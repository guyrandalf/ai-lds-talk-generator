'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GeneratedTalk } from '@/lib/actions/talks'
import TalkManagementActions from './TalkManagementActions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Tag, Calendar, Eye, MoreHorizontal, FileText, ArrowRight } from 'lucide-react'

interface TalksListProps {
    talks: GeneratedTalk[]
}

export default function TalksList({ talks }: TalksListProps) {
    const [selectedTalk, setSelectedTalk] = useState<GeneratedTalk | null>(null)

    if (talks.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No talks created yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Create your first talk to get started with personalized Church content.
                        </p>
                        <Button asChild>
                            <Link href="/questionnaire">
                                Create your first talk
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {talks.map((talk) => (
                <Card key={talk.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-semibold truncate">
                                        {talk.title}
                                    </h4>
                                    <Badge variant={talk.meetingType === 'sacrament' ? 'default' : 'secondary'}>
                                        {talk.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Stake Conference'}
                                    </Badge>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {talk.duration} minutes
                                    </div>
                                    {talk.questionnaire?.topic && (
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-1" />
                                            {talk.questionnaire.topic}
                                        </div>
                                    )}
                                    {talk.createdAt && (
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {new Date(talk.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <p className="text-muted-foreground text-sm line-clamp-2">
                                    {talk.content.substring(0, 150)}...
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/talk/${talk.id}`}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Link>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTalk(talk)}
                                >
                                    <MoreHorizontal className="w-4 h-4 mr-1" />
                                    Manage
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Management Modal */}
            {selectedTalk && (
                <TalkManagementActions
                    talk={selectedTalk}
                    onClose={() => setSelectedTalk(null)}
                />
            )}
        </div>
    )
}