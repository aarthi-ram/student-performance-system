
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import pickle
import numpy as np
from pathlib import Path

from database import engine, get_db, Base
from models import Student, PredictionHistory

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Student Performance Prediction API",
    description="AI-powered student performance prediction backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load trained ML model
MODEL_PATH = Path(__file__).parent / "data" / "student_model.pkl"

with open(MODEL_PATH, "rb") as file:
    model = pickle.load(file)


class StudentData(BaseModel):
    name: str
    attendance: float
    study_hours: float
    previous_marks: float
    assignment_score: float


@app.get("/")
def home():
    return {"message": "Student Performance Prediction API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Predict and save student data + prediction
@app.post("/predict")
def predict_performance(
    student: StudentData,
    db: Session = Depends(get_db)
):
    input_data = np.array([[
        student.attendance,
        student.study_hours,
        student.previous_marks,
        student.assignment_score
    ]])

    prediction = model.predict(input_data)
    predicted_marks = round(float(prediction[0]), 2)

    if predicted_marks >= 80:
        category = "Excellent"
    elif predicted_marks >= 60:
        category = "Good"
    elif predicted_marks >= 40:
        category = "Average"
    else:
        category = "Needs Improvement"

    # Save student information
    db_student = Student(
        name=student.name,
        attendance=student.attendance,
        study_hours=student.study_hours,
        previous_marks=student.previous_marks,
        assignment_score=student.assignment_score
    )

    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    # Save prediction history
    history = PredictionHistory(
        student_id=db_student.id,
        predicted_marks=predicted_marks,
        performance_category=category
    )

    db.add(history)
    db.commit()

    return {
        "student_id": db_student.id,
        "student_name": db_student.name,
        "predicted_final_marks": predicted_marks,
        "performance_category": category,
        "status": "Success"
    }


# Get all prediction history
@app.get("/history")
def get_prediction_history(db: Session = Depends(get_db)):
    records = (
        db.query(PredictionHistory, Student)
        .join(Student, PredictionHistory.student_id == Student.id)
        .order_by(PredictionHistory.predicted_at.desc())
        .all()
    )

    return [
        {
            "id": history.id,
            "student_id": student.id,
            "student_name": student.name,
            "predicted_marks": history.predicted_marks,
            "performance_category": history.performance_category,
            "predicted_at": history.predicted_at
        }
        for history, student in records
    ]
