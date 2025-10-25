import * as React from 'react'
import { BaseComponentProps } from './common'

// Navigation item structure
export interface NavigationItem {
 id: string
 label: string
 href?: string
 icon?: React.ComponentType<{ className?: string }>
 badge?: string | number
 disabled?: boolean
 children?: NavigationItem[]
 onClick?: () => void
 external?: boolean
}

// Props for main navigation components
export interface NavigationProps extends BaseComponentProps {
 items: NavigationItem[]
 currentPath?: string
 onItemClick?: (item: NavigationItem) => void
 variant?: 'horizontal' | 'vertical' | 'sidebar'
 collapsible?: boolean
 collapsed?: boolean
 onToggleCollapse?: () => void
}

// Props for mobile navigation drawer
export interface MobileNavigationProps extends BaseComponentProps {
 isOpen: boolean
 onOpenChange: (open: boolean) => void
 items?: NavigationItem[]
 user?: {
 id: string
 firstName: string
 lastName: string
 email: string
 } | null
 trigger?: React.ReactNode
}

// Props for breadcrumb navigation
export interface BreadcrumbItem {
 label: string
 href?: string
 current?: boolean
}

export interface BreadcrumbProps extends BaseComponentProps {
 items: BreadcrumbItem[]
 separator?: React.ReactNode
 maxItems?: number
 showHome?: boolean
 homeHref?: string
}

// Props for tab navigation
export interface TabItem {
 id: string
 label: string
 content?: React.ReactNode
 disabled?: boolean
 badge?: string | number
 icon?: React.ComponentType<{ className?: string }>
}

export interface TabsProps extends BaseComponentProps {
 items: TabItem[]
 activeTab?: string
 defaultTab?: string
 onTabChange?: (tabId: string) => void
 variant?: 'default' | 'pills' | 'underline'
 orientation?: 'horizontal' | 'vertical'
}

// Props for pagination navigation
export interface PaginationProps extends BaseComponentProps {
 currentPage: number
 totalPages: number
 onPageChange: (page: number) => void
 showFirstLast?: boolean
 showPrevNext?: boolean
 maxVisiblePages?: number
 disabled?: boolean
 size?: 'sm' | 'md' | 'lg'
}

// Props for step navigation/wizard
export interface StepItem {
 id: string
 title: string
 description?: string
 status: 'pending' | 'current' | 'completed' | 'error'
 optional?: boolean
}

export interface StepNavigationProps extends BaseComponentProps {
 steps: StepItem[]
 currentStep: string
 onStepClick?: (stepId: string) => void
 orientation?: 'horizontal' | 'vertical'
 showConnectors?: boolean
 clickableSteps?: boolean
}

// Props for menu components (dropdown, context menu)
export interface MenuItem {
 id: string
 label: string
 icon?: React.ComponentType<{ className?: string }>
 shortcut?: string
 disabled?: boolean
 destructive?: boolean
 separator?: boolean
 children?: MenuItem[]
 onClick?: () => void
}

export interface MenuProps extends BaseComponentProps {
 items: MenuItem[]
 trigger?: React.ReactNode
 onItemClick?: (item: MenuItem) => void
 placement?: 'top' | 'bottom' | 'left' | 'right'
 closeOnItemClick?: boolean
}

// Props for search navigation
export interface SearchProps extends BaseComponentProps {
 value?: string
 placeholder?: string
 onSearch?: (query: string) => void
 onClear?: () => void
 suggestions?: string[]
 isLoading?: boolean
 showRecentSearches?: boolean
 recentSearches?: string[]
 maxSuggestions?: number
}