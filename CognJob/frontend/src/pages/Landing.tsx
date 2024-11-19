// src/pages/Landing.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Welcome to CognJob
      </h1>
      <p className="mt-6 text-xl text-muted-foreground max-w-[600px]">
        Your AI-powered audio transcription assistant. Transform conversations into actionable insights in real-time.
      </p>
      <div className="flex gap-4 mt-8">
        <Button 
          size="lg" 
          onClick={() => navigate('/register')}
          className="gap-2"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[900px]">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <feature.icon className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const features = [
  {
    title: "Real-time Transcription",
    description: "Convert speech to text instantly with high accuracy.",
    icon: ArrowRight,
  },
  {
    title: "AI-Powered Insights",
    description: "Get intelligent responses and suggestions in real-time.",
    icon: ArrowRight,
  },
  {
    title: "Secure & Private",
    description: "Your conversations are encrypted and private.",
    icon: ArrowRight,
  },
];

export default Landing;