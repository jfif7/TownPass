假資料

event：可以生五個左右，三種 status:
- upcoming: 生 3 個
- ongoing: 生 4 個
- completed: 生 2 個

```
{
  "events": [
    {
      "id": 0,
      "title": "string",
      "description": "string",
      "start_time": "2025-11-08T12:55:53.407Z",
      "end_time": "2025-11-08T12:55:53.407Z",
      "location": "string",
      "cover_image_url": "string",
      "status": "string",
      "total_missions": 0,
      "my_missions_completed": 0,
      "is_registered": true
    }
  ],
  "pagination": {
    "additionalProp1": {}
  }
}
```

mission: 可以一個 event 生 3 個
- 至少一個 mission 有三種 checkpoint

```
{
  "event_id": 0,
  "name": "string",
  "description": "string",
  "order": 0,
  "is_active": true
}

```

checkpoint: 可以一個 mission 生 3 個
- checkpoint_type: nfc, question, qrcode 各一個
- is_active 都先設為 true
- checkpoint_type 為 question 的要有 question_data
- 

```
[
    {
        "name": "NFC",
        "description": "掃描 NFC",
        "checkpoint_type": "nfc",
        "lat": 25.033,
        "lng": 121.5654,
        "order": 1,
        "reward_points": 10,
        "is_active": true,
        "id": 1,
        "mission_id": 1,
        "nfc_tag_id": 1,
        "question_data": null,
        "qrcode_data": null,
        "created_at": "2025-11-08T12:47:34.662117Z",
        "updated_at": "2025-11-08T12:47:34.662117Z",
        "completed": false
    },
    {
        "name": "QA!",
        "description": "回答問題",
        "checkpoint_type": "question",
        "lat": 25.033,
        "lng": 121.5654,
        "order": 2,
        "reward_points": 10,
        "is_active": true,
        "id": 2,
        "mission_id": 1,
        "nfc_tag_id": null,
        "question_data": "今天星期幾",
        "qrcode_data": null,
        "created_at": "2025-11-08T12:49:11.052810Z",
        "updated_at": "2025-11-08T12:49:11.052810Z",
        "completed": false
    },
    {
        "name": "QRCODE!",
        "description": "掃描QRCODE",
        "checkpoint_type": "qrcode",
        "lat": 25.033,
        "lng": 121.5654,
        "order": 3,
        "reward_points": 10,
        "is_active": true,
        "id": 3,
        "mission_id": 1,
        "nfc_tag_id": null,
        "question_data": null,
        "qrcode_data": "QQ",
        "created_at": "2025-11-08T12:50:01.490350Z",
        "updated_at": "2025-11-08T12:50:01.490350Z",
        "completed": false
    }
]

```

badge: 
- 每完成一個 mission 就有一個 badge


```
{
    "id": 0,
    "name": "string",
    "description": "string",
    "image_url": "string",
    "badge_type": "string",
    "timestamp_earned": "2025-11-08T12:59:31.123Z",
    "event_id": 0,
    "event_title": "string"
  }

```

nfc_tag
- 每個 checkpoint 一個 tag

```
{
  "tag_uid": "string",
  "checkpoint_id": 0,
  "reward_points": 0,
  "is_active": true
}

```