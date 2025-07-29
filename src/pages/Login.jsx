import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const emailToIdMap = {
  "priya.patel@securitylearn.dev": "68c02c7b-01b8-4693-8c9a-25077b62aa44",
  "maria.rodriguez@innovatelearn.net": "3a43c013-41ba-434a-bf58-68a1746b3d04",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const userId = emailToIdMap[email.trim().toLowerCase()];
    if (!userId) {
      setError("Email not found. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/users/gainer/${userId}/profile`
      );
      if (!res.ok) throw new Error("Failed to fetch user profile.");
      const profile = await res.json();
      localStorage.setItem("currentUser", JSON.stringify(profile));
      navigate("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 24, border: "1px solid #eee", borderRadius: 8, background: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 4, border: "1px solid #ccc" }}
          required
        />
        <button
          type="submit"
          style={{ width: "100%", padding: 10, borderRadius: 4, border: "none", background: "#1976d2", color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{ color: "#d32f2f", marginTop: 16, textAlign: "center" }}>{error}</div>}
      </form>
    </div>
  );
};

export default Login; 