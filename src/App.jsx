import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import SuppliersPage from "./pages/SuppliersPage";
import ItemsPage from "./pages/ItemsPage";
import PurchaseInvoicesPage from "./pages/PurchaseInvoicesPage";
import SaleInvoicesPage from "./pages/SaleInvoicesPage";
import StatisticsPage from "./pages/StatisticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SalesReportPage from "./pages/SalesReportPage";
import HomePage from "./pages/HomePage"; // ✅ أضفنا الصفحة الرئيسية
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} /> {/* ✅ الصفحة الرئيسية */}
            <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
            <Route path="/purchase-invoices" element={<ProtectedRoute><PurchaseInvoicesPage /></ProtectedRoute>} />
            <Route path="/sale-invoices" element={<ProtectedRoute><SaleInvoicesPage /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
            <Route path="/sales-report" element={<ProtectedRoute><SalesReportPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
