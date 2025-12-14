/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/voice-bridge - Whisper STT Client
 * Cognitive Mesh OS Layer 11 - Speech-to-Text Integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptionRequest, TranscriptionResponse } from '../types/voice.types.js';

// ═══════════════════════════════════════════════════════════════════════════
// WHISPER CLIENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export interface WhisperClientConfig {
    api_key: string;
    model?: 'whisper-1';
    base_url?: string;    // For self-hosted Whisper
    timeout_ms?: number;
    max_retries?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// WHISPER CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class WhisperClient {
    private openai: OpenAI;
    private model: string;
    private maxRetries: number;

    constructor(config: WhisperClientConfig) {
        this.openai = new OpenAI({
            apiKey: config.api_key,
            baseURL: config.base_url,
            timeout: config.timeout_ms ?? 60000,
            maxRetries: config.max_retries ?? 2,
        });
        this.model = config.model ?? 'whisper-1';
        this.maxRetries = config.max_retries ?? 2;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TRANSCRIPTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Transcribe audio to text
     */
    async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
        const startTime = Date.now();
        const requestId = uuidv4();

        try {
            // Convert audio data to File object
            const audioData = typeof request.audio_data === 'string'
                ? Buffer.from(request.audio_data, 'base64')
                : request.audio_data;

            const file = new File(
                [audioData],
                `audio.${request.format}`,
                { type: this.getMimeType(request.format) }
            );

            // Call Whisper API
            const response = await this.openai.audio.transcriptions.create({
                file,
                model: this.model,
                language: this.normalizeLanguage(request.language),
                prompt: request.prompt,
                temperature: request.temperature,
                response_format: 'verbose_json',
                timestamp_granularities: request.timestamp_granularities,
            });

            const processingTime = Date.now() - startTime;

            // Build response
            const result: TranscriptionResponse = {
                id: requestId,
                text: response.text,
                language: response.language || request.language,
                duration_seconds: response.duration || 0,
                provider: 'whisper',
                processing_time_ms: processingTime,
            };

            // Add word-level timestamps if available
            if (response.words) {
                result.words = response.words.map(w => ({
                    word: w.word,
                    start: w.start,
                    end: w.end,
                }));
            }

            console.log(`[Whisper] Transcribed ${result.duration_seconds}s audio in ${processingTime}ms`);
            return result;

        } catch (error) {
            const err = error as Error;
            console.error('[Whisper] Transcription error:', err.message);
            throw new Error(`Whisper transcription failed: ${err.message}`);
        }
    }

    /**
     * Transcribe audio from URL
     */
    async transcribeFromUrl(
        audioUrl: string,
        options?: Partial<TranscriptionRequest>
    ): Promise<TranscriptionResponse> {
        const response = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await response.arrayBuffer());

        return this.transcribe({
            audio_data: audioBuffer,
            format: this.detectFormat(audioUrl),
            language: options?.language ?? 'pt-BR',
            prompt: options?.prompt,
            temperature: options?.temperature ?? 0,
        });
    }

    /**
     * Transcribe audio stream in chunks (for real-time dictation)
     */
    async *transcribeStream(
        audioChunks: AsyncIterable<Buffer>,
        options?: Partial<TranscriptionRequest>
    ): AsyncGenerator<TranscriptionResponse> {
        let chunkBuffer: Buffer[] = [];
        let chunkDuration = 0;
        const chunkThresholdMs = 5000; // 5 seconds per chunk

        for await (const chunk of audioChunks) {
            chunkBuffer.push(chunk);
            chunkDuration += this.estimateChunkDuration(chunk, options?.format ?? 'webm');

            // Process when we have enough audio
            if (chunkDuration >= chunkThresholdMs) {
                const combinedAudio = Buffer.concat(chunkBuffer);

                try {
                    const result = await this.transcribe({
                        audio_data: combinedAudio,
                        format: options?.format ?? 'webm',
                        language: options?.language ?? 'pt-BR',
                        prompt: options?.prompt,
                    });
                    yield result;
                } catch (error) {
                    console.error('[Whisper] Stream chunk error:', error);
                }

                chunkBuffer = [];
                chunkDuration = 0;
            }
        }

        // Process remaining audio
        if (chunkBuffer.length > 0) {
            const combinedAudio = Buffer.concat(chunkBuffer);
            const result = await this.transcribe({
                audio_data: combinedAudio,
                format: options?.format ?? 'webm',
                language: options?.language ?? 'pt-BR',
                prompt: options?.prompt,
            });
            yield result;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MEDICAL TRANSCRIPTION HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Transcribe with medical context prompt for better accuracy
     */
    async transcribeMedical(
        audioData: Buffer | string,
        options?: {
            format?: TranscriptionRequest['format'];
            specialty?: string;
            record_type?: string;
        }
    ): Promise<TranscriptionResponse> {
        const medicalPrompt = this.buildMedicalPrompt(options?.specialty, options?.record_type);

        return this.transcribe({
            audio_data: audioData,
            format: options?.format ?? 'webm',
            language: 'pt-BR',
            prompt: medicalPrompt,
            temperature: 0, // Lower temperature for medical accuracy
        });
    }

    /**
     * Build medical context prompt for better transcription
     */
    private buildMedicalPrompt(specialty?: string, recordType?: string): string {
        const baseTerms = [
            'paciente', 'diagnóstico', 'prescrição', 'medicamento', 'mg', 'ml',
            'via oral', 'intramuscular', 'intravenoso', 'subcutâneo',
            'frequência cardíaca', 'pressão arterial', 'temperatura', 'saturação',
            'história clínica', 'exame físico', 'hipótese diagnóstica', 'conduta',
            'retorno', 'encaminhamento', 'atestado', 'laudo',
        ];

        const specialtyTerms: Record<string, string[]> = {
            cardiology: ['ECG', 'ecocardiograma', 'arritmia', 'fibrilação', 'stent', 'angioplastia'],
            orthopedics: ['fratura', 'luxação', 'entorse', 'artroscopia', 'osteossíntese'],
            dermatology: ['lesão', 'mácula', 'pápula', 'vesícula', 'biópsia'],
            gynecology: ['ultrassom transvaginal', 'papanicolau', 'colposcopia', 'DIU'],
            pediatrics: ['vacina', 'desenvolvimento', 'peso', 'altura', 'percentil'],
        };

        const recordTypeTerms: Record<string, string[]> = {
            soap_note: ['Subjetivo', 'Objetivo', 'Avaliação', 'Plano', 'S:', 'O:', 'A:', 'P:'],
            prescription: ['uso contínuo', 'uso por', 'dias', 'comprimido', 'cápsula', 'gotas'],
            referral: ['encaminho', 'especialista', 'avaliação', 'urgente'],
        };

        let prompt = baseTerms.join(', ');

        if (specialty && specialtyTerms[specialty]) {
            prompt += ', ' + specialtyTerms[specialty].join(', ');
        }

        if (recordType && recordTypeTerms[recordType]) {
            prompt += ', ' + recordTypeTerms[recordType].join(', ');
        }

        return prompt;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private getMimeType(format: string): string {
        const mimeTypes: Record<string, string> = {
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            webm: 'audio/webm',
            ogg: 'audio/ogg',
            m4a: 'audio/m4a',
            flac: 'audio/flac',
        };
        return mimeTypes[format] || 'audio/webm';
    }

    private detectFormat(url: string): TranscriptionRequest['format'] {
        const ext = url.split('.').pop()?.toLowerCase();
        const formats = ['mp3', 'wav', 'webm', 'ogg', 'm4a', 'flac'];
        return (formats.includes(ext ?? '') ? ext : 'webm') as TranscriptionRequest['format'];
    }

    private normalizeLanguage(language: string): string {
        // Whisper uses ISO 639-1 codes
        const langMap: Record<string, string> = {
            'pt-BR': 'pt',
            'pt-PT': 'pt',
            'en-US': 'en',
            'en-GB': 'en',
            'es-ES': 'es',
            'es-MX': 'es',
        };
        return langMap[language] || language.split('-')[0];
    }

    private estimateChunkDuration(chunk: Buffer, format: string): number {
        // Rough estimation based on bitrate
        const bitrateKbps: Record<string, number> = {
            webm: 128,
            mp3: 128,
            ogg: 128,
            wav: 1411, // 16-bit 44.1kHz stereo
        };
        const bitrate = bitrateKbps[format] || 128;
        return (chunk.length * 8) / bitrate; // ms
    }
}
