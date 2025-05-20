
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Re-enabled
import { authInstance } from '@/lib/firebase'; // Re-enabled
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus } from 'lucide-react'; // Removed AlertTriangle

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Removed: toast({ title: "Feature Paused", description: "User registration is temporarily unavailable.", variant: "destructive" });
    // Removed: setLoading(false);


    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Registration Error", description: "Passwords do not match.", variant: "destructive" });
      setLoading(false);
      return; 
    }
    

    if (!authInstance) {
      setError("Authentication service is not available. Please try again later.");
      setLoading(false);
      toast({ title: "Registration Error", description: "Authentication service unavailable.", variant: "destructive" });
      return;
    }

    try {
      await createUserWithEmailAndPassword(authInstance, email, password);
      toast({ title: "Registration Successful!", description: "You can now log in." });
      router.push('/login'); 
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Failed to register. Please try again.');
      toast({ title: "Registration Failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-2xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join to start building and testing landing pages.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Removed Paused Feature Notice */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
                disabled={loading} // Re-enabled
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (min. 6 characters)"
                className="mt-1"
                disabled={loading} // Re-enabled
              />
            </div>
             <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                disabled={loading} // Re-enabled
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 hover:underline">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
