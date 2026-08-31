import { prisma } from "@/utils/prisma";
import { AiChart } from "@/components/AiChart";
import { Briefcase, GraduationCap, Code, FolderGit2, BookOpen, User } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [profile, exps, edus, skills, projs, blogs, aiLogs] = await Promise.all([
    prisma.profileInfo.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.skill.count(),
    prisma.project.count(),
    prisma.blog.count(),
    prisma.aiUsageLog.findMany({ orderBy: { createdAt: 'asc' }, take: 30 })
  ]);

  const totalTokens = aiLogs.reduce((acc, log) => acc + log.totalTokenCount, 0);

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 drop-shadow-sm tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: "Experiences", count: exps, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10", glow: "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]", glowBorder: "group-hover:border-purple-400/50" },
          { label: "Education", count: edus, icon: GraduationCap, color: "text-teal-400", bg: "bg-teal-500/10", glow: "group-hover:shadow-[0_0_20px_rgba(45,212,191,0.3)]", glowBorder: "group-hover:border-teal-400/50" },
          { label: "Skills", count: skills, icon: Code, color: "text-sky-400", bg: "bg-sky-500/10", glow: "group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]", glowBorder: "group-hover:border-sky-400/50" },
          { label: "Projects", count: projs, icon: FolderGit2, color: "text-pink-400", bg: "bg-pink-500/10", glow: "group-hover:shadow-[0_0_20px_rgba(244,114,182,0.3)]", glowBorder: "group-hover:border-pink-400/50" },
          { label: "Blogs", count: blogs, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-600/10", glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]", glowBorder: "group-hover:border-blue-400/50" },
          { label: "Profile", count: profile, icon: User, color: "text-yellow-400", bg: "bg-yellow-500/10", glow: "group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]", glowBorder: "group-hover:border-yellow-400/50" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
          <div key={i} className={`bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 ${stat.glow} ${stat.glowBorder}`}>
            {/* Soft inner gradient based on theme */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{stat.label}</p>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className={`text-5xl font-black font-sans ${stat.color} relative z-10 drop-shadow-md`}>{stat.count}</p>
          </div>
        )})}
      </div>

      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden mt-6 group">
        <div className="absolute top-[-20%] left-[-10%] w-[30%] h-[50%] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none z-0 group-hover:bg-cyan-400/20 transition-colors duration-1000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none z-0 group-hover:bg-purple-400/20 transition-colors duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-2">AI Token Usage</h2>
            <p className="text-muted-foreground font-medium">Total Tokens Used: <span className="text-primary font-bold drop-shadow-sm">{totalTokens.toLocaleString()}</span> / 1,500,000 limit</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs mb-1 font-mono text-muted-foreground">
              <span>{((totalTokens / 1500000) * 100).toFixed(2)}% Used</span>
              <span>1.5M</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative"
                style={{ width: `${Math.min((totalTokens / 1500000) * 100, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 blur-[2px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px] relative z-10">
          <AiChart logs={aiLogs} />
        </div>
      </div>
    </div>
  );
}