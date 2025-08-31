// pages/StatisticsPage.jsx
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import "./StatisticsPage.css";

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const fetchStats = async () => {
    try {
      const res = await fetch("https://prog2025.goldyol.com/api/statistics", {
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setStats(data.data);
      } else {
        setModalType("error");
        setModalMessage(data.message || "فشل في جلب الإحصائيات");
      }
    } catch (err) {
      setModalType("error");
      setModalMessage("حدث خطأ في الاتصال بالسيرفر");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // قيم افتراضية
  const defaultStats = {
    inventory_stats: {
      total_items_types: "لا توجد بيانات",
      total_items_quantity: "لا توجد بيانات",
      capital_value: "لا توجد بيانات",
      total_selling_value: "لا توجد بيانات",
      total_potential_profit: "لا توجد بيانات",
    },
    profit_and_debt_stats: {
      realized_profit: "لا توجد بيانات",
      supplier_debts: "لا توجد بيانات",
      realized_profit_after_debts: "لا توجد بيانات",
      total_sales_invoices: "لا توجد بيانات",
      average_profit_per_invoice: "لا توجد بيانات",
    },
    supplier_balance_stats: {
      total_suppliers_count: "لا توجد بيانات",
      total_suppliers_balance: "لا توجد بيانات",
      suppliers_with_credit: "لا توجد بيانات",
      suppliers_with_debt: "لا توجد بيانات",
      total_net_balance: "لا توجد بيانات",
    },
    top_performing_items: {},
    low_performing_items: {},
    stock_alerts: {
      out_of_stock_items: [],
      low_stock_items: [],
      expiring_soon_items: [],
    },
  };

  const s = stats || defaultStats;

  return (
    <div className="statistics-page">
      <h1>الإحصائيات الشاملة</h1>

      <div className="cards-container">
        {/* مخزون */}
        <div className="stat-card">
          <h2>المخزون</h2>
          <ul>
            <li>عدد أنواع العناصر: {s.inventory_stats.total_items_types}</li>
            <li>إجمالي كمية العناصر: {s.inventory_stats.total_items_quantity}</li>
            <li>القيمة الرأسمالية: {s.inventory_stats.capital_value}</li>
            <li>قيمة البيع الإجمالية: {s.inventory_stats.total_selling_value}</li>
            <li>الأرباح المحتملة: {s.inventory_stats.total_potential_profit}</li>
          </ul>
        </div>

        {/* الأرباح والديون */}
        <div className="stat-card">
          <h2>الأرباح والديون</h2>
          <ul>
            <li>الربح المحقق: {s.profit_and_debt_stats.realized_profit}</li>
            <li>ديون الموردين: {s.profit_and_debt_stats.supplier_debts}</li>
            <li>الربح بعد الديون: {s.profit_and_debt_stats.realized_profit_after_debts}</li>
            <li>عدد فواتير البيع: {s.profit_and_debt_stats.total_sales_invoices}</li>
            <li>متوسط الربح لكل فاتورة: {s.profit_and_debt_stats.average_profit_per_invoice}</li>
          </ul>
        </div>

        {/* أرصدة الموردين */}
        <div className="stat-card">
          <h2>أرصدة الموردين</h2>
          <ul>
            <li>عدد الموردين: {s.supplier_balance_stats.total_suppliers_count}</li>
            <li>إجمالي أرصدة الموردين: {s.supplier_balance_stats.total_suppliers_balance}</li>
            <li>الموردين ذوي رصيد إيجابي: {s.supplier_balance_stats.suppliers_with_credit}</li>
            <li>الموردين ذوي دين: {s.supplier_balance_stats.suppliers_with_debt}</li>
            <li>الرصيد الصافي: {s.supplier_balance_stats.total_net_balance}</li>
          </ul>
        </div>

        {/* أفضل العناصر */}
        <div className="stat-card">
          <h2>أفضل العناصر</h2>
          <ul>
            <li>الأكثر مبيعاً: {s.top_performing_items.most_sold_by_quantity?.name || "لا توجد بيانات"}</li>
            <li>الأكثر ربحاً: {s.top_performing_items.most_profitable?.name || "لا توجد بيانات"}</li>
          </ul>
        </div>

        {/* أسوأ العناصر */}
        <div className="stat-card">
          <h2>أسوأ العناصر</h2>
          <ul>
            <li>الأقل مبيعاً: {s.low_performing_items.least_sold_by_quantity?.name || "لا توجد بيانات"}</li>
            <li>الأقل ربحاً: {s.low_performing_items.least_profitable?.name || "لا توجد بيانات"}</li>
          </ul>
        </div>

        {/* تنبيهات المخزون */}
        <div className="stat-card">
          <h2>تنبيهات المخزون</h2>
          <ul>
            <li>العناصر منتهية أو نفدت: {s.stock_alerts.out_of_stock_items.length}</li>
            <li>العناصر منخفضة المخزون: {s.stock_alerts.low_stock_items.length}</li>
            <li>العناصر على وشك الانتهاء: {s.stock_alerts.expiring_soon_items.length}</li>
          </ul>
        </div>
      </div>

      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </div>
  );
}
