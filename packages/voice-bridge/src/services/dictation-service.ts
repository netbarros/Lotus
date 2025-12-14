/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/voice-bridge - Dictation Service
 * Cognitive Mesh OS Layer 11 - Medical Dictation for MedicSaaS
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import type { Redis } from 'ioredis';
import { WhisperClient } from '../providers/whisper-client.js';
import type { DictationSession, TranscriptionResponse } from '../types/voice.types.js';

// ═══════════════════════════════════════════════════════════════════════════
// DICTATION SERVICE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface DictationServiceConfig {
    whisper: WhisperClient;
    redis: Redis;
    tenant_id: string;
    petala: string;
    session_ttl_seconds?: number; // Default: 24 hours
}

// ═══════════════════════════════════════════════════════════════════════════
// DICTATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class DictationService extends EventEmitter {
    private whisper: WhisperClient;
    private redis: Redis;
    private tenantId: string;
    private petala: string;
    private sessionTtl: number;
    private keyPrefix: string;
    private activeSessions: Map<string, DictationSession> = new Map();

    constructor(config: DictationServiceConfig) {
        super();
        this.whisper = config.whisper;
        this.redis = config.redis;
        this.tenantId = config.tenant_id;
        this.petala = config.petala;
        this.sessionTtl = config.session_ttl_seconds ?? 86400;
        this.keyPrefix = `magicsaas:${config.tenant_id}:${config.petala}:dictation`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SESSION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Start a new dictation session
     */
    async startSession(options: {
        user_id: string;
        patient_id?: string;
        record_type: DictationSession['record_type'];
    }): Promise<DictationSession> {
        const session: DictationSession = {
            id: uuidv4(),
            tenant_id: this.tenantId,
            petala: this.petala,
            user_id: options.user_id,
            patient_id: options.patient_id,
            record_type: options.record_type,
            status: 'recording',
            started_at: new Date(),
            audio_chunks: [],
        };

        this.activeSessions.set(session.id, session);
        await this.saveSession(session);

        console.log(`[Dictation] Started session ${session.id} for ${options.record_type}`);
        this.emit('session_started', session);

        return session;
    }

    /**
     * Add audio chunk to session
     */
    async addAudioChunk(
        sessionId: string,
        audioData: Buffer,
        durationMs: number
    ): Promise<TranscriptionResponse | null> {
        const session = await this.getSession(sessionId);
        if (!session || session.status !== 'recording') {
            throw new Error(`Invalid session or session not recording: ${sessionId}`);
        }

        const chunkId = uuidv4();

        // Add chunk to session
        session.audio_chunks.push({
            chunk_id: chunkId,
            timestamp: new Date(),
            duration_ms: durationMs,
            processed: false,
        });

        // Transcribe the chunk
        let transcription: TranscriptionResponse | null = null;
        try {
            transcription = await this.whisper.transcribeMedical(audioData, {
                specialty: this.getSpecialtyFromRecordType(session.record_type),
                record_type: session.record_type,
            });

            // Update chunk with transcription
            const chunk = session.audio_chunks.find(c => c.chunk_id === chunkId);
            if (chunk) {
                chunk.processed = true;
                chunk.text = transcription.text;
            }

            // Append to full transcript
            session.full_transcript = [
                session.full_transcript ?? '',
                transcription.text,
            ].filter(Boolean).join(' ');

            this.emit('chunk_transcribed', { session, chunk, transcription });
        } catch (error) {
            console.error(`[Dictation] Transcription error for chunk ${chunkId}:`, error);
            this.emit('transcription_error', { sessionId, chunkId, error });
        }

        await this.saveSession(session);
        return transcription;
    }

    /**
     * Pause dictation session
     */
    async pauseSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'processing';
        await this.saveSession(session);

        this.emit('session_paused', session);
        console.log(`[Dictation] Paused session ${sessionId}`);
    }

    /**
     * Resume dictation session
     */
    async resumeSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'recording';
        await this.saveSession(session);

        this.emit('session_resumed', session);
        console.log(`[Dictation] Resumed session ${sessionId}`);
    }

    /**
     * Complete dictation session
     */
    async completeSession(sessionId: string): Promise<DictationSession> {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error(`Session not found: ${sessionId}`);

        session.status = 'completed';
        session.ended_at = new Date();

        // Calculate metadata
        const totalDuration = session.audio_chunks.reduce(
            (sum, chunk) => sum + chunk.duration_ms,
            0
        ) / 1000;

        const wordCount = (session.full_transcript ?? '')
            .split(/\s+/)
            .filter(Boolean).length;

        session.metadata = {
            language: 'pt-BR',
            total_duration_seconds: totalDuration,
            word_count: wordCount,
        };

        // Parse structured data if applicable
        if (session.record_type === 'soap_note') {
            session.structured_data = this.parseSOAPNote(session.full_transcript ?? '');
        }

        await this.saveSession(session);
        this.activeSessions.delete(sessionId);

        this.emit('session_completed', session);
        console.log(`[Dictation] Completed session ${sessionId}: ${wordCount} words`);

        return session;
    }

    /**
     * Cancel dictation session
     */
    async cancelSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) return;

        session.status = 'cancelled';
        session.ended_at = new Date();
        await this.saveSession(session);
        this.activeSessions.delete(sessionId);

        this.emit('session_cancelled', session);
        console.log(`[Dictation] Cancelled session ${sessionId}`);
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId: string): Promise<DictationSession | null> {
        // Check memory first
        const cached = this.activeSessions.get(sessionId);
        if (cached) return cached;

        // Load from Redis
        const data = await this.redis.get(`${this.keyPrefix}:${sessionId}`);
        if (data) {
            const session = JSON.parse(data) as DictationSession;
            session.started_at = new Date(session.started_at);
            if (session.ended_at) session.ended_at = new Date(session.ended_at);
            session.audio_chunks.forEach(chunk => {
                chunk.timestamp = new Date(chunk.timestamp);
            });
            return session;
        }

        return null;
    }

    /**
     * Get active sessions for a user
     */
    async getUserSessions(userId: string): Promise<DictationSession[]> {
        const keys = await this.redis.keys(`${this.keyPrefix}:*`);
        const sessions: DictationSession[] = [];

        for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
                const session = JSON.parse(data) as DictationSession;
                if (session.user_id === userId && session.status !== 'cancelled') {
                    sessions.push(session);
                }
            }
        }

        return sessions.sort((a, b) =>
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STRUCTURED DATA PARSING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Parse SOAP note from transcript
     */
    private parseSOAPNote(transcript: string): Record<string, unknown> {
        const sections: Record<string, string> = {
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
        };

        // Try to parse structured SOAP
        const patterns = [
            { section: 'subjective', regex: /(?:subjetivo|s:)\s*(.+?)(?=(?:objetivo|o:|avaliação|a:|plano|p:)|$)/is },
            { section: 'objective', regex: /(?:objetivo|o:)\s*(.+?)(?=(?:avaliação|a:|plano|p:)|$)/is },
            { section: 'assessment', regex: /(?:avaliação|a:)\s*(.+?)(?=(?:plano|p:)|$)/is },
            { section: 'plan', regex: /(?:plano|p:)\s*(.+?)$/is },
        ];

        for (const { section, regex } of patterns) {
            const match = transcript.match(regex);
            if (match) {
                sections[section] = match[1].trim();
            }
        }

        // If no structured format, put all in subjective
        if (Object.values(sections).every(v => v === '')) {
            sections.subjective = transcript;
        }

        return sections;
    }

    /**
     * Get medical specialty from record type
     */
    private getSpecialtyFromRecordType(
        recordType: DictationSession['record_type']
    ): string | undefined {
        // This could be enhanced with user/clinic specialty settings
        return undefined;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    private async saveSession(session: DictationSession): Promise<void> {
        await this.redis.set(
            `${this.keyPrefix}:${session.id}`,
            JSON.stringify(session),
            'EX',
            this.sessionTtl
        );

        // Update active sessions cache
        if (session.status === 'recording' || session.status === 'processing') {
            this.activeSessions.set(session.id, session);
        }
    }
}
