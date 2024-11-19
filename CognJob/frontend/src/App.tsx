import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="cognjob-theme">
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                    <h1 className="text-5xl font-bold tracking-tight mb-6">
                      Welcome to CognJob
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[600px] mb-8">
                      Your AI-powered audio transcription assistant.
                    </p>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;