
import axios from 'axios';

export class WhisperClient {
    constructor(private apiKey: string, private baseUrl: string = 'https://api.openai.com/v1/audio/transcriptions') { }

    async transcribe(audioBlob: Blob): Promise<string> {
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('model', 'whisper-1');

        const response = await axios.post(this.baseUrl, formData, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.text;
    }
}
