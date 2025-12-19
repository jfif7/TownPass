"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, Gift, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations, useLocale } from "next-intl"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function DiscountPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("discount")
  const locale = useLocale()

  const [checkpoint, setCheckpoint] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  useEffect(() => {
    async function fetchCheckpoint() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}admin/checkpoints/${params.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
        })
        const data = await res.json()

        if (!data) throw new Error("No checkpoint data")

        // Check if already completed
        const progressRes = await fetch(
          `${API_URL}missions/${data.mission_id}/checkpoints?skip=0&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
            },
          }
        )
        const progressData = await progressRes.json()
        const checkpointProgress = Array.isArray(progressData) 
          ? progressData.find((cp: any) => cp.id === data.id)
          : null

        setCheckpoint({
          id: String(data.id),
          name: data.name,
          description: data.description,
          qrcodeData: data.qrcode_data, // Using qrcode_data field for discount URL
          rewardPoints: data.reward_points,
          missionId: data.mission_id,
        })

        if (checkpointProgress?.completed) {
          setAlreadyCompleted(true)
        }
      } catch (e) {
        console.error("Failed to fetch checkpoint:", e)
        setCheckpoint(null)
      }
      setLoading(false)
    }
    fetchCheckpoint()
  }, [params.id])

  const handleOpenCoupon = () => {
    if (checkpoint?.qrcodeData) {
      // Open the discount URL
      window.open(checkpoint.qrcodeData, '_blank')
      
      // Mark as completed after opening
      handleCheckIn()
    }
  }

  const handleCheckIn = async () => {
    if (alreadyCompleted) return

    setSubmitting(true)
    try {
      // Simulate API call to mark checkpoint as completed
      await new Promise((resolve) => setTimeout(resolve, 500))

      setShowSuccess(true)
      setAlreadyCompleted(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        if (checkpoint?.missionId) {
          router.push(`/${locale}/mission/${checkpoint.missionId}`)
        } else {
          router.back()
        }
      }, 2000)
    } catch (e) {
      console.error("Failed to check in:", e)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {t("loading") || "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!checkpoint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">
            {t("notFound") || "Checkpoint not found"}
          </p>
        </div>
      </div>
    )
  }

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
              disabled={submitting}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{t("title")}</h1>
              <p className="text-sm opacity-90">{checkpoint.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Success Alert */}
        {showSuccess && (
          <Alert className="border-primary bg-primary/5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertDescription className="text-primary font-medium">
              {t("checkInSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {/* Already Completed Alert */}
        {alreadyCompleted && !showSuccess && (
          <Alert className="border-muted bg-muted/5">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <AlertDescription className="text-muted-foreground font-medium">
              {t("alreadyCompleted")}
            </AlertDescription>
          </Alert>
        )}

        {/* Discount Card */}
        <Card className="border-primary shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{checkpoint.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {checkpoint.description}
                </p>
              </div>
            </div>

            {/* Coupon Display - Clickable */}
            {checkpoint.qrcodeData ? (
              <a
                href={checkpoint.qrcodeData}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCheckIn()}
                className="block bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border-2 border-dashed border-primary/30 cursor-pointer"
              >
                <div className="text-center space-y-4">
                  <Gift className="h-16 w-16 mx-auto text-primary" />
                  <p className="text-lg font-semibold">{t("description")}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    <span>點擊開啟優惠券</span>
                  </div>
                </div>
              </a>
            ) : (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border-2 border-dashed border-primary/30">
                <div className="text-center space-y-4">
                  <Gift className="h-16 w-16 mx-auto text-primary" />
                  <p className="text-lg font-semibold">{t("description")}</p>
                </div>
              </div>
            )}

            {/* Open Coupon Button */}
            {checkpoint.qrcodeData && (
              <a
                href={checkpoint.qrcodeData}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCheckIn()}
              >
                <Button
                  disabled={submitting}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <span>
                    {submitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-5 w-5" />
                        {t("openCoupon")}
                      </>
                    )}
                  </span>
                </Button>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Reward Info */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("rewardInfo")}
              </p>
              <p className="text-2xl font-bold text-primary">
                +{checkpoint.rewardPoints} {t("points")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">{t("instructions")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t("instruction1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t("instruction2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t("instruction3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
