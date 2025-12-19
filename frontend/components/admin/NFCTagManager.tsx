"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type NFCTag = {
  id: number
  checkpoint_id: number
  tag_uid: string
  tag_name: string
  description: string
  is_active: boolean
}

type Checkpoint = {
  id: number
  name: string
  mission_id: number
  checkpoint_type: string
}

export default function NFCTagManager() {
  const [nfcTags, setNfcTags] = useState<NFCTag[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTag, setEditingTag] = useState<NFCTag | null>(null)
  const [formData, setFormData] = useState({
    checkpoint_id: "",
    tag_uid: "",
    tag_name: "",
    description: "",
    is_active: true
  })

  useEffect(() => {
    fetchCheckpoints()
    fetchNFCTags()
  }, [])

  const fetchCheckpoints = async () => {
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
  }

  const fetchNFCTags = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}admin/nfc-tags?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })
      const data = await res.json()
      setNfcTags(Array.isArray(data) ? data : (data.nfc_tags || []))
    } catch (e) {
      console.error("Failed to fetch NFC tags:", e)
      setNfcTags([])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTag
        ? `${API_URL}admin/nfc-tags/${editingTag.id}`
        : `${API_URL}admin/nfc-tags`
      
      const method = editingTag ? "PUT" : "POST"
      
      const payload = {
        ...formData,
        checkpoint_id: parseInt(formData.checkpoint_id)
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
        fetchNFCTags()
        resetForm()
        alert(editingTag ? "NFC 標籤已更新" : "NFC 標籤已創建")
      }
    } catch (e) {
      console.error("Failed to save NFC tag:", e)
      alert("操作失敗")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此 NFC 標籤嗎?")) return

    try {
      const res = await fetch(`${API_URL}admin/nfc-tags/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      })

      if (res.ok) {
        fetchNFCTags()
        alert("NFC 標籤已刪除")
      }
    } catch (e) {
      console.error("Failed to delete NFC tag:", e)
      alert("刪除失敗")
    }
  }

  const handleEdit = (tag: NFCTag) => {
    setEditingTag(tag)
    setFormData({
      checkpoint_id: tag.checkpoint_id.toString(),
      tag_uid: tag.tag_uid,
      tag_name: tag.tag_name,
      description: tag.description,
      is_active: tag.is_active
    })
  }

  const resetForm = () => {
    setEditingTag(null)
    setFormData({
      checkpoint_id: "",
      tag_uid: "",
      tag_name: "",
      description: "",
      is_active: true
    })
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{editingTag ? "編輯 NFC 標籤" : "新增 NFC 標籤"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>所屬檢查點</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.checkpoint_id}
                  onChange={(e) => setFormData({ ...formData, checkpoint_id: e.target.value })}
                  required
                >
                  <option value="">選擇檢查點</option>
                  {checkpoints
                    .filter((checkpoint) => checkpoint.checkpoint_type === 'NFC')
                    .map((checkpoint) => (
                      <option key={checkpoint.id} value={checkpoint.id}>
                        {checkpoint.name} (Mission: {checkpoint.mission_id})
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>標籤 UID</Label>
                <Input
                  value={formData.tag_uid}
                  onChange={(e) => setFormData({ ...formData, tag_uid: e.target.value })}
                  placeholder="例: A1B2C3D4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>標籤名稱</Label>
                <Input
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                  required
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
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingTag ? "更新" : "創建"}
              </Button>
              {editingTag && (
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
          <CardTitle className="text-xl">NFC 標籤列表</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">載入中...</p>
          ) : nfcTags.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">尚無 NFC 標籤</p>
          ) : (
            <div className="space-y-3">
              {nfcTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-5 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{tag.tag_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      UID: {tag.tag_uid} | Checkpoint ID: {tag.checkpoint_id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{tag.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${tag.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tag.is_active ? '啟用' : '停用'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => handleDelete(tag.id)}
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
