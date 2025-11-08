"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from "@/components/event-card"
import { LanguageSwitcher } from "@/components/language-switcher"
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
  const t = useTranslations()
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
        // 將 API 回傳格式轉換成 EventCardData 陣列
        const mapped: EventCardData[] = (data.events || []).map((e: any) => {
          let status: 'upcoming' | 'ongoing' | 'past' = 'upcoming';
          if (e.status === 'ongoing') status = 'ongoing';
          else if (e.status === 'past' || e.status === 'finished') status = 'past';
          
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
        setError(t('common.error'))
        setEvents([])
      }
      setLoading(false)
    }
    fetchEvents()
  }, [t])

  // Available: upcoming, Active: ongoing, Completed: past
  const unattended = events.filter(e => e.status === 'upcoming')
  const attending = events.filter(e => e.status === 'ongoing')
  const completed = events.filter(e => e.status === 'past')

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Using Town Pass Primary Color */}
      <header className="sticky top-0 z-50 bg-primary-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Compass className="h-8 w-8" />
              <div>
                <h1 className="font-h2-semibold">{t('home.title')}</h1>
                <p className="font-caption-regular opacity-90">{t('home.subtitle')}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="unattended">{t('home.tabs.available')}</TabsTrigger>
            <TabsTrigger value="attending">{t('home.tabs.active')}</TabsTrigger>
            <TabsTrigger value="completed">{t('home.tabs.completed')}</TabsTrigger>
          </TabsList>

          <TabsContent value="unattended" className="space-y-4">
            {loading && <div>{t('common.loading')}</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && unattended.map((event) => (
              <EventCard key={event.id} event={event} status="unattended" />
            ))}
          </TabsContent>

          <TabsContent value="attending" className="space-y-4">
            {loading && <div>{t('common.loading')}</div>}
            {!loading && attending.map((event) => (
              <EventCard key={event.id} event={event} status="attending" />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {loading && <div>{t('common.loading')}</div>}
            {!loading && completed.map((event) => (
              <EventCard key={event.id} event={event} status="completed" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
