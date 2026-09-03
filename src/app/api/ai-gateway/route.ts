import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/utils/prisma';

export async function POST(req: Request) {
  try {
    // 1. Security Check (API Key Validation)
    const authHeader = req.headers.get('authorization');
    const gatewaySecret = process.env.GATEWAY_SECRET;
    
    if (!gatewaySecret) {
      return NextResponse.json({ error: 'Gateway is not configured properly.' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${gatewaySecret}`) {
      return NextResponse.json({ error: 'Unauthorized. Invalid Gateway Secret.' }, { status: 401 });
    }

    // 2. Parse Request
    const body = await req.json();
    const { project, messages, prompt, systemInstruction } = body;

    const projectName = project || 'Unknown Project';

    // Build contents array for Gemini
    let formattedContents: any[] = [];
    if (messages && Array.isArray(messages)) {
       formattedContents = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
    } else if (prompt) {
       formattedContents = [{ role: 'user', parts: [{ text: prompt }] }];
    } else {
       return NextResponse.json({ error: 'Missing "messages" array or "prompt" string in request body.' }, { status: 400 });
    }

    // 3. Process with Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });
    
    const config: any = {
      temperature: body.temperature || 0.7,
    };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: body.model || 'gemini-3.6-flash',
      contents: formattedContents,
      config: config
    });

    const aiResponseText = response.text || '';

    // 4. Log Usage to Database (Fire-and-Forget)
    if (response.usageMetadata) {
      prisma.aiUsageLog.create({
        data: {
          action: `Gateway: ${projectName}`,
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0,
        }
      }).catch(e => console.error('Failed to log Gateway AI usage:', e));
    }

    // 5. Return Response
    return NextResponse.json({ 
      text: aiResponseText,
      usage: response.usageMetadata 
    });

  } catch (error: any) {
    console.error('AI Gateway Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
