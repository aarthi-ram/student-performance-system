
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    name: "",
    attendance: 85,
    studyHours: 3,
    previousMarks: 75,
    assignments: 80,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const fetchHistory = async () => {
  setHistoryLoading(true);
  setHistoryError("");

  try {
    const response = await fetch("http://127.0.0.1:8000/history");

    if (!response.ok) {
      throw new Error("Failed to fetch history");
    }

    const data = await response.json();
    setHistory(data);
  } catch (err) {
    setHistoryError("Unable to load prediction history.");
  } finally {
    setHistoryLoading(false);
  }
};

useEffect(() => {
  fetchHistory();
}, []);

  const handlePredict = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  name: form.name,
  attendance: Number(form.attendance),
  study_hours: Number(form.studyHours),
  previous_marks: Number(form.previousMarks),
  assignment_score: Number(form.assignments),
}),
      });

      if (!response.ok) {
        throw new Error("Prediction failed. Please try again.");
      }

      const data = await response.json();

      const predictedMarks = data.predicted_final_marks;

      setResult({
        marks: predictedMarks,
        category:
          predictedMarks >= 80
            ? "Excellent"
            : predictedMarks >= 60
            ? "Good"
            : predictedMarks >= 40
            ? "Average"
            : "Needs Improvement",
      });
    } catch (err) {
      setError(
        "Backend connection failed. Make sure the Python API server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🎓 EduPredict</h2>
        <p className="brand-subtitle">Student Analytics</p>

        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#prediction">Performance Prediction</a>
          <a href="#analytics">Analytics</a>
          <a href="#history">Prediction History</a>
        </nav>

        <div className="sidebar-bottom">
          <p>AI Student Performance</p>
          <small>Prediction System</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome! Analyze and predict student performance.</p>
          </div>
          <div className="admin-profile">
            <span>👤</span>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        <section className="stats-grid" id="dashboard">
          <div className="stat-card">
            <span>Total Students</span>
            <h2>250</h2>
            <p>Registered students</p>
          </div>

          <div className="stat-card">
            <span>Average Attendance</span>
            <h2>85%</h2>
            <p>Across all students</p>
          </div>

          <div className="stat-card">
            <span>Average Performance</span>
            <h2>78%</h2>
            <p>Overall academic score</p>
          </div>

          <div className="stat-card">
            <span>At-Risk Students</span>
            <h2>18</h2>
            <p>Need additional support</p>
          </div>
        </section>

        <section className="prediction-section" id="prediction">
          <div className="section-heading">
            <h2>Student Performance Prediction</h2>
            <p>Enter student details to estimate academic performance.</p>
          </div>

          <form className="prediction-form" onSubmit={handlePredict}>
            <div className="form-grid">
              <label>
                Student Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                />
              </label>

              <label>
                Attendance (%)
                <input
                  name="attendance"
                  type="number"
                  min="0"
                  max="100"
                  value={form.attendance}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Study Hours / Day
                <input
                  name="studyHours"
                  type="number"
                  min="0"
                  max="24"
                  value={form.studyHours}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Previous Marks (%)
                <input
                  name="previousMarks"
                  type="number"
                  min="0"
                  max="100"
                  value={form.previousMarks}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Assignment Score (%)
                <input
                  name="assignments"
                  type="number"
                  min="0"
                  max="100"
                  value={form.assignments}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Predict Performance →"}
            </button>
          </form>

          {error && (
            <div className="result-card">
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="result-card">
              <h3>Prediction Result</h3>
              <p>Student: {form.name}</p>
              <h2>{result.marks}%</h2>
              <strong>{result.category}</strong>
              <p>Prediction generated by the trained Machine Learning model.</p>
            </div>
          )}
        </section>
        <section className="history-section" id="history">
  <div className="section-heading">
    <div>
      <h2>Prediction History</h2>
      <p>Previously generated student predictions.</p>
    </div>

    <button onClick={fetchHistory} disabled={historyLoading}>
      {historyLoading ? "Loading..." : "Refresh"}
    </button>
  </div>

  {historyError && <p>{historyError}</p>}

  {historyLoading ? (
    <p>Loading history...</p>
  ) : history.length === 0 ? (
    <p>No prediction history found.</p>
  ) : (
    <div className="history-table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Predicted Marks</th>
            <th>Category</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.student_name}</td>
              <td>{Number(item.predicted_marks).toFixed(2)}%</td>
              <td>{item.performance_category}</td>
              <td>
                {new Date(item.predicted_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>


        <section className="analytics-section" id="analytics">
          <h2>Performance Overview</h2>
          <div className="analytics-card">
            <div>
              <span>Excellent</span>
              <div className="progress">
                <div style={{ width: "30%" }} />
              </div>
            </div>
            <strong>30%</strong>
          </div>

          <div className="analytics-card">
            <div>
              <span>Good</span>
              <div className="progress">
                <div style={{ width: "45%" }} />
              </div>
            </div>
            <strong>45%</strong>
          </div>

          <div className="analytics-card">
            <div>
              <span>Needs Improvement</span>
              <div className="progress">
                <div style={{ width: "25%" }} />
              </div>
            </div>
            <strong>25%</strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
