"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Navigation, Footprints, Scan, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data
const mockPointDetails = {
  id: "p3",
  name: "Food Court",
  description: "Visit the local food court area",
  targetLat: 25.034,
  targetLng: 121.5665,
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  const bearing = ((θ * 180) / Math.PI + 360) % 360

  return bearing
}

export default function NavigationPage() {
  const params = useParams()
  const router = useRouter()
  const point = mockPointDetails

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [distance, setDistance] = useState<number | null>(null)
  const [distanceLevel, setDistanceLevel] = useState<"near" | "mid" | "far">("far")
  const [showNFCScanner, setShowNFCScanner] = useState(false)
  const [locationError, setLocationError] = useState(false)

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(newLocation)
          setLocationError(false)

          // Calculate distance
          const dist = calculateDistance(newLocation.lat, newLocation.lng, point.targetLat, point.targetLng)
          setDistance(dist)

          // Set distance level
          if (dist < 40) {
            setDistanceLevel("near")
            setShowNFCScanner(true)
          } else if (dist < 200) {
            setDistanceLevel("mid")
          } else {
            setDistanceLevel("far")
          }

          // Calculate bearing
          const bearing = calculateBearing(newLocation.lat, newLocation.lng, point.targetLat, point.targetLng)
          setHeading(bearing)
        },
        (error) => {
          console.error("[v0] Geolocation error:", error)
          setLocationError(true)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      setLocationError(true)
    }
  }, [point.targetLat, point.targetLng])

  const handleNFCScan = () => {
    // In a real app, this would trigger NFC scanning
    console.log("[v0] NFC scan initiated")
    router.push("/complete/m3")
  }

  const handleManualCheckIn = () => {
    // Backup check-in method
    router.push("/complete/m3")
  }

  const footstepCount = distanceLevel === "near" ? 1 : distanceLevel === "mid" ? 2 : 3

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
              <h1 className="text-xl font-bold">Navigation</h1>
              <p className="text-sm opacity-90">{point.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {locationError && (
          <Alert variant="destructive">
            <AlertDescription>
              Unable to access your location. Please enable location services to use navigation.
            </AlertDescription>
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
                  {distanceLevel === "near" && "Very Close (~40m or less)"}
                  {distanceLevel === "mid" && "Getting Closer (40-200m)"}
                  {distanceLevel === "far" && "Keep Going (200m+)"}
                </p>
              </div>

              {/* Target Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">{point.name}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Options */}
        {showNFCScanner && (
          <Card className="border-accent bg-accent/5">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-accent mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">You've Arrived!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan the NFC tag at this location or use manual check-in
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleNFCScan} size="lg" className="w-full">
                  <Scan className="mr-2 h-5 w-5" />
                  Scan NFC Tag
                </Button>
                <Button onClick={handleManualCheckIn} variant="outline" size="lg" className="w-full bg-transparent">
                  Manual Check-in
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Navigation Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Footprints className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Follow the arrow direction and watch the footsteps decrease</span>
              </li>
              <li className="flex items-start gap-2">
                <Navigation className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>The arrow points toward your destination</span>
              </li>
              <li className="flex items-start gap-2">
                <Scan className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Scan the NFC tag when you arrive to complete the checkpoint</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
