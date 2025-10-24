'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { GeneratedTalk } from '@/lib/types/talks/generation'

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
    shouldBlockNavigation: (url?: string) => boolean
    handleNavigationAttempt: (url: string) => boolean
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

    // Keep state ref updated
    useEffect(() => {
        stateRef.current = state
    }, [state])

    const stateRef = useRef(state)

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
        const { pendingNavigation } = stateRef.current

        // Reset state first
        setState(prev => ({
            ...prev,
            hasUnsavedChanges: false,
            showWarning: false,
            pendingNavigation: null
        }))

        // Perform the navigation if there was a pending one
        if (pendingNavigation) {
            router.push(pendingNavigation)
        }
    }, [router])

    // Helper function to check if navigation should be blocked
    const shouldBlockNavigation = useCallback((url?: string) => {
        if (!enabled || !stateRef.current.hasUnsavedChanges) {
            return false
        }

        if (onNavigationAttempt) {
            return !onNavigationAttempt(url || '')
        }

        return true
    }, [enabled, onNavigationAttempt])

    // Helper function to handle navigation attempt
    const handleNavigationAttempt = useCallback((url: string) => {
        if (shouldBlockNavigation(url)) {
            setState(prev => ({
                ...prev,
                showWarning: true,
                pendingNavigation: url
            }))
            return false
        }
        return true
    }, [shouldBlockNavigation])

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
            if (stateRef.current.hasUnsavedChanges) {
                // Call custom handler if provided
                if (onBeforeUnload && !onBeforeUnload()) {
                    return undefined
                }

                // Standard browser warning
                event.preventDefault()
                event.returnValue = warningMessage
                return warningMessage
            }

            return undefined
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [enabled, warningMessage, onBeforeUnload])

    // Handle browser navigation (back/forward)
    useEffect(() => {
        if (!enabled) return

        const handlePopState = () => {
            if (stateRef.current.hasUnsavedChanges) {
                // Show warning for browser navigation
                const shouldLeave = window.confirm(warningMessage)
                if (!shouldLeave) {
                    // Push current state back to prevent navigation
                    window.history.pushState(null, '', window.location.href)
                }
            }
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [enabled, warningMessage])

    // Handle navigation interception using popstate and beforeunload only
    // Router method interception is too fragile and causes conflicts

    return useMemo(() => ({
        ...state,
        setUnsavedChanges,
        showUnsavedWarning,
        hideUnsavedWarning,
        confirmNavigation,
        cancelNavigation,
        resetGuard,
        shouldBlockNavigation,
        handleNavigationAttempt
    }), [state, setUnsavedChanges, showUnsavedWarning, hideUnsavedWarning, confirmNavigation, cancelNavigation, resetGuard, shouldBlockNavigation, handleNavigationAttempt])
}

// Specialized hook for talk editing with auto-save detection
export function useTalkNavigationGuard(talk?: GeneratedTalk, originalTalk?: GeneratedTalk) {
    // Derive changes state directly from props using useMemo
    const hasChanges = useMemo(() => {
        if (!talk || !originalTalk) {
            return false
        }

        return (
            talk.title !== originalTalk.title ||
            talk.content !== originalTalk.content ||
            talk.duration !== originalTalk.duration ||
            talk.meetingType !== originalTalk.meetingType
        )
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
    }, [hasChanges, navigationGuard.setUnsavedChanges])

    return useMemo(() => ({
        ...navigationGuard,
        hasUnsavedChanges: hasChanges
    }), [navigationGuard, hasChanges])
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
    }, [isDirty, navigationGuard, navigationGuard.setUnsavedChanges])

    return navigationGuard
}