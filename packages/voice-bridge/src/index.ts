
export const VERSION = '1.0.0';

export * from './whisper.js';
export * from './alexa.js';

// Stubs for MedicSaaS Build Compatibility
export interface DictationSession {
    id: string;
    patient_id: string;
    user_id: string;
    record_type: 'anamnesis' | 'evolution' | 'prescription';
    status: 'recording' | 'processing' | 'completed';
    metadata?: {
        word_count: number;
    };
    full_transcript?: string;
    structured_data?: Record<string, any>;
}

export interface VoiceBridgeInstance {
    dictation: {
        startSession(params: { user_id: string; patient_id: string; record_type: string }): Promise<DictationSession>;
        addAudioChunk(sessionId: string, audio: Buffer, duration: number): Promise<{ text: string }>;
        completeSession(sessionId: string): Promise<DictationSession>;
        cancelSession(sessionId: string): Promise<void>;
        getSession(sessionId: string): Promise<DictationSession | null>;
        getUserSessions(userId: string): Promise<DictationSession[]>;
        on(event: string, callback: Function): void;
    };
    transcribe(audio: Buffer, options?: any): Promise<{ text: string; duration_seconds: number }>;
    handleAlexaRequest(request: unknown, headers: Record<string, string>): Promise<unknown>;
}

export function createVoiceBridge(config: any, redis: any): VoiceBridgeInstance {
    return {
        dictation: {
            startSession: async () => ({ id: 'mock', patient_id: 'mock', user_id: 'mock', record_type: 'anamnesis', status: 'recording' }),
            addAudioChunk: async () => ({ text: 'mock text' }),
            completeSession: async () => ({ id: 'mock', patient_id: 'mock', user_id: 'mock', record_type: 'anamnesis', status: 'completed' }),
            cancelSession: async () => { },
            getSession: async () => null,
            getUserSessions: async () => [],
            on: () => { },
        },
        transcribe: async () => ({ text: 'mock transcription', duration_seconds: 0 }),
        handleAlexaRequest: async () => ({}),
    };
}
