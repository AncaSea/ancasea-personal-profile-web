
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
  const [profile, experiences, education, skills, featuredProjects, regularProjects] = await Promise.all([
    prisma.profileInfo.findFirst(),
    prisma.experience.findMany({ orderBy: { startDate: "desc" } }),
    prisma.education.findMany({ orderBy: { year: "desc" } }),
    prisma.skill.findMany(),
    prisma.project.findMany({ where: { isFeatured: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 6 })
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      
      <Hero profile={profile} />
      <About experiences={experiences} education={education} skills={skills} />
      <Projects featuredProjects={featuredProjects} regularProjects={regularProjects} />

      
      
      

      
    </main>
  );
}