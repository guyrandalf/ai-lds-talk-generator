'use client'

import { BreadcrumbItem, BreadcrumbProps } from '@/lib/types/components/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
 return (
 <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
 {items.map((item, index) => (
 <div key={index} className="flex items-center">
 {index > 0 && (
 <svg
 className="w-4 h-4 mx-2 text-gray-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 )}

 {item.href && !item.current ? (
 <Link
 href={item.href}
 className="text-gray-600 hover:text-gray-900 transition-colors"
 >
 {item.label}
 </Link>
 ) : (
 <span className={item.current ? 'text-gray-900 font-medium' : 'text-gray-600'}>
 {item.label}
 </span>
 )}
 </div>
 ))}
 </nav>
 )
}

// Hook to generate breadcrumbs based on current path
export function useBreadcrumbs() {
 const pathname = usePathname()

 const generateBreadcrumbs = (customItems?: BreadcrumbItem[]): BreadcrumbItem[] => {
 if (customItems) {
 return customItems
 }

 const items: BreadcrumbItem[] = [
 { label: 'Dashboard', href: '/dashboard' }
 ]

 if (pathname === '/generate') {
 items.push({ label: 'Create Talk', current: true })
 } else if (pathname.startsWith('/talk/')) {
 const segments = pathname.split('/')
 if (segments.includes('edit')) {
 items.push(
 { label: 'Talks', href: '/dashboard' },
 { label: 'Edit Talk', current: true }
 )
 } else {
 items.push(
 { label: 'Talks', href: '/dashboard' },
 { label: 'View Talk', current: true }
 )
 }
 } else if (pathname === '/settings') {
 items.push({ label: 'Settings', current: true })
 }

 return items
 }

 return { generateBreadcrumbs }
}

// Specialized breadcrumb for talk generation flow
export function TalkGenerationBreadcrumb({
 currentStep
}: {
 currentStep: 'questionnaire' | 'generating' | 'display'
}) {
 const getStepLabel = () => {
 switch (currentStep) {
 case 'questionnaire':
 return 'Create Talk'
 case 'generating':
 return 'Generating Talk'
 case 'display':
 return 'Review Talk'
 default:
 return 'Create Talk'
 }
 }

 const items: BreadcrumbItem[] = [
 { label: 'Dashboard', href: '/dashboard' },
 { label: getStepLabel(), current: true }
 ]

 return <Breadcrumb items={items} className="text-gray-600 mb-8" />
}