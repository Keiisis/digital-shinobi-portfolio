import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const EMAIL_USER = "chefkeiis377@gmail.com"
const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD || '' // Ce sera le code de 16 caractères

export async function POST(request: NextRequest) {
    try {
        const { name, email, domain, content } = await request.json()

        const { error: dbError } = await supabase
            .from('messages')
            .insert([{ name, email, domain, content }])

        if (dbError) throw dbError

        // 1.5 Centraliser dans la table Prospects
        const { data: existingProspect } = await supabase
            .from('prospects')
            .select('id')
            .eq('email', email)
            .single()

        if (!existingProspect) {
            await supabase.from('prospects').insert([{
                name: name,
                email: email,
                domain: domain,
                source: 'Contact Form'
            }])
        }

        // 2. Récupérer les réglages de l'Assistant pour le ton et la personnalité
        const { data: settings } = await supabase
            .from('assistant_settings')
            .select('*')
            .single()

        // 3. Générer la réponse via Grok (Groq Llama 3)
        const systemPrompt = `
            Tu es ${settings?.name || 'Kevin Assistant'}, l'assistant intelligent de Kevin Chacha (Digital Shinobi).
            Kevin vient de recevoir un nouveau message via son portfolio.
            
            TA MISSION : Rédiger un email de réponse automatique court, professionnel et chaleureux pour confirmer la réception.
            
            INFOS DU CLIENT :
            - Nom : ${name}
            - Domaine : ${domain}
            - Message reçu : "${content}"
            
            TON DE L'ASSISTANT : ${settings?.personality || 'Professionnel et chaleureux avec un accent béninois.'}
            
            INSTRUCTIONS DE RÉDACTION :
            - Confirme que Kevin a bien reçu le message.
            - Dis que Kevin l'analysera et reviendra vers lui très prochainement.
            - Garde un style "Shinobi" (subtil, efficace, respectueux).
            - Ne signe pas à la place de Kevin, signe en tant que "${settings?.name || 'Kevin Assistant'}".
            - Utilise le tutoiement ou le vouvoiement selon le ton habituel (le vouvoiement est plus sûr pour un premier contact pro).
            - RÉPONDS UNIQUEMENT AVEC LE CORPS DE L'EMAIL (pas de blabla avant ou après).
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
                    { role: 'user', content: `Génère une réponse pour ${name}.` }
                ],
                temperature: 0.7
            })
        })

        const groqData = await groqResponse.json()
        const aiReply = groqData.choices[0]?.message?.content || `Bonjour ${name}, nous avons bien reçu votre message concernant "${domain}". Kevin reviendra vers vous bientôt.`

        // 4. Configurer Nodemailer (Le "PHPMailer" pour Node.js)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS // Ton mot de passe d'application Google
            }
        })

        // 5. Envoyer l'email
        const mailOptions = {
            from: `"Digital Shinobi Assistant" <${EMAIL_USER}>`,
            to: email, // Envoyer au client
            subject: `Confirmation de transmission - Digital Shinobi Portfolio`,
            text: aiReply,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #e50914; text-transform: uppercase; letter-spacing: 2px;">Transmission Reçue</h2>
                    </div>
                    <div style="line-height: 1.6; font-size: 16px;">
                        ${aiReply.replace(/\n/g, '<br>')}
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <div style="font-size: 12px; color: #888; text-align: center;">
                        Ceci est une réponse automatique générée par l'IA de l'Assistant Shinobi.<br>
                        Kevin Chacha - Architecte du Digital & Shinobi du Web.
                    </div>
                </div>
            `
        }

        if (EMAIL_PASS) {
            await transporter.sendMail(mailOptions)
        } else {
            console.warn("L'email n'a pas été envoyé car EMAIL_APP_PASSWORD est manquant.")
        }

        return NextResponse.json({ success: true, ai_replied: !!EMAIL_PASS })

    } catch (error: any) {
        console.error('Contact API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
