"use client";

import { useState } from "react";
import { Code, X } from "lucide-react";

export function ContextModal({ contextData }: { contextData: string }) {
  const [isOpen, setIsOpen] = useState(false);

  let formattedJson = contextData;
  try {
    formattedJson = JSON.stringify(JSON.parse(contextData), null, 2);
  } catch (e) {
    // If it's not valid JSON, leave as is
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold"
      >
        <Code className="w-3.5 h-3.5" />
        Lihat Detail
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-3xl max-h-[85vh] rounded-xl border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Code className="w-5 h-5" />
                <span>Context Data & Stack Trace</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto bg-[#0d0d0d]">
              <pre className="text-xs font-mono text-[#00ffcc] leading-relaxed">
                {formattedJson}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}