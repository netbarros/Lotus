
import axios, { AxiosInstance } from 'axios';
import { IntentionRequest, SofiaResponse, GenerationRequest } from './types.js';

export interface SofiaConfig {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
}

export class SofiaClient {
    private client: AxiosInstance;

    constructor(private config: SofiaConfig) {
        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout || 10000,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Ask Sofia a natural language question or command
     */
    async ask(prompt: string, context?: Record<string, unknown>): Promise<string> {
        const response = await this.client.post<{ answer: string }>('/chat', {
            prompt,
            context,
        });
        return response.data.answer;
    }

    /**
     * Process an intention to determine actions and parameters
     */
    async processIntention(request: IntentionRequest): Promise<SofiaResponse> {
        const response = await this.client.post<SofiaResponse>('/intention', request);
        return response.data;
    }

    /**
     * Generate parameters or content based on a prompt
     */
    async generateParams(prompt: string, schema?: Record<string, unknown>): Promise<Record<string, unknown>> {
        const response = await this.client.post<{ parameters: Record<string, unknown> }>('/generate/params', {
            prompt,
            schema,
        });
        return response.data.parameters;
    }

    async generateContent(request: GenerationRequest): Promise<string> {
        const response = await this.client.post<{ content: string }>('/generate/content', request);
        return response.data.content;
    }
}
