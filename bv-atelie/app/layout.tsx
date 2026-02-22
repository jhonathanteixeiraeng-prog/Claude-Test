import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BV Atelie e Bordados",
  description: "Sistema de gerenciamento de presença e pagamentos",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
