"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"

// Mock data
const mockMissionDetails = {
  id: "m3",
  title: "Market Square",
  description: "Explore the bustling market square and discover all checkpoint locations",
  points: [
    {
      id: "p1",
      name: "Main Entrance",
      description: "Find the main entrance gate",
      completed: true,
      lat: 25.033,
      lng: 121.5654,
    },
    {
      id: "p2",
      name: "Fountain Plaza",
      description: "Locate the central fountain",
      completed: true,
      lat: 25.0335,
      lng: 121.566,
    },
    {
      id: "p3",
      name: "Food Court",
      description: "Visit the local food court area",
      completed: false,
      lat: 25.034,
      lng: 121.5665,
    },
    {
      id: "p4",
      name: "Artisan Corner",
      description: "Find the artisan crafts corner",
      completed: false,
      lat: 25.0345,
      lng: 121.567,
    },
  ],
}

export default function MissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('mission')
  const locale = useLocale()
  const mission = mockMissionDetails

  const completedPoints = mission.points.filter((p) => p.completed).length
  const totalPoints = mission.points.length
  const progress = (completedPoints / totalPoints) * 100

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

          {mission.points.map((point, index) => (
            <Card key={point.id} className={point.completed ? "opacity-75 border-primary/30" : "border-primary"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
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
                        <Badge variant="secondary" className="flex-shrink-0">
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
