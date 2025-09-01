import React, { useEffect, useState } from "react";
import "./SalesReportPage.css";

export default function SalesReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(""); // تاريخ البداية
  const [endDate, setEndDate] = useState("");     // تاريخ النهاية

  const fetchSalesReport = async () => {
    if (!startDate || !endDate) return; // لا شيء يتم بدون تحديد البداية والنهاية
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `https://prog2025.goldyol.com/api/reports/sales?period=monthly&start_date=${startDate}&end_date=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("فشل في جلب البيانات");
      const data = await res.json();
      setReport(data.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setReport(null);
      setLoading(false);
    }
  };

  // جلب البيانات عند تغيير أي من التواريخ
  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  return (
    <div className="sales-report-page">
      <h2>تقرير المبيعات</h2>

      {/* اختيار تواريخ البداية والنهاية */}
      <div className="date-selector">
        <label>تاريخ البداية: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>تاريخ النهاية: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {loading && <p className="loading">جاري التحميل...</p>}
      {error && <p className="error">حدث خطأ: {error}</p>}
      {report && (
        <>
          {/* الملخص */}
          <div className="report-summary">
            <div className="summary-box">
              <h3>إجمالي المبيعات</h3>
              <p>{report.total_sales}</p>
            </div>
            <div className="summary-box">
              <h3>إجمالي الأرباح</h3>
              <p>{report.total_profit}</p>
            </div>
          </div>

          {/* الفواتير */}
          {report.sales.map((sale) => (
            <div key={sale.id} className="sale-invoice">
              <div className="invoice-header">
                <h3>فاتورة #{sale.id}</h3>
                <p>المشتري: {sale.buyer_name}</p>
                <p>صاحب المستودع: {sale.warehouse_owner_name}</p>
                <p>تاريخ الفاتورة: {new Date(sale.invoice_date).toLocaleDateString()}</p>
                <p>السعر الإجمالي: {sale.total_price}</p>
              </div>

              {/* العناصر داخل الفاتورة */}
              <div className="table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>اسم العنصر</th>
                      <th>الشركة</th>
                      <th>الكمية</th>
                      <th>سعر البيع</th>
                      <th>الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.company}</td>
                        <td>{item.pivot.quantity}</td>
                        <td>{item.pivot.selling_price}</td>
                        <td>{item.profit_margin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
