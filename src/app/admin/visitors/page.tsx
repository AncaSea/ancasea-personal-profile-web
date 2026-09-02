"use client";
import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = async () => {
    try {
      const res = await fetch('/api/admin/visitors');
      if (res.ok) setVisitors(await res.json());
    } catch (e) {
      toast.error("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisitors(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Visitors Info</h1>
          <p className="text-muted-foreground text-sm">Track users who logged in via OAuth.</p>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Logins</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">First Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-400" /></td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No visitors found.</td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      {v.avatarUrl ? <img src={v.avatarUrl} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-blue-500/20" />}
                      {v.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{v.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/10 rounded-md">{v.loginCount}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(v.lastLogin).toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(v.createdAt).toLocaleDateString()}</td>
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
