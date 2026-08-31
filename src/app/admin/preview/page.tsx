"use client";
import { useState } from "react";
import { Monitor, Smartphone, Tablet, ExternalLink } from "lucide-react";

export default function PreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const getWidth = () => {
    switch (device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-t-xl p-3">
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'desktop' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Desktop View"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'tablet' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Tablet View"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${device === 'mobile' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Mobile View"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-muted px-4 py-1.5 rounded-full text-xs font-mono text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Preview (localhost:3000)
          </div>
        </div>

        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Open in New Tab
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-muted/30 border-x border-b border-border rounded-b-xl overflow-hidden flex items-center justify-center p-4">
        <div className={`h-full ${getWidth()} transition-all duration-300 ease-in-out bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col relative`}>
          {device !== 'desktop' && (
            <div className="h-6 bg-card border-b border-border flex items-center justify-center shrink-0">
              <div className="w-16 h-1.5 bg-muted rounded-full" />
            </div>
          )}
          <iframe 
            src="/" 
            className="w-full flex-1 border-none bg-background"
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  );
}