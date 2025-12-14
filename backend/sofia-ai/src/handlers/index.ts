/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HANDLERS INDEX - Export all event handlers
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { IoTEventHandler, type IoTEvent, type OccupancyEvent, type SensorEvent } from './IoTEventHandler.js';
export { VoiceEventHandler, type VoiceEvent, type DictationEvent, type TranscriptionEvent } from './VoiceEventHandler.js';
export { WhatsAppEventHandler, type WhatsAppEvent, type MessageReceivedEvent, type TemplateTriggerEvent } from './WhatsAppEventHandler.js';
