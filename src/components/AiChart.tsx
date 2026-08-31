"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { AiUsageLog } from "@prisma/client";
import { format } from "date-fns";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-[0_8px_32px_rgba(56,189,248,0.2)]">
        <p className="text-muted-foreground text-xs font-semibold mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-md">
          {payload[0].value.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Tokens</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AiChart({ logs }: { logs: AiUsageLog[] }) {
  const data = logs.map(log => ({
    date: format(new Date(log.createdAt), 'MMM dd HH:mm'),
    tokens: log.totalTokenCount
  }));

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground font-medium">No AI usage recorded yet. Click Extract & Save to test!</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="auroraGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1}/>  {/* Teal */}
            <stop offset="50%" stopColor="#3b82f6" stopOpacity={1}/> {/* Blue */}
            <stop offset="100%" stopColor="#a855f7" stopOpacity={1}/> {/* Purple */}
          </linearGradient>
          <linearGradient id="auroraFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
        
        <XAxis 
          dataKey="date" 
          stroke="currentColor" 
          className="text-[10px] opacity-40 font-mono tracking-widest" 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="currentColor" 
          className="text-[10px] opacity-40 font-mono tracking-widest" 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} 
          dx={-10}
        />
        
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2, strokeDasharray: '4 4' }} />
        
        <Area 
          type="monotone" 
          dataKey="tokens" 
          stroke="url(#auroraGradient)" 
          strokeWidth={4} 
          fill="url(#auroraFill)" 
          filter="url(#glow)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
