"use client"

import * as React from"react"
import { Button } from"@/components/ui/button"
import { Loader2 } from"lucide-react"
import { cn } from"@/lib/utils"

interface FormSubmitProps {
 children: React.ReactNode
 loading?: boolean
 disabled?: boolean
 loadingText?: string
 variant?:"default" |"destructive" |"outline" |"secondary" |"ghost" |"link"
 size?:"default" |"sm" |"lg" |"icon"
 className?: string
 type?:"submit" |"button"
 onClick?: () => void
}

export function FormSubmit({
 children,
 loading = false,
 disabled = false,
 loadingText ="Loading...",
 variant ="default",
 size ="default",
 className,
 type ="submit",
 onClick
}: FormSubmitProps) {
 return (
 <Button
 type={type}
 variant={variant}
 size={size}
 disabled={disabled || loading}
 onClick={onClick}
 className={cn(
"relative",
 loading &&"cursor-not-allowed",
 className
 )}
 >
 {loading && (
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 )}
 {loading ? loadingText : children}
 </Button>
 )
}

// Form container with loading overlay
interface FormContainerProps {
 children: React.ReactNode
 loading?: boolean
 loadingText?: string
 onSubmit?: (e: React.FormEvent) => void
 className?: string
}

export function FormContainer({
 children,
 loading = false,
 loadingText ="Processing...",
 onSubmit,
 className
}: FormContainerProps) {
 return (
 <div className={cn("relative", className)}>
 <form onSubmit={onSubmit} className="space-y-6">
 {children}
 </form>

 {loading && (
 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Loader2 className="h-4 w-4 animate-spin" />
 {loadingText}
 </div>
 </div>
 )}
 </div>
 )
}

export type { FormSubmitProps, FormContainerProps }