'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export default function UnsavedChangesDialog({
    open,
    onOpenChange,
    title = "Unsaved Changes",
    message = "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
    confirmText = "Leave without saving",
    cancelText = "Stay on page",
    onConfirm,
    onCancel,
    isLoading = false
}: UnsavedChangesDialogProps) {
    const handleConfirm = () => {
        onConfirm()
        onOpenChange(false)
    }

    const handleCancel = () => {
        onCancel()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading && (
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Specialized dialog for talk-related unsaved changes
export function TalkUnsavedChangesDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    onSave,
    isLoading = false,
    isSaving = false
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    onCancel: () => void
    onSave?: () => void
    isLoading?: boolean
    isSaving?: boolean
}) {
    const handleSaveAndLeave = () => {
        if (onSave) {
            onSave()
        }
    }

    const handleLeaveWithoutSaving = () => {
        onConfirm()
        onOpenChange(false)
    }

    const handleStay = () => {
        onCancel()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        Unsaved Talk Changes
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        You have unsaved changes to your talk. What would you like to do?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleStay}
                        disabled={isLoading || isSaving}
                        className="w-full sm:w-auto order-3 sm:order-1"
                    >
                        Stay and continue editing
                    </Button>

                    {onSave && (
                        <Button
                            variant="default"
                            onClick={handleSaveAndLeave}
                            disabled={isLoading || isSaving}
                            className="w-full sm:w-auto order-1 sm:order-2"
                        >
                            {isSaving && (
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            )}
                            Save and leave
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        onClick={handleLeaveWithoutSaving}
                        disabled={isLoading || isSaving}
                        className="w-full sm:w-auto order-2 sm:order-3"
                    >
                        {isLoading && (
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        )}
                        Leave without saving
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Hook to use the unsaved changes dialog with navigation guard
export function useUnsavedChangesDialog() {
    return {
        UnsavedChangesDialog,
        TalkUnsavedChangesDialog
    }
}