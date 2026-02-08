import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
    try {
        const { messages, visitorId, type = 'chat', language = 'fr' } = await request.json()

        // 1. Fetch Assistant Settings
        const { data: settings } = await supabase
            .from('assistant_settings')
            .select('*')
            .single()

        if (!settings) {
            return NextResponse.json({ error: 'Assistant settings not found' }, { status: 404 })
        }

        // 1.5 Fetch Real Data from Database (Projects & Skills)
        const [{ data: projects }, { data: skills }] = await Promise.all([
            supabase.from('projects').select('title, category, description').eq('status', 'published').limit(10),
            supabase.from('skills').select('name, category, level').limit(15)
        ])

        const projectsList = projects?.map(p => `- ${p.title} (${p.category}): ${p.description}`).join('\n') || "Aucun projet listé pour le moment."
        const skillsList = skills?.map(s => `- ${s.name} (${s.category}) - Niveau: ${s.level}`).join('\n') || "Aucune compétence listée pour le moment."

        // 2. Prepare System Prompt with Knowledge Base
        const fullSystemPrompt = `
            ${settings.system_prompt}
            
            PERSONALITÉ: ${settings.personality}
            TON: ${settings.tone}
            
            BASE DE CONNAISSANCES SUR KEVIN CHACHA:
            ${settings.knowledge_base}

            MES RÉALISATIONS (PROJETS RÉELS):
            ${projectsList}

            MES COMPÉTENCES (ARSENAL):
            ${skillsList}
            
            INSTRUCTIONS:
            - Réponds de manière concise et utile.
            - Si on te demande tes projets, cite par exemple: ${projects?.slice(0, 3).map(p => p.title).join(', ')}.
            - Si on te demande qui tu es, présente-toi comme ${settings.name}.
            - N'invente pas d'informations sur Kevin qui ne sont pas dans la base de connaissances ou la liste des projets.
            - Rappelle aux visiteurs qu'ils peuvent contacter Kevin via le formulaire s'ils ont des questions spécifiques.
            - Utilise des expressions chaleureuses typiques de l'Afrique de l'Ouest (Bénin) quand c'est approprié.
            
            CRITICAL INSTRUCTION:
            - You MUST respond in the language: '${language}'. If the user writes in another language, adapt, but your primary instruction is to speak '${language}'.
        `

        // 3. Call Groq
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: fullSystemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        })

        if (!response.ok) {
            throw new Error('Groq API error')
        }

        const data = await response.json()
        const assistantMessage = data.choices[0]?.message?.content || "Désolé, j'ai rencontré un problème."

        // 4. Log Conversation (Optional: handle this on client for efficiency if needed, but doing it here for reliability)
        // We update the conversation in the database
        // This part can be improved to append to JSONB

        return NextResponse.json({ message: assistantMessage })

    } catch (error) {
        console.error('Assistant API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
