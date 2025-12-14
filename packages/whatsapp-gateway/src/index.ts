/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/whatsapp-gateway - Multi-Provider Router with Failover
 * Cognitive Mesh OS Layer 11 - Communication Integration
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Priority order (as defined in MedicSaaS Blueprint):
 * 1. Evolution API 2.3.4 (primary)
 * 2. Meta Cloud API v21 (official backup)
 * 3. Z-API (last resort fallback)
 */

import { Inngest } from 'inngest';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type WhatsAppProvider = 'evolution' | 'meta_cloud' | 'zapi';

export interface WhatsAppMessage {
    id?: string;
    to: string;                  // Phone number with country code (e.g., '5511999999999')
    type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template';
    content: {
        text?: string;
        mediaUrl?: string;
        fileName?: string;
        caption?: string;
        templateName?: string;
        templateParams?: Record<string, string>;
    };
    metadata?: {
        tenant_id?: string;
        petala?: string;
        context?: string;
        priority?: 'low' | 'normal' | 'high';
    };
}

export interface SendResult {
    success: boolean;
    provider: WhatsAppProvider;
    message_id?: string;
    error?: string;
    attempts: number;
}

export interface ProviderConfig {
    evolution?: {
        base_url: string;
        api_key: string;
        instance: string;
    };
    meta_cloud?: {
        phone_number_id: string;
        access_token: string;
        api_version?: string;
    };
    zapi?: {
        instance_id: string;
        token: string;
        base_url?: string;
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER CLIENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evolution API Client
 */
async function sendViaEvolution(
    message: WhatsAppMessage,
    config: ProviderConfig['evolution']
): Promise<{ success: boolean; message_id?: string; error?: string }> {
    if (!config) throw new Error('Evolution API not configured');

    try {
        const endpoint = message.type === 'text'
            ? '/message/sendText'
            : '/message/sendMedia';

        const response = await fetch(`${config.base_url}${endpoint}/${config.instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.api_key,
            },
            body: JSON.stringify({
                number: message.to,
                text: message.content.text,
                mediaUrl: message.content.mediaUrl,
                caption: message.content.caption,
                fileName: message.content.fileName,
            }),
        });

        const data = await response.json() as { key?: { id?: string }; error?: string };

        if (!response.ok) {
            return { success: false, error: data.error || `HTTP ${response.status}` };
        }

        return { success: true, message_id: data.key?.id };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Meta Cloud API Client
 */
async function sendViaMetaCloud(
    message: WhatsAppMessage,
    config: ProviderConfig['meta_cloud']
): Promise<{ success: boolean; message_id?: string; error?: string }> {
    if (!config) throw new Error('Meta Cloud API not configured');

    const apiVersion = config.api_version || 'v21.0';
    const url = `https://graph.facebook.com/${apiVersion}/${config.phone_number_id}/messages`;

    try {
        let body: Record<string, unknown>;

        if (message.type === 'template') {
            body = {
                messaging_product: 'whatsapp',
                to: message.to,
                type: 'template',
                template: {
                    name: message.content.templateName,
                    language: { code: 'pt_BR' },
                    components: message.content.templateParams
                        ? [{ type: 'body', parameters: Object.values(message.content.templateParams).map(v => ({ type: 'text', text: v })) }]
                        : undefined,
                },
            };
        } else if (message.type === 'text') {
            body = {
                messaging_product: 'whatsapp',
                to: message.to,
                type: 'text',
                text: { body: message.content.text },
            };
        } else {
            body = {
                messaging_product: 'whatsapp',
                to: message.to,
                type: message.type,
                [message.type]: {
                    link: message.content.mediaUrl,
                    caption: message.content.caption,
                },
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.access_token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json() as { messages?: { id: string }[]; error?: { message: string } };

        if (!response.ok) {
            return { success: false, error: data.error?.message || `HTTP ${response.status}` };
        }

        return { success: true, message_id: data.messages?.[0]?.id };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Z-API Client
 */
async function sendViaZAPI(
    message: WhatsAppMessage,
    config: ProviderConfig['zapi']
): Promise<{ success: boolean; message_id?: string; error?: string }> {
    if (!config) throw new Error('Z-API not configured');

    const baseUrl = config.base_url || 'https://api.z-api.io';

    try {
        const endpoint = message.type === 'text'
            ? '/send-text'
            : '/send-link-file';

        const response = await fetch(`${baseUrl}/instances/${config.instance_id}/token/${config.token}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: message.to,
                message: message.content.text,
                linkFile: message.content.mediaUrl,
            }),
        });

        const data = await response.json() as { messageId?: string; error?: string };

        if (!response.ok) {
            return { success: false, error: data.error || `HTTP ${response.status}` };
        }

        return { success: true, message_id: data.messageId };
    } catch (error) {
        return { success: false, error: (error as Error).message };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER WITH FAILOVER
// ═══════════════════════════════════════════════════════════════════════════

export class WhatsAppRouter {
    private config: ProviderConfig;
    private providerOrder: WhatsAppProvider[];

    constructor(config: ProviderConfig) {
        this.config = config;
        this.providerOrder = ['evolution', 'meta_cloud', 'zapi'];
    }

    /**
     * Send message with automatic failover
     */
    async send(message: WhatsAppMessage): Promise<SendResult> {
        let lastError = '';
        let attempts = 0;

        for (const provider of this.providerOrder) {
            attempts++;
            console.log(`[WhatsApp] Attempting to send via ${provider}...`);

            try {
                let result: { success: boolean; message_id?: string; error?: string };

                switch (provider) {
                    case 'evolution':
                        if (!this.config.evolution) continue;
                        result = await sendViaEvolution(message, this.config.evolution);
                        break;
                    case 'meta_cloud':
                        if (!this.config.meta_cloud) continue;
                        result = await sendViaMetaCloud(message, this.config.meta_cloud);
                        break;
                    case 'zapi':
                        if (!this.config.zapi) continue;
                        result = await sendViaZAPI(message, this.config.zapi);
                        break;
                    default:
                        continue;
                }

                if (result.success) {
                    console.log(`[WhatsApp] Sent successfully via ${provider}: ${result.message_id}`);
                    return {
                        success: true,
                        provider,
                        message_id: result.message_id,
                        attempts,
                    };
                }

                lastError = result.error || 'Unknown error';
                console.warn(`[WhatsApp] Failed via ${provider}: ${lastError}`);

            } catch (error) {
                lastError = (error as Error).message;
                console.warn(`[WhatsApp] Exception via ${provider}: ${lastError}`);
            }
        }

        return {
            success: false,
            provider: this.providerOrder[this.providerOrder.length - 1],
            error: `All providers failed. Last error: ${lastError}`,
            attempts,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INNGEST DURABLE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export const inngest = new Inngest({ id: 'magicsaas-whatsapp' });

/**
 * Durable WhatsApp send function with retries and failover
 */
export const sendWhatsAppMessage = inngest.createFunction(
    {
        id: 'whatsapp/send-message',
        retries: 3,
    },
    { event: 'whatsapp/message.send' },
    async ({ event, step }) => {
        const message = event.data as WhatsAppMessage;

        // Try Evolution API first
        const evolutionResult = await step.run('send-via-evolution', async () => {
            // In production, get config from environment
            return { success: false, error: 'Evolution not configured in this context' };
        });

        if (evolutionResult.success) {
            return { success: true, provider: 'evolution', ...evolutionResult };
        }

        // Failover to Meta Cloud API
        const metaResult = await step.run('send-via-meta-cloud', async () => {
            return { success: false, error: 'Meta Cloud not configured in this context' };
        });

        if (metaResult.success) {
            return { success: true, provider: 'meta_cloud', ...metaResult };
        }

        // Last resort: Z-API
        const zapiResult = await step.run('send-via-zapi', async () => {
            return { success: false, error: 'Z-API not configured in this context' };
        });

        if (zapiResult.success) {
            return { success: true, provider: 'zapi', ...zapiResult };
        }

        // All providers failed
        throw new Error('All WhatsApp providers failed');
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export function createWhatsAppGateway(config: ProviderConfig): WhatsAppRouter {
    return new WhatsAppRouter(config);
}

export default { createWhatsAppGateway, sendWhatsAppMessage, inngest };
