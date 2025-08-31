import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

/* استيراد أيقونات Material-UI */
import PeopleIcon from '@mui/icons-material/People';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function HomePage() {
  const navigate = useNavigate();

  const shortcuts = [
    { title: "الموردين", icon: <PeopleIcon />, link: "/suppliers" },
    { title: "الأدوية", icon: <LocalPharmacyIcon />, link: "/items" },
    { title: "فواتير الشراء", icon: <ReceiptIcon />, link: "/purchase-invoices" },
    { title: "فواتير البيع", icon: <MonetizationOnIcon />, link: "/sale-invoices" },
    { title: "الإحصائيات", icon: <BarChartIcon />, link: "/statistics" },
    { title: "تقرير المبيعات", icon: <DescriptionIcon />, link: "/sales-report" },
    { title: "الإشعارات", icon: <NotificationsIcon />, link: "/notifications" },
  ];

  return (
    <div className="home-page">
      <h1 className="app-name">MediStore</h1>
      <div className="shortcuts-container">
        {shortcuts.map((item, index) => (
          <div
            key={index}
            className="shortcut-card"
            onClick={() => navigate(item.link)}
          >
            <div className="shortcut-icon">{item.icon}</div>
            <p className="shortcut-title">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
