'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
    clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            id,
            duration: 5000, // Default 5 seconds
            ...toast
        }

        setToasts(prev => [...prev, newToast])

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const clearAllToasts = () => {
        setToasts([])
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    const handleRemove = () => {
        setIsLeaving(true)
        setTimeout(() => onRemove(toast.id), 300) // Match animation duration
    }

    const getToastStyles = () => {
        const baseStyles = "transform transition-all duration-300 ease-in-out"

        if (isLeaving) {
            return `${baseStyles} translate-x-full opacity-0`
        }

        if (isVisible) {
            return `${baseStyles} translate-x-0 opacity-100`
        }

        return `${baseStyles} translate-x-full opacity-0`
    }

    const getToastColors = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            default:
                return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
        }
    }

    const getIcon = () => {
        const iconClass = "w-5 h-5 flex-shrink-0"

        switch (toast.type) {
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-600 dark:text-green-400`} />
            case 'error':
                return <AlertCircle className={`${iconClass} text-red-600 dark:text-red-400`} />
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-yellow-600 dark:text-yellow-400`} />
            case 'info':
                return <Info className={`${iconClass} text-blue-600 dark:text-blue-400`} />
            default:
                return <Info className={`${iconClass} text-gray-600 dark:text-gray-400`} />
        }
    }

    return (
        <div className={`${getToastStyles()}`}>
            <div className={`rounded-xl border shadow-lg p-4 ${getToastColors()}`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>

                    <div className="ml-3 flex-1">
                        <h4 className="text-sm font-semibold">
                            {toast.title}
                        </h4>
                        {toast.message && (
                            <p className="mt-1 text-sm opacity-90">
                                {toast.message}
                            </p>
                        )}
                        {toast.action && (
                            <div className="mt-3">
                                <button
                                    onClick={toast.action.onClick}
                                    className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                                >
                                    {toast.action.label}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleRemove}
                            className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Convenience functions for common toast types
export const toast = {
    success: (title: string, message?: string, options?: Partial<Toast>) => ({
        type: 'success' as const,
        title,
        message,
        ...options
    }),

    error: (title: string, message?: string, options?: Partial<Toast>) => ({
        type: 'error' as const,
        title,
        message,
        ...options
    }),

    warning: (title: string, message?: string, options?: Partial<Toast>) => ({
        type: 'warning' as const,
        title,
        message,
        ...options
    }),

    info: (title: string, message?: string, options?: Partial<Toast>) => ({
        type: 'info' as const,
        title,
        message,
        ...options
    })
}