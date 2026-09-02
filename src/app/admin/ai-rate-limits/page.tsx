"use client";
import { useEffect, useState } from 'react';
import { ShieldAlert, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAiLimits() {
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const deleteLimit = async (id: string | null, clearAll: boolean = false) => {
    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, clearAll })
      });
      if (res.ok) {
        toast.success(clearAll ? "All limits cleared" : "Limit cleared");
        fetchLimits();
      } else {
        toast.error("Failed to delete limit");
      }
    } catch (e) {
      toast.error("Error deleting limit");
    }
  };

  useEffect(() => { fetchLimits(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">AI Monitor</h1>
            <p className="text-muted-foreground text-sm">Monitor and clear AI rate limits by IP.</p>
          </div>
        </div>
        
        <button
          onClick={() => deleteLimit(null, true)}
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
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-red-400" /></td>
                </tr>
              ) : limits.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No active rate limits.</td>
                </tr>
              ) : (
                limits.map((limit) => (
                  <tr key={limit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary">{limit.ip}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(limit.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteLimit(limit.id)} className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                        Unblock IP
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
