import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/SmoothScroll";
import SectionNavigation from "@/components/SectionNavigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Profile",
  description: "Modern Parallax Portfolio",
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
          <Toaster theme="system" duration={8000} richColors />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}