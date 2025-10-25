"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { BaseUser } from "@/lib/types/auth/user"
import { BaseComponentProps, LoadingProps } from "@/lib/types/components/common"


interface UserSearchComboboxProps extends BaseComponentProps, LoadingProps {
    selectedUsers: BaseUser[]
    onUserSelect: (user: BaseUser) => void
    onUserRemove: (userId: string) => void
    placeholder?: string
}

export function UserSearchCombobox({
    selectedUsers,
    onUserSelect,
    onUserRemove,
    placeholder = "Search users by name or email..."
}: UserSearchComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<BaseUser[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [searchError, setSearchError] = React.useState<string | null>(null)

    // Debounce search to avoid too many API calls
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim().length >= 1) {
                setIsLoading(true)
                setSearchError(null)
                try {
                    console.log('Searching for users with query:', searchQuery.trim())
                    const response = await fetch(
                        `/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`
                    )

                    if (response.ok) {
                        const data = await response.json()
                        console.log('Search response:', data)
                        setSearchResults(data.users || [])
                        setSearchError(null)
                    } else {
                        const errorData = await response.json().catch(() => ({}))
                        console.error('Search failed:', response.status, response.statusText, errorData)
                        setSearchError(errorData.error || `Search failed (${response.status})`)
                        setSearchResults([])
                    }
                } catch (error) {
                    console.error('Failed to search users:', error)
                    setSearchError('Network error - please check your connection')
                    setSearchResults([])
                } finally {
                    setIsLoading(false)
                }
            } else {
                setSearchResults([])
                setSearchError(null)
                setIsLoading(false)
            }
        }, 200) // Reduced debounce time for faster response

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const handleUserSelect = (user: BaseUser) => {
        // Check if user is already selected
        if (!selectedUsers.find(u => u.id === user.id)) {
            onUserSelect(user)
        }
        setOpen(false)
        setSearchQuery("")
    }



    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search users..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                                        Searching users...
                                    </div>
                                ) : searchError ? (
                                    <div className="py-4 text-center">
                                        <p className="text-sm text-red-600 mb-2">
                                            {searchError}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Please try again or contact support if the issue persists
                                        </p>
                                    </div>
                                ) : searchQuery.trim().length < 1 ? (
                                    <div className="py-4 text-center text-sm text-muted-foreground">
                                        Start typing to search for users by name or email
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <p className="text-sm text-muted-foreground mb-2">
                                            No users found for &quot;{searchQuery}&quot;
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Try searching by:
                                        </p>
                                        <ul className="text-xs text-muted-foreground mt-1">
                                            <li>• First name or last name</li>
                                            <li>• Email address</li>
                                            <li>• Part of their name</li>
                                        </ul>
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {searchResults.map((user) => {
                                    const isSelected = selectedUsers.find(u => u.id === user.id)
                                    const fullName = `${user.firstName} ${user.lastName}`

                                    return (
                                        <CommandItem
                                            key={user.id}
                                            value={`${fullName} ${user.email}`}
                                            onSelect={() => handleUserSelect(user)}
                                            className={cn(
                                                "cursor-pointer p-3 hover:bg-accent",
                                                isSelected && "bg-accent/50"
                                            )}
                                        >
                                            <div className="flex items-center w-full">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-sm truncate">
                                                            {fullName}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground truncate block">
                                                        {user.email}
                                                    </span>
                                                </div>
                                                <Check
                                                    className={cn(
                                                        "ml-2 h-4 w-4 flex-shrink-0",
                                                        isSelected ? "opacity-100 text-green-600" : "opacity-0"
                                                    )}
                                                />
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Display selected users */}
            {selectedUsers.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Selected users ({selectedUsers.length})
                        </p>
                        {selectedUsers.length > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectedUsers.forEach(user => onUserRemove(user.id))}
                                className="text-xs text-muted-foreground hover:text-destructive"
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between bg-accent/30 p-3 rounded-lg border"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onUserRemove(user.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    title="Remove user"
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}