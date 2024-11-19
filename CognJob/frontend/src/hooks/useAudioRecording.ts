// src/hooks/useAudioRecording.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface AudioRecordingState {
  isRecording: boolean;
  audioLevel: number;
  error: string | null;
}

interface AudioRecordingHook extends AudioRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export const useAudioRecording = (): AudioRecordingHook => {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    audioLevel: 0,
    error: null,
  });

  const { sendAudioChunk } = useWebSocket();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>();

  const updateAudioLevel = useCallback(() => {
    if (analyser.current && state.isRecording) {
      const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
      analyser.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setState(prev => ({ ...prev, audioLevel: average / 255 }));
      
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state.isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      // Setup AudioContext
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      // Configure analyzer
      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;

      // Setup MediaRecorder with optimized settings
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          sendAudioChunk(event.data);
        }
      };

      // Start recording
      mediaRecorder.current.start(250); // Send chunks every 250ms
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      updateAudioLevel();
      
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording. Please check your microphone permissions.'
      }));
      console.error('Recording error:', err);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

      if (audioContext.current) {
        audioContext.current.close();
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        audioLevel: 0
      }));
    }
  }, [state.isRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
};