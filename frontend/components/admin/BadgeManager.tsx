"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Badge = {
  id: number
  name: string
  description: string
  image_url: string
  badge_type: string
  event_id?: number
  mission_id?: number
}

type Event = {
  id: number
  title: string
}

export default function BadgeManager() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    badge_type: "mission_complete",
    event_id: "",
    mission_id: ""
  })

  useEffect(() => {
    fetchEvents()
    fetchBadges()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}admin/events?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : (data.events || []))
    } catch (e) {
      console.error("Failed to fetch events:", e)
      setEvents([])
    }
  }

  const fetchBadges = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}admin/badges?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })
      const data = await res.json()
      setBadges(Array.isArray(data) ? data : (data.badges || []))
    } catch (e) {
      console.error("Failed to fetch badges:", e)
      setBadges([])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBadge
        ? `${API_URL}admin/badges/${editingBadge.id}`
        : `${API_URL}admin/badges`
      
      const method = editingBadge ? "PUT" : "POST"
      
      const payload: any = {
        name: formData.name,
        description: formData.description,
        image_url: formData.image_url,
        badge_type: formData.badge_type
      }

      if (formData.event_id) {
        payload.event_id = parseInt(formData.event_id)
      }

      if (formData.mission_id) {
        payload.mission_id = parseInt(formData.mission_id)
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        fetchBadges()
        resetForm()
        alert(editingBadge ? "徽章已更新" : "徽章已創建")
      }
    } catch (e) {
      console.error("Failed to save badge:", e)
      alert("操作失敗")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此徽章嗎?")) return

    try {
      const res = await fetch(`${API_URL}admin/badges/${id}?hard=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })

      if (res.ok) {
        fetchBadges()
        alert("徽章已刪除")
      }
    } catch (e) {
      console.error("Failed to delete badge:", e)
      alert("刪除失敗")
    }
  }

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      description: badge.description,
      image_url: badge.image_url,
      badge_type: badge.badge_type,
      event_id: badge.event_id?.toString() || "",
      mission_id: badge.mission_id?.toString() || ""
    })
  }

  const resetForm = () => {
    setEditingBadge(null)
    setFormData({
      name: "",
      description: "",
      image_url: "",
      badge_type: "mission_complete",
      event_id: "",
      mission_id: ""
    })
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {editingBadge ? "編輯徽章" : "新增徽章"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>徽章名稱</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>類型</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.badge_type}
                  onChange={(e) => setFormData({ ...formData, badge_type: e.target.value })}
                >
                  <option value="mission_complete">任務完成</option>
                  <option value="event_complete">活動完成</option>
                  <option value="special">特殊徽章</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>圖片 URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/badge.png"
                />
              </div>
              <div className="space-y-2">
                <Label>關聯活動 (選填)</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                >
                  <option value="">不關聯</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>關聯任務 ID (選填)</Label>
                <Input
                  type="number"
                  value={formData.mission_id}
                  onChange={(e) => setFormData({ ...formData, mission_id: e.target.value })}
                  placeholder="輸入任務 ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>徽章描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingBadge ? "更新" : "創建"}
              </Button>
              {editingBadge && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>徽章列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>載入中...</p>
          ) : (
            <div className="space-y-2">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {badge.image_url && (
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {badge.badge_type}
                        {badge.event_id && ` | Event: ${badge.event_id}`}
                        {badge.mission_id && ` | Mission: ${badge.mission_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(badge)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(badge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
