import { prisma } from "@/utils/prisma";
import { AiChart } from "@/components/AiChart";
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
        <h1 className="text-3xl font-bold font-mono text-primary">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Experiences", count: exps },
          { label: "Education", count: edus },
          { label: "Skills", count: skills },
          { label: "Projects", count: projs },
          { label: "Blogs", count: blogs },
          { label: "Profile Extracted", count: profile },
        ].map((stat, i) => (
          <div key={i} className="bg-background/50 border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-4xl font-black text-primary">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-background/50 border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">AI Token Usage</h2>
        <p className="text-muted-foreground mb-6">Total Tokens Used: <span className="text-purple-500 font-bold">{totalTokens}</span> / 1.5M limit</p>
        <div className="h-64">
          <AiChart logs={aiLogs} />
        </div>
      </div>
    </div>
  );
}