import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const emailToIdMap = {
  "priya.patel@securecyber.org": "242f9dce-64d4-47cb-947b-1b6f128a3c6e",
  "maria.rodriguez@futuretech.edu": "462bddec-e645-4b99-9e13-5b8e5a4eb5ad",
  // Add more emails as needed
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