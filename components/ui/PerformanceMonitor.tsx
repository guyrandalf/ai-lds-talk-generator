'use client'

import { useEffect, useState } from 'react'

interface NetworkInformation {
 effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
 downlink?: number
 rtt?: number
 saveData?: boolean
}

interface PerformanceMetrics {
 loadTime: number
 renderTime: number
 memoryUsage?: number
 connectionType?: string
 isSlowConnection: boolean
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
 const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

 useEffect(() => {
 // Measure page load performance
 const measurePerformance = () => {
 if (typeof window !== 'undefined' && 'performance' in window) {
 const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
 const paint = performance.getEntriesByType('paint')

 const loadTime = navigation.loadEventEnd - navigation.loadEventStart
 const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

 // Get connection information if available
 const navigatorWithConnection = navigator as Navigator & {
 connection?: NetworkInformation
 mozConnection?: NetworkInformation
 webkitConnection?: NetworkInformation
 }
 const connection = navigatorWithConnection.connection ||
 navigatorWithConnection.mozConnection ||
 navigatorWithConnection.webkitConnection
 const connectionType = connection?.effectiveType || 'unknown'
 const isSlowConnection = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'

 // Get memory usage if available
 const memoryUsage = (performance as Performance & {
 memory?: {
 usedJSHeapSize: number
 totalJSHeapSize: number
 jsHeapSizeLimit: number
 }
 }).memory?.usedJSHeapSize

 setMetrics({
 loadTime,
 renderTime,
 memoryUsage,
 connectionType,
 isSlowConnection
 })
 }
 }

 // Measure after page load
 if (document.readyState === 'complete') {
 measurePerformance()
 return undefined
 } else {
 window.addEventListener('load', measurePerformance)
 return () => window.removeEventListener('load', measurePerformance)
 }
 }, [])

 return metrics
}

/**
 * Performance monitoring component for development
 */
export function PerformanceMonitor() {
 const metrics = usePerformanceMonitor()
 const [isVisible, setIsVisible] = useState(false)

 // Only show in development
 if (process.env.NODE_ENV !== 'development') {
 return null
 }

 if (!metrics) {
 return null
 }

 return (
 <div className="fixed bottom-4 right-4 z-50">
 <button
 onClick={() => setIsVisible(!isVisible)}
 className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
 title="Performance Metrics"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </button>

 {isVisible && (
 <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
 <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>

 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Load Time:</span>
 <span className={`font-mono ${metrics.loadTime > 3000 ? 'text-red-600' : metrics.loadTime > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
 {metrics.loadTime.toFixed(0)}ms
 </span>
 </div>

 <div className="flex justify-between">
 <span className="text-gray-600">Render Time:</span>
 <span className={`font-mono ${metrics.renderTime > 2000 ? 'text-red-600' : metrics.renderTime > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
 {metrics.renderTime.toFixed(0)}ms
 </span>
 </div>

 {metrics.memoryUsage && (
 <div className="flex justify-between">
 <span className="text-gray-600">Memory:</span>
 <span className="font-mono text-gray-900">
 {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
 </span>
 </div>
 )}

 <div className="flex justify-between">
 <span className="text-gray-600">Connection:</span>
 <span className={`font-mono ${metrics.isSlowConnection ? 'text-red-600' : 'text-green-600'}`}>
 {metrics.connectionType}
 </span>
 </div>

 {metrics.isSlowConnection && (
 <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
 Slow connection detected. Consider optimizing for low bandwidth.
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )
}

/**
 * Component performance tracker
 */
export function withPerformanceTracking<P extends object>(
 Component: React.ComponentType<P>,
 componentName: string
) {
 return function TrackedComponent(props: P) {
 useEffect(() => {
 const startTime = performance.now()

 return () => {
 const endTime = performance.now()
 const renderTime = endTime - startTime

 if (renderTime > 100) { // Log slow renders
 console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
 }
 }
 })

 return <Component {...props} />
 }
}

/**
 * Bundle size analyzer (development only)
 */
interface BundleInfo {
 totalSize: number
 chunks: string[]
 dependencies: string[]
}

export function BundleAnalyzer() {
 const [bundleInfo, setBundleInfo] = useState<BundleInfo | null>(null)

 useEffect(() => {
 if (process.env.NODE_ENV === 'development') {
 // Analyze bundle size and dependencies
 const analyzeBundle = async () => {
 try {
 // This would integrate with webpack-bundle-analyzer or similar
 const info = {
 totalSize: 0, // Would be calculated from actual bundle
 chunks: [],
 dependencies: []
 }
 setBundleInfo(info)
 } catch (error) {
 console.error('Bundle analysis failed:', error)
 }
 }

 analyzeBundle()
 }
 }, [])

 if (process.env.NODE_ENV !== 'development' || !bundleInfo) {
 return null
 }

 return (
 <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
 <h3 className="font-semibold text-gray-900 mb-2">Bundle Analysis</h3>
 <div className="text-sm text-gray-600">
 Bundle analysis would appear here in a full implementation
 </div>
 </div>
 )
}

/**
 * Web Vitals monitoring
 */
export function useWebVitals() {
 const [vitals, setVitals] = useState<Record<string, number>>({})

 useEffect(() => {
 if (typeof window !== 'undefined') {
 // Import web-vitals dynamically
 import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
 onCLS((metric) => setVitals(prev => ({ ...prev, CLS: metric.value })))
 onINP((metric) => setVitals(prev => ({ ...prev, INP: metric.value })))
 onFCP((metric) => setVitals(prev => ({ ...prev, FCP: metric.value })))
 onLCP((metric) => setVitals(prev => ({ ...prev, LCP: metric.value })))
 onTTFB((metric) => setVitals(prev => ({ ...prev, TTFB: metric.value })))
 }).catch(() => {
 // web-vitals not available, use fallback measurements
 const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
 setVitals({
 TTFB: navigation.responseStart - navigation.requestStart,
 FCP: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
 })
 })
 }
 }, [])

 return vitals
}