import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Header } from '@/components/layout/Header';

const App = () => {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="cognjob-theme">
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <div className="text-center">
                  <h1 className="text-4xl font-bold">Welcome to CognJob</h1>
                  <p className="mt-4 text-xl text-muted-foreground">
                    Your AI-powered audio transcription assistant
                  </p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;