import LoginForm from '@/components/auth/LoginForm'
import AuthLayout from '@/components/auth/AuthLayout'

export default async function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to access your saved talks and continue creating inspiring content"
        >
            <LoginForm />
        </AuthLayout>
    )
}

export const metadata = {
    title: 'Sign In - Pulpit Pal',
    description: 'Sign in to access your saved talks and account settings',
}