import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin Portal - Town Pass',
  description: 'Town Pass Admin Portal',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
