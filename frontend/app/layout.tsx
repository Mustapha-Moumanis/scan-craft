import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { createTheme } from "@mui/material/styles"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Scan Craft",
  description: "Process PDF files and extract QR codes",
  generator: "mmoumanis",
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#7F5AF0",
    },
    background: {
      default: "#F8F9FF",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)",
  },
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
