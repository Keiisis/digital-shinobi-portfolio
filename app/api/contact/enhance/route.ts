import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
    try {
        const { text, clientName, domain } = await request.json()

        if (!text) {
            return NextResponse.json({ error: 'Texte manquant' }, { status: 400 })
        }

        const systemPrompt = `
            Tu es l'Expert Stratège et Cloud Shinobi de Kevin Chacha.
            TA MISSION : Améliorer une réponse commerciale pour un client.
            
            TECHNIQUES À APPLIQUER :
            - PNL Commerciale (Programmation Neuro-Linguistique) : Utilise des prédicats sensoriels, crée du rapport.
            - Hypnose Conversationnelle : Utilise des structures persuasives subtiles (doubles liens, présuppositions).
            - Marketing des Affaires : Soit convaincant, précis, et mets en avant la valeur ajoutée (ROI, efficacité).
            - Style Shinobi : Secret, puissant, rapide, élégant et mystérieux mais ultra-professionnel.
            
            CONTEXTE :
            - Client : ${clientName}
            - Domaine : ${domain}
            
            INSTRUCTIONS :
            - Transforme le texte brut en un message de vente "Elite".
            - Le ton doit être courtois mais montrer une expertise dominante.
            - La réponse doit être directe et donner envie de collaborer immédiatement.
            - RÉPONDS UNIQUEMENT AVEC LE TEXTE AMÉLIORÉ.
        `

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Améliore ce message : "${text}"` }
                ],
                temperature: 0.8
            })
        })

        const groqData = await groqResponse.json()
        const enhancedText = groqData.choices[0]?.message?.content || text

        return NextResponse.json({ enhancedText })

    } catch (error: any) {
        console.error('Enhance API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
