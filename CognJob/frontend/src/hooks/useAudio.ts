import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface AudioConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
}

const defaultConfig: AudioConfig = {
  sampleRate: 16000,
  channels: 1,
  bufferSize: 4096,
};

export const useAudio = (config: AudioConfig = defaultConfig) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const { sendMessage } = useWebSocket();

  const initAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext({
        sampleRate: config.sampleRate,
      });

      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = config.bufferSize;

      source.connect(analyser.current);

      // Setup MediaRecorder
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const arrayBuffer = await event.data.arrayBuffer();
          sendMessage(new Uint8Array(arrayBuffer));
        }
      };

      // Setup audio visualization
      const dataArray = new Float32Array(analyser.current.frequencyBinCount);
      const updateVisualization = () => {
        if (analyser.current && isRecording) {
          analyser.current.getFloatTimeDomainData(dataArray);
          setAudioData(dataArray);
          requestAnimationFrame(updateVisualization);
        }
      };

      updateVisualization();
    } catch (err) {
      setError(err.message);
      console.error('Error initializing audio context:', err);
    }
  }, [config.sampleRate, config.bufferSize, sendMessage]);

  const startRecording = useCallback(async () => {
    try {
      if (!audioContext.current) {
        await initAudioContext();
      }

      if (mediaRecorder.current && audioContext.current) {
        mediaRecorder.current.start(1000); // Send data every second
        setIsRecording(true);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error starting recording:', err);
    }
  }, [initAudioContext]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setAudioData(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [stopRecording]);

  return {
    isRecording,
    audioData,
    error,
    startRecording,
    stopRecording,
  };
};