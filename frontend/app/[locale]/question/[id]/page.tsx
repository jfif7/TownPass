"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, HelpCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations, useLocale } from "next-intl"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("question")
  const locale = useLocale()

  const [checkpoint, setCheckpoint] = useState<any | null>(null)
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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

        setCheckpoint({
          id: String(data.id),
          name: data.name,
          description: data.description,
          questionData: data.question_data,
          rewardPoints: data.reward_points,
          missionId: data.mission_id,
        })
      } catch (e) {
        console.error("Failed to fetch checkpoint:", e)
        setCheckpoint(null)
      }
      setLoading(false)
    }
    fetchCheckpoint()
  }, [params.id])

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return
    }

    setSubmitting(true)
    try {
      // 在這裡可以調用 API 來記錄答案
      // 目前一律視為正確答案

      // 模擬 API 呼叫延遲
      await new Promise((resolve) => setTimeout(resolve, 500))

      setShowSuccess(true)

      // 1.5 秒後導向完成頁面
      setTimeout(() => {
        if (checkpoint?.missionId) {
          router.push(`/${locale}/event/8/badges`)
        } else {
          router.back()
        }
      }, 1500)
    } catch (e) {
      console.error("Failed to submit answer:", e)
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
              disabled={submitting || showSuccess}
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
              {t("correctAnswer")}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="border-primary shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{checkpoint.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {checkpoint.description}
                </p>
              </div>
            </div>

            {/* Question */}
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-lg font-medium text-center">
                {checkpoint.questionData}
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label htmlFor="answer" className="text-sm font-medium block">
                {t("yourAnswer")}
              </label>
              <Input
                id="answer"
                type="text"
                placeholder={t("answerPlaceholder")}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting || showSuccess}
                className="text-lg h-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting && !showSuccess) {
                    handleSubmit()
                  }
                }}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting || showSuccess}
              size="lg"
              className="w-full"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {t("submitting")}
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {t("submitted")}
                </>
              ) : (
                t("submitAnswer")
              )}
            </Button>
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
