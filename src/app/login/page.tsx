"use client";
import { useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      alert("Error logging in: " + error.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="glass-panel p-12 rounded-3xl w-full max-w-md text-center relative">
        <button
          onClick={() => window.location.href = '/'}
          className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors absolute top-8 left-8"
        >
          &larr; Back to Home
        </button>

        <h1 className="text-3xl font-black mb-2 tracking-tighter mt-12">Admin Portal</h1>
        <p className="text-muted-foreground mb-8">Authorized Personnel Only</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8 text-sm font-bold">
            {error.replace(/\+/g, ' ')}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? "Authenticating..." : "Continue with Google"}
        </button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary font-mono animate-pulse">Loading auth...</div>}>
      <LoginContent />
    </Suspense>
  );
}