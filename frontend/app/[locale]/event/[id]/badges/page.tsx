"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Award } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Badge = {
  id: string
  name: string
  imageUrl: string
  earnedAt: string
  description?: string
}

type EventData = {
  id: string
  title: string
  description: string
  completedDate: string
  badges: Badge[]
  largeImage?: string
}

export default function BadgesPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('badges')
  const locale = useLocale()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBadges() {
      setLoading(true)
      setError(null)
      try {
        // 取得使用者在該活動的徽章
        const badgesRes = await fetch(
          `${API_URL}badges/me/badges?event_id=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
          }
        )
        
        if (!badgesRes.ok) {
          throw new Error('Failed to fetch badges')
        }

        const badgesData = await badgesRes.json()

        // 處理不同的回應格式 (可能是陣列或包含 data 屬性的物件)
        const badges = Array.isArray(badgesData) 
          ? badgesData 
          : (badgesData.data || badgesData.badges || [])

        // 取得活動資訊
        const eventRes = await fetch(`${API_URL}events/${params.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        
        const eventInfo = await eventRes.json()
        
        // 組合資料
        const getValidDate = (dateStr: any): string => {
          if (!dateStr) return new Date().toISOString()
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
        }

        const mapped: EventData = {
          id: String(params.id),
          title: eventInfo.title || 'Event',
          description: eventInfo.description || '',
          completedDate: badges.length > 0 
            ? getValidDate(badges[0].earned_at).split('T')[0]
            : new Date().toISOString().split('T')[0],
          badges: badges.map((badge: any) => ({
            id: String(badge.badge_id || badge.id),
            name: badge.badge_name || badge.name,
            imageUrl: badge.badge_image_url || badge.image_url || "/placeholder.svg",
            earnedAt: getValidDate(badge.earned_at),
            description: badge.badge_description || badge.description,
          })),
          largeImage: eventInfo.cover_image_url || "/placeholder.svg?height=400&width=400",
        }

        setEventData(mapped)
      } catch (e) {
        console.error('Failed to fetch badges:', e)
        setError('Failed to load badges')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBadges()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    )
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">{error || '找不到活動資料'}</p>
      </div>
    )
  }

  const event = eventData

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
              {t('yourBadges')} ({event.badges.length})
            </h3>
            {event.badges.length > 0 ? (
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
                      <div className="text-white text-center">
                        <p className="text-xs font-semibold">{badge.name}</p>
                        {badge.description && (
                          <p className="text-[10px] mt-1 opacity-90">{badge.description}</p>
                        )}
                        <p className="text-[10px] mt-1 opacity-75">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>尚未獲得任何徽章</p>
              </div>
            )}

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
