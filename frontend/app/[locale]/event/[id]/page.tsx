"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Award, CheckCircle2, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('event')
  const locale = useLocale()
  const [event, setEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true)
      try {
        // 取得單一 event 詳細
        const res = await fetch(`${API_URL}events/${params.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        const data = await res.json()
        console.log('Fetched event detail:', data)
        // 後端可能回 { event: {...} } 或直接回 {...}
        const raw = data?.event ?? data
        if (!raw) throw new Error('No event data')

        // 映射為前端使用的結構
        const mapped = {
          id: String(raw.id),
          title: raw.title,
          description: raw.description,
          location: raw.location,
          imageUrl: raw.cover_image_url || '/placeholder.svg',
          missions: (raw.missions || []).map((m: any) => ({
            id: String(m.id),
            title: m.name,
            description: m.description,
            // 後端目前沒有 points/badge，必要時可日後擴充
            points: typeof m.points === 'number' ? m.points : undefined,
            completed: !!m.is_completed,
          })),
          my_progress: raw.my_progress,
          status: raw.status,
        }

        setEvent(mapped)
      } catch (e) {
        setEvent(null)
      }
      setLoading(false)
    }
    fetchEvent()
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center">{t('loading')}</div>
  }

  if (!event) {
    return <div className="p-8 text-center text-red-500">{t('notFound')}</div>
  }

  // 使用後端提供的 my_progress，若無則回退以任務完成數計算
  const completedMissions = event.my_progress?.missions_completed ?? (event.missions?.filter((m: any) => m.completed).length || 0)
  const totalMissions = event.my_progress?.total_missions ?? (event.missions?.length || 0)
  const progress = typeof event.my_progress?.completion_percentage === 'number'
    ? event.my_progress.completion_percentage
    : (totalMissions ? (completedMissions / totalMissions) * 100 : 0)

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
            <h1 className="text-xl font-bold">{t('detailTitle')}</h1>
          </div>
        </div>
      </header>

      {/* Event Image */}
      <div className="relative h-64 overflow-hidden">
        <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-2 text-balance">{event.title}</h2>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>{t('about')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>{t('yourProgress')}</CardTitle>
            <CardDescription>
              {t('missionsCompleted', { completed: completedMissions, total: totalMissions })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Missions */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            {t('missionsTitle')}
          </h3>

          {event.missions?.map((mission: any) => (
            <Card key={mission.id} className={mission.completed ? "opacity-75 border-primary/30" : "border-primary"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {mission.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-balance">{mission.title}</h4>
                      {typeof mission.points === 'number' && (
                        <Badge variant={mission.completed ? "secondary" : "default"}>{mission.points} {t('points')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                    {!mission.completed && (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/${locale}/mission/${mission.id}`}>{t('startMission')}</Link>
                      </Button>
                    )}
                    {mission.completed && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t('completed')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
