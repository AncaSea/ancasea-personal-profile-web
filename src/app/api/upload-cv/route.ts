if (typeof global !== 'undefined' && !global.DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof global !== 'undefined' && !global.ImageData) {
  (global as any).ImageData = class ImageData {};
}

import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@/utils/supabase/server'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pdfParseRaw = require('pdf-parse-debugging-disabled');
const pdfParse = typeof pdfParseRaw === 'function' ? pdfParseRaw : pdfParseRaw.default;

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables (.env). Please add it first!');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('cv') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    let combinedText = ""
    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdfParse(buffer)
        combinedText += `\n\n--- Document: ${file.name} ---\n\n` + pdfData.text
    }

    if (combinedText.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text from the provided PDFs.' }, { status: 400 })
    }

    const ai = getGenAI();
    const prompt = `
      You are an expert HR data extractor. I will provide you with the text from one or more documents (like a CV and a Portfolio).
      Extract all experiences, educations, skills, and projects into a valid JSON object.
      Do NOT include markdown formatting like \`\`\`json. Just return raw JSON.
      
      Format:
      {
        "profile": {
          "name": "Full Name",
          "tagline": "Short professional tagline or title",
          "bio": "A short professional summary"
        },
        "experiences": [
          { "company": "Company Name", "position": "Job Title", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "description": "Short summary of responsibilities" }
        ],
        "education": [
          { "institution": "University/School", "degree": "Degree Name", "year": "YYYY" }
        ],
        "skills": [
          { "name": "Skill Name", "category": "Frontend/Backend/etc" }
        ],
        "projects": [
          { "title": "Project Name", "description": "Project Description", "techStack": ["React", "Node", "etc"], "link": "url if available" }
        ]
      }

      Documents Text:
      ${combinedText}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
    });

        const jsonText = response.text;
    
    // Log AI Usage
    if (response.usageMetadata) {
      await prisma.aiUsageLog.create({
        data: {
          action: 'extract_cv',
          promptTokenCount: response.usageMetadata.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata.totalTokenCount || 0
        }
      });
    }
    
    if (!jsonText) {
      throw new Error("No text returned from Gemini API");
    }
    const parsedData = JSON.parse(jsonText);

    // Wipe existing data for simplicity of syncing
    await prisma.profileInfo.deleteMany({});
    await prisma.experience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.project.deleteMany({});

    if (parsedData.profile) {
      await prisma.profileInfo.create({ data: parsedData.profile });
    }
    if (parsedData.experiences && parsedData.experiences.length > 0) {
      await prisma.experience.createMany({ data: parsedData.experiences });
    }
    if (parsedData.education && parsedData.education.length > 0) {
      await prisma.education.createMany({ data: parsedData.education });
    }
    if (parsedData.skills && parsedData.skills.length > 0) {
      await prisma.skill.createMany({ data: parsedData.skills });
    }
    if (parsedData.projects && parsedData.projects.length > 0) {
      // Prisma expects techStack as Json, arrays are fine.
      await prisma.project.createMany({ data: parsedData.projects });
    }

    return NextResponse.json({
      success: true,
      data: {
        experiences: parsedData.experiences?.length || 0,
        education: parsedData.education?.length || 0,
        skills: parsedData.skills?.length || 0,
        projects: parsedData.projects?.length || 0,
      }
    })
    
  } catch (error: any) {
    console.error('Data Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}