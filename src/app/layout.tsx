import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/SmoothScroll";
import SectionNavigation from "@/components/SectionNavigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AiAssistant } from "@/components/AiAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://ancasea.com"),
  title: {
    default: "Ancasea - Fullstack Developer",
    template: "%s | Ancasea"
  },
  description: "Personal portfolio of Ancasea, showcasing modern web development, projects, and technical skills using Next.js, React, and TypeScript.",
  keywords: ["Ancasea", "Fullstack Developer", "Web Developer", "Next.js Portfolio", "React Developer", "Software Engineer", "Indonesia"],
  authors: [{ name: "Ancasea" }],
  creator: "Ancasea",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://ancasea.com", // Replace with real domain later
    title: "Ancasea - Fullstack Developer",
    description: "Personal portfolio of Ancasea, showcasing modern web development, projects, and technical skills.",
    siteName: "Ancasea Portfolio",
    images: [
      {
        url: "/og-image.png", // Add an actual image to public/og-image.png later
        width: 1200,
        height: 630,
        alt: "Ancasea Portfolio Presentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancasea - Fullstack Developer",
    description: "Personal portfolio of Ancasea, showcasing modern web development, projects, and technical skills.",
    images: ["/og-image.png"],
    creator: "@ancasea", // Replace if you have a twitter handle
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE", // Replace this with the real code from GSC
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme-mode-auto') === 'true') {
                  var hour = new Date().getHours();
                  var timeTheme = (hour >= 18 || hour < 6) ? 'theme-futuristic' : 'light';
                  localStorage.setItem('theme', timeTheme);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "theme-futuristic", "theme-glass", "system"]}
        >
          <SmoothScroll>
            {children}
            <SectionNavigation />
            <ThemeSwitcher />
            <AiAssistant />
          <Toaster theme="system" duration={8000} richColors />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}