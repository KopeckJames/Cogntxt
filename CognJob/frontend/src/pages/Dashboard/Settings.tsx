import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/Label';

interface UserSettings {
  email: string;
  notifications: boolean;
  language: string;
  transcriptionQuality: 'standard' | 'high';
}

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    notifications: true,
    language: 'en',
    transcriptionQuality: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        setError('Failed to load settings');
      }
    };

    fetchSettings();
  }, [user, navigate]);

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Settings updated successfully');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold">Settings</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive email notifications about transcriptions
              </div>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, notifications: checked })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <select
              id="language"
              className="w-full p-2 rounded-md border bg-background"
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              disabled={loading}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Transcription Quality</Label>
            <select
              id="quality"
              className="w-full p-2 rounded-md border bg-background"
              value={settings.transcriptionQuality}
              onChange={(e) => setSettings({ 
                ...settings, 
                transcriptionQuality: e.target.value as 'standard' | 'high'
              })}
              disabled={loading}
            >
              <option value="standard">Standard</option>
              <option value="high">High</option>
            </select>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;