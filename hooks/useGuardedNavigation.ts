'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface NavigationGuard {
    shouldBlockNavigation: (url?: string) => boolean
    handleNavigationAttempt: (url: string) => boolean
}

export function useGuardedNavigation(guard?: NavigationGuard) {
    const router = useRouter()

    const push = useCallback((href: string, options?: { scroll?: boolean }) => {
        if (guard && guard.shouldBlockNavigation(href)) {
            guard.handleNavigationAttempt(href)
            return
        }
        router.push(href, options)
    }, [router, guard])

    const replace = useCallback((href: string, options?: { scroll?: boolean }) => {
        if (guard && guard.shouldBlockNavigation(href)) {
            guard.handleNavigationAttempt(href)
            return
        }
        router.replace(href, options)
    }, [router, guard])

    const back = useCallback(() => {
        router.back()
    }, [router])

    const forward = useCallback(() => {
        router.forward()
    }, [router])

    const refresh = useCallback(() => {
        router.refresh()
    }, [router])

    return {
        push,
        replace,
        back,
        forward,
        refresh
    }
}