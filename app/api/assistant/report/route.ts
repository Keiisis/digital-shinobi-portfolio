import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { visitorId, messages, type = 'chat' } = await request.json()

        // 1. Generate Summary of the conversation
        const lastMessages = messages.slice(-5).map((m: any) => `${m.role}: ${m.content}`).join('\n')

        // 2. Save to Admin Panel (assistant_conversations)
        const { data, error } = await supabase
            .from('assistant_conversations')
            .insert([{
                visitor_id: visitorId,
                messages: messages,
                summary: `Derniers échanges:\n${lastMessages}`,
                type: type
            }])

        if (error) throw error

        // 3. Simulated Email Report
        // In a real app, you'd use SendGrid/Resend here.
        console.log(`[RAPPORT ASSISTANT] Nouvelle interaction avec le visiteur ${visitorId}`)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Report API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
