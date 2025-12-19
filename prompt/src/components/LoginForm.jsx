import React, { useState } from "react";
import { loginUser } from "./api/API";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      return setMessage("Both fields are required");
    }

    setLoading(true);

    const res = await loginUser({
      emailOrUsername: identifier,
      password: password
    });

    setLoading(false);

    if (!res.ok) {
      return setMessage(res.message || "Invalid credentials");
    }

    // Save token
    if (res.token) {
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <h3 className="header">Login</h3>

        {message && <div className="msg">{message}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="switch-btn"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
