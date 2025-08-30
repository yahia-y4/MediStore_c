import React, { useState, useEffect } from "react";
import AddSaleInvoice from "../components/AddSaleInvoice";
import Modal from "../components/Modal";
import "./SaleInvoicesPage.css";

export default function SaleInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [confirmDeleteInvoice, setConfirmDeleteInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("http://prog2025.goldyol.com/api/sale-invoices", {
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (Array.isArray(data.data)) setInvoices(data.data);
      else setInvoices([]);
    } catch (error) {
      console.error(error);
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // دالة الحذف
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://prog2025.goldyol.com/api/sale-invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (res.ok) {
        setModalType("success");
        setModalMessage("تم حذف فاتورة البيع بنجاح");
        fetchInvoices();
      } else {
        setModalType("error");
        setModalMessage(data.message || "حدث خطأ أثناء الحذف");
      }
    } catch (err) {
      setModalType("error");
      setModalMessage("حدث خطأ في الاتصال بالسيرفر");
      console.error(err);
    } finally {
      setConfirmDeleteInvoice(null);
    }
  };

  return (
    <div className="invoices-page">
      <h1>فواتير البيع</h1>

      <div className="invoices-layout">
        {/* قسم إضافة فاتورة بيع */}
        <div className="add-invoice-section">
          <AddSaleInvoice onInvoiceAdded={fetchInvoices} />
        </div>

        {/* قائمة الفواتير */}
        <div className="invoices-list-section">
          <h2>قائمة فواتير البيع</h2>
          {invoices.length > 0 ? (
            <ul className="invoices-list">
              {invoices.map(inv => (
                <li key={inv.id} className="invoice-item">
                  <div onClick={() => setSelectedInvoice(inv)} style={{ cursor: "pointer" }}>
                    <div><strong>العميل:</strong> {inv.buyer_name}</div>
                    <div><strong>المجموع:</strong> {inv.total_price}</div>
                    <div><strong>تاريخ الفاتورة:</strong> {inv.invoice_date.split("T")[0]}</div>
                    <div><strong>صاحب المستودع:</strong> {inv.warehouse_owner_name}</div>
                  </div>
                  <button
                    className="delete-invoice-btn"
                    onClick={() => setConfirmDeleteInvoice(inv.id)}
                  >
                    حذف
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-invoices">لا توجد فواتير بيع</p>
          )}
        </div>
      </div>

      {/* مودال تفاصيل الفاتورة */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>تفاصيل فاتورة البيع</h2>
            <p><strong>العميل:</strong> {selectedInvoice.buyer_name}</p>
            <p><strong>المجموع:</strong> {selectedInvoice.total_price}</p>
            <p><strong>تاريخ الفاتورة:</strong> {selectedInvoice.invoice_date.split("T")[0]}</p>
            <p><strong>صاحب المستودع:</strong> {selectedInvoice.warehouse_owner_name}</p>
            <h3>الأصناف</h3>
            <ul>
              {selectedInvoice.items.map(it => (
                <li key={it.id}>
                  {it.name} - الكمية: {it.pivot.quantity} - سعر البيع: {it.pivot.selling_price}
                </li>
              ))}
            </ul>
            <button className="modal-close" onClick={() => setSelectedInvoice(null)}>إغلاق</button>
          </div>
        </div>
      )}

      {/* مودال التأكيد قبل الحذف */}
      {confirmDeleteInvoice && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>تأكيد الحذف</h2>
            <p>هل أنت متأكد من حذف فاتورة البيع هذه؟</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
              <button
                className="modal-close"
                onClick={() => setConfirmDeleteInvoice(null)}
              >
                إلغاء
              </button>
              <button
                className="modal-close"
                style={{ backgroundColor: "#FF4D4F", color: "#fff", border: "none" }}
                onClick={() => handleDelete(confirmDeleteInvoice)}
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الرسائل */}
      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </div>
  );
}
