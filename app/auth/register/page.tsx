import RegisterForm from '@/components/auth/RegisterForm'
import AuthLayout from '@/components/auth/AuthLayout'

export default async function RegisterPage() {
    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Join thousands of Church members creating inspiring talks with official content"
        >
            <RegisterForm />
        </AuthLayout>
    )
}

export const metadata = {
    title: 'Register - Pulpit Pal',
    description: 'Create your account to save and manage your talks',
}