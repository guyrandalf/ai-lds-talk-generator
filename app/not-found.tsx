'use client'

import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center transition-colors">
                    {/* 404 Icon */}
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* 404 Title */}
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                        404
                    </h1>

                    {/* Error Message */}
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                        Let&apos;s get you back on track.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </button>
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Popular pages:
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link
                                href="/generate"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                            >
                                Generate Talk
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/auth/login"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}