
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authInstance } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [primaryInterest, setPrimaryInterest] = useState(''); // Added
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast({ title: "Registration Error", description: "Passwords do not match.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!primaryInterest) { // Added check
      setError("Please select your primary interest.");
      toast({ title: "Registration Error", description: "Please select your primary interest.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!authInstance) {
      setError("Authentication service is not available. Please try again later.");
      setLoading(false);
      toast({ title: "Registration Error", description: "Authentication service unavailable.", variant: "destructive" });
      return;
    }

    console.log("Registration attempt with interest:", primaryInterest); // Log selected interest

    try {
      await createUserWithEmailAndPassword(authInstance, email, password);
      // NOTE: The 'primaryInterest' is not saved to Firebase Auth user profile here.
      // This would require custom claims (server-side) or a separate DB write (e.g., Firestore).
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="primaryInterest">Primary Interest</Label>
              <Select
                value={primaryInterest}
                onValueChange={setPrimaryInterest}
                disabled={loading}
                required
              >
                <SelectTrigger id="primaryInterest" className="w-full mt-1">
                  <SelectValue placeholder="Select how you'll use this tool..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creator">Creating and Managing Landing Page Content</SelectItem>
                  <SelectItem value="admin_viewer">Reviewing Technical Specifications & Admin Tasks</SelectItem>
                  {/* Add other potential roles/interests as needed */}
                </SelectContent>
              </Select>
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
