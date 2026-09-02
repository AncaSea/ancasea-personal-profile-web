"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, LogOut, BookOpen, Briefcase, ScrollText, Eye, MessageSquare, ShieldAlert, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar({ email }: { email: string | undefined }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Manage Projects', icon: Briefcase },
    { href: '/admin/cv', label: 'Import CV', icon: FileText },
    { href: '/admin/blog', label: 'Manage Blogs', icon: BookOpen },
    { href: '/admin/logs', label: 'System Logs', icon: ScrollText },
    { href: '/admin/guestbook', label: 'Guestbook Logs', icon: MessageSquare },
    { href: '/admin/visitors', label: 'Visitors Info', icon: Users },
    { href: '/admin/ai-rate-limits', label: 'AI Monitor', icon: ShieldAlert },
    { href: '/admin/preview', label: 'Preview Website', icon: Eye },
  ];

  return (
    <aside className="w-64 h-full bg-card/40 backdrop-blur-xl border border-white/10 flex flex-col shrink-0 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden relative group transition-all duration-300">
      {/* Subtle Sidebar Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

      <div className="p-6 border-b border-white/10 relative z-10">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Admin Panel</h2>
        <p className="text-xs font-mono text-muted-foreground mt-1 truncate">{email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? "text-primary font-bold shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent border-l-4 border-blue-400" />
              )}
              <Icon size={20} className={cn("relative z-10", isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" : "group-hover:scale-110 transition-transform")} /> 
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 relative z-10">
        <form action="/api/auth/signout" method="POST">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-sm font-bold group">
            <LogOut size={20} className="group-hover:scale-110 transition-transform" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}