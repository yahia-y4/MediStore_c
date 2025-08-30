import React, { useState } from "react";

export default function AuthForm({ mode = "login", onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl =
    mode === "login"
      ? "http://prog2025.goldyol.com/api/login"
      : "http://prog2025.goldyol.com/api/register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, password_confirmation: confirmPassword };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.errors || data.message === "Invalid credentials") {
        const msg = data.errors
          ? Object.values(data.errors).flat().join(" | ")
          : data.message || "حدث خطأ ما";
        setError(msg);
        setLoading(false);
        return;
      }

      if (data.bearer_token) {
        localStorage.setItem("auth_token", data.bearer_token);
      }

      setLoading(false);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error(err);
      setError("خطأ في الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h1>{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>

        {error && <div className="error">{error}</div>}

        {mode === "register" && (
          <div className="input-group">
            <label>الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {mode === "register" && (
          <div className="input-group">
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "جارٍ الإرسال..."
            : mode === "login"
            ? "تسجيل الدخول"
            : "إنشاء الحساب"}
        </button>
      </form>
    </div>
  );
}
