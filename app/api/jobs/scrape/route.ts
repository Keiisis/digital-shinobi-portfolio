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

        // 1. Scan des Offres d'Emploi (Vrai Web)
        const query = `site:linkedin.com/jobs/ "${domain}" hiring in "${region}" 2026`

        const searchResults = await exa.search(query, {
            type: "auto",
            category: "news", // Les offres d'emploi sont traitées comme des contenus récents
            numResults: 15,
            useAutoprompt: true
        })

        if (!searchResults.results || searchResults.results.length === 0) {
            return NextResponse.json({ success: true, results: [], message: "Aucune offre détectée." })
        }

        // 2. Formatage Shinobi des Opportunités
        const jobsToInsert = searchResults.results.map((result: any) => {
            return {
                title: result.title.split('|')[0].trim(),
                company: result.author || 'Entreprise Confidentielle',
                location: region,
                link: result.url,
                category: domain,
                region: region,
                description: `Opportunité détectée via intelligence Exa : ${result.title}`
            }
        })

        // 3. Archivage dans la table 'jobs'
        const { error: insertError } = await supabase
            .from('jobs')
            .insert(jobsToInsert)

        if (insertError) {
            // Si la table n'existe pas encore, on renvoie une erreur explicite
            if (insertError.code === '42P01') {
                throw new Error("La table 'jobs' n'existe pas dans Supabase. Crée-la via l'onglet SQL.")
            }
            throw new Error(`Erreur SQL : ${insertError.message}`)
        }

        return NextResponse.json({
            success: true,
            results: jobsToInsert,
            count: jobsToInsert.length
        })

    } catch (error: any) {
        console.error('Job Scraper Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
