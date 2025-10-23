import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileUpdateForm from '@/components/ProfileUpdateForm'
import PasswordChangeForm from '@/components/PasswordChangeForm'

export default async function SettingsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your profile and account preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <ProfileUpdateForm user={user} />

                    {/* Security Settings */}
                    <PasswordChangeForm />

                    {/* Talk Preferences */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Talk Preferences</h2>
                                    <p className="text-gray-600 text-sm">Customize your talk generation settings</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Default Talk Length</h3>
                                        <p className="text-gray-600 text-sm">15 minutes</p>
                                    </div>
                                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Customize
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                                    <div>
                                        <h3 className="font-medium text-gray-900">Export Format</h3>
                                        <p className="text-gray-600 text-sm">Microsoft Word (.docx)</p>
                                    </div>
                                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
                                    <p className="text-gray-600 text-sm">Manage your account</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-red-900">Delete Account</h3>
                                        <p className="text-red-700 text-sm">Permanently delete your account and all data</p>
                                    </div>
                                    <button className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Settings - LDS Talk Generator',
    description: 'Manage your account settings and preferences',
}