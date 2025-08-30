import React, { useState, useEffect } from "react";
import AddPurchaseInvoice from "../components/AddPurchaseInvoice";
import Modal from "../components/Modal";
import "./PurchaseInvoicesPage.css";

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [confirmDeleteInvoice, setConfirmDeleteInvoice] = useState(null); // لتأكيد الحذف

  const fetchInvoices = async () => {
    try {
      const res = await fetch("http://prog2025.goldyol.com/api/purchase-invoices", {
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
      const res = await fetch(`http://prog2025.goldyol.com/api/purchase-invoices/${id}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (res.ok) {
        setModalType("success");
        setModalMessage("تم حذف الفاتورة بنجاح");
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
      setConfirmDeleteInvoice(null); // إغلاق مودال التأكيد بعد المحاولة
    }
  };

  return (
    <div className="invoices-page">
      <h1>فواتير الشراء</h1>

      <div className="invoices-layout">
        {/* قسم إضافة فاتورة */}
        <div className="add-invoice-section">
          <AddPurchaseInvoice onInvoiceAdded={fetchInvoices} />
        </div>

        {/* قائمة الفواتير */}
        <div className="invoices-list-section">
          <h2>قائمة الفواتير</h2>
          {invoices.length > 0 ? (
            <ul className="invoices-list">
              {invoices.map(inv => (
                <li key={inv.id} className="invoice-item">
                  <div onClick={() => setSelectedInvoice(inv)} style={{ cursor: "pointer" }}>
                    <div><strong>المورد:</strong> {inv.supplier?.name}</div>
                    <div><strong>المجموع:</strong> {inv.total_price}</div>
                    <div><strong>حالة الدفع:</strong> {inv.payment_status}</div>
                    <div><strong>تاريخ الفاتورة:</strong> {inv.invoice_date.split("T")[0]}</div>
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
            <p className="no-invoices">لا توجد فواتير</p>
          )}
        </div>
      </div>

      {/* مودال تفاصيل الفاتورة */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>تفاصيل الفاتورة</h2>
            <p><strong>المورد:</strong> {selectedInvoice.supplier?.name}</p>
            <p><strong>المجموع:</strong> {selectedInvoice.total_price}</p>
            <p><strong>حالة الدفع:</strong> {selectedInvoice.payment_status}</p>
            <p><strong>المبلغ المدفوع:</strong> {selectedInvoice.paid_amount}</p>
            <p><strong>تاريخ الفاتورة:</strong> {selectedInvoice.invoice_date.split("T")[0]}</p>
            <h3>الأصناف</h3>
            <ul>
              {selectedInvoice.items.map(it => (
                <li key={it.id}>
                  {it.name} - الكمية: {it.pivot.quantity}
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
            <p>هل أنت متأكد من حذف هذه الفاتورة؟</p>
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
