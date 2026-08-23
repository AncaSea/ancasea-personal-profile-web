import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { prisma } from "@/utils/prisma";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profileInfo.findFirst();
  const name = profile?.name || "Creative Developer";
  const tagline = profile?.tagline || "Building Digital Experiences";
  
  return {
    title: `${name} | ${tagline}`,
    description: profile?.bio || `Portfolio of ${name} - ${tagline}`,
    openGraph: {
      title: `${name} | ${tagline}`,
      description: profile?.bio || `Portfolio of ${name} - ${tagline}`,
      images: ['/api/og'],
    },
  };
}

export default async function Home() {
  const [profile, experiences, education, skills, projects] = await Promise.all([
    prisma.profileInfo.findFirst(),
    prisma.experience.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.education.findMany({ orderBy: { year: 'desc' } }),
    prisma.skill.findMany(),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      
      <Hero profile={profile} />
      <About experiences={experiences} education={education} skills={skills} />
      <Projects projects={projects} />

      <div className="hidden futuristic:block absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      <div className="hidden glass:block fixed top-1/4 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="hidden glass:block fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      <ThemeSwitcher />
    </main>
  );
}