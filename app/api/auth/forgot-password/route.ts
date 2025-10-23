import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PasswordResetService } from '@/lib/services/passwordResetService';
import { emailService } from '@/lib/services/emailService';
import { z } from 'zod';

const prisma = new PrismaClient();

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address')
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Always return success to prevent email enumeration attacks
        // But only send email if user exists
        if (user) {
            try {
                // Generate reset token
                const token = await PasswordResetService.generateResetToken(user.id);

                // Send reset email
                await emailService.sendPasswordReset(user.email, token, user.firstName);
            } catch (error) {
                console.error('Error sending password reset email:', error);
                // Don't expose internal errors to client
            }
        }

        return NextResponse.json({
            message: 'If an account with that email exists, we have sent a password reset link.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}