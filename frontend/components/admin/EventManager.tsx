"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Event = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  cover_image_url: string;
  status: string;
};

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    cover_image_url: "",
    status: "upcoming",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}admin/events?skip=0&limit=100`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      });
      const data = await res.json();
      // 處理 API 可能回傳陣列或物件的情況
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (e) {
      console.error("Failed to fetch events:", e);
      setEvents([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent
        ? `${API_URL}admin/events/${editingEvent.id}`
        : `${API_URL}admin/events`;

      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchEvents();
        resetForm();
        alert(editingEvent ? "活動已更新" : "活動已創建");
      }
    } catch (e) {
      console.error("Failed to save event:", e);
      alert("操作失敗");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除此活動嗎?")) return;

    try {
      const res = await fetch(`${API_URL}admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      });

      if (res.ok) {
        fetchEvents();
        alert("活動已刪除");
      }
    } catch (e) {
      console.error("Failed to delete event:", e);
      alert("刪除失敗");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      start_time: event.start_time.split(".")[0],
      end_time: event.end_time.split(".")[0],
      location: event.location,
      cover_image_url: event.cover_image_url,
      status: event.status,
    });
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      cover_image_url: "",
      status: "upcoming",
    });
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            {editingEvent ? "編輯活動" : "新增活動"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>活動標題</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>地點</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>開始時間</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>結束時間</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>封面圖片 URL</Label>
                <Input
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cover_image_url: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>狀態</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="upcoming">即將開始</option>
                  <option value="ongoing">進行中</option>
                  <option value="past">已結束</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>活動描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingEvent ? "更新" : "創建"}</Button>
              {editingEvent && (
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
          <CardTitle className="text-xl">活動列表</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">載入中...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">尚無活動</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-5 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_time).toLocaleString()} -{" "}
                      {new Date(event.end_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="cursor-pointer"
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className="cursor-pointer"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(event.id)}
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
  );
}
