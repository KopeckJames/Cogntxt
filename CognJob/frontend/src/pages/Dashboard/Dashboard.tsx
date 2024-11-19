// src/pages/Dashboard/Dashboard.tsx
import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { 
  Mic, 
  Pause, 
  Volume2, 
  Waveform, 
  Settings, 
  Clock,
  BarChart
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { transcript, aiResponse, isConnected, error: wsError } = useWebSocket();
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    audioLevel, 
    error: recordingError 
  } = useAudioRecording();
  
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const error = wsError || recordingError;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 ${
            isConnected ? 'text-green-500' : 'text-yellow-500'
          }`}>
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'animate-ping bg-green-500' : 'bg-yellow-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
            </span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
          
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recording Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">00:00:00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Audio Level
            </CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(audioLevel * 100)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Words Processed
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transcript?.split(' ').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transcription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Live Transcription
              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <Volume2 
                  className={`h-5 w-5 transition-colors ${
                    isRecording ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                />
              </div>
            </CardTitle>
            <CardDescription>
              Real-time speech to text transcription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                ref={transcriptRef}
                className="h-[300px] border rounded-lg p-4 overflow-y-auto bg-muted/50 whitespace-pre-wrap"
              >
                {transcript || 'Your transcription will appear here...'}
              </div>

              {/* Audio Level Visualization */}
              {isRecording && (
                <div className="h-12 border rounded-lg p-4 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-full transition-all duration-150"
                        style={{
                          height: `${Math.max(3, Math.min(24, audioLevel * 100 * (1 + i * 0.1)))}px`,
                          backgroundColor: `hsl(var(--primary) / ${Math.min(1, audioLevel * 3)})`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Button 
                className="w-full"
                onClick={handleToggleRecording}
                variant={isRecording ? "destructive" : "default"}
                disabled={!isConnected}
              >
                {isRecording ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Response Card */}
        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
            <CardDescription>
              Real-time AI generated responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] border rounded-lg p-4 overflow-y-auto bg-muted/50">
              {aiResponse || 'AI responses will appear here...'}
            </div>
            
            {isRecording && (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 flex items-center gap-2">
                <Waveform className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-primary">AI is listening and processing...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}