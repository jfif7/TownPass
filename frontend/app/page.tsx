"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from "@/components/event-card"
import { Compass } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL


type EventCardData = {
  id: string
  title: string
  description: string
  location: string
  imageUrl: string
  missions: number
  badges: number
  progress?: number
  completedBadges?: number
  status: 'upcoming' | 'ongoing' | 'past'
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("unattended")
  const [events, setEvents] = useState<EventCardData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}events?page=1&limit=20`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        // 將 API 回傳格式轉換成 EventCardData 陣列（後端鍵名為 events）
        const mapped: EventCardData[] = (data.events || []).map((e: any) => {
          // status: upcoming, ongoing, past
          let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
          if (e.status === 'ongoing') status = 'ongoing';
          else if (e.status === 'past' || e.status === 'finished') status = 'past';
          // 其餘皆 upcoming
          return {
            id: String(e.id),
            title: e.title,
            description: e.description,
            location: e.location,
            imageUrl: e.cover_image_url || '',
            missions: e.total_missions ?? 0,
            badges: e.total_missions ?? 0,
            progress: e.my_missions_completed ?? 0,
            completedBadges: e.my_missions_completed ?? 0,
            status,
          }
        })
        setEvents(mapped)
      } catch (e: any) {
        setError('無法取得活動資料')
        setEvents([])
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  // Available: upcoming, Active: ongoing, Completed: past
  const unattended = events.filter(e => e.status === 'upcoming')
  const attending = events.filter(e => e.status === 'ongoing')
  const completed = events.filter(e => e.status === 'past')

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
            {loading && <div>載入中...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && unattended.map((event) => (
              <EventCard key={event.id} event={event} status="unattended" />
            ))}
          </TabsContent>

          <TabsContent value="attending" className="space-y-4">
            {attending.map((event) => (
              <EventCard key={event.id} event={event} status="attending" />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.map((event) => (
              <EventCard key={event.id} event={event} status="completed" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
