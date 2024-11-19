// src/hooks/useAudioRecording.ts
import { useState, useRef, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface AudioRecordingHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  audioLevel: number;
  error: string | null;
}

export const useAudioRecording = (): AudioRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { sendAudioData } = useWebSocket();
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>();

  const updateAudioLevel = useCallback(() => {
    if (analyser.current && isRecording) {
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      analyser.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          sendAudioData(event.data);
        }
      };

      mediaRecorder.current.start(250);
      setIsRecording(true);
      setError(null);
      updateAudioLevel();
      
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

      if (audioContext.current) {
        audioContext.current.close();
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      setIsRecording(false);
      setAudioLevel(0);
    }
  }, [isRecording]);

  return {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording,
  };
};