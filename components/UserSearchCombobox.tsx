"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
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

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
}

interface UserSearchComboboxProps {
    selectedUsers: User[]
    onUserSelect: (user: User) => void
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
    const [searchResults, setSearchResults] = React.useState<User[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Debounce search to avoid too many API calls
    React.useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsLoading(true)
                try {
                    const response = await fetch(
                        `/api/users/search?q=${encodeURIComponent(searchQuery)}`
                    )
                    if (response.ok) {
                        const data = await response.json()
                        setSearchResults(data.users || [])
                    }
                } catch (error) {
                    console.error('Failed to search users:', error)
                    setSearchResults([])
                } finally {
                    setIsLoading(false)
                }
            } else {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    const handleUserSelect = (user: User) => {
        // Check if user is already selected
        if (!selectedUsers.find(u => u.id === user.id)) {
            onUserSelect(user)
        }
        setOpen(false)
        setSearchQuery("")
    }

    const formatUserDisplay = (user: User) => {
        return `${user.firstName} ${user.lastName} (${user.email})`
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
                                {isLoading ? "Searching..." : searchQuery.length < 2 ? "Type at least 2 characters to search" : "No users found."}
                            </CommandEmpty>
                            <CommandGroup>
                                {searchResults.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.id}
                                        onSelect={() => handleUserSelect(user)}
                                        className="cursor-pointer"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {user.email}
                                            </span>
                                        </div>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedUsers.find(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Display selected users */}
            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected users:</p>
                    <div className="space-y-1">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between bg-muted p-2 rounded-md"
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm">
                                        {formatUserDisplay(user)}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onUserRemove(user.id)}
                                    className="h-6 w-6 p-0"
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