from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class EventResultsResponse(BaseModel):
    event_id: int
    event_title: str
    event_status: str
    total_missions: int
    my_missions_hit: int
    completion_percentage: float
    my_rank: Optional[int] = None
    total_participants: Optional[int] = None
    my_rank_percentile: Optional[float] = None
    total_points_earned: int
    badges_earned_in_this_event: List[dict]
    missions_details: List[dict]
    leaderboard_position: Optional[dict] = None

