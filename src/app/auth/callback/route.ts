import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Handle Auth Errors from Supabase (e.g. Signup Disabled)
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
  }

  // Handle successful login (exchange code for session)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Fallback
  return NextResponse.redirect(`${origin}/login?error=Invalid_Auth_Callback`)
}