/**
 * ═══════════════════════════════════════════════════════════════════════════
 * @magicsaas/iot-mesh - Main Entry Point
 * Cognitive Mesh OS Layer 11 - IoT Integration
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Types
export * from './types/iot.types.js';

// Clients
export { MqttMeshClient } from './clients/mqtt-client.js';
export { Zigbee2MqttBridge, type ZigbeeBridgeConfig } from './clients/zigbee-bridge.js';

// Handlers
export { RoomOccupancyHandler, type OccupancyHandlerConfig } from './handlers/occupancy-handler.js';

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

import type { Redis } from 'ioredis';
import type { IoTMeshConfig } from './types/iot.types.js';
import { MqttMeshClient } from './clients/mqtt-client.js';
import { Zigbee2MqttBridge } from './clients/zigbee-bridge.js';
import { RoomOccupancyHandler } from './handlers/occupancy-handler.js';

/**
 * Create and configure an IoT Mesh instance
 */
export async function createIoTMesh(config: IoTMeshConfig, redis: Redis) {
    // Create MQTT client
    const mqttClient = new MqttMeshClient(config.mqtt);
    await mqttClient.connect();

    // Create Zigbee bridge if enabled
    let zigbeeBridge: Zigbee2MqttBridge | undefined;
    if (config.zigbee?.enabled) {
        zigbeeBridge = new Zigbee2MqttBridge({
            mqtt_client: mqttClient,
            base_topic: 'zigbee2mqtt',
            tenant_id: config.tenant_id,
            petala: config.petala,
        });
        await zigbeeBridge.initialize();
    }

    // Create occupancy handler
    const occupancyHandler = new RoomOccupancyHandler({
        redis,
        tenant_id: config.tenant_id,
        petala: config.petala,
    });

    // Wire up events
    mqttClient.on('sensor_event', (event) => {
        occupancyHandler.handleSensorEvent(event);
    });

    if (zigbeeBridge) {
        zigbeeBridge.on('sensor_event', (event) => {
            occupancyHandler.handleSensorEvent(event);
        });
    }

    return {
        mqtt: mqttClient,
        zigbee: zigbeeBridge,
        occupancy: occupancyHandler,

        /**
         * Disconnect all IoT connections
         */
        async disconnect() {
            await mqttClient.disconnect();
        },
    };
}

/**
 * IoT Mesh instance type
 */
export type IoTMeshInstance = Awaited<ReturnType<typeof createIoTMesh>>;
