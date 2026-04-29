import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Hardcoded credentials for frontend demo (hidden from UI)
  const USERS = [
    { email: "admin@pharmacy.com", password: "admin123", role: "Admin" },
    { email: "staff@pharmacy.com", password: "staff123", role: "Staff" },
  ];

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = USERS.find(
        (u) => u.email === email.trim() && u.password === password
      );
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    }, 800);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(rgba(243, 244, 246, 0.85), rgba(243, 244, 246, 0.95)), url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo / Branding */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, background: "#111827", borderRadius: 14,
            marginBottom: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="#fff" strokeWidth="1.5"/>
              <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>
            Pharmacy Manager
          </h1>
          <p style={{ fontSize: 14, color: "#4b5563", marginTop: 6, fontWeight: 500 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "0.5px solid #e5e7eb",
          padding: "2rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}>
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@pharmacy.com"
                required
                style={{
                  width: "100%", fontSize: 14, padding: "10px 12px",
                  border: "1px solid #d1d5db", borderRadius: 8,
                  outline: "none", boxSizing: "border-box",
                  background: "#fff", color: "#111827",
                  transition: "border 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#111827"}
                onBlur={e => e.target.style.borderColor = "#d1d5db"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%", fontSize: 14, padding: "10px 40px 10px 12px",
                    border: "1px solid #d1d5db", borderRadius: 8,
                    outline: "none", boxSizing: "border-box",
                    background: "#fff", color: "#111827",
                  }}
                  onFocus={e => e.target.style.borderColor = "#111827"}
                  onBlur={e => e.target.style.borderColor = "#d1d5db"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4,
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontSize: 13, color: "#dc2626", background: "#fee2e2",
                border: "1px solid #fecaca", borderRadius: 8,
                padding: "8px 12px", marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", fontSize: 14, fontWeight: 600,
                padding: "11px 0", background: loading ? "#6b7280" : "#111827",
                color: "#fff", border: "none", borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#6b7280", marginTop: 20, fontWeight: 500 }}>
          © 2026 Pharmacy Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
}