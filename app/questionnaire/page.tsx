import { redirect } from 'next/navigation'

interface QuestionnairePageProps {
    searchParams: Promise<{ topic?: string }>
}

export default async function QuestionnairePage({ searchParams }: QuestionnairePageProps) {
    const params = await searchParams
    const topic = params.topic || ''

    // Redirect to the new generate page with the topic
    const searchParamsString = topic ? `?topic=${encodeURIComponent(topic)}` : ''
    redirect(`/generate${searchParamsString}`)
}