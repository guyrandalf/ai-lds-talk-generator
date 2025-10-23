'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

export interface NavigationGuardState {
    hasUnsavedChanges: boolean
    showWarning: boolean
    warningMessage: string
    pendingNavigation: string | null
}

export interface NavigationGuardActions {
    setUnsavedChanges: (hasChanges: boolean) => void
    showUnsavedWarning: (message?: string) => void
    hideUnsavedWarning: () => void
    confirmNavigation: () => void
    cancelNavigation: () => void
    resetGuard: () => void
}

export interface UseNavigationGuardOptions {
    enabled?: boolean
    warningMessage?: string
    onBeforeUnload?: () => boolean
    onNavigationAttempt?: (url: string) => boolean
}

const DEFAULT_WARNING_MESSAGE = 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'

export function useNavigationGuard(options: UseNavigationGuardOptions = {}) {
    const {
        enabled = true,
        warningMessage = DEFAULT_WARNING_MESSAGE,
        onBeforeUnload,
        onNavigationAttempt
    } = options

    const router = useRouter()
    const [state, setState] = useState<NavigationGuardState>({
        hasUnsavedChanges: false,
        showWarning: false,
        warningMessage,
        pendingNavigation: null
    })

    // Track if we're in the middle of a confirmed navigation
    const isNavigatingRef = useRef(false)
    const originalPushRef = useRef<typeof router.push | null>(null)
    const originalReplaceRef = useRef<typeof router.replace | null>(null)

    const setUnsavedChanges = useCallback((hasChanges: boolean) => {
        setState(prev => ({
            ...prev,
            hasUnsavedChanges: hasChanges
        }))
    }, [])

    const showUnsavedWarning = useCallback((message?: string) => {
        setState(prev => ({
            ...prev,
            showWarning: true,
            warningMessage: message || warningMessage
        }))
    }, [warningMessage])

    const hideUnsavedWarning = useCallback(() => {
        setState(prev => ({
            ...prev,
            showWarning: false,
            pendingNavigation: null
        }))
    }, [])

    const confirmNavigation = useCallback(() => {
        const { pendingNavigation } = state

        // Reset state first
        setState(prev => ({
            ...prev,
            hasUnsavedChanges: false,
            showWarning: false,
            pendingNavigation: null
        }))

        // Perform the navigation if there was a pending one
        if (pendingNavigation) {
            isNavigatingRef.current = true
            router.push(pendingNavigation)
        }
    }, [state, router])

    const cancelNavigation = useCallback(() => {
        hideUnsavedWarning()
    }, [hideUnsavedWarning])

    const resetGuard = useCallback(() => {
        setState({
            hasUnsavedChanges: false,
            showWarning: false,
            warningMessage,
            pendingNavigation: null
        })
    }, [warningMessage])

    // Handle browser beforeunload event
    useEffect(() => {
        if (!enabled) return

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Skip if we're in a confirmed navigation
            if (isNavigatingRef.current) {
                isNavigatingRef.current = false
                return
            }

            if (state.hasUnsavedChanges) {
                // Call custom handler if provided
                if (onBeforeUnload && !onBeforeUnload()) {
                    return
                }

                // Standard browser warning
                event.preventDefault()
                event.returnValue = warningMessage
                return warningMessage
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [enabled, state.hasUnsavedChanges, warningMessage, onBeforeUnload])

    // Intercept router navigation
    useEffect(() => {
        if (!enabled) return

        // Store original router methods
        if (!originalPushRef.current) {
            originalPushRef.current = router.push
            originalReplaceRef.current = router.replace
        }

        // Override router.push
        router.push = (href: string, options?: any) => {
            // Skip if we're in a confirmed navigation
            if (isNavigatingRef.current) {
                isNavigatingRef.current = false
                return originalPushRef.current!(href, options)
            }

            if (state.hasUnsavedChanges) {
                // Call custom handler if provided
                if (onNavigationAttempt && !onNavigationAttempt(href)) {
                    return Promise.resolve(true)
                }

                // Show warning dialog
                setState(prev => ({
                    ...prev,
                    showWarning: true,
                    pendingNavigation: href
                }))
                return Promise.resolve(true)
            }

            return originalPushRef.current!(href, options)
        }

        // Override router.replace
        router.replace = (href: string, options?: any) => {
            // Skip if we're in a confirmed navigation
            if (isNavigatingRef.current) {
                isNavigatingRef.current = false
                return originalReplaceRef.current!(href, options)
            }

            if (state.hasUnsavedChanges) {
                // Call custom handler if provided
                if (onNavigationAttempt && !onNavigationAttempt(href)) {
                    return Promise.resolve(true)
                }

                // Show warning dialog
                setState(prev => ({
                    ...prev,
                    showWarning: true,
                    pendingNavigation: href
                }))
                return Promise.resolve(true)
            }

            return originalReplaceRef.current!(href, options)
        }

        // Cleanup function to restore original methods
        return () => {
            if (originalPushRef.current) {
                router.push = originalPushRef.current
            }
            if (originalReplaceRef.current) {
                router.replace = originalReplaceRef.current
            }
        }
    }, [enabled, state.hasUnsavedChanges, state.showWarning, router, onNavigationAttempt])

    return {
        ...state,
        setUnsavedChanges,
        showUnsavedWarning,
        hideUnsavedWarning,
        confirmNavigation,
        cancelNavigation,
        resetGuard
    }
}

// Specialized hook for talk editing with auto-save detection
export function useTalkNavigationGuard(talk?: any, originalTalk?: any) {
    const [hasChanges, setHasChanges] = useState(false)

    // Detect changes by comparing current talk with original
    useEffect(() => {
        if (!talk || !originalTalk) {
            setHasChanges(false)
            return
        }

        const hasUnsavedChanges =
            talk.title !== originalTalk.title ||
            talk.content !== originalTalk.content ||
            talk.duration !== originalTalk.duration ||
            talk.meetingType !== originalTalk.meetingType

        setHasChanges(hasUnsavedChanges)
    }, [talk, originalTalk])

    const navigationGuard = useNavigationGuard({
        enabled: true,
        warningMessage: 'You have unsaved changes to your talk. Are you sure you want to leave? Your changes will be lost.',
        onBeforeUnload: () => {
            // Return false to show browser warning
            return !hasChanges
        },
        onNavigationAttempt: (url) => {
            // Return false to show custom warning dialog
            return !hasChanges
        }
    })

    // Sync changes with navigation guard
    useEffect(() => {
        navigationGuard.setUnsavedChanges(hasChanges)
    }, [hasChanges, navigationGuard])

    return {
        ...navigationGuard,
        hasUnsavedChanges: hasChanges,
        setHasChanges
    }
}

// Hook for form-based navigation guards
export function useFormNavigationGuard(isDirty: boolean = false, customMessage?: string) {
    const navigationGuard = useNavigationGuard({
        enabled: true,
        warningMessage: customMessage || 'You have unsaved form changes. Are you sure you want to leave?',
    })

    // Sync form dirty state with navigation guard
    useEffect(() => {
        navigationGuard.setUnsavedChanges(isDirty)
    }, [isDirty, navigationGuard])

    return navigationGuard
}