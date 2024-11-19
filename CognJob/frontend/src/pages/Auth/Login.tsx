// src/pages/Auth/Login.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Login() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const { login, loading, error } = useAuth();

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   try {
     await login(email, password);
   } catch (err) {
     // Error handled by auth context
   }
 };

 return (
   <div className="flex items-center justify-center min-h-[80vh] px-4">
     <Card className="w-full max-w-md">
       <form onSubmit={handleSubmit}>
         <CardHeader>
           <CardTitle>Welcome back</CardTitle>
           <CardDescription>Sign in to your account</CardDescription>
         </CardHeader>

         <CardContent className="space-y-4">
           {error && (
             <Alert variant="destructive">
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}

           <div className="space-y-2">
             <label htmlFor="email">Email</label>
             <Input
               id="email"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               disabled={loading}
               required
             />
           </div>

           <div className="space-y-2">
             <label htmlFor="password">Password</label>
             <Input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               disabled={loading}
               required
             />
           </div>
         </CardContent>

         <CardFooter className="flex flex-col space-y-4">
           <Button 
             type="submit" 
             className="w-full"
             disabled={loading}
           >
             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Sign in
           </Button>

           <p className="text-sm text-center text-muted-foreground">
             Don't have an account?{' '}
             <Link to="/register" className="text-primary hover:underline">
               Sign up
             </Link>
           </p>
         </CardFooter>
       </form>
     </Card>
   </div>
 );
}