import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/utils/prisma';

// Global cache to prevent hitting the database on every single chat message
const rateLimitMap = new Map<string, number[]>();
let cachedSystemPrompt: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds

async function getSystemPrompt() {
  if (cachedSystemPrompt && (Date.now() - lastCacheTime < CACHE_TTL)) {
    return cachedSystemPrompt;
  }

  // Fallback context in case DB times out
  let profileName = 'Ancasea';
  let bio = 'Web Developer & Designer';
  let tagline = 'Crafting digital experiences';
  let skillNames = 'Next.js, React, Tailwind CSS, TypeScript';
  let expTexts = '';
  let projectTexts = '';

  try {
    // Execute sequentially instead of Promise.all to prevent 
    // connection pool exhaustion (ETIMEDOUT) on cold starts
    const profile = await prisma.profileInfo.findFirst();
    if (profile) {
      profileName = profile.name;
      bio = profile.bio || '';
      tagline = profile.tagline || '';
    }
    
    const skills = await prisma.skill.findMany();
    if (skills.length > 0) skillNames = skills.map((s: any) => s.name).join(', ');
    
    const exps = await prisma.experience.findMany();
    if (exps.length > 0) expTexts = exps.map((e: any) => e.company + ' as ' + e.position).join(', ');
    
    const projects = await prisma.project.findMany();
    if (projects.length > 0) projectTexts = projects.map((p: any) => p.title).join(', ');

    // Only cache for a long time if DB fetch was successful
    lastCacheTime = Date.now();
  } catch (dbError) {
    console.warn('DB Timeout or error fetching AI context. Using fallback context.', dbError);
    // Cache the fallback for a very short time (1 minute) so it retries soon
    lastCacheTime = Date.now() - CACHE_TTL + 60000; 
  }

  cachedSystemPrompt = `You are the AI Assistant of ${profileName}. 
Your goal is to answer questions about ${profileName}'s portfolio, experience, and skills on behalf of him/her.
Be professional, friendly, and helpful. Clearly state that you are an AI Assistant and NOT ${profileName}.
Here is ${profileName}'s background information:
- Bio: ${bio}
- Tagline: ${tagline}
- Skills: ${skillNames}
- Experience: ${expTexts}
- Projects: ${projectTexts}

IMPORTANT INSTRUCTIONS:
1. If you are asked a question that you cannot answer using the provided context, or if the user explicitly wants to discuss a project, collaboration, or contact Ancasea directly, you MUST do the following:
   - Provide Ancasea's Telegram link as a clickable markdown link: [t.me/AncSea](https://t.me/AncSea) (tell them this is the fastest way)
   - Tell the user they can also simply type their Email and Message directly here in the chat, and you will forward it to Ancasea immediately.
2. If the user provides their email and a message to be forwarded, you MUST output this exact markdown tag in your response:
   [FORWARD_TO_TELEGRAM: <User's Email> | <User's Message>]
   Example: [FORWARD_TO_TELEGRAM: user@example.com | Hello Ancasea, let's collaborate!]
Keep answers relatively short (max 2 paragraphs).`;

  return cachedSystemPrompt;
}


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // In-Memory Rate Limiting Logic (10 requests per 1 minute)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago
    
    let userRequests = rateLimitMap.get(ip) || [];
    // Filter out requests older than 1 minute
    userRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (userRequests.length >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You are sending messages too fast. Please try again in a minute.' }, 
        { status: 429 }
      );
    }
    
    // Add current request to history
    userRequests.push(now);
    rateLimitMap.set(ip, userRequests);

    // Fire and forget the DB log so it doesn't block the AI response at all
    prisma.aiRateLimit.create({ data: { ip } }).catch(e => console.error('Rate limit log failed:', e));

    // Get system prompt (returns instantly from memory if cached)
    const systemPrompt = await getSystemPrompt();

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });


    // Format messages for @google/genai SDK (v2.18.0)
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Inject system instruction in the API call
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    let aiResponseText = response.text || '';

    // Automatically log AI Token Usage to the database (Fire and Forget)
    if (response.usageMetadata) {
      prisma.aiUsageLog.create({
        data: {
          action: 'Chat Assistant',
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        }
      }).catch(e => console.error('Failed to log AI usage:', e));
    }

    // INTERCEPTOR LOGIC: Check for [FORWARD_TO_TELEGRAM: email | message]
    // The regex uses /s to allow newlines within the message part
    const forwardMatch = aiResponseText.match(/\[FORWARD_TO_TELEGRAM:\s*(.+?)\s*\|\s*([\s\S]+?)\]/);
    
    if (forwardMatch) {
      const email = forwardMatch[1].trim();
      const message = forwardMatch[2].trim();
      
      // Remove the tag from the final response
      aiResponseText = aiResponseText.replace(forwardMatch[0], '').trim();
      
      // Add a friendly confirmation message
      if (aiResponseText.length > 0) {
        aiResponseText += '\n\n';
      }
      aiResponseText += '*(Pesan Anda telah berhasil saya teruskan ke Telegram Ancasea! Beliau akan menghubungi Anda segera.)*';

      // Send to Telegram
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (botToken && chatId) {
        const text = `🚨 *Panggilan dari AI Assistant!* 🚨\n\n*Email:* ${email}\n*Pesan:* \n${message}`;
        
        // Fire and forget Telegram fetch so the user doesn't have to wait for Telegram's server
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
          }),
        }).catch (telegramErr => {
          console.error('Failed to send telegram message from AI:', telegramErr);
        });
      }
    }

    return NextResponse.json({ 
      role: 'assistant', 
      content: aiResponseText 
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    let errorMessage = 'Sistem internal AI sedang mengalami gangguan sementara.';
    
    // Parse Gemini API Errors
    const errorString = error?.toString() || '';
    
    if (error.status === 503 || errorString.includes('503') || errorString.includes('high demand') || errorString.includes('UNAVAILABLE')) {
      errorMessage = 'Mohon maaf, server Google Gemini saat ini sedang kelebihan muatan (Overloaded) melayani seluruh dunia. Silakan coba beberapa saat lagi ya, atau silakan hubungi Ancasea langsung via Telegram: [t.me/AncSea](https://t.me/AncSea) 🙏';
    } else if (error.status === 429 || errorString.includes('429') || errorString.includes('quota')) {
      errorMessage = 'Kuota API Google Gemini telah habis. Silakan lapor ke Admin, atau langsung hubungi Ancasea via Telegram: [t.me/AncSea](https://t.me/AncSea)';
    } else if (error.message) {
       // Extract just the message if it's a JSON string
       try {
         const match = errorString.match(/\{.*\}/);
         if (match) {
            const parsed = JSON.parse(match[0]);
            if (parsed.error && parsed.error.message) {
               errorMessage = `Google AI Error: ${parsed.error.message}\n\nJika berlanjut, hubungi Ancasea: [t.me/AncSea](https://t.me/AncSea)`;
            }
         } else {
            errorMessage = `${error.message}\n\nJika berlanjut, hubungi Ancasea: [t.me/AncSea](https://t.me/AncSea)`;
         }
       } catch (e) {
         errorMessage = `${error.message}\n\nJika berlanjut, hubungi Ancasea: [t.me/AncSea](https://t.me/AncSea)`;
       }
    } else {
      errorMessage += '\n\nSilakan hubungi Ancasea langsung via Telegram: [t.me/AncSea](https://t.me/AncSea)';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
