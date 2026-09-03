"use client";
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
};

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Ancasea's AI Assistant. Ask me anything about their projects, skills, or experience!", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { ...data, timestamp: new Date() }]);
      } else {
        const errData = await response.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: errData.error || 'Sorry, my neural link is currently unstable. Please try again later.', timestamp: new Date() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full border shadow-xl hover:scale-110 transition-all duration-300 backdrop-blur-md group",
          "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
          isOpen ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"
        )}
      >
        <Bot className="w-6 h-6 group-hover:animate-bounce" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-full max-w-[350px] sm:max-w-[400px] max-h-[80vh] flex flex-col backdrop-blur-2xl border rounded-2xl shadow-2xl transition-all duration-500 origin-bottom-right overflow-hidden",
          "bg-background/90 border-border shadow-[0_10px_40px_rgba(0,0,0,0.2)]",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-20 pointer-events-none"
        )}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-secondary" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b relative z-10 bg-secondary/30 border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border bg-primary/10 border-primary/20">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1 text-foreground">
                AI Clone <Sparkles className="w-3 h-3 text-yellow-500" />
              </h3>
              <p className="text-xs flex items-center gap-1 text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto max-h-[400px] p-4 space-y-5 relative z-10 custom-scrollbar" data-lenis-prevent>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 max-w-[88%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm border",
                msg.role === 'user' 
                  ? "bg-primary/20 text-primary border-primary/30" 
                  : "bg-secondary text-secondary-foreground border-border"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="flex flex-col gap-1">
                <div className={cn(
                  "p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm border",
                  "space-y-2 [&>p]:mb-2 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>strong]:font-bold [&>em]:italic [&_a]:text-blue-500 dark:[&_a]:text-[#00e5ff] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-blue-600 dark:hover:[&_a]:text-[#00e5ff]/80",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground border-primary/50 rounded-tr-sm" 
                    : "bg-secondary/50 text-foreground border-border rounded-tl-sm [&>strong]:text-primary"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {mounted && msg.timestamp && (
                  <span className={cn(
                    "text-[10px] text-muted-foreground/60 px-1 font-mono",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm border bg-secondary text-secondary-foreground border-border">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm border bg-secondary/50 border-border">
                <span className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground" />
                <span className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full animate-bounce bg-muted-foreground" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t relative z-10 bg-background/50 border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-all bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-sm border bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
