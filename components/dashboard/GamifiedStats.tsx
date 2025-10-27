'use client'

import { useMemo, useEffect, useState } from 'react'
import { GeneratedTalk } from '@/lib/types/talks/generation'
import { getUserCumulativeStats } from '@/lib/actions/talks'
import { Trophy, Target, Zap, BookOpen, Award, Star, TrendingUp } from 'lucide-react'

interface GamifiedStatsProps {
    talks: GeneratedTalk[]
}

interface CumulativeStats {
    totalTalksGenerated: number
    totalWordsWritten: number
    longestStreak: number
}

interface Achievement {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    unlocked: boolean
    progress?: number
    maxProgress?: number
    color: string
}

interface UserStats {
    level: number
    xp: number
    xpToNext: number
    totalTalks: number
    totalWords: number
    streak: number
    achievements: Achievement[]
}

export default function GamifiedStats({ talks }: GamifiedStatsProps) {
    const [cumulativeStats, setCumulativeStats] = useState<CumulativeStats>({
        totalTalksGenerated: 0,
        totalWordsWritten: 0,
        longestStreak: 0
    })

    // Fetch cumulative stats on component mount and when talks change
    useEffect(() => {
        const fetchStats = async () => {
            const result = await getUserCumulativeStats()
            if (result.success && result.data) {
                setCumulativeStats(result.data)
            }
        }
        fetchStats()
    }, [talks])

    // Listen for talks changes from other components
    useEffect(() => {
        const handleTalksChanged = () => {
            // Refetch stats when talks change
            const fetchStats = async () => {
                const result = await getUserCumulativeStats()
                if (result.success && result.data) {
                    setCumulativeStats(result.data)
                }
            }
            fetchStats()
        }

        window.addEventListener('talksChanged', handleTalksChanged)
        return () => window.removeEventListener('talksChanged', handleTalksChanged)
    }, [])

    const stats = useMemo((): UserStats => {
        // Current active talks and words
        const currentTalks = talks.length
        const currentWords = talks.reduce((sum, talk) => {
            return sum + (talk.content?.split(/\s+/).length || 0)
        }, 0)

        // Use database cumulative stats for achievements and XP
        const persistentTalks = cumulativeStats.totalTalksGenerated
        const persistentWords = cumulativeStats.totalWordsWritten

        // Calculate XP based on persistent stats for achievements
        const xp = (persistentTalks * 100) + Math.floor(persistentWords / 10)

        // Calculate level (every 500 XP = 1 level)
        const level = Math.floor(xp / 500) + 1
        const xpToNext = 500 - (xp % 500)

        // Calculate streak (simplified - based on current talks)
        const streak = Math.min(currentTalks, 7) // Max streak of 7 for demo

        // Define achievements using persistent stats
        const achievements: Achievement[] = [
            {
                id: 'first_talk',
                title: 'First Steps',
                description: 'Generate your first talk',
                icon: <BookOpen className="w-5 h-5" />,
                unlocked: persistentTalks >= 1,
                color: 'bg-green-500'
            },
            {
                id: 'prolific_writer',
                title: 'Prolific Writer',
                description: 'Generate 5 talks (lifetime)',
                icon: <Trophy className="w-5 h-5" />,
                unlocked: persistentTalks >= 5,
                progress: Math.min(persistentTalks, 5),
                maxProgress: 5,
                color: 'bg-blue-500'
            },
            {
                id: 'word_master',
                title: 'Word Master',
                description: 'Write 10,000 words (lifetime)',
                icon: <Zap className="w-5 h-5" />,
                unlocked: persistentWords >= 10000,
                progress: Math.min(persistentWords, 10000),
                maxProgress: 10000,
                color: 'bg-purple-500'
            },
            {
                id: 'consistent_creator',
                title: 'Consistent Creator',
                description: 'Maintain a 5-talk streak',
                icon: <Target className="w-5 h-5" />,
                unlocked: streak >= 5,
                progress: Math.min(streak, 5),
                maxProgress: 5,
                color: 'bg-orange-500'
            },
            {
                id: 'talk_veteran',
                title: 'Talk Veteran',
                description: 'Generate 10 talks (lifetime)',
                icon: <Award className="w-5 h-5" />,
                unlocked: persistentTalks >= 10,
                progress: Math.min(persistentTalks, 10),
                maxProgress: 10,
                color: 'bg-red-500'
            },
            {
                id: 'rising_star',
                title: 'Rising Star',
                description: 'Reach level 5',
                icon: <Star className="w-5 h-5" />,
                unlocked: level >= 5,
                progress: Math.min(level, 5),
                maxProgress: 5,
                color: 'bg-yellow-500'
            }
        ]

        return {
            level,
            xp,
            xpToNext,
            totalTalks: currentTalks, // Show current active talks
            totalWords: currentWords, // Show current active words
            streak,
            achievements
        }
    }, [talks, cumulativeStats])

    return (
        <div className="space-y-6">
            {/* Level & XP Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Level {stats.level}</h3>
                        <p className="text-blue-100">Talk Creator</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>XP Progress</span>
                        <span>{stats.xpToNext} XP to next level</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${((500 - stats.xpToNext) / 500) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Stats Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 text-blue-600 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-blue-800 font-medium">About Your Stats</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Your level and achievements are based on lifetime progress and won&apos;t decrease when you delete talks.
                            The talk and word counts below show your currently active content.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTalks}</p>
                            <p className="text-sm text-gray-500">Active Talks</p>
                            {cumulativeStats.totalTalksGenerated > stats.totalTalks && (
                                <p className="text-xs text-gray-400">{cumulativeStats.totalTalksGenerated} created total</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
                            <p className="text-sm text-gray-500">Current Streak</p>
                            {cumulativeStats.longestStreak > stats.streak && (
                                <p className="text-xs text-gray-400">Best: {cumulativeStats.longestStreak}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Active Words</p>
                            {cumulativeStats.totalWordsWritten > stats.totalWords && (
                                <p className="text-xs text-gray-400">{cumulativeStats.totalWordsWritten.toLocaleString()} written total</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.achievements.filter(a => a.unlocked).length}</p>
                            <p className="text-sm text-gray-500">Achievements</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Achievements
                </h3>

                <div className="space-y-3">
                    {stats.achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${achievement.unlocked
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${achievement.unlocked ? achievement.color : 'bg-gray-400'
                                }`}>
                                {achievement.icon}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {achievement.title}
                                    </h4>
                                    {achievement.unlocked && (
                                        <span className="text-green-600 text-sm font-medium">Unlocked!</span>
                                    )}
                                </div>

                                <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                    {achievement.description}
                                </p>

                                {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-500 rounded-full h-1.5 transition-all duration-500"
                                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}