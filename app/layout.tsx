import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { DotPatternBackground } from "@/components/ui/dot-pattern-background"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Culture Guides Rockstar - Salesforce",
  description: "Earn points, make an impact, and celebrate Salesforce culture.",
  keywords: "Salesforce, Culture Guides, Employee Engagement, Gamification",
  authors: [{ name: "Salesforce Culture Guides Team" }],
  openGraph: {
    title: "Culture Guides Rockstar",
    description: "Earn points, make an impact, and celebrate Salesforce culture.",
    type: "website",
  },
  generator: "v0.dev",
}

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DotPatternBackground />
            <div className="min-h-screen relative">
              {children}
              <Toaster />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
