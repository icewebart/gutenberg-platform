import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | 'magiclink' | 'email' | null
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createServerClient()
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to home page after successful verification
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to home page after successful code exchange
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
  }

  // If there's an error, redirect to home with error message
  return NextResponse.redirect(new URL(`/?error=auth_callback_error`, requestUrl.origin))
}

