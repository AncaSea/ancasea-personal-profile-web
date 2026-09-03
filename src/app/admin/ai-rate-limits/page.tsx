"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, Loader2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAiLimits() {
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIps, setExpandedIps] = useState<Record<string, boolean>>({});

  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits');
      if (res.ok) setLimits(await res.json());
    } catch (e) {
      toast.error("Failed to load rate limits");
    } finally {
      setLoading(false);
    }
  };

  const deleteLimit = async (params: { id?: string | null, clearAll?: boolean, ip?: string }) => {
    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        if (params.clearAll) toast.success("All limits cleared");
        else if (params.ip) toast.success(`All limits for IP ${params.ip} cleared`);
        else toast.success("Limit cleared");
        fetchLimits();
      } else {
        toast.error("Failed to delete limit");
      }
    } catch (e) {
      toast.error("Error deleting limit");
    }
  };

  const toggleExpand = (ip: string) => {
    setExpandedIps(prev => ({ ...prev, [ip]: !prev[ip] }));
  };

  useEffect(() => { fetchLimits(); }, []);

  // Group limits by IP
  const groupedLimits = limits.reduce((acc: any, limit: any) => {
    if (!acc[limit.ip]) {
      acc[limit.ip] = [];
    }
    acc[limit.ip].push(limit);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">AI Monitor</h1>
            <p className="text-muted-foreground text-sm">Monitor and clear AI rate limits grouped by IP.</p>
          </div>
        </div>
        
        <button
          onClick={() => deleteLimit({ clearAll: true })}
          disabled={limits.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors font-semibold disabled:opacity-50"
        >
          <RefreshCw size={18} /> Clear All Limits
        </button>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Hit Count</th>
                <th className="px-6 py-4">Latest Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-400" /></td>
                </tr>
              ) : Object.keys(groupedLimits).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No active rate limits.</td>
                </tr>
              ) : (
                Object.entries(groupedLimits).map(([ip, ipLimits]: [string, any]) => {
                  const isExpanded = expandedIps[ip];
                  const latestLimit = ipLimits[0]; // Assuming limits are sorted desc by default

                  return (
                    <React.Fragment key={ip}>
                      {/* Summary Row */}
                      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleExpand(ip)}>
                        <td className="px-6 py-4 text-muted-foreground">
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </td>
                        <td className="px-6 py-4 font-mono text-primary font-bold">{ip}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-bold">
                            {ipLimits.length} HITS
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(latestLimit.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteLimit({ ip }); }} 
                            className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-bold"
                          >
                            Unblock IP
                          </button>
                        </td>
                      </tr>
                      
                      {/* Detail Rows */}
                      {isExpanded && ipLimits.map((limit: any, index: number) => (
                        <tr key={limit.id} className="bg-black/20 border-b border-white/5 text-xs">
                          <td className="px-6 py-2"></td>
                          <td className="px-6 py-2 text-muted-foreground pl-10" colSpan={2}>
                            Hit #{ipLimits.length - index}
                          </td>
                          <td className="px-6 py-2 text-muted-foreground">{new Date(limit.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-2 text-right">
                            <button 
                              onClick={() => deleteLimit({ id: limit.id })} 
                              className="px-2 py-1 text-muted-foreground hover:text-red-400 transition-colors"
                              title="Delete this specific hit"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
