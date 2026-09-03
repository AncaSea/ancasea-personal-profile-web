
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/utils/prisma';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const limits = await prisma.aiRateLimit.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(limits);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, clearAll, ip } = await req.json();
    if (clearAll) {
      await prisma.aiRateLimit.deleteMany();
    } else if (ip) {
      await prisma.aiRateLimit.deleteMany({ where: { ip } });
    } else if (id) {
      await prisma.aiRateLimit.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
