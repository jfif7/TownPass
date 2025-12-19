"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Mission = {
  id: number
  event_id: number
  name: string
  description: string
  order: number
  is_active: boolean
}

type Event = {
  id: number
  title: string
}

export default function MissionManager() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [formData, setFormData] = useState({
    event_id: "",
    name: "",
    description: "",
    order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchEvents()
    fetchMissions()
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

  const fetchMissions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}admin/missions?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })
      const data = await res.json()
      setMissions(Array.isArray(data) ? data : (data.missions || []))
    } catch (e) {
      console.error("Failed to fetch missions:", e)
      setMissions([])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingMission
        ? `${API_URL}admin/missions/${editingMission.id}`
        : `${API_URL}admin/missions`
      
      const method = editingMission ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({
          ...formData,
          event_id: parseInt(formData.event_id)
        }),
      })

      if (res.ok) {
        fetchMissions()
        resetForm()
        alert(editingMission ? "任務已更新" : "任務已創建")
      }
    } catch (e) {
      console.error("Failed to save mission:", e)
      alert("操作失敗")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此任務嗎?")) return

    try {
      const res = await fetch(`${API_URL}admin/missions/${id}?hard=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })

      if (res.ok) {
        fetchMissions()
        alert("任務已刪除")
      }
    } catch (e) {
      console.error("Failed to delete mission:", e)
      alert("刪除失敗")
    }
  }

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission)
    setFormData({
      event_id: String(mission.event_id),
      name: mission.name,
      description: mission.description,
      order: mission.order,
      is_active: mission.is_active
    })
  }

  const resetForm = () => {
    setEditingMission(null)
    setFormData({
      event_id: "",
      name: "",
      description: "",
      order: 0,
      is_active: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader >
          <CardTitle className="text-xl">{editingMission ? "編輯任務" : "新增任務"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>所屬活動</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  required
                >
                  <option value="">選擇活動</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>任務名稱</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>順序</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">啟用</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>任務描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingMission ? "更新" : "創建"}
              </Button>
              {editingMission && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  取消
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">任務列表</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">載入中...</p>
          ) : missions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">尚無任務</p>
          ) : (
            <div className="space-y-3">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-5 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{mission.name}</h3>
                    <p className="text-sm text-muted-foreground">{mission.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Event ID: {mission.event_id} | Order: {mission.order} | 
                      {mission.is_active ? " 啟用" : " 停用"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleEdit(mission)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleDelete(mission.id)}
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
