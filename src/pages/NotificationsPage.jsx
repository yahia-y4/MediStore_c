// NotificationsPage.jsx
import React, { useEffect, useState } from "react";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("لم يتم العثور على توكن.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://prog2025.goldyol.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.redirected) {
        setError("تحتاج لتسجيل الدخول مرة أخرى.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || "حدث خطأ أثناء جلب الإشعارات.");
      }
    } catch (err) {
      console.error(err);
      setError("خطأ في الاتصال بالسيرفر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `http://prog2025.goldyol.com/api/notifications/${id}/mark-as-read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      } else {
        alert(data.message || "حدث خطأ أثناء تعليم الإشعار كمقروء.");
      }
    } catch (err) {
      console.error(err);
      alert("خطأ في الاتصال بالسيرفر.");
    }
  };

  // 🔹 دالة تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <p>جارٍ تحميل الإشعارات...</p>;
  if (error) return <p className="error">{error}</p>;
  if (notifications.length === 0) return <p>لا توجد إشعارات جديدة حتى الآن.</p>;

  return (
    <div className="notifications-page">
      <h2>الإشعارات</h2>
      <div className="notifications-container">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${n.read_at ? "read" : "unread"}`}
          >
            <div className="notification-message">
              {!n.read_at && <span className="red-dot"></span>}
              <p>{n.message}</p>
              {/* 🔹 عرض تاريخ الإشعار */}
              <small className="notification-date">
                {formatDate(n.created_at)}
              </small>
            </div>
            {!n.read_at && (
              <button
                className="mark-read-btn"
                onClick={() => markAsRead(n.id)}
              >
                تمييز كمقروء
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
