"use client"

import { AppSidebar } from "@/components/app-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      {/* Content with responsive margin */}
      <div className="lg:ml-16 min-h-screen">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}