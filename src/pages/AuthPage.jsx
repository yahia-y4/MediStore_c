import React, { useState } from "react";
import "./AuthPage.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login أو register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (mode === "register" && password !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    const apiUrl =
      mode === "login"
        ? "http://prog2025.goldyol.com/api/login"
        : "http://prog2025.goldyol.com/api/register";

    const payload =
      mode === "login"
        ? { email, password }
        : { name, email, password, password_confirmation: confirmPassword };

    try {
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
        setMessage(msg);
        setLoading(false);
        return;
      }

      if (data.bearer_token) localStorage.setItem("auth_token", data.bearer_token);

      setLoading(false);
      window.location.href = "/"; // تحويل للصفحة الرئيسية بعد النجاح
    } catch (err) {
      console.error(err);
      setMessage("خطأ في الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h2>

        {message && <p className="message">{message}</p>}

        {mode === "register" && (
          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل الاسم"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            required
          />
        </div>

        <div className="form-group">
          <label>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            required
          />
        </div>

        {mode === "register" && (
          <div className="form-group">
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد كتابة كلمة المرور"
              required
            />
          </div>
        )}

        <div className="auth-buttons">
          <button type="submit" disabled={loading}>
            {loading
              ? "جارٍ الإرسال..."
              : mode === "login"
              ? "تسجيل الدخول"
              : "إنشاء الحساب"}
          </button>
          <button type="button" className="toggle-btn" onClick={toggleMode}>
            {mode === "login"
              ? "ليس لديك حساب؟ أنشئ حساب الآن"
              : "لديك حساب؟ تسجيل الدخول"}
          </button>
        </div>
      </form>
    </div>
  );
}
