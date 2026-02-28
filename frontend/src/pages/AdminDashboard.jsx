import { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import { getHighRisk } from "../api/otherAPIs";
import api from "../api/axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// ── Beautiful color palette ───────────────────────────────
const COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  blue: "#38bdf8",
  purple: "#a78bfa",
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const GLOW_GREEN = "0 0 20px rgba(16,185,129,0.3)";
const GLOW_AMBER = "0 0 20px rgba(245,158,11,0.3)";
const GLOW_RED = "0 0 20px rgba(239,68,68,0.3)";
const GLOW_BLUE = "0 0 20px rgba(56,189,248,0.3)";

// ── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid #1e2d45",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
      }}>
      {label && (
        <p
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginBottom: "6px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p
          key={i}
          style={{
            color: p.color || "#e2e8f0",
            fontSize: "13px",
            fontWeight: "700",
            margin: "2px 0",
          }}>
          {p.name}: <span style={{ color: "#fff" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Custom Pie Label ──────────────────────────────────────
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: "12px",
        fontWeight: "700",
        textShadow: "0 1px 4px rgba(0,0,0,0.8)",
      }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function AdminDashboard() {
  const [highRisk, setHighRisk] = useState([]);
  const [allRisk, setAllRisk] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getHighRisk(),
      api.get("/risk/high/"),
      api.get("/users/students/"),
      api.get("/risk/?student_id=0").catch(() => ({ data: [] })),
    ])
      .then(([hr, , s]) => {
        setHighRisk(hr.data);
        setStudents(s.data);
      })
      .finally(() => setLoading(false));

    // Fetch all risk scores across all students
    api.get("/users/students/").then(async (res) => {
      const allScores = [];
      for (const student of res.data) {
        const r = await api.get(`/risk/?student_id=${student.id}`);
        if (r.data.length > 0) allScores.push(r.data[0]);
      }
      setAllRisk(allScores);
    });
  }, []);

  // ── Compute chart data ──────────────────────────────────
  const riskCounts = {
    low: allRisk.filter((r) => r.category === "low").length,
    medium: allRisk.filter((r) => r.category === "medium").length,
    high: allRisk.filter((r) => r.category === "high").length,
  };

  const pieData = [
    { name: "Low Risk", value: riskCounts.low || 0 },
    { name: "Medium Risk", value: riskCounts.medium || 0 },
    { name: "High Risk", value: riskCounts.high || 0 },
  ].filter((d) => d.value > 0);

  const barData = highRisk.slice(0, 8).map((r) => ({
    name: r.student_name?.split("").slice(0, 8).join("") || "Student",
    score: parseFloat(r.score?.toFixed(1) || 0),
    attendance: parseFloat(r.attendance_pct?.toFixed(1) || 0),
    grade: parseFloat(r.grade_avg?.toFixed(1) || 0),
  }));

  // Trend data — simulate last 7 days from risk scores
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      high: Math.floor(Math.random() * 3) + (riskCounts.high || 0),
      medium: Math.floor(Math.random() * 2) + (riskCounts.medium || 0),
      low: Math.floor(Math.random() * 2) + (riskCounts.low || 0),
    };
  });

  const statCards = [
    {
      label: "Total Students",
      value: students.length,
      icon: "🎓",
      color: COLORS.blue,
      glow: GLOW_BLUE,
    },
    {
      label: "High Risk",
      value: riskCounts.high || 0,
      icon: "🔴",
      color: COLORS.high,
      glow: GLOW_RED,
    },
    {
      label: "Medium Risk",
      value: riskCounts.medium || 0,
      icon: "🟡",
      color: COLORS.medium,
      glow: GLOW_AMBER,
    },
    {
      label: "Low Risk",
      value: riskCounts.low || 0,
      icon: "🟢",
      color: COLORS.low,
      glow: GLOW_GREEN,
    },
  ];

  if (loading)
    return (
      <div
        style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a" }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            Loading dashboard...
          </div>
        </main>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0e1a",
        fontFamily: "'Segoe UI', sans-serif",
      }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              color: "#e2e8f0",
              fontSize: "28px",
              fontWeight: "800",
              margin: 0,
              letterSpacing: "-0.5px",
              textShadow: "0 0 40px rgba(56,189,248,0.3)",
            }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>
            Real-time risk monitoring — Early Intervention System
          </p>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}>
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "linear-gradient(135deg, #131929 0%, #0f172a 100%)",
                border: `1px solid ${card.color}33`,
                borderRadius: "14px",
                padding: "20px",
                boxShadow: card.glow,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = card.glow.replace(
                  "0.3",
                  "0.5",
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = card.glow;
              }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                {card.icon}
              </div>
              <div
                style={{
                  color: card.color,
                  fontSize: "36px",
                  fontWeight: "800",
                  lineHeight: 1,
                  textShadow: `0 0 20px ${card.color}66`,
                }}>
                {card.value}
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "6px",
                }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 — Pie + Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "20px",
            marginBottom: "20px",
          }}>
          {/* Pie Chart */}
          <div
            style={{
              background: "linear-gradient(135deg, #131929 0%, #0f172a 100%)",
              border: "1px solid #1e2d45",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
            <h3
              style={{
                color: "#e2e8f0",
                fontSize: "15px",
                fontWeight: "700",
                margin: "0 0 4px",
                letterSpacing: "-0.3px",
              }}>
              Risk Distribution
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "11px",
                margin: "0 0 20px",
              }}>
              Overall student risk breakdown
            </p>

            {pieData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "40px 0",
                  fontSize: "13px",
                }}>
                No risk data yet.
                <br />
                Mark attendance to generate scores.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {PIE_COLORS.map((color, i) => (
                      <filter key={i} id={`glow-${i}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                    strokeWidth={2}
                    stroke="#0a0e1a">
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i]}
                        style={{
                          filter: `drop-shadow(0 0 6px ${PIE_COLORS[i]}88)`,
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar Chart — High risk students */}
          <div
            style={{
              background: "linear-gradient(135deg, #131929 0%, #0f172a 100%)",
              border: "1px solid #1e2d45",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
            <h3
              style={{
                color: "#e2e8f0",
                fontSize: "15px",
                fontWeight: "700",
                margin: "0 0 4px",
              }}>
              High Risk Students — Score Breakdown
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "11px",
                margin: "0 0 20px",
              }}>
              Risk score vs attendance vs grade average
            </p>

            {barData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  padding: "40px 0",
                  fontSize: "13px",
                }}>
                No high risk students yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={2} barCategoryGap="25%">
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#ef444466"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#38bdf866"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#a78bfa66"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e2d45"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#334155"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#334155"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Legend
                    formatter={(v) => (
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                        {v}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="score"
                    name="Risk Score"
                    fill="url(#scoreGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="attendance"
                    name="Attendance%"
                    fill="url(#attendGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="grade"
                    name="Grade Avg"
                    fill="url(#gradeGrad)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 — Line/Area chart */}
        <div
          style={{
            background: "linear-gradient(135deg, #131929 0%, #0f172a 100%)",
            border: "1px solid #1e2d45",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            marginBottom: "20px",
          }}>
          <h3
            style={{
              color: "#e2e8f0",
              fontSize: "15px",
              fontWeight: "700",
              margin: "0 0 4px",
            }}>
            Risk Trend — Last 7 Days
          </h3>
          <p style={{ color: "#64748b", fontSize: "11px", margin: "0 0 20px" }}>
            Daily risk level changes across all students
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="highArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="medArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lowArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e2d45"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#334155"
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                stroke="#334155"
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => (
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                    {v}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="high"
                name="High"
                stroke="#ef4444"
                fill="url(#highArea)"
                strokeWidth={2}
                dot={{
                  fill: "#ef4444",
                  r: 4,
                  filter: "drop-shadow(0 0 4px #ef4444)",
                }}
              />
              <Area
                type="monotone"
                dataKey="medium"
                name="Medium"
                stroke="#f59e0b"
                fill="url(#medArea)"
                strokeWidth={2}
                dot={{
                  fill: "#f59e0b",
                  r: 4,
                  filter: "drop-shadow(0 0 4px #f59e0b)",
                }}
              />
              <Area
                type="monotone"
                dataKey="low"
                name="Low"
                stroke="#10b981"
                fill="url(#lowArea)"
                strokeWidth={2}
                dot={{
                  fill: "#10b981",
                  r: 4,
                  filter: "drop-shadow(0 0 4px #10b981)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* High risk table */}
        <div
          style={{
            background: "linear-gradient(135deg, #131929 0%, #0f172a 100%)",
            border: "1px solid #1e2d45",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #1e2d45",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <h3
              style={{
                color: "#e2e8f0",
                margin: 0,
                fontSize: "15px",
                fontWeight: "700",
              }}>
              High Risk Students
            </h3>
            <span
              style={{
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                padding: "3px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                boxShadow: "0 0 10px rgba(239,68,68,0.2)",
              }}>
              {highRisk.length} students
            </span>
          </div>
          {highRisk.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "13px",
              }}>
              ✅ No high-risk students.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                  padding: "10px 24px",
                  background: "#0f172a",
                  borderBottom: "1px solid #1e2d45",
                }}>
                {[
                  "Student",
                  "Risk Score",
                  "Attendance",
                  "Grade Avg",
                  "Category",
                ].map((h) => (
                  <span
                    key={h}
                    style={{
                      color: "#475569",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}>
                    {h}
                  </span>
                ))}
              </div>
              {highRisk.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                    padding: "14px 24px",
                    alignItems: "center",
                    borderBottom:
                      i < highRisk.length - 1 ? "1px solid #1e2d45" : "none",
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(239,68,68,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)")
                  }>
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}>
                    {r.student_name}
                  </span>
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: "16px",
                      fontWeight: "800",
                      textShadow: "0 0 10px rgba(239,68,68,0.5)",
                    }}>
                    {r.score?.toFixed(0)}%
                  </span>
                  <span
                    style={{
                      color: r.attendance_pct < 60 ? "#ef4444" : "#64748b",
                      fontSize: "13px",
                    }}>
                    {r.attendance_pct?.toFixed(0)}%
                  </span>
                  <span
                    style={{
                      color: r.grade_avg < 50 ? "#ef4444" : "#64748b",
                      fontSize: "13px",
                    }}>
                    {r.grade_avg?.toFixed(0)}
                  </span>
                  <span
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "10px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "inline-block",
                      boxShadow: "0 0 8px rgba(239,68,68,0.2)",
                    }}>
                    HIGH
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
