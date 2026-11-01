from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    attendance = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    previous_marks = Column(Float, nullable=False)
    assignment_score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship(
        "PredictionHistory",
        back_populates="student"
    )


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    predicted_marks = Column(Float, nullable=False)
    performance_category = Column(String(50))
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship(
        "Student",
        back_populates="predictions"
    )