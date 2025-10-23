'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { sanitizeInput } from '../security/inputSanitization'

const prisma = new PrismaClient()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type AuthResult = {
  success: boolean
  error?: string
  user?: User
}

export async function registerUser(formData: FormData): Promise<AuthResult> {
  try {

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    }

    // Sanitize inputs (don't remove sensitive info for registration fields)
    const emailResult = await sanitizeInput(rawData.email, 'email', { removeSensitiveInfo: false })
    const firstNameResult = await sanitizeInput(rawData.firstName, 'name', { removeSensitiveInfo: false })
    const lastNameResult = await sanitizeInput(rawData.lastName, 'name', { removeSensitiveInfo: false })
    const passwordResult = await sanitizeInput(rawData.password, 'password', { removeSensitiveInfo: false })

    if (!emailResult.success || !firstNameResult.success || !lastNameResult.success || !passwordResult.success) {
      return {
        success: false,
        error: 'Invalid input data. Please check your information and try again.'
      }
    }

    const sanitizedData = {
      email: emailResult.sanitizedValue,
      password: passwordResult.sanitizedValue,
      firstName: firstNameResult.sanitizedValue,
      lastName: lastNameResult.sanitizedValue,
    }

    // Validate input
    const validatedData = registerSchema.parse(sanitizedData)

    // Check if user already exists
    console.log('Checking for existing user with email:', validatedData.email)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      console.log('User already exists')
      return {
        success: false,
        error: 'An account with this email already exists'
      }
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    console.log('Creating user...')
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    })
    console.log('User created successfully:', user.email)

    // Create session
    await createSession(user.id)

    return {
      success: true,
      user
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message
      }
    }

    console.error('Registration error:', error)
    return {
      success: false,
      error: 'An error occurred during registration. Please try again.'
    }
  }
}

export async function loginUser(formData: FormData): Promise<AuthResult> {
  try {

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Sanitize inputs (don't remove sensitive info for login fields)
    const emailResult = await sanitizeInput(rawData.email, 'email', { removeSensitiveInfo: false })
    const passwordResult = await sanitizeInput(rawData.password, 'password', { removeSensitiveInfo: false })

    if (!emailResult.success || !passwordResult.success) {
      return {
        success: false,
        error: 'Invalid input data. Please check your information and try again.'
      }
    }

    const sanitizedData = {
      email: emailResult.sanitizedValue,
      password: passwordResult.sanitizedValue,
    }

    // Validate input
    const validatedData = loginSchema.parse(sanitizedData)

    // Find user
    console.log('Looking for user with email:', validatedData.email)
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    console.log('User found:', user ? 'Yes' : 'No')
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // Verify password
    console.log('Comparing password...')
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password'
      }
    }

    // Create session
    await createSession(user.id)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message
      }
    }

    console.error('Login error:', error)
    return {
      success: false,
      error: 'An error occurred during login. Please try again.'
    }
  }
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/')
}

// Session management
async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()

  // Simple session token (in production, use JWT or more secure method)
  const sessionToken = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64')

  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())

    // Check if session is expired
    if (Date.now() > sessionData.expires) {
      return null
    }

    return { userId: sessionData.userId }
  } catch {
    return null
  }
}

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  try {
    // Try to get user from cache first
    const { getCachedUser, setCachedUser } = await import('../cache/queryCache')
    const cachedUser = await getCachedUser(session.userId) as User | null

    if (cachedUser) {
      return cachedUser
    }

    // If not in cache, fetch from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    })

    // Cache the user data for 5 minutes
    if (user) {
      await setCachedUser(session.userId, user, 5 * 60)
    }

    return user
  } catch {
    return null
  }
}

export async function updateProfile(formData: FormData): Promise<AuthResult> {
  try {

    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to update your profile'
      }
    }

    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    }

    // Sanitize inputs (don't remove sensitive info for profile fields)
    const firstNameResult = await sanitizeInput(rawData.firstName, 'name', { removeSensitiveInfo: false })
    const lastNameResult = await sanitizeInput(rawData.lastName, 'name', { removeSensitiveInfo: false })


    if (!firstNameResult.success || !lastNameResult.success) {
      return {
        success: false,
        error: 'Invalid input data. Please check your information and try again.'
      }
    }

    const sanitizedData = {
      firstName: firstNameResult.sanitizedValue,
      lastName: lastNameResult.sanitizedValue,
    }

    // Validate input
    const validatedData = profileUpdateSchema.parse(sanitizedData)


    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    })

    // Invalidate user cache after update
    const { invalidateUserCache } = await import('../cache/queryCache')
    await invalidateUserCache(session.userId)

    return {
      success: true,
      user: updatedUser
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message
      }
    }

    console.error('Profile update error:', error)
    return {
      success: false,
      error: 'An error occurred while updating your profile. Please try again.'
    }
  }
}

export async function changePassword(formData: FormData): Promise<AuthResult> {
  try {

    const session = await getSession()

    if (!session) {
      return {
        success: false,
        error: 'You must be logged in to change your password'
      }
    }

    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    // Sanitize inputs (passwords need special handling, don't remove sensitive info)
    const currentPasswordResult = await sanitizeInput(rawData.currentPassword, 'password', { removeSensitiveInfo: false })
    const newPasswordResult = await sanitizeInput(rawData.newPassword, 'password', { removeSensitiveInfo: false })
    const confirmPasswordResult = await sanitizeInput(rawData.confirmPassword, 'password', { removeSensitiveInfo: false })

    if (!currentPasswordResult.success || !newPasswordResult.success || !confirmPasswordResult.success) {
      return {
        success: false,
        error: 'Invalid input data. Please check your passwords and try again.'
      }
    }

    const sanitizedData = {
      currentPassword: currentPasswordResult.sanitizedValue,
      newPassword: newPasswordResult.sanitizedValue,
      confirmPassword: confirmPasswordResult.sanitizedValue,
    }

    // Validate input
    const validatedData = passwordChangeSchema.parse(sanitizedData)

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        password: true,
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Current password is incorrect'
      }
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(validatedData.newPassword, user.password)

    if (isSamePassword) {
      return {
        success: false,
        error: 'New password must be different from your current password'
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedNewPassword,
      }
    })

    return {
      success: true
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message
      }
    }

    console.error('Password change error:', error)
    return {
      success: false,
      error: 'An error occurred while changing your password. Please try again.'
    }
  }
}