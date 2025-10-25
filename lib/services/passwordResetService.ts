import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class PasswordResetService {
 private static readonly TOKEN_EXPIRY_HOURS = 1;

 static async generateResetToken(userId: string): Promise<string> {
 // Generate a secure random token
 const token = crypto.randomBytes(32).toString('hex');

 // Calculate expiry time (1 hour from now)
 const expiresAt = new Date();
 expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);

 // Invalidate any existing unused tokens for this user
 await prisma.passwordReset.updateMany({
 where: {
 userId,
 used: false,
 expiresAt: {
 gt: new Date()
 }
 },
 data: {
 used: true
 }
 });

 // Create new reset token
 await prisma.passwordReset.create({
 data: {
 token,
 userId,
 expiresAt,
 used: false
 }
 });

 return token;
 }

 static async validateResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
 try {
 const resetRecord = await prisma.passwordReset.findUnique({
 where: { token },
 include: { user: true }
 });

 if (!resetRecord) {
 return { valid: false, error: 'Invalid reset token' };
 }

 if (resetRecord.used) {
 return { valid: false, error: 'Reset token has already been used' };
 }

 if (resetRecord.expiresAt < new Date()) {
 return { valid: false, error: 'Reset token has expired' };
 }

 return { valid: true, userId: resetRecord.userId };
 } catch (error) {
 console.error('Error validating reset token:', error);
 return { valid: false, error: 'Failed to validate reset token' };
 }
 }

 static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
 try {
 const validation = await this.validateResetToken(token);

 if (!validation.valid || !validation.userId) {
 return { success: false, error: validation.error || 'Invalid token' };
 }

 // Hash the new password
 const bcrypt = await import('bcryptjs');
 const hashedPassword = await bcrypt.hash(newPassword, 12);

 // Update user password and mark token as used
 await prisma.$transaction([
 prisma.user.update({
 where: { id: validation.userId },
 data: { password: hashedPassword }
 }),
 prisma.passwordReset.update({
 where: { token },
 data: { used: true }
 })
 ]);

 return { success: true };
 } catch (error) {
 console.error('Error resetting password:', error);
 return { success: false, error: 'Failed to reset password' };
 }
 }

 static async cleanupExpiredTokens(): Promise<void> {
 try {
 await prisma.passwordReset.deleteMany({
 where: {
 OR: [
 { expiresAt: { lt: new Date() } },
 { used: true }
 ]
 }
 });
 } catch (error) {
 console.error('Error cleaning up expired tokens:', error);
 }
 }
}