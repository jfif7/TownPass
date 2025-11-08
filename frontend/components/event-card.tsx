import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Award, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  location: string
  imageUrl: string
  missions: number
  badges: number
  progress?: number
  completedBadges?: number
}

interface EventCardProps {
  event: Event
  status: "unattended" | "attending" | "completed"
}

export function EventCard({ event, status }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        {status === "attending" && event.progress && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-3">
            <div className="flex items-center justify-between text-white text-sm mb-1">
              <span>Progress</span>
              <span>
                {event.progress}/{event.missions} missions
              </span>
            </div>
            <Progress value={(event.progress / event.missions) * 100} className="h-2" />
          </div>
        )}
      </div>

      <CardHeader>
        <h3 className="text-xl font-bold text-balance">{event.title}</h3>
        <p className="text-sm text-muted-foreground text-pretty">{event.description}</p>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>
              {event.missions} {event.missions === 1 ? "mission" : "missions"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-accent" />
            <span>{status === "completed" ? event.completedBadges : event.badges} badges</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {status === "unattended" && (
          <Button asChild className="w-full" size="lg">
            <Link href={`/event/${event.id}`}>Start Adventure</Link>
          </Button>
        )}
        {status === "attending" && (
          <Button asChild className="w-full" variant="default" size="lg">
            <Link href={`/event/${event.id}`}>Continue</Link>
          </Button>
        )}
        {status === "completed" && (
          <Button asChild className="w-full" variant="secondary" size="lg">
            <Link href={`/event/${event.id}/badges`}>View Badges</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
