import { Geist_Mono, Inter, Figtree } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SNU TeamUp - 서울대 공모전 팀빌딩",
  description: "서울대학교 학생들을 위한 공모전 팀빌딩 플랫폼. 함께할 팀원을 찾고, 공모전에 도전하세요.",
  openGraph: {
    title: "SNU TeamUp - 서울대 공모전 팀빌딩",
    description: "서울대학교 학생들을 위한 공모전 팀빌딩 플랫폼. 함께할 팀원을 찾고, 공모전에 도전하세요.",
    siteName: "SNU TeamUp",
  },
};

const figtreeHeading = Figtree({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, figtreeHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
