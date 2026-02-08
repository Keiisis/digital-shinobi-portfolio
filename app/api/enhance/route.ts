import { NextRequest, NextResponse } from 'next/server'

// Use Groq free API for text enhancement
// Get your free API key at https://console.groq.com/
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
    try {
        const { text, type = 'enhance' } = await request.json()

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        // If no API key, use a fallback enhancement (basic)
        if (!GROQ_API_KEY) {
            return NextResponse.json({
                enhanced: enhanceTextBasic(text),
                warning: 'Using basic enhancement. Set GROQ_API_KEY for AI-powered enhancement.'
            })
        }

        // Use Groq API (free, fast, powerful)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(type)
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Groq API error:', errorData)
            return NextResponse.json({
                enhanced: enhanceTextBasic(text),
                warning: 'AI unavailable, using basic enhancement'
            })
        }

        const data = await response.json()
        const enhanced = data.choices[0]?.message?.content || text

        return NextResponse.json({ enhanced })

    } catch (error) {
        console.error('Enhancement error:', error)
        return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 })
    }
}

// System prompts for different enhancement types
function getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
        enhance: `Tu es un expert en rédaction de portfolios professionnels. 
Ton rôle est de transformer les descriptions de projets en textes captivants, séduisants et professionnels.

Règles:
- Garde le sens original mais améliore le style
- Utilise un ton professionnel mais engageant
- Mets en valeur les compétences et réalisations
- Sois concis mais impactant
- Réponds UNIQUEMENT avec le texte amélioré, sans introduction ni explication
- Garde la même langue que le texte original`,

        translate_en: `You are a professional translator specializing in portfolios and creative content.
Translate the following text to English while maintaining a professional and engaging tone.
Respond ONLY with the translation, no explanations.`,

        translate_es: `Eres un traductor profesional especializado en portfolios y contenido creativo.
Traduce el siguiente texto al español manteniendo un tono profesional y atractivo.
Responde SOLO con la traducción, sin explicaciones.`
    }

    return prompts[type] || prompts.enhance
}

// Basic enhancement without AI (fallback)
function enhanceTextBasic(text: string): string {
    // Capitalize first letter
    let enhanced = text.charAt(0).toUpperCase() + text.slice(1)

    // Ensure proper punctuation
    if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
        enhanced += '.'
    }

    // Replace basic words with stronger alternatives
    const replacements: Record<string, string> = {
        'fait': 'réalisé',
        'créé': 'conçu',
        'travail': 'projet',
        'bien': 'excellemment',
        'beau': 'remarquable',
        'joli': 'élégant'
    }

    Object.entries(replacements).forEach(([word, replacement]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        enhanced = enhanced.replace(regex, replacement)
    })

    return enhanced
}
