import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
 children: React.ReactNode
 title: string
 subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
 return (
 <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 {/* Back to Home */}
 <div className="mb-8">
 <Link
 href="/"
 className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group"
 >
 <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
 Back to Home
 </Link>
 </div>

 {/* Header */}
 <div className="text-center mb-8">
 <h2 className="text-3xl font-bold text-gray-900 mb-2">
 {title}
 </h2>
 <p className="text-gray-600">
 {subtitle}
 </p>
 </div>
 </div>

 {/* Form Container */}
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 transition-colors">
 {children}
 </div>
 </div>
 </div>
 )
}