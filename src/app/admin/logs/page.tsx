import { prisma } from "@/utils/prisma";
import { format } from "date-fns";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { ContextModal } from "./ContextModal";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Show last 100 logs
  });

  const getIcon = (level: string) => {
    if (level === 'ERROR') return <XCircle className="text-destructive w-5 h-5" />;
    if (level === 'WARNING') return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
    return <Info className="text-blue-500 w-5 h-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">System Logs</h1>
          <p className="text-muted-foreground">Audit trail and technical errors.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-y-auto max-h-[75vh] custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Level</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium w-1/3">Context / Stack Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-mono font-bold">
                    {getIcon(log.level)}
                    <span className={
                      log.level === 'ERROR' ? 'text-destructive' :
                      log.level === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
                    }>{log.level}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm:ss")}
                </td>
                <td className="px-6 py-4 font-medium">
                  {log.message}
                </td>
                <td className="px-6 py-4">
                  {log.context ? (
                    <ContextModal contextData={log.context} />
                  ) : (
                    <span className="text-muted-foreground italic">-</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No system logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}