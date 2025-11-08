from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    max_participants = Column(Integer, nullable=True)

    # Constraints
    __table_args__ = (
        CheckConstraint("end_time > start_time", name="check_end_after_start"),
    )

    # Relationships
    admin = relationship("User", back_populates="events_created")
    missions = relationship("Mission", back_populates="event", cascade="all, delete-orphan", order_by="Mission.order")
    attendances = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
    user_badges = relationship("UserBadge", back_populates="event")

