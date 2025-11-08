from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    nfc_tag_id = Column(Integer, ForeignKey("nfc_tags.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    reward_points_earned = Column(Integer, default=0, nullable=False)

    # Constraints - 防止重複掃描
    __table_args__ = (
        UniqueConstraint("user_id", "nfc_tag_id", name="uq_user_nfc_tag"),
    )

    # Relationships
    user = relationship("User", back_populates="attendances")
    event = relationship("Event", back_populates="attendances")
    nfc_tag = relationship("NFCTag", back_populates="attendances")

