// src/contexts/WebSocketContext.tsx
import { createContext, useContext, useRef, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  sendAudioChunk: (audioChunk: Blob) => void;
  transcript: string;
  aiResponse: string;
  isConnected: boolean;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const connect = () => {
      const websocketUrl = `${import.meta.env.VITE_WS_URL}/transcribe`;
      ws.current = new WebSocket(websocketUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
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

      ws.current.onerror = () => {
        setError('WebSocket connection failed');
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

  const sendAudioChunk = (audioChunk: Blob) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    ws.current.send(audioChunk);
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendAudioChunk,
        transcript,
        aiResponse,
        isConnected,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};