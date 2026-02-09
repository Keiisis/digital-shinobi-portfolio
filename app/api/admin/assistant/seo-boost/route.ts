import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
    try {
        // 1. Collecter les données pour l'optimisation
        const { data: projects } = await supabase.from('projects').select('title, category, tags')
        const { data: skills } = await supabase.from('skills').select('name, category')

        const siteData = { projects, skills }

        // 2. Envoyer à Groq pour générer du SEO "Blackhat" & PNL
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en SEO Blackhat et en psychologie PNL (Programmation Neuro-Linguistique).
                    Ton but est de générer des méta-données et du contenu subliminal pour le site "Digital Shinobi".
                    Produit un objet JSON avec les clés suivantes :
                    - meta_description : Une description de 160 caractères max, incluant des déclencheurs psychologiques de curiosité et d'autorité.
                    - keywords : Une liste de mots-clés haute performance (tech et psychologie).
                    - structured_data : Un objet JSON-LD (Schema.org) complet pour un "ProfessionalService" ou "Person".
                    - pnl_hooks : Une liste de 3 phrases addictives à utiliser dans le site.`
                },
                {
                    role: "user",
                    content: `Contenu actuel du site : ${JSON.stringify(siteData)}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0].message.content || "{}"
        const seoPayload = JSON.parse(content)

        return NextResponse.json(seoPayload)
    } catch (error) {
        console.error('SEO Boost Error:', error)
        return NextResponse.json({ error: "Échec du boost SEO." }, { status: 500 })
    }
}
