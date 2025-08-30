import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("http://prog2025.goldyol.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const unread = data.data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // تحديث كل دقيقة
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("notifications-updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">{isOpen ? "لوحة التحكم" : ""}</h2>
        <button className="sidebar-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "❮" : "❯"}
        </button>
      </div>

      <nav>
        <ul>
          <li>
            <NavLink to="/auth" className={({ isActive }) => isActive ? "active-link" : ""}>
              تسجيل الدخول
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
              الموردين
            </NavLink>
          </li>
          <li>
            <NavLink to="/items" className={({ isActive }) => isActive ? "active-link" : ""}>
              الأدوية
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase-invoices" className={({ isActive }) => isActive ? "active-link" : ""}>
              فواتير الشراء
            </NavLink>
          </li>
          <li>
            <NavLink to="/sale-invoices" className={({ isActive }) => isActive ? "active-link" : ""}>
              فواتير البيع
            </NavLink>
          </li>
          <li>
            <NavLink to="/statistics" className={({ isActive }) => isActive ? "active-link" : ""}>
              الإحصائيات
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales-report" className={({ isActive }) => isActive ? "active-link" : ""}>
              تقرير المبيعات
            </NavLink>
          </li>
          <li>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "active-link" : ""}>
              الإشعارات
              {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
