"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Navigation, Footprints, Scan, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations, useLocale } from "next-intl"
import {
  postFlutterMessage,
  useHandleConnectionData,
} from "@/hooks/use-flutter"

// Mock data
const mockPointDetails = {
  id: "p3",
  name: "Food Court",
  description: "Visit the local food court area",
  targetLat: 25.0217245,
  targetLng: 121.5351365,
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  const bearing = ((θ * 180) / Math.PI + 360) % 360

  return bearing
}

export default function NavigationPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("navigation")
  const locale = useLocale()
  const point = mockPointDetails

  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [distance, setDistance] = useState<number | null>(null)
  const [distanceLevel, setDistanceLevel] = useState<"near" | "mid" | "far">(
    "far"
  )
  const [enableNFC, setEnableNFC] = useState(false)
  const [locationError, setLocationError] = useState(false)
  const [debugm, setDebugm] = useState("")
  const [counter, setCounter] = useState(0)

  useHandleConnectionData((e) => {
    const data = JSON.parse(e.data)
    if (!data || data.name !== "nfc") {
      return
    }
    const tagId = data.data
    if (typeof tagId === "string") {
      console.error(tagId)
    }
  })

  useHandleConnectionData((e) => {
    const data = JSON.parse(e.data)
    if (!data) {
      return
    }
    if (data["name"] !== "location") {
      return
    }
    if (data && data["data"] && data["data"]["latitude"]) {
      const newLocation = {
        lat: data["data"]["latitude"],
        lng: data["data"]["longitude"],
      }
      setUserLocation(newLocation)
      setLocationError(false)
      const dist = calculateDistance(
        newLocation.lat,
        newLocation.lng,
        point.targetLat,
        point.targetLng
      )
      setDistance(dist)

      // Set distance level
      if (dist < 40) {
        setDistanceLevel("near")
        setEnableNFC(true)
      } else if (dist < 200) {
        setDistanceLevel("mid")
      } else {
        setDistanceLevel("far")
      }

      // Calculate bearing
      const bearing = calculateBearing(
        newLocation.lat,
        newLocation.lng,
        point.targetLat,
        point.targetLng
      )
      setHeading(bearing)
    } else {
      console.error("[v0] Geolocation error:", e.data)
      setLocationError(true)
    }
  })
  useEffect(() => {
    // Initial location request
    postFlutterMessage("location", null)

    // Set up interval to refresh location every 1 second
    const locationInterval = setInterval(() => {
      postFlutterMessage("location", null)
    }, 1000)

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(locationInterval)
  }, [])

  useEffect(() => {
    postFlutterMessage("nfc", "start")
    const nfcInterval = setInterval(() => {
      postFlutterMessage("nfc", "read")
    }, 1000)
    return () => {
      postFlutterMessage("nfc", "stop")
      clearInterval(nfcInterval)
    }
  }, [])

  const handleManualCheckIn = () => {
    // Backup check-in method
    router.push(`/${locale}/complete/m3`)
  }

  const footstepCount =
    distanceLevel === "near" ? 1 : distanceLevel === "mid" ? 2 : 3

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
              <h1 className="text-xl font-bold">
                {t("title")}
                {debugm}
                {counter}
              </h1>
              <p className="text-sm opacity-90">{point.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {locationError && (
          <Alert variant="destructive">
            <AlertDescription>{t("locationError")}</AlertDescription>
          </Alert>
        )}

        {/* Compass */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* Direction Arrow */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10" />
                <div className="absolute inset-4 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-8 rounded-full border-2 border-primary/20" />
                <Navigation
                  className="h-24 w-24 text-accent transition-transform duration-300"
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              </div>

              {/* Distance Indicator */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[...Array(footstepCount)].map((_, i) => (
                    <Footprints key={i} className="h-8 w-8 text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {distanceLevel === "near" && t("distance.near")}
                  {distanceLevel === "mid" && t("distance.mid")}
                  {distanceLevel === "far" && t("distance.far")}
                </p>
              </div>

              {/* Target Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">{point.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Options */}
        {enableNFC && (
          <Card className="border-accent bg-accent/5">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-accent mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">{t("arrived")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("scanOrManual")}
                </p>
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full" disabled={!false}>
                  <Scan className="mr-2 h-5 w-5" />
                  {t("scanNFC")}
                </Button>
                <Button
                  onClick={handleManualCheckIn}
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent"
                >
                  {t("manualCheckIn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">{t("tips")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Footprints className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{t("tip1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Navigation className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{t("tip2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Scan className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{t("tip3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
