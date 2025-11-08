"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('mission')
  const locale = useLocale()
  const [mission, setMission] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMissionAndCheckpoints() {
      setLoading(true)
      try {
        // 取得 mission 詳細資訊
        const missionRes = await fetch(`${API_URL}admin/missions/${params.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        const missionData = await missionRes.json()
        
        if (!missionData) throw new Error('No mission data')

        // 取得 checkpoints
        const checkpointsRes = await fetch(
          `${API_URL}admin/checkpoints/mission/${params.id}?skip=0&limit=100&include_inactive=false`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
          }
        )
        const checkpointsData = await checkpointsRes.json()
        const checkpoints = Array.isArray(checkpointsData) ? checkpointsData : []

        // 映射為前端使用的結構
        const mapped = {
          id: String(missionData.id),
          title: missionData.name,
          description: missionData.description,
          points: checkpoints
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((cp: any) => ({
              id: String(cp.id),
              name: cp.name,
              description: cp.description,
              completed: !!cp.completed,
              lat: cp.lat,
              lng: cp.lng,
              checkpointType: cp.checkpoint_type,
              rewardPoints: cp.reward_points,
              order: cp.order,
            })),
        }

        setMission(mapped)
      } catch (e) {
        console.error('Failed to fetch mission:', e)
        setMission(null)
      }
      setLoading(false)
    }
    fetchMissionAndCheckpoints()
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center">{t('loading') || 'Loading...'}</div>
  }

  if (!mission) {
    return <div className="p-8 text-center text-red-500">{t('notFound') || 'Mission not found'}</div>
  }

  const completedPoints = mission.points.filter((p: any) => p.completed).length
  const totalPoints = mission.points.length
  const progress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0

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
              <h1 className="text-xl font-bold">{mission.title}</h1>
              <p className="text-sm opacity-90">{t('details')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b sticky top-[72px] z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">{t('progress')}</span>
            <span className="text-muted-foreground">
              {t('checkpointsCount', { completed: completedPoints, total: totalPoints })}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Mission Description */}
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{mission.description}</p>
          </CardContent>
        </Card>

        {/* Checkpoints */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {t('checkpoints')}
          </h3>

          {mission.points.map((point: any, index: number) => (
            <Card key={point.id} className={point.completed ? "opacity-75 border-primary/30" : "border-primary"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {point.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-balance">{point.name}</h4>
                      {point.completed && (
                        <Badge variant="secondary" className="shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t('done')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{point.description}</p>
                    {!point.completed && (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/${locale}/navigate/${point.id}`}>{t('navigateHere')}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {progress === 100 && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">{t('complete')}</h3>
              <p className="mb-4 opacity-90">{t('allCheckpointsCompleted')}</p>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href={`/${locale}/complete/${mission.id}`}>{t('claimBadge')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
