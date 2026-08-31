
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { FloatingNav } from "@/components/FloatingNav";
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
    prisma.project.findMany({ where: { isFeatured: true }, orderBy: { featuredOrder: "asc" }, take: 3 }),
    prisma.project.findMany({ orderBy: { order: "asc" }, take: 6 })
  ]);


  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.name || 'Creative Developer',
    jobTitle: profile?.tagline || 'Building Digital Experiences',
    description: profile?.bio || 'Portfolio',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://ancasea.com',
    sameAs: [
      'https://github.com/ancasea',
      'https://linkedin.com/in/ancasea'
    ]
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <Hero profile={profile} />
      <About experiences={experiences} education={education} skills={skills} />
      <Projects featuredProjects={featuredProjects} regularProjects={regularProjects} />

      
      
      

      
      <FloatingNav />
    </main>
  );
}