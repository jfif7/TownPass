"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Award } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'

// Mock data for completed event with badges forming an image
const mockCompletedEvent = {
  id: "4",
  title: "Museum Quest",
  description: "Completed tour of famous museums and cultural sites",
  completedDate: "2024-01-15",
  badges: [
    {
      id: "b1",
      name: "Ancient History",
      imageUrl: "/ancient-history-badge.jpg",
      position: { row: 0, col: 0 },
    },
    {
      id: "b2",
      name: "Modern Art",
      imageUrl: "/modern-art-badge.jpg",
      position: { row: 0, col: 1 },
    },
    {
      id: "b3",
      name: "Natural Science",
      imageUrl: "/science-badge.png",
      position: { row: 0, col: 2 },
    },
    {
      id: "b4",
      name: "Cultural Heritage",
      imageUrl: "/heritage-badge.jpg",
      position: { row: 1, col: 0 },
    },
    {
      id: "b5",
      name: "Architecture",
      imageUrl: "/architecture-badge.jpg",
      position: { row: 1, col: 1 },
    },
    {
      id: "b6",
      name: "Photography",
      imageUrl: "/photography-badge.jpg",
      position: { row: 1, col: 2 },
    },
  ],
  largeImage: "/placeholder.svg?height=400&width=400",
}

export default function BadgesPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('badges')
  const locale = useLocale()
  const event = mockCompletedEvent

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{t('title')}</h1>
              <p className="text-sm opacity-90">{event.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Event Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-accent" />
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('completedOn', { date: new Date(event.completedDate).toLocaleDateString() })}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">{event.description}</p>
          </CardContent>
        </Card>

        {/* Collected Badges forming larger image */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              {t('yourBadges')}
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {event.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="aspect-square relative group overflow-hidden rounded-lg border-2 border-border hover:border-accent transition-colors"
                >
                  <img
                    src={badge.imageUrl || "/placeholder.svg"}
                    alt={badge.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center font-semibold">{badge.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Trophy */}
            <div className="pt-6 border-t">
              <h4 className="text-lg font-bold mb-3 text-center">{t('trophy')}</h4>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl" />
                  <img
                    src={event.largeImage || "/placeholder.svg"}
                    alt="Completion Trophy"
                    className="relative w-64 h-64 object-contain"
                  />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                {t('trophyDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
          <a href={`/${locale}`} className="w-full">
            {t('backToHome')}
          </a>
        </Button>
      </div>
    </div>
  )
}
