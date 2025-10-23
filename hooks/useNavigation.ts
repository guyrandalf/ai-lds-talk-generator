'use client'

import { useState, useEffect, useCallback } from 'react'

export function useNavigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const openMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(true)
    }, [])

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false)
    }, [])

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev)
    }, [])

    // Close menu on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu()
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleEscape)
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen, closeMobileMenu])

    return {
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu
    }
}