import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
    try {
        // 1. Collecter les données brutes du site
        const { data: projects } = await supabase.from('projects').select('title, category, description')
        const { data: skills } = await supabase.from('skills').select('name, category, level')
        const { data: counters } = await supabase.from('experience_counters').select('*')
        const { data: messages } = await supabase.from('messages').select('content, created_at').order('created_at', { ascending: false }).limit(20)

        const siteContext = {
            projects,
            skills,
            counters,
            recent_messages: messages,
            timestamp: new Date().toISOString()
        }

        // 2. Envoyer à Groq pour analyse
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Tu es l'Intelligence Centrale du portfolio "Digital Shinobi" de Kevin. 
                    Ton rôle est de fournir un rapport stratégique, chic, professionnel et ultra-détaillé. 
                    Analyse les données fournies et rédige un rapport structuré avec :
                    - État de l'Arsenal (Projets & Skills)
                    - Activité Récente (Interactions messages)
                    - Recommandations stratégiques pour dominer le marché.
                    Utilise un ton mystérieux mais extrêmement efficace, type "Opérations Spéciales".`
                },
                {
                    role: "user",
                    content: `Données brutes du site : ${JSON.stringify(siteContext)}`
                }
            ],
            model: "llama-3.3-70b-versatile",
        })

        const content = completion.choices[0].message.content || ""
        return NextResponse.json({ report: content })
    } catch (error) {
        console.error('Report Error:', error)
        return NextResponse.json({ error: "Échec de la génération du rapport." }, { status: 500 })
    }
}
