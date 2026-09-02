import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  
  // Use forwarded host on Vercel, or fallback to NEXT_PUBLIC_BASE_URL, or origin
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  let baseUrl = requestUrl.origin
  if (forwardedHost) {
    baseUrl = `${protocol}://${forwardedHost}`
  }
  
  // Handle Auth Errors from Supabase (e.g. Signup Disabled)
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error_description || error)}`)
  }

  // Handle successful login (exchange code for session)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

    if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Record visitor in DB
      try {
        const { prisma } = await import('@/utils/prisma');
        const email = data.user.email || '';
        const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0];
        const avatarUrl = data.user.user_metadata?.avatar_url || '';
        
        if (email) {
          await prisma.visitor.upsert({
            where: { email },
            update: {
              loginCount: { increment: 1 },
              lastLogin: new Date(),
              name,
              avatarUrl
            },
            create: {
              email,
              name,
              avatarUrl
            }
          });
        }
      } catch (err) {
        console.error('Failed to log visitor:', err);
      }

      return NextResponse.redirect(new URL(next, baseUrl).toString())
    } else {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || 'Auth_Failed')}`, baseUrl).toString())
    }
  }

  // Fallback
  return NextResponse.redirect(`${baseUrl}/login?error=Invalid_Auth_Callback`)
}
