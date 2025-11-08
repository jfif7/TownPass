"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Sparkles, Share2, QrCode } from "lucide-react"
import Link from "next/link"
import Confetti from "react-confetti"

// Mock data
const mockMissionComplete = {
  id: "m3",
  title: "Market Square",
  badgeUrl: "/golden-market-badge.jpg",
  prizeQRCode: "/qr-code-prize.jpg",
  prizeLink: "https://example.com/claim/prize-abc123",
}

export default function MissionCompletePage() {
  const params = useParams()
  const router = useRouter()
  const mission = mockMissionComplete
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I completed ${mission.title}!`,
          text: "Check out my achievement in TownPass!",
          url: window.location.href,
        })
      } catch (error) {
        console.log("[v0] Error sharing:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4 animate-bounce">
            <Award className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-balance">
            <Sparkles className="inline h-8 w-8 text-accent mb-1" />
            Congratulations!
            <Sparkles className="inline h-8 w-8 text-accent mb-1" />
          </h1>
          <p className="text-xl text-muted-foreground">You completed the mission!</p>
        </div>

        {/* Badge Card */}
        <Card className="overflow-hidden border-accent">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
                <img
                  src={mission.badgeUrl || "/placeholder.svg"}
                  alt={`${mission.title} Badge`}
                  className="relative w-48 h-48 object-contain animate-in zoom-in duration-500"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{mission.title}</h2>
                <p className="text-muted-foreground">Mission Badge Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize Claim */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <QrCode className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Claim Your Prize</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Show this QR code or use the link below to claim your reward
              </p>
            </div>

            <div className="flex justify-center">
              <img
                src={mission.prizeQRCode || "/placeholder.svg"}
                alt="Prize QR Code"
                className="w-64 h-64 border-4 border-border rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <a href={mission.prizeLink} target="_blank" rel="noopener noreferrer">
                  Open Prize Link
                </a>
              </Button>
              <Button onClick={handleShare} variant="outline" className="w-full bg-transparent" size="lg">
                <Share2 className="mr-2 h-5 w-5" />
                Share Achievement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/event/1">Back to Event</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
