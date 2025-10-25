'use client'

import { useMemo } from 'react'
import { GeneratedTalk } from '@/lib/types/talks/generation'
import { Trophy, Target, Zap, BookOpen, Award, Star, TrendingUp } from 'lucide-react'

interface GamifiedStatsProps {
    talks: GeneratedTalk[]
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
    const stats = useMemo((): UserStats => {
        const totalTalks = talks.length
        const totalWords = talks.reduce((sum, talk) => {
            return sum + (talk.content?.split(/\s+/).length || 0)
        }, 0)

        // Calculate XP (100 XP per talk + 1 XP per 10 words)
        const xp = (totalTalks * 100) + Math.floor(totalWords / 10)

        // Calculate level (every 500 XP = 1 level)
        const level = Math.floor(xp / 500) + 1
        const xpToNext = 500 - (xp % 500)

        // Calculate streak (simplified - based on recent talks)
        const streak = Math.min(totalTalks, 7) // Max streak of 7 for demo

        // Define achievements
        const achievements: Achievement[] = [
            {
                id: 'first_talk',
                title: 'First Steps',
                description: 'Generate your first talk',
                icon: <BookOpen className="w-5 h-5" />,
                unlocked: totalTalks >= 1,
                color: 'bg-green-500'
            },
            {
                id: 'prolific_writer',
                title: 'Prolific Writer',
                description: 'Generate 5 talks',
                icon: <Trophy className="w-5 h-5" />,
                unlocked: totalTalks >= 5,
                progress: Math.min(totalTalks, 5),
                maxProgress: 5,
                color: 'bg-blue-500'
            },
            {
                id: 'word_master',
                title: 'Word Master',
                description: 'Write 10,000 words total',
                icon: <Zap className="w-5 h-5" />,
                unlocked: totalWords >= 10000,
                progress: Math.min(totalWords, 10000),
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
                description: 'Generate 10 talks',
                icon: <Award className="w-5 h-5" />,
                unlocked: totalTalks >= 10,
                progress: Math.min(totalTalks, 10),
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
            totalTalks,
            totalWords,
            streak,
            achievements
        }
    }, [talks])

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

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTalks}</p>
                            <p className="text-sm text-gray-500">Talks Created</p>
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
                            <p className="text-sm text-gray-500">Day Streak</p>
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
                            <p className="text-sm text-gray-500">Words Written</p>
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