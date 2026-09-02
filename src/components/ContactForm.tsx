"use client";
import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden glass-panel border border-white/10 p-8 w-full max-w-2xl mx-auto mt-12 mb-24 z-10">
      {/* Background Glow */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10 group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
          Let's Work Together
        </h2>
        <p className="text-muted-foreground mt-2">Have a project in mind? Drop me a message.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground ml-1">Name</label>
            <input 
              id="name"
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-1">Email</label>
            <input 
              id="email"
              required
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="message" className="text-xs font-semibold text-muted-foreground ml-1">Message</label>
          <textarea 
            id="message"
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30 resize-none"
            placeholder="Tell me about your project..."
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]",
            status === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
            status === 'error' ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
            "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]"
          )}
        >
          {status === 'idle' && <><Send size={18} /> Send Message</>}
          {status === 'loading' && <><Loader2 size={18} className="animate-spin" /> Sending...</>}
          {status === 'success' && <><CheckCircle2 size={18} /> Message Sent!</>}
          {status === 'error' && <><AlertCircle size={18} /> Failed. Try Again.</>}
        </button>
      </form>
    </div>
  );
}
