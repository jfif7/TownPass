"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from "@/components/event-card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Compass } from "lucide-react"

export default function HomePage() {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState("unattended")

  // 使用翻譯的模擬資料
  const mockEvents = {
    unattended: [
      {
        id: "1",
        title: t('mockData.events.downtown.title'),
        description: t('mockData.events.downtown.description'),
        location: t('mockData.events.downtown.location'),
        imageUrl: "/urban-exploration.png",
        missions: 5,
        badges: 5,
      },
      {
        id: "2",
        title: t('mockData.events.coastal.title'),
        description: t('mockData.events.coastal.description'),
        location: t('mockData.events.coastal.location'),
        imageUrl: "/coastal-adventure.jpg",
        missions: 7,
        badges: 7,
      },
    ],
    attending: [
      {
        id: "3",
        title: t('mockData.events.park.title'),
        description: t('mockData.events.park.description'),
        location: t('mockData.events.park.location'),
        imageUrl: "/park-nature-trail.jpg",
        missions: 4,
        badges: 4,
        progress: 2,
      },
    ],
    completed: [
      {
        id: "4",
        title: t('mockData.events.museum.title'),
        description: t('mockData.events.museum.description'),
        location: t('mockData.events.museum.location'),
        imageUrl: "/museum-cultural.jpg",
        missions: 6,
        badges: 6,
        completedBadges: 6,
      },
    ],
  }

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
