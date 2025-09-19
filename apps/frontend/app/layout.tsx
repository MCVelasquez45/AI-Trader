import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/layout/providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Options Strategist",
  description: "Layered intelligence for options traders with live analytics and AI rationale."
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-950`}> 
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
