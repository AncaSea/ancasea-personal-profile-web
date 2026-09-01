import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const searchParams = requestUrl.searchParams
  
  // Use forwarded host on Vercel, or fallback to NEXT_PUBLIC_BASE_URL, or origin
  const forwardedHost = request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  let baseUrl = requestUrl.origin
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  } else if (forwardedHost) {
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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    } else {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Fallback
  return NextResponse.redirect(`${baseUrl}/login?error=Invalid_Auth_Callback`)
}
