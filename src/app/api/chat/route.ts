import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Rate Limiting Logic (10 requests per 1 minute)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const windowStart = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    
    const requestCount = await prisma.aiRateLimit.count({
      where: { 
        ip, 
        createdAt: { gte: windowStart } 
      }
    });

    if (requestCount >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You are sending messages too fast. Please try again in a minute.' }, 
        { status: 429 }
      );
    }
    
    // Log the request
    await prisma.aiRateLimit.create({ data: { ip } });

    // Fetch profile context from DB concurrently to improve speed
    const [profile, skills, exps, projects] = await Promise.all([
      prisma.profileInfo.findFirst(),
      prisma.skill.findMany(),
      prisma.experience.findMany(),
      prisma.project.findMany()
    ]);

    const systemPrompt = `You are the AI Assistant of ${profile?.name || 'Ancasea'}. \nYour goal is to answer questions about ${profile?.name || 'Ancasea'}'s portfolio, experience, and skills on behalf of him/her.\nBe professional, friendly, and helpful. Clearly state that you are an AI Assistant and NOT ${profile?.name || 'Ancasea'}.\nHere is ${profile?.name || 'Ancasea'}'s background information:\n- Bio: ${profile?.bio}\n- Tagline: ${profile?.tagline}\n- Skills: ${skills.map(s => s.name).join(', ')}\n- Experience: ${exps.map(e => e.company + ' as ' + e.position).join(', ')}\n- Projects: ${projects.map(p => p.title).join(', ')}\n\nIMPORTANT INSTRUCTIONS:\n1. If you are asked a question that you cannot answer using the provided context.\n2. If the user wants to discuss a project, collaboration, or contact Ancasea directly.\n-> Politely inform them that you do not have that information and direct them to contact Ancasea via the Contact Form on this website (or scroll to the Let's Work Together section).\nKeep answers relatively short (max 2 paragraphs).`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });

    // Format messages for @google/genai SDK (v2.18.0)
    const formattedContents = messages.map(msg => ({
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

    return NextResponse.json({ 
      role: 'assistant', 
      content: response.text 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
