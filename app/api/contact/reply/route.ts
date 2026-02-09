import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

const EMAIL_USER = "chefkeiis377@gmail.com"
const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD || ''

export async function POST(request: NextRequest) {
    try {
        const { messageId, clientEmail, replyContent, clientName } = await request.json()

        if (!replyContent || !clientEmail) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
        }

        // 1. Configurer Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        })

        // 2. Envoyer l'email
        const mailOptions = {
            from: `"Kevin Chacha | Digital Shinobi" <${EMAIL_USER}>`,
            to: clientEmail,
            subject: `Suite à votre message - Kevin Chacha`,
            text: replyContent,
            html: `
                <div style="font-family: 'Rajdhani', sans-serif; color: #f0f0f0; max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #222; padding: 30px; border-radius: 8px;">
                    <div style="border-left: 4px solid #e50914; padding-left: 20px; margin-bottom: 30px;">
                        <h2 style="color: #ffffff; text-transform: uppercase; letter-spacing: 3px; font-size: 20px; margin: 0;">Transmission Shinobi</h2>
                    </div>
                    
                    <div style="line-height: 1.8; font-size: 16px; color: #ccc;">
                        ${replyContent.replace(/\n/g, '<br>')}
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #222;">
                        <p style="font-weight: bold; color: #fff; margin: 0;">Kevin Chacha</p>
                        <p style="font-size: 12px; color: #e50914; text-transform: uppercase; letter-spacing: 1px; margin: 5px 0;">Architecte du Digital & Shinobi du Web</p>
                    </div>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        // 3. Mettre à jour dans Supabase
        if (messageId) {
            await supabase
                .from('messages')
                .update({
                    reply_sent: true,
                    reply_content: replyContent,
                    read: true
                })
                .eq('id', messageId)
        }

        // 4. Ajouter aux prospects si c'est un nouveau contact
        const { data: existing } = await supabase
            .from('prospects')
            .select('id')
            .eq('email', clientEmail)
            .single()

        if (!existing) {
            await supabase.from('prospects').insert([{
                name: clientName || 'Client Inconnu',
                email: clientEmail,
                source: 'Contact Form Reply'
            }])
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Reply API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
