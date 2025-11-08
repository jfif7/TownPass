"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Award, CheckCircle2, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

// Mock data
const mockEventDetails = {
  id: "1",
  title: "Downtown Discovery",
  description:
    "Embark on an exciting journey through the historic downtown area. Discover hidden gems, learn about local history, and collect badges as you complete each mission.",
  location: "Downtown District",
  imageUrl: "/downtown-cityscape.jpg",
  missions: [
    {
      id: "m1",
      title: "Historic Plaza",
      description: "Find the historic plaza and learn about its significance",
      points: 3,
      completed: true,
      badgeUrl: "/plaza-badge.jpg",
    },
    {
      id: "m2",
      title: "Old Clock Tower",
      description: "Navigate to the iconic clock tower",
      points: 4,
      completed: true,
      badgeUrl: "/clock-badge.jpg",
    },
    {
      id: "m3",
      title: "Market Square",
      description: "Explore the bustling market square",
      points: 3,
      completed: false,
      badgeUrl: "/market-badge.jpg",
    },
    {
      id: "m4",
      title: "Riverside Walk",
      description: "Follow the scenic riverside path",
      points: 5,
      completed: false,
      badgeUrl: "/river-badge.jpg",
    },
    {
      id: "m5",
      title: "Art District",
      description: "Discover the vibrant art district",
      points: 4,
      completed: false,
      badgeUrl: "/art-badge.png",
    },
  ],
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const event = mockEventDetails

  const completedMissions = event.missions.filter((m) => m.completed).length
  const totalMissions = event.missions.length
  const progress = (completedMissions / totalMissions) * 100

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
            <h1 className="text-xl font-bold">Event Details</h1>
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
            <CardTitle>About This Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              {completedMissions} of {totalMissions} missions completed
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
            Missions
          </h3>

          {event.missions.map((mission) => (
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
                      <Badge variant={mission.completed ? "secondary" : "default"}>{mission.points} points</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{mission.description}</p>
                    {!mission.completed && (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link href={`/mission/${mission.id}`}>Start Mission</Link>
                      </Button>
                    )}
                    {mission.completed && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
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
