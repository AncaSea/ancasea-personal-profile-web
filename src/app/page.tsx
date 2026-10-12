import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { ContactForm } from "@/components/ContactForm";
import { Guestbook } from "@/components/Guestbook";
import { AlertHandler } from "@/components/AlertHandler";
import { prisma } from "@/utils/prisma";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profileInfo.findFirst();
  const name = profile?.name || "Creative Developer";
  const tagline = profile?.tagline || "Building Digital Experiences";
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://ancasea.com"),
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
    prisma.project.findMany({ where: { isFeatured: true, isVisible: true }, orderBy: { featuredOrder: "asc" }, take: 3 }),
    prisma.project.findMany({ where: { isVisible: true }, orderBy: { order: "asc" }, take: 6 })
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
    <main className="relative bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-clip">
      <AlertHandler />
      <script 
        id="jsonld-data"
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      
      {/* SECTION 1: HERO */}
      <Hero profile={profile} />

      {/* SECTION 2: ABOUT / EXPERIENCE / EDUCATION / ARSENAL */}
      <About experiences={experiences} education={education} skills={skills} />

      {/* SECTION 3: PROJECTS SHOWCASE */}
      <Projects featuredProjects={featuredProjects} regularProjects={regularProjects} />

      {/* SECTION 4: CONTACT */}
      <section id="contact" className="relative w-full min-h-screen py-20 sm:py-28 flex items-center justify-center bg-background border-t border-border/40">
        <div className="container mx-auto px-4 w-full max-w-4xl">
          <ContactForm />
        </div>
      </section>

      {/* SECTION 5: GUESTBOOK */}
      <section id="guestbook" className="relative w-full min-h-screen py-20 sm:py-28 flex items-center justify-center bg-background/50 border-t border-border/40">
        <div className="container mx-auto px-4 w-full max-w-4xl">
          <Guestbook />
        </div>
      </section>
    </main>
  );
}
