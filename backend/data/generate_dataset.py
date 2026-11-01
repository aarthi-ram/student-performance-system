import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

# Generate 1000 student records
num_students = 1000

attendance = np.random.randint(40, 101, num_students)
study_hours = np.random.randint(0, 9, num_students)
previous_marks = np.random.randint(20, 101, num_students)
assignment_score = np.random.randint(0, 101, num_students)

# Generate final marks for ML training
final_marks = (
    0.25 * attendance
    + 3.0 * study_hours
    + 0.35 * previous_marks
    + 0.20 * assignment_score
    + np.random.normal(0, 5, num_students)
)

final_marks = np.clip(final_marks, 0, 100).round(2)

# Create dataset
data = pd.DataFrame({
    "attendance": attendance,
    "study_hours": study_hours,
    "previous_marks": previous_marks,
    "assignment_score": assignment_score,
    "final_marks": final_marks
})

# Save CSV file
output_path = Path(__file__).parent / "student_performance.csv"
data.to_csv(output_path, index=False)

print("Dataset created successfully!")
print(data.head())
print(f"\nTotal student records: {len(data)}")
print(f"Saved to: {output_path}")