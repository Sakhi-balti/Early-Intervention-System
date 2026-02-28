import { useState, useEffect } from "react";
import {
  getMyAlerts,
  markAlertRead,
  getHighRisk,
  addIntervention,
} from "../api/otherAPIs";
import Sidebar from "../components/common/Sidebar";
import RiskBadge from "../components/common/RiskBadge";

export function CounselorDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("counseling");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyAlerts()
      .then((res) => setAlerts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await markAlertRead(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleIntervention = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await addIntervention({
        student: selected.student,
        action_type: action,
        notes,
      });
      await markAlertRead(selected.id);
      setAlerts((prev) => prev.filter((a) => a.id !== selected.id));
      setSelected(null);
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              color: "#e2e8f0",
              fontSize: "24px",
              fontWeight: "800",
              margin: 0,
            }}>
            🔔 Alerts & Cases
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>
            {alerts.length} unread alert{alerts.length !== 1 ? "s" : ""}{" "}
            requiring your attention
          </p>
        </div>

        {loading && <div style={{ color: "#64748b" }}>Loading alerts...</div>}

        {!loading && alerts.length === 0 && (
          <div
            style={{
              background: "#131929",
              border: "1px solid #1e2d45",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}>
            ✅ No pending alerts. All students are being monitored.
          </div>
        )}

        <div style={{ display: "grid", gap: "12px" }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                background: "#131929",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "12px",
                padding: "20px",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                <div>
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}>
                    🚨 {alert.alert_type?.replace("_", " ")}
                  </div>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                      marginBottom: "6px",
                    }}>
                    {alert.message}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "11px" }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setSelected(alert)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: "rgba(16,185,129,0.1)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.3)",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}>
                    + Intervene
                  </button>
                  <button
                    onClick={() => handleRead(alert.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: "rgba(100,116,139,0.1)",
                      color: "#64748b",
                      border: "1px solid #1e2d45",
                      fontSize: "12px",
                    }}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intervention modal */}
        {selected && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}>
            <div
              style={{
                background: "#131929",
                border: "1px solid #1e2d45",
                borderRadius: "16px",
                padding: "32px",
                width: "100%",
                maxWidth: "420px",
              }}>
              <h3 style={{ color: "#e2e8f0", margin: "0 0 20px" }}>
                📋 Assign Intervention
              </h3>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "6px",
                  }}>
                  Action Type
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #1e2d45",
                    color: "#e2e8f0",
                    fontSize: "13px",
                    outline: "none",
                  }}>
                  <option value="counseling">Counseling Session</option>
                  <option value="parent_meet">Parent Meeting</option>
                  <option value="academic_help">Academic Support</option>
                  <option value="behavior">Behavior Guidance</option>
                </select>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "6px",
                  }}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this intervention..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    border: "1px solid #1e2d45",
                    color: "#e2e8f0",
                    fontSize: "13px",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleIntervention}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}>
                  {saving ? "Saving..." : "✓ Save Intervention"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "#1e2d45",
                    color: "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
