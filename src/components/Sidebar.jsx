import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

/* استيراد أيقونات MUI */
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LoginIcon from '@mui/icons-material/Login';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
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
      const unread = data.data.filter((n) => !n.read_at).length;
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

  const menuItems = [
    { title: "الرئيسية", link: "/", icon: <HomeIcon /> },
    { title: "الموردين", link: "/suppliers", icon: <PeopleIcon /> },
    { title: "الأدوية", link: "/items", icon: <LocalPharmacyIcon /> },
    { title: "فواتير الشراء", link: "/purchase-invoices", icon: <ReceiptIcon /> },
    { title: "فواتير البيع", link: "/sale-invoices", icon: <MonetizationOnIcon /> },
    { title: "الإحصائيات", link: "/statistics", icon: <BarChartIcon /> },
    { title: "تقرير المبيعات", link: "/sales-report", icon: <DescriptionIcon /> },
    { title: "الإشعارات", link: "/notifications", icon: <NotificationsIcon />, badge: unreadCount },
    { title: "تسجيل الدخول", link: "/auth", icon: <LoginIcon /> },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">{isOpen ? "لوحة التحكم" : ""}</h2>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "❮" : "❯"}
        </button>
      </div>

      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.title}
                {item.badge > 0 && (
                  <span className="unread-count">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
