import { MeetingType } from '@/lib/types/talks/generation'

export const getMeetingTypeLabel = (meetingType: MeetingType): string => {
    const meetingTypeLabels: Record<MeetingType, string> = {
        'sacrament': 'Sacrament Meeting',
        'sunday_school': 'Sunday School',
        'priesthood_relief_society': 'Priesthood/Relief Society',
        'primary': 'Primary',
        'young_men_women': 'Young Men/Young Women',
        'stake_conference': 'Stake Conference',
        'ward_conference': 'Ward Conference',
        'area_devotional': 'Area Conference/Devotional',
        'ysa_devotional': 'YSA Devotional/Fireside',
        'youth_fireside': 'Youth Fireside',
        'mission_conference': 'Mission Conference',
        'senior_devotional': 'Senior Devotional',
        'general_fireside': 'General Fireside'
    }

    return meetingTypeLabels[meetingType] || meetingType
}

export const getMeetingTypeVariant = (meetingType: MeetingType): 'default' | 'secondary' => {
    // Use default variant for sacrament meeting, secondary for others
    return meetingType === 'sacrament' ? 'default' : 'secondary'
}