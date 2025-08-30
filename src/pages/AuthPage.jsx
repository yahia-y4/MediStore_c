import React, { useState } from "react";
import "./AuthPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://prog2025.goldyol.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.bearer_token) {
        localStorage.setItem("auth_token", data.bearer_token);
        window.location.href = "/"; // يحوله للصفحة الرئيسية
      } else {
        setMessage(data.message || "خطأ في تسجيل الدخول");
      }
    } catch (error) {
      setMessage("حصل خطأ في الاتصال بالسيرفر");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>تسجيل الدخول</h2>

        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            placeholder="أدخل البريد الإلكتروني"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            placeholder="أدخل كلمة المرور"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {message && <p className="message">{message}</p>}

        <div className="auth-buttons">
          <button type="submit">تسجيل الدخول</button>
        </div>
      </form>
    </div>
  );
}
