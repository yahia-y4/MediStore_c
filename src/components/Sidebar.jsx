import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'; // أيقونة التحكم

export default function Sidebar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch("https://prog2025.goldyol.com/api/notifications", {
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
    const interval = setInterval(fetchUnreadCount, 60000);
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener("notifications-updated", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/auth"); // يرجع المستخدم لصفحة تسجيل الدخول
  };

  const menuItems = [
    { title: "الرئيسية", link: "/", icon: <HomeIcon /> },
    { title: "الموردين", link: "/suppliers", icon: <PeopleIcon /> },
    { title: "الأدوية", link: "/items", icon: <LocalPharmacyIcon /> },
    { title: "فواتير الشراء", link: "/purchase-invoices", icon: <ReceiptIcon /> },
    { title: "فواتير البيع", link: "/sale-invoices", icon: <MonetizationOnIcon /> },
    { title: "الإحصائيات", link: "/statistics", icon: <BarChartIcon /> },
    { title: "تقرير المبيعات", link: "/sales-report", icon: <DescriptionIcon /> },
    { title: "الإشعارات", link: "/notifications", icon: <NotificationsIcon />, badge: unreadCount },
    { title: "الحساب", link: "/auth", icon: <AccountCircleIcon /> },
  ];

  return (
    <div className="sidebar open">
      <div className="sidebar-header">
        <h2 className="sidebar-title">لوحة التحكم</h2>
        <span className="sidebar-settings">
          <SettingsIcon />
        </span>
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

          {/* زر تسجيل الخروج */}
          <li>
            <button onClick={handleLogout} className="logout-btn">
              <span className="sidebar-icon"><LogoutIcon /></span>
              تسجيل الخروج
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
