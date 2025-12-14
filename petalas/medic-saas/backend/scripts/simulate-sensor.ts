
import mqtt from 'mqtt';

// Configuration
const BROKER_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const TOPIC = 'clinic/default/reception/occupancy';

console.log(`[Sim] Connecting to ${BROKER_URL}...`);

const client = mqtt.connect(BROKER_URL, {
    clientId: 'sensor-simulator-01'
});

client.on('connect', () => {
    console.log('[Sim] Connected! Starting simulation...');

    let occupancy = 5;

    setInterval(() => {
        // Randomly add or remove people (mostly add to test threshold)
        const change = Math.random() > 0.4 ? 1 : -1;
        occupancy = Math.max(0, occupancy + change);

        const payload = JSON.stringify({
            occupancy,
            timestamp: new Date().toISOString(),
            sensor_id: 'zigbee-occupancy-01'
        });

        console.log(`[Sim] -> Publishing to ${TOPIC}:`, payload);
        client.publish(TOPIC, payload, { qos: 1 });

    }, 5000); // Every 5 seconds
});

client.on('error', (err: any) => {
    console.error('[Sim] Error:', err);
});
