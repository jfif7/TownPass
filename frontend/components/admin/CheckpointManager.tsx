"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Checkpoint = {
  id: number
  mission_id: number
  name: string
  description: string
  checkpoint_type: string
  lat?: number
  lng?: number
  order: number
  reward_points: number
  is_active: boolean
  question_data?: string
  qrcode_data?: string
}

type Mission = {
  id: number
  name: string
  event_id: number
}

export default function CheckpointManager() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)
  const [formData, setFormData] = useState({
    mission_id: "",
    name: "",
    description: "",
    checkpoint_type: "NFC",
    lat: "",
    lng: "",
    order: 0,
    reward_points: 10,
    is_active: true,
    question_data: "",
    qrcode_data: ""
  })

  useEffect(() => {
    fetchMissions()
    fetchCheckpoints()
  }, [])

  const fetchMissions = async () => {
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
  }

  const fetchCheckpoints = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}admin/checkpoints?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })
      const data = await res.json()
      setCheckpoints(Array.isArray(data) ? data : (data.checkpoints || []))
    } catch (e) {
      console.error("Failed to fetch checkpoints:", e)
      setCheckpoints([])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCheckpoint
        ? `${API_URL}admin/checkpoints/${editingCheckpoint.id}`
        : `${API_URL}admin/checkpoints`
      
      const method = editingCheckpoint ? "PUT" : "POST"
      
      const payload: any = {
        ...formData,
        mission_id: parseInt(formData.mission_id),
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
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
        fetchCheckpoints()
        resetForm()
        alert(editingCheckpoint ? "檢查點已更新" : "檢查點已創建")
      }
    } catch (e) {
      console.error("Failed to save checkpoint:", e)
      alert("操作失敗")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此檢查點嗎?")) return

    try {
      const res = await fetch(`${API_URL}admin/checkpoints/${id}?hard=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })

      if (res.ok) {
        fetchCheckpoints()
        alert("檢查點已刪除")
      }
    } catch (e) {
      console.error("Failed to delete checkpoint:", e)
      alert("刪除失敗")
    }
  }

  const handleEdit = (checkpoint: Checkpoint) => {
    setEditingCheckpoint(checkpoint)
    setFormData({
      mission_id: String(checkpoint.mission_id),
      name: checkpoint.name,
      description: checkpoint.description,
      checkpoint_type: checkpoint.checkpoint_type,
      lat: checkpoint.lat?.toString() || "",
      lng: checkpoint.lng?.toString() || "",
      order: checkpoint.order,
      reward_points: checkpoint.reward_points,
      is_active: checkpoint.is_active,
      question_data: checkpoint.question_data || "",
      qrcode_data: checkpoint.qrcode_data || ""
    })
  }

  const resetForm = () => {
    setEditingCheckpoint(null)
    setFormData({
      mission_id: "",
      name: "",
      description: "",
      checkpoint_type: "NFC",
      lat: "",
      lng: "",
      order: 0,
      reward_points: 10,
      is_active: true,
      question_data: "",
      qrcode_data: ""
    })
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{editingCheckpoint ? "編輯檢查點" : "新增檢查點"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>所屬任務</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.mission_id}
                  onChange={(e) => setFormData({ ...formData, mission_id: e.target.value })}
                  required
                >
                  <option value="">選擇任務</option>
                  {missions.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      {mission.name} (Event: {mission.event_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>檢查點名稱</Label>
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
                  value={formData.checkpoint_type}
                  onChange={(e) => setFormData({ ...formData, checkpoint_type: e.target.value })}
                >
                  <option value="NFC">NFC</option>
                  <option value="QRCODE">QR Code</option>
                  <option value="QUESTION">問答</option>
                  <option value="DISCOUNT">優惠券</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>獎勵積分</Label>
                <Input
                  type="number"
                  value={formData.reward_points}
                  onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) })}
                />
              </div>
               <div className="space-y-2">
                <Label>緯度 (Latitude)</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="25.0330"
                />
              </div>
              <div className="space-y-2">
                <Label>經度 (Longitude)</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="121.5654"
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
                  id="checkpoint_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="checkpoint_active">啟用</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            {formData.checkpoint_type === "QUESTION" && (
              <div>
                <Label>問題資料 (JSON)</Label>
                <Textarea
                  value={formData.question_data}
                  onChange={(e) => setFormData({ ...formData, question_data: e.target.value })}
                  placeholder='{"question": "問題", "answer": "答案"}'
                  rows={2}
                />
              </div>
            )}
            {formData.checkpoint_type === "QRCODE" && (
              <div>
                <Label>QR Code 資料</Label>
                <Input
                  value={formData.qrcode_data}
                  onChange={(e) => setFormData({ ...formData, qrcode_data: e.target.value })}
                  placeholder="QR Code 內容或識別碼"
                />
              </div>
            )}
            {formData.checkpoint_type === "DISCOUNT" && (
              <div>
                <Label>優惠券連結</Label>
                <Input
                  value={formData.qrcode_data}
                  onChange={(e) => setFormData({ ...formData, qrcode_data: e.target.value })}
                  placeholder="https://example.com/coupon"
                  type="url"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">
                {editingCheckpoint ? "更新" : "創建"}
              </Button>
              {editingCheckpoint && (
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
          <CardTitle>檢查點列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>載入中...</p>
          ) : (
            <div className="space-y-2">
              {checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{checkpoint.name}</h3>
                    <p className="text-sm text-muted-foreground">{checkpoint.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Mission: {checkpoint.mission_id} | Type: {checkpoint.checkpoint_type} | 
                      Points: {checkpoint.reward_points} | Order: {checkpoint.order}
                      {checkpoint.is_active ? " | 啟用" : " | 停用"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(checkpoint)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(checkpoint.id)}
                      className="cursor-pointer"
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
