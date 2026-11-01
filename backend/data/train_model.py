import pandas as pd
import pickle

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# Load dataset
data_path = Path(__file__).parent / "student_performance.csv"
data = pd.read_csv(data_path)

# Features and target
X = data[
    [
        "attendance",
        "study_hours",
        "previous_marks",
        "assignment_score"
    ]
]

y = data["final_marks"]

# Split data into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Create Random Forest model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Evaluate model
predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print("Model training completed!")
print(f"Mean Absolute Error: {mae:.2f}")
print(f"R2 Score: {r2:.2f}")

# Save trained model
model_path = Path(__file__).parent / "student_model.pkl"

with open(model_path, "wb") as file:
    pickle.dump(model, file)

print(f"Model saved successfully: {model_path}")