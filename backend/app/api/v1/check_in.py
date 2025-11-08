from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.crud import nfc_tag as crud_nfc_tag, attendance as crud_attendance
from app.schemas.attendance import CheckInRequest, CheckInResponse

router = APIRouter()


@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
async def check_in(
    request: CheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """NFC 報到"""
    # 1. 查詢 NFC 標籤
    result = crud_nfc_tag.get_nfc_tag_with_mission(db, tag_uid=request.nfc_tag_uid)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NFC 標籤無效或未綁定活動"
        )
    
    nfc_tag, mission, event = result
    
    # 2. 檢查活動狀態
    now = datetime.now(timezone.utc)
    if event.start_time > now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活動尚未開始"
        )
    if event.end_time < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活動已結束"
        )
    
    # 3. 檢查是否已報到
    if crud_attendance.check_attendance_exists(db, current_user.id, nfc_tag.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="你已經在這個報到點報到過了"
        )
    
    # 4. 創建報到記錄
    attendance = crud_attendance.create_attendance(
        db=db,
        user_id=current_user.id,
        event_id=event.id,
        nfc_tag_id=nfc_tag.id,
        reward_points=nfc_tag.reward_points
    )
    
    # 5. 計算使用者在此活動的進度
    from app.crud import event as crud_event
    progress = crud_event.get_user_event_progress(db, current_user.id, event.id)
    
    # 6. 計算總 missions 數
    from app.models.mission import Mission
    total_missions = db.query(Mission).filter(Mission.event_id == event.id).count()
    
    return CheckInResponse(
        status="success",
        event_id=event.id,
        event_title=event.title,
        mission_name=mission.name,
        mission_id=mission.id,
        reward_points=nfc_tag.reward_points,
        message="報到成功！",
        timestamp=attendance.timestamp,
        total_missions_in_event=total_missions,
        user_missions_completed=progress["completed_missions"]
    )

