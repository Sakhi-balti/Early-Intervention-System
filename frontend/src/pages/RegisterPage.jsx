import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authAPI";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(JSON.stringify(err.response?.data || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#0f172a",
    border: "1px solid #1e2d45",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <div
        style={{
          background: "#131929",
          border: "1px solid #1e2d45",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
        }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>📝</div>
          <h1
            style={{
              color: "#e2e8f0",
              fontSize: "20px",
              fontWeight: "800",
              margin: 0,
            }}>
            Create Account
          </h1>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#f87171",
              fontSize: "13px",
              marginBottom: "16px",
            }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            ["Username", "username", "text", true],
            ["Email", "email", "email", false],
            ["Password", "password", "password", true],
          ].map(([label, field, type, isRequired]) => (
            <div key={field} style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type}
                required={isRequired}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="counselor">Counselor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              style={inputStyle}
              placeholder="e.g. Information Technology"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: loading ? "#1e2d45" : "#10b981",
              color: "white",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}>
            {loading ? "Creating..." : "Create Account →"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "13px",
            marginTop: "20px",
          }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#38bdf8", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
