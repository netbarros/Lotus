
'use client';

import { useState } from 'react';
import { Button } from "@magicsaas/ui-kit";
import { Mic, MicOff, Loader2 } from 'lucide-react';

export function DictationFab({ onTranscribe }: { onTranscribe: (text: string) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleRecording = async () => {
        if (!isRecording) {
            // Start Recording Simulation
            setIsRecording(true);
            console.log("Recording started...");
        } else {
            // Stop Recording & "Process"
            setIsRecording(false);
            setIsProcessing(true);

            // Mock Voice Bridge Delay
            setTimeout(() => {
                setIsProcessing(false);
                const mockText = "Patient reports improvement in lumbar pain after following the prescribed stretching exercises for 3 days. BP 120/80.";
                onTranscribe(mockText);
            }, 1500);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Button
                size="icon"
                className={`h-16 w-16 rounded-full shadow-lg transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
                onClick={toggleRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="h-8 w-8" />
                ) : (
                    <Mic className="h-8 w-8" />
                )}
            </Button>
        </div>
    );
}
