"use client";
import { useEffect, useState } from 'react';
import { Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGuestbook() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/guestbook');
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      toast.error("Failed to load guestbook logs");
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const res = await fetch('/api/admin/guestbook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success("Message deleted");
        fetchLogs();
      } else {
        toast.error("Failed to delete message");
      }
    } catch (e) {
      toast.error("Error deleting message");
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/20 text-primary rounded-xl">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Guestbook Logs</h1>
          <p className="text-muted-foreground text-sm">Manage messages left by visitors.</p>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No messages found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      {log.avatarUrl ? <img src={log.avatarUrl} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-primary/20" />}
                      {log.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{log.email}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={log.message}>{log.message}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteLog(log.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 size={18} />
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
