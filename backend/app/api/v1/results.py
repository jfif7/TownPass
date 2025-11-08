from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.attendance import Attendance
from app.models.nfc_tag import NFCTag
from app.crud import event as crud_event, badge as crud_badge
from app.schemas.results import EventResultsResponse

router = APIRouter()


def get_event_status(event) -> str:
    """取得活動狀態"""
    from datetime import datetime
    now = datetime.utcnow()
    if event.start_time > now:
        return "upcoming"
    elif event.end_time < now:
        return "completed"
    else:
        return "ongoing"


@router.get("/events/{event_id}/my-results", response_model=EventResultsResponse)
async def get_event_results(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取得活動成果"""
    # 取得活動
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活動不存在"
        )
    
    # 取得所有 missions
    missions = db.query(Mission).filter(Mission.event_id == event_id).order_by(Mission.order).all()
    total_missions = len(missions)
    
    # 取得使用者完成的 missions
    completed_nfc_tag_ids = db.query(Attendance.nfc_tag_id).join(
        NFCTag, NFCTag.id == Attendance.nfc_tag_id
    ).join(
        Mission, Mission.id == NFCTag.mission_id
    ).filter(
        Attendance.user_id == current_user.id,
        Mission.event_id == event_id
    ).distinct().all()
    
    completed_ids = {row[0] for row in completed_nfc_tag_ids}
    my_missions_hit = len(completed_ids)
    
    # 計算完成百分比
    completion_percentage = (my_missions_hit / total_missions * 100) if total_missions > 0 else 0
    
    # 計算總點數
    total_points = db.query(func.sum(Attendance.reward_points_earned)).filter(
        Attendance.user_id == current_user.id,
        Attendance.event_id == event_id
    ).scalar() or 0
    
    # 計算排名（簡化版）
    # 取得所有參與者的完成數
    participant_scores = db.query(
        Attendance.user_id,
        func.count(func.distinct(Attendance.nfc_tag_id)).label('completed')
    ).join(
        NFCTag, NFCTag.id == Attendance.nfc_tag_id
    ).join(
        Mission, Mission.id == NFCTag.mission_id
    ).filter(
        Mission.event_id == event_id
    ).group_by(Attendance.user_id).all()
    
    total_participants = len(participant_scores)
    my_rank = None
    my_rank_percentile = None
    
    if total_participants > 0:
        # 排序並找到排名
        sorted_scores = sorted(participant_scores, key=lambda x: x[1], reverse=True)
        for idx, (uid, score) in enumerate(sorted_scores, 1):
            if uid == current_user.id:
                my_rank = idx
                my_rank_percentile = ((total_participants - idx) / total_participants * 100) if total_participants > 0 else 0
                break
    
    # 取得在此活動獲得的徽章
    user_badges = crud_badge.get_user_badges(db, current_user.id, event_id=event_id)
    badges_earned = [
        {
            "id": ub.badge.id,
            "name": ub.badge.name,
            "description": ub.badge.description,
            "image_url": ub.badge.image_url,
            "timestamp_earned": ub.timestamp_earned.isoformat()
        }
        for ub in user_badges
    ]
    
    # 取得 missions 詳細資訊
    missions_details = []
    for mission in missions:
        nfc_tag = db.query(NFCTag).filter(NFCTag.mission_id == mission.id).first()
        is_completed = nfc_tag and nfc_tag.id in completed_ids if nfc_tag else False
        
        completed_at = None
        points_earned = 0
        if is_completed and nfc_tag:
            attendance = db.query(Attendance).filter(
                Attendance.user_id == current_user.id,
                Attendance.nfc_tag_id == nfc_tag.id
            ).first()
            if attendance:
                completed_at = attendance.timestamp.isoformat()
                points_earned = attendance.reward_points_earned
        
        missions_details.append({
            "mission_name": mission.name,
            "is_completed": is_completed,
            "completed_at": completed_at,
            "points_earned": points_earned
        })
    
    return EventResultsResponse(
        event_id=event.id,
        event_title=event.title,
        event_status=get_event_status(event),
        total_missions=total_missions,
        my_missions_hit=my_missions_hit,
        completion_percentage=completion_percentage,
        my_rank=my_rank,
        total_participants=total_participants,
        my_rank_percentile=my_rank_percentile,
        total_points_earned=total_points,
        badges_earned_in_this_event=badges_earned,
        missions_details=missions_details,
        leaderboard_position={
            "rank": my_rank,
            "users_above": my_rank - 1 if my_rank else 0,
            "users_below": total_participants - my_rank if my_rank else total_participants
        } if my_rank else None
    )

