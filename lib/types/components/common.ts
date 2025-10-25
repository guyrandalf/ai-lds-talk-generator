import * as React from 'react'

// Base component props that most components should extend
export interface BaseComponentProps {
 className?: string
 children?: React.ReactNode
}

// Loading state props for components that can show loading states
export interface LoadingProps {
 isLoading?: boolean
 loadingText?: string
}

// Error handling props for components that can display errors
export interface ErrorProps {
 error?: string
 onRetry?: () => void
}

// Size variants commonly used across components
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl'

// Common variant types for styled components
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'

// Props for components that can be disabled
export interface DisableableProps {
 disabled?: boolean
}

// Props for components with async actions
export interface AsyncActionProps {
 isLoading?: boolean
 onAction?: () => void | Promise<void>
}

// Props for components that handle user interactions
export interface InteractiveProps extends BaseComponentProps, DisableableProps {
 onClick?: (event: React.MouseEvent) => void
 onKeyDown?: (event: React.KeyboardEvent) => void
}

// Props for components that display data with optional actions
export interface DataDisplayProps<T = unknown> extends BaseComponentProps {
 data?: T
 isLoading?: boolean
 error?: string
 onRefresh?: () => void
}

// Props for modal/dialog components
export interface ModalProps extends BaseComponentProps {
 isOpen: boolean
 onClose: () => void
 title?: string
}

// Props for components with confirmation actions
export interface ConfirmationProps {
 onConfirm: () => void
 onCancel: () => void
 confirmText?: string
 cancelText?: string
 isDestructive?: boolean
}

// Props for components that handle file operations
export interface FileActionProps {
 onExport?: () => void
 onSave?: () => void
 onEdit?: () => void
 isExporting?: boolean
 isSaving?: boolean
}

// Props for components with authentication context
export interface AuthContextProps {
 isAuthenticated?: boolean
 user?: {
 id: string
 firstName: string
 lastName: string
 email: string
 }
}

// Dashboard-specific types
export interface UserStats {
 totalTalks: number
 availableForExport: number
}