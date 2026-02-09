import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Exa from 'exa-js'

const EXA_API_KEY = process.env.EXA_API_KEY || ''
const exa = new Exa(EXA_API_KEY)

export async function POST(request: NextRequest) {
    try {
        const { region, domain } = await request.json()

        if (!EXA_API_KEY) {
            throw new Error("Clé API EXA manquante")
        }

        // 1. Infiltration Massive (20 résultats demandés)
        // On demande des profils LinkedIn avec des indices de contact publics
        const query = `site:linkedin.com/in/ ("CEO" OR "Founder" OR "Recruiter" OR "Manager") "${domain}" "${region}" contact info email phone`

        const searchResults = await exa.search(query, {
            type: "auto",
            category: "people",
            numResults: 20, // Montée en puissance à 20
            useAutoprompt: true
        })

        if (!searchResults.results || searchResults.results.length === 0) {
            return NextResponse.json({ success: true, results: [], message: "Aucun profil détecté." })
        }

        // 2. Traitement des données cibles
        const prospectsToInsert = searchResults.results.map((result: any) => {
            const titleParts = result.title.split('-')
            const fullName = result.author || titleParts[0].split('|')[0].trim()

            // Note: Exa récupère des données indexées. Trouver des téléphones privés est rare pour la protection des données
            // mais on peut stocker les indices de contact trouvés dans les notes ou le snippet.
            return {
                name: fullName,
                email: null, // Sera complété manuellement ou via enrichissement futur
                phone: null, // Champ ajouté pour le futur
                region: region,
                domain: domain,
                source: 'Elite LinkedIn Scraper v2',
                notes: `Profil: ${result.title}. URL: ${result.url}`
            }
        })

        // 3. Archivage dans Supabase
        const { error: insertError } = await supabase
            .from('prospects')
            .insert(prospectsToInsert)

        if (insertError) {
            throw new Error(`Échec de l'archivage Supabase : ${insertError.message}`)
        }

        return NextResponse.json({
            success: true,
            results: prospectsToInsert,
            count: prospectsToInsert.length
        })

    } catch (error: any) {
        console.error('LinkedIn Scraper Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
