"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { AiUsageLog } from "@prisma/client";
import { format } from "date-fns";

export function AiChart({ logs }: { logs: AiUsageLog[] }) {
  const data = logs.map(log => ({
    date: format(new Date(log.createdAt), 'MMM dd HH:mm'),
    tokens: log.totalTokenCount
  }));

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">No AI usage recorded yet. Click Extract & Save to test!</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
          itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
        />
        <Area type="monotone" dataKey="tokens" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}