import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const entries = await prisma.guestbook.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Guestbook GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';
    const avatarUrl = user.user_metadata?.avatar_url || null;

    const newEntry = await prisma.guestbook.create({
      data: {
        email: user.email || 'unknown',
        name,
        avatarUrl,
        message: message.trim().substring(0, 500), // Max 500 chars
      },
    });

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Guestbook POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
