"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import EventManager from "@/components/admin/EventManager"
import MissionManager from "@/components/admin/MissionManager"
import CheckpointManager from "@/components/admin/CheckpointManager"
import BadgeManager from "@/components/admin/BadgeManager"

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("events")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Admin Portal</h1>
              <p className="text-sm opacity-90">管理活動、任務、檢查點和徽章</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12">
            <TabsTrigger value="events" className="text-sm">活動 Events</TabsTrigger>
            <TabsTrigger value="missions" className="text-sm">任務 Missions</TabsTrigger>
            <TabsTrigger value="checkpoints" className="text-sm">檢查點 Checkpoints</TabsTrigger>
            <TabsTrigger value="badges" className="text-sm">徽章 Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-0">
            <EventManager />
          </TabsContent>

          <TabsContent value="missions" className="mt-0">
            <MissionManager />
          </TabsContent>

          <TabsContent value="checkpoints" className="mt-0">
            <CheckpointManager />
          </TabsContent>

          <TabsContent value="badges" className="mt-0">
            <BadgeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
