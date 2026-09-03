"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X, Cpu, MessageSquare, Zap } from "lucide-react";

type AiUsageLog = {
  id: string;
  action: string;
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  createdAt: Date;
};

export function GatewayLogModal({ log }: { log: AiUsageLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
          <div>
            <h3 className="font-black text-lg text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Token Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {log.id}</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 bg-background/50">
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="font-bold">Prompt Tokens</span>
            </div>
            <span className="font-black font-mono text-lg text-cyan-400">{log.promptTokenCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="font-bold">Completion Tokens</span>
            </div>
            <span className="font-black font-mono text-lg text-purple-400">{log.candidatesTokenCount.toLocaleString()}</span>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="flex items-center justify-between p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="font-black text-blue-400">Total Usage</span>
            <span className="font-black font-mono text-2xl text-blue-400 drop-shadow-md">{log.totalTokenCount.toLocaleString()}</span>
          </div>

        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="ml-3 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
        title="View Token Details"
      >
        <Info className="w-4 h-4" />
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
