import { useEffect, useState } from 'react';

const WEBSOCKET_URL = 'ws://localhost:8000/ws'; // Adjust the URL as necessary

export const useWebSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            console.log('WebSocket connection established');
            setSocket(ws);
            setIsConnected(true);
            setError(null);
        };

        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
            setMessages((prevMessages) => [...prevMessages, event.data]);
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'transcript') {
                    setTranscript(data.content);
                } else if (data.type === 'ai_response') {
                    setAiResponse(data.content);
                }
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            setError('WebSocket connection failed');
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
            setSocket(null);
            setIsConnected(false);
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const sendAudioData = (audioChunk: Blob) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setError('WebSocket not connected');
            return;
        }

        socket.send(audioChunk);
    };

    return { socket, messages, error, transcript, aiResponse, isConnected, sendAudioData };
};
