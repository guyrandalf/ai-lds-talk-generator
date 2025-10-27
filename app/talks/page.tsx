'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
// import { useRouter } from 'next/navigation' // Not currently used
import Link from 'next/link'
import { Search, ArrowLeft, Plus } from 'lucide-react'
import { getUserTalksPaginated } from '@/lib/actions/talks'
import { GeneratedTalk } from '@/lib/types/talks/generation'
import TalksList from '@/components/TalksList'
import { TalkListSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'sonner'

export default function AllTalksPage() {
    // const router = useRouter() // Removed as not currently used
    const [talks, setTalks] = useState<GeneratedTalk[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [search, setSearch] = useState('')
    const [searchDebounce, setSearchDebounce] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement | null>(null)

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    // Fetch talks function
    const fetchTalks = useCallback(async (pageNum: number, searchTerm: string = '', reset: boolean = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }

            const result = await getUserTalksPaginated(pageNum, 10, searchTerm)

            if (result.success && result.data) {
                const { talks: newTalks, totalCount: newTotal, hasMore: newHasMore } = result.data

                if (reset || pageNum === 1) {
                    setTalks(newTalks)
                } else {
                    setTalks(prev => [...prev, ...newTalks])
                }

                setTotalCount(newTotal)
                setHasMore(newHasMore)
                setPage(pageNum)
            } else {
                toast.error(result.error || 'Failed to load talks')
            }
        } catch (error) {
            console.error('Error fetching talks:', error)
            toast.error('Failed to load talks')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    // Reset and fetch when search changes
    useEffect(() => {
        setTalks([])
        setPage(1)
        setHasMore(true)
        fetchTalks(1, searchDebounce, true)
    }, [searchDebounce, fetchTalks])

    // Initial load
    useEffect(() => {
        fetchTalks(1)
    }, [fetchTalks])

    // Infinite scroll setup
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
                    fetchTalks(page + 1, searchDebounce)
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [hasMore, loading, loadingMore, page, searchDebounce, fetchTalks])

    // Handle talk deletion
    const handleTalkDeleted = useCallback(() => {
        // Refresh the current page to update counts
        fetchTalks(1, searchDebounce, true)
        // Notify other components
        window.dispatchEvent(new CustomEvent('talksChanged'))
    }, [searchDebounce, fetchTalks])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold text-gray-900">My Talks</h1>
                            <p className="text-gray-600 mt-2">
                                {loading ? 'Loading...' : `${totalCount} talk${totalCount !== 1 ? 's' : ''} total`}
                            </p>
                        </div>
                        <div className="hidden md:flex space-x-4">
                            <Link
                                href="/generate"
                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Talk
                            </Link>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search talks by title, content, or topic..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Talks List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {loading ? (
                        <div className="p-6">
                            <TalkListSkeleton />
                        </div>
                    ) : talks.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search className="w-16 h-16 mx-auto mb-4" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {search ? 'No talks found' : 'No talks yet'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {search
                                    ? `No talks match "${search}". Try a different search term.`
                                    : 'Create your first talk to get started with personalized Church content.'
                                }
                            </p>
                            {!search && (
                                <Link
                                    href="/generate"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Talk
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            <TalksList talks={talks} onTalkDeleted={handleTalkDeleted} />

                            {/* Loading more indicator */}
                            {loadingMore && (
                                <div className="mt-6 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {/* Infinite scroll trigger */}
                            <div ref={loadMoreRef} className="h-4" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}