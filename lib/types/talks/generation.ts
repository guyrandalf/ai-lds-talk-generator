// Talk generation type definitions
// This file contains types for talk generation functionality

export type MeetingType = 'sacrament' | 'stake_conference';

export interface TalkQuestionnaire {
    topic: string;
    duration: number;
    meetingType: MeetingType;
    personalStory?: string;
    gospelLibraryLinks: string[];
    audienceType?: string;
    speakerAge?: string;
    preferredThemes: string[];
    customThemes: string[];
    audienceContext?: string;
    specificScriptures: string[];
}

export interface ChurchSource {
    title: string;
    url: string;
    type: 'scripture' | 'conference_talk' | 'manual' | 'article';
}

export interface GeneratedTalk {
    id?: string;
    title: string;
    content: string;
    duration: number;
    meetingType: MeetingType;
    sources: ChurchSource[];
    questionnaire: TalkQuestionnaire;
    createdAt?: Date;
}

export interface TalkPreferences {
    audienceType?: string;
    preferredThemes?: string[];
    specificScriptures?: string[];
}

export interface ProcessedQuestionnaireResult {
    success: boolean;
    error?: string;
    data?: {
        questionnaire: TalkQuestionnaire;
        userId?: string;
        sessionId: string;
    };
}

// Database talk type that matches the Prisma schema
export interface DatabaseTalk {
    id: string;
    title: string;
    content: string;
    duration: number;
    meetingType: string;
    topic: string | null;
    personalStory: string | null;
    gospelLibraryLinks: string[];
    preferences: unknown; // JSON field from database - using any to match Prisma's JsonValue
    audienceContext: string | null;
    customThemes: string[];
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}