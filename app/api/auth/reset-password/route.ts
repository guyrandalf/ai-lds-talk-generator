import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/lib/services/passwordResetService';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

const validateTokenSchema = z.object({
    token: z.string().min(1, 'Reset token is required')
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { token, password } = validation.data;

        // Reset password
        const result = await PasswordResetService.resetPassword(token, password);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to reset password' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'An error occurred while resetting your password' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Reset token is required' },
                { status: 400 }
            );
        }

        // Validate token
        const validation = validateTokenSchema.safeParse({ token });
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid reset token format' },
                { status: 400 }
            );
        }

        const result = await PasswordResetService.validateResetToken(token);

        if (!result.valid) {
            return NextResponse.json(
                { error: result.error || 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            message: 'Reset token is valid'
        });

    } catch (error) {
        console.error('Validate token error:', error);
        return NextResponse.json(
            { error: 'An error occurred while validating the reset token' },
            { status: 500 }
        );
    }
}