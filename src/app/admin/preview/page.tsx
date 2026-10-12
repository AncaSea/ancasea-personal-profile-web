"use client";
import { useState } from "react";
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw } from "lucide-react";

export default function PreviewPage() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);

  const isMobileOrTablet = device !== 'desktop';

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '390px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-t-xl p-3 shrink-0">
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
            Live Preview — {device === 'desktop' ? 'Full Width' : device === 'tablet' ? '768px' : '390px'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setKey(k => k + 1)}
            title="Reload preview"
            className="flex items-center gap-1.5 text-xs font-bold bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-accent hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
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
      </div>

      {/* Frame Container — takes remaining height */}
      <div className="flex-1 min-h-0 bg-muted/30 border-x border-b border-border rounded-b-xl overflow-auto flex items-start justify-center p-4">
        <div
          className="transition-all duration-300 ease-in-out bg-background shadow-2xl rounded-lg overflow-hidden flex flex-col relative border border-border"
          style={{
            width: getDeviceWidth(),
            height: isMobileOrTablet ? 'auto' : '100%',
            minHeight: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Device notch bar (mobile/tablet) */}
          {isMobileOrTablet && (
            <div className="h-6 bg-card border-b border-border flex items-center justify-center shrink-0">
              <div className="w-16 h-1.5 bg-muted rounded-full" />
            </div>
          )}

          {/* The iframe */}
          <iframe 
            key={key + '-' + device}
            src="/" 
            className="w-full border-none bg-background"
            style={{ 
              flex: 1,
              minHeight: isMobileOrTablet ? '812px' : '100%',
            }}
            title="Live Preview"
          />
        </div>
      </div>
    </div>
  );
}
