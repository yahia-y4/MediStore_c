import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "./SupplierDetails.css";

export default function SupplierDetails({ supplierId, onClose }) {
  const [supplier, setSupplier] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(`https://prog2025.goldyol.com/api/suppliers/${supplierId}`, {
          headers: { "Authorization": localStorage.getItem("auth_token") || "" },
        });

        const data = await response.json();
        if (response.ok) {
          setSupplier(data.data.supplier);
        } else {
          setModalMessage(data.message || "حدث خطأ أثناء جلب بيانات المورد");
          setModalType("error");
        }
      } catch (error) {
        setModalMessage("حصل خطأ في الاتصال بالسيرفر");
        setModalType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  if (loading) return <p>جارٍ تحميل بيانات المورد...</p>;
  if (!supplier) return null;

  // إغلاق عند النقر على الخلفية
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("supplier-details-backdrop")) {
      onClose();
    }
  };

  return (
    <>
      <div className="supplier-details-backdrop" onClick={handleBackdropClick}>
        <div className="supplier-details-modal">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>تفاصيل المورد: {supplier.name}</h2>
          <p><strong>معلومات الاتصال:</strong> {supplier.contact_details}</p>
          <p><strong>الرصيد الحالي:</strong> {supplier.balance}</p>
          <p><strong>حالة الرصيد:</strong> {supplier.has_debt ? "مدين" : supplier.has_credit ? "دائن" : "متوازن"}</p>
          <p><strong>آخر معاملة:</strong> {supplier.last_transaction_date}</p>

          <h3>الفواتير المرتبطة:</h3>
          {supplier.purchase_invoices && supplier.purchase_invoices.length > 0 ? (
            <ul>
              {supplier.purchase_invoices.map((invoice) => (
                <li key={invoice.id} className="invoice-item">
                  <strong>فاتورة رقم: {invoice.id}</strong><br />
                  المجموع: {invoice.total_price}, الحالة: {invoice.payment_status}, المدفوع: {invoice.paid_amount}<br />
                  الأصناف:
                  <ul>
                    {invoice.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} - الكمية: {item.quantity} - السعر: {item.selling_price}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>لا توجد فواتير مرتبطة.</p>
          )}
        </div>
      </div>

      {/* Modal للرسائل */}
      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </>
  );
}
