"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from "@/components/event-card"
import { Compass } from "lucide-react"

// Mock data for demo
const mockEvents = {
  unattended: [
    {
      id: "1",
      title: "Downtown Discovery",
      description: "Explore the historic downtown area and discover hidden gems",
      location: "Downtown District",
      imageUrl: "/urban-exploration.png",
      missions: 5,
      badges: 5,
    },
    {
      id: "2",
      title: "Coastal Adventure",
      description: "Journey along the beautiful coastline and coastal landmarks",
      location: "Coastal Area",
      imageUrl: "/coastal-adventure.jpg",
      missions: 7,
      badges: 7,
    },
  ],
  attending: [
    {
      id: "3",
      title: "Park Explorer",
      description: "Navigate through city parks and natural trails",
      location: "City Parks",
      imageUrl: "/park-nature-trail.jpg",
      missions: 4,
      badges: 4,
      progress: 2,
    },
  ],
  completed: [
    {
      id: "4",
      title: "Museum Quest",
      description: "Visit famous museums and cultural sites",
      location: "Museum District",
      imageUrl: "/museum-cultural.jpg",
      missions: 6,
      badges: 6,
      completedBadges: 6,
    },
  ],
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("unattended")

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Using Town Pass Primary Color */}
      <header className="sticky top-0 z-50 bg-primary-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Compass className="h-8 w-8" />
            <div>
              <h1 className="font-h2-semibold">TownPass</h1>
              <p className="font-caption-regular opacity-90">GPS Adventure Game</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="unattended">Available</TabsTrigger>
            <TabsTrigger value="attending">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="unattended" className="space-y-4">
            {mockEvents.unattended.map((event) => (
              <EventCard key={event.id} event={event} status="unattended" />
            ))}
          </TabsContent>

          <TabsContent value="attending" className="space-y-4">
            {mockEvents.attending.map((event) => (
              <EventCard key={event.id} event={event} status="attending" />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {mockEvents.completed.map((event) => (
              <EventCard key={event.id} event={event} status="completed" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
