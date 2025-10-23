'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/components/auth/AuthLayout';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                toast.success('Password reset instructions sent to your email');
            } else {
                toast.error(data.error || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout title="Check Your Email" subtitle="We've sent password reset instructions to your email address if an account exists.">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Check Your Email</CardTitle>
                        <CardDescription>
                            We've sent password reset instructions to your email address if an account exists.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setEmail('');
                                }}
                                className="w-full"
                            >
                                Try Different Email
                            </Button>
                            <Link href="/auth/login">
                                <Button variant="ghost" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot Password" subtitle="Enter your email address and we'll send you a link to reset your password.">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/auth/login"
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                Remember your password? Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}