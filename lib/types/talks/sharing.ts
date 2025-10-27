// Talk sharing type definitions
// This file contains types for talk sharing functionality

import { BaseUser } from '../auth/user';
import { MeetingType } from './generation';

export type ShareStatus = 'pending' | 'accepted' | 'declined';

export interface TalkShare {
    id: string;
    talkId: string;
    sharedById: string;
    sharedWithId: string;
    message?: string;
    status: ShareStatus;
    createdAt: Date;
    respondedAt?: Date;
}

export interface SharedTalkDetails {
    id: string;
    talk: {
        id?: string;
        title: string;
        content: string;
        duration: number;
        meetingType: MeetingType;
    };
    sharedWith: BaseUser;
    message?: string;
    status: ShareStatus;
    createdAt: Date;
    respondedAt?: Date;
}

export interface ReceivedTalkDetails {
    id: string;
    talk: {
        id?: string;
        title: string;
        content: string;
        duration: number;
        meetingType: MeetingType;
    };
    sharedBy: BaseUser;
    message?: string;
    status: ShareStatus;
    createdAt: Date;
}