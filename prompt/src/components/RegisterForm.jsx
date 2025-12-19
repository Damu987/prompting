import React, { useState } from "react";
import { registerUser, sendOtp } from "./api/API";
import "./RegisterForm.css";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return setMessage("Email required for OTP");
    setLoading(true);
    const res = await sendOtp(email);
    setMessage(res.message);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword)
      return setMessage("Passwords don't match");

    setLoading(true);
    const res = await registerUser({
      username,
      fullname,
      email,
      otp,
      password,
    });

    setMessage(res.message);
    setLoading(false);

    if (res.ok) {
      navigate("/login");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h3 className="header">Register</h3>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleRegister} className="register-form">

          <div className="form">
            <label>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="form">
            <label>Full Name</label>
            <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} />
          </div>

          <div className="form">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form">
            <input
              className="otp-row"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="OTP"
            />
            <button className="otp" type="button" onClick={handleSendOtp}>
              Send OTP
            </button>
          </div>

          <div className="form">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <div className="form">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="create" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <p>
            Already have an account?{" "}
            <button
              className="login"
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>

        </form>
      </div>
    </div>
  );
}
