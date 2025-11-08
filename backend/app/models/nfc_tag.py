from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class NFCTag(Base):
    __tablename__ = "nfc_tags"

    id = Column(Integer, primary_key=True, index=True)
    tag_uid = Column(String(255), unique=True, nullable=False, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    reward_points = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    mission = relationship("Mission", back_populates="nfc_tag")
    attendances = relationship("Attendance", back_populates="nfc_tag", cascade="all, delete-orphan")

