'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
 src: string
 alt: string
 width?: number
 height?: number
 className?: string
 priority?: boolean
 quality?: number
 placeholder?: 'blur' | 'empty'
 blurDataURL?: string
 sizes?: string
 fill?: boolean
 style?: React.CSSProperties
 onLoad?: () => void
 onError?: () => void
}

/**
 * Optimized image component with lazy loading, blur placeholder, and error handling
 */
export function OptimizedImage({
 src,
 alt,
 width,
 height,
 className = '',
 priority = false,
 quality = 85,
 placeholder = 'blur',
 blurDataURL,
 sizes,
 fill = false,
 style,
 onLoad,
 onError
}: OptimizedImageProps) {
 const [isLoading, setIsLoading] = useState(true)
 const [hasError, setHasError] = useState(false)

 // Generate a simple blur placeholder if none provided
 const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width || 400, height || 300)

 const handleLoad = () => {
 setIsLoading(false)
 onLoad?.()
 }

 const handleError = () => {
 setIsLoading(false)
 setHasError(true)
 onError?.()
 }

 if (hasError) {
 return (
 <div
 className={`flex items-center justify-center bg-gray-200 ${className}`}
 style={{ width, height, ...style }}
 >
 <svg
 className="w-8 h-8 text-gray-400"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
 />
 </svg>
 </div>
 )
 }

 return (
 <div className={`relative ${className}`} style={style}>
 <Image
 src={src}
 alt={alt}
 width={fill ? undefined : width}
 height={fill ? undefined : height}
 fill={fill}
 priority={priority}
 quality={quality}
 placeholder={placeholder}
 blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
 sizes={sizes}
 className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
 }`}
 onLoad={handleLoad}
 onError={handleError}
 />

 {isLoading && (
 <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
 </div>
 )}
 </div>
 )
}

/**
 * Generate a simple blur data URL for placeholder
 */
function generateBlurDataURL(width: number, height: number): string {
 const canvas = document.createElement('canvas')
 canvas.width = width
 canvas.height = height

 const ctx = canvas.getContext('2d')
 if (!ctx) return ''

 // Create a simple gradient blur effect
 const gradient = ctx.createLinearGradient(0, 0, width, height)
 gradient.addColorStop(0, '#f3f4f6')
 gradient.addColorStop(1, '#e5e7eb')

 ctx.fillStyle = gradient
 ctx.fillRect(0, 0, width, height)

 return canvas.toDataURL()
}

/**
 * Responsive image component with automatic sizing
 */
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'width' | 'height' | 'sizes'> {
 aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | number
 maxWidth?: number
 breakpoints?: {
 sm?: number
 md?: number
 lg?: number
 xl?: number
 }
}

export function ResponsiveImage({
 aspectRatio = 'landscape',
 maxWidth = 1200,
 breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 },
 ...props
}: ResponsiveImageProps) {
 // Calculate aspect ratio
 const getAspectRatio = () => {
 if (typeof aspectRatio === 'number') return aspectRatio

 switch (aspectRatio) {
 case 'square': return 1
 case 'video': return 16 / 9
 case 'portrait': return 3 / 4
 case 'landscape': return 4 / 3
 default: return 4 / 3
 }
 }

 const ratio = getAspectRatio()

 // Generate sizes string for responsive images
 const sizes = Object.entries(breakpoints)
 .sort(([, a], [, b]) => a - b)
 .map(([key, value], index, array) => {
 const isLast = index === array.length - 1
 const width = Math.min(value, maxWidth)
 return isLast ? `${width}px` : `(max-width: ${value}px) ${width}px`
 })
 .join(', ')

 return (
 <div
 className="relative w-full"
 style={{ aspectRatio: ratio }}
 >
 <OptimizedImage
 {...props}
 fill
 sizes={sizes}
 className="object-cover"
 />
 </div>
 )
}

/**
 * Avatar image component with fallback
 */
interface AvatarImageProps {
 src?: string
 alt: string
 size?: 'sm' | 'md' | 'lg' | 'xl'
 fallback?: string
 className?: string
}

export function AvatarImage({
 src,
 alt,
 size = 'md',
 fallback,
 className = ''
}: AvatarImageProps) {
 const [hasError, setHasError] = useState(false)

 const sizeClasses = {
 sm: 'w-8 h-8',
 md: 'w-12 h-12',
 lg: 'w-16 h-16',
 xl: 'w-24 h-24'
 }

 const sizePixels = {
 sm: 32,
 md: 48,
 lg: 64,
 xl: 96
 }

 if (!src || hasError) {
 return (
 <div className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center ${className}`}>
 {fallback ? (
 <span className="text-gray-600 font-medium">
 {fallback}
 </span>
 ) : (
 <svg className="w-1/2 h-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
 <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 )}
 </div>
 )
 }

 return (
 <OptimizedImage
 src={src}
 alt={alt}
 width={sizePixels[size]}
 height={sizePixels[size]}
 className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
 onError={() => setHasError(true)}
 />
 )
}