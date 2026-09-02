"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Send, Loader2, LogIn, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface GuestbookEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  message: string;
  createdAt: string;
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchEntries();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/guestbook');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch guestbook", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/#guestbook`
      }
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries([newEntry, ...entries]);
        setMessage('');
        toast.success("Thanks for signing the guestbook!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to post message");
      }
    } catch (error) {
      toast.error("Internal Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="guestbook" className="w-full max-w-4xl mx-auto py-24 px-4 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-flex items-center gap-4">
          <MessageSquare className="w-10 h-10 text-purple-400" /> Guestbook
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">Leave a mark on my digital universe.</p>
      </div>

      <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 bg-card/30 backdrop-blur-xl mb-12">
        {!user ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold mb-4">Sign in to leave a message</h3>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <Image src={user.user_metadata.avatar_url} alt="Avatar" width={48} height={48} className="rounded-full border border-white/20" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/30">
                  {user.user_metadata?.full_name?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Write a message..."
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 pr-16 text-sm text-foreground focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="absolute right-2 top-2 p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Loading messages...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-white/10 rounded-2xl">Be the first to sign the guestbook!</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
              <div className="flex-shrink-0 mt-1">
                {entry.avatarUrl ? (
                  <Image src={entry.avatarUrl} alt={entry.name} width={40} height={40} className="rounded-full border border-white/10 shadow-lg" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">
                    {entry.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">{entry.name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground/90 mt-1 text-sm leading-relaxed">{entry.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
