
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from "@magicsaas/ui-kit";
import { MqttMeshClient, type MqttMessage } from "@magicsaas/iot-mesh";

interface SensorEvent {
    id: string;
    type: string;
    value: number;
    timestamp: string;
    message: string;
}

export default function ReceptionPage() {
    const [occupancy, setOccupancy] = useState<number>(0);
    const [events, setEvents] = useState<SensorEvent[]>([]);
    const [status, setStatus] = useState<string>('Disconnected');

    useEffect(() => {
        // Initialize MQTT Client via IoT Mesh
        // Note: In production, URL comes from env
        const client = new MqttMeshClient({
            broker_url: 'ws://localhost:9001', // MQTT over WebSockets
            client_id: `medic-saas-reception-${Math.random().toString(16).substr(2, 8)}`,
        });

        const topic = 'clinic/default/reception/occupancy';

        const connectIoT = async () => {
            try {
                setStatus('Connecting...');
                await client.connect();
                setStatus('Connected');

                // Subscribe to occupancy topic
                client.subscribe(topic);

                client.on('message', (msg: MqttMessage) => {
                    console.log('IoT Message:', msg);
                    if (msg.topic === topic) {
                        // Payload expected: { occupancy: number, timestamp: string }
                        const payload = typeof msg.payload === 'object' ? msg.payload : JSON.parse(String(msg.payload));
                        setOccupancy(payload.occupancy || 0);

                        // Add to event log
                        const newEvent = {
                            id: Date.now().toString(),
                            type: 'Occupancy Update',
                            value: payload.occupancy || 0,
                            timestamp: new Date().toLocaleTimeString(),
                            message: `Occupancy changed to ${payload.occupancy}`
                        };
                        setEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10
                    }
                });

            } catch (err) {
                console.error('IoT Connection Failed:', err);
                setStatus('Connection Failed');
            }
        };

        connectIoT();

        // Cleanup on unmount
        return () => {
            client.disconnect();
        };
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Waiting Room Operations</h2>
                <div className="flex gap-2 items-center">
                    <span className={`w-3 h-3 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-500">{status}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Real-time Occupancy Counter */}
                <Card className={occupancy > 10 ? 'border-red-500 border-2' : ''}>
                    <CardHeader>
                        <CardTitle>Current Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-8xl font-bold text-center py-8">
                            {occupancy}
                        </div>
                        {occupancy > 10 && (
                            <div className="text-center text-red-500 font-bold bg-red-50 p-2 rounded">
                                ⚠️ CROWDED - PLEASE OPEN ROOM B
                            </div>
                        )}
                        <p className="text-center text-muted-foreground mt-4">
                            Real-time Zigbee Sensor Data
                        </p>
                    </CardContent>
                </Card>

                {/* Event Stream */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sensor Stream</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                            {events.length === 0 ? (
                                <p className="text-gray-400 text-center italic">Waiting for sensor events...</p>
                            ) : events.map(event => (
                                <div key={event.id} className="flex justify-between items-center border-b pb-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{event.type}</span>
                                        <span className="text-xs text-gray-500">{event.message}</span>
                                    </div>
                                    <span className="text-xs font-mono">{event.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
