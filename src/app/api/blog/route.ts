import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/utils/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, excerpt, published } = body
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const post = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        published
      }
    })

    return NextResponse.json({ success: true, post })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}