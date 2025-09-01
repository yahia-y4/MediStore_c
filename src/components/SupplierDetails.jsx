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
        const response = await fetch(
          `https://prog2025.goldyol.com/api/suppliers/${supplierId}`,
          { headers: { Authorization: localStorage.getItem("auth_token") || "" } }
        );

        const data = await response.json();

        if (response.ok) {
          const supplierData = data.data.supplier;
          supplierData.total_debt = data.data.total_debt; // أضف total_debt

          // تنسيق التواريخ
          supplierData.created_at = formatDate(supplierData.created_at);
          supplierData.updated_at = formatDate(supplierData.updated_at);
          supplierData.last_transaction_date = formatDate(supplierData.last_transaction_date);

          supplierData.purchase_invoices = supplierData.purchase_invoices?.map(invoice => ({
            ...invoice,
            invoice_date: formatDate(invoice.invoice_date),
            items: invoice.items.map(item => ({
              ...item,
              expiry_date: formatDate(item.expiry_date)
            }))
          }));

          setSupplier(supplierData);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG") + " " + date.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <p>جارٍ تحميل بيانات المورد...</p>;
  if (!supplier) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("supplier-details-backdrop")) {
      onClose();
    }
  };

  return (
    <>
      <div className="supplier-details-backdrop" onClick={handleBackdropClick}>
        <div className="supplier-details-modal">
          <h2>تفاصيل المورد: {supplier.name}</h2>
          <p><strong>رقم الهاتف:</strong> {supplier.contact_details}</p>
          <p><strong>المستخدم المسؤول:</strong> {supplier.user?.name}</p>
          <p><strong>تاريخ الإنشاء:</strong> {supplier.created_at}</p>
          <p><strong>تاريخ التحديث:</strong> {supplier.updated_at}</p>

          <p><strong>الرصيد الحالي:</strong> {supplier.balance}</p>
          <p><strong>مجموع الدين:</strong> {supplier.total_debt}</p>
          <p><strong>حالة الرصيد:</strong> {supplier.has_debt ? "مدين" : supplier.has_credit ? "دائن" : "متوازن"}</p>
          <p><strong>آخر معاملة:</strong> {supplier.last_transaction_date}</p>

          <h3>الفواتير المرتبطة:</h3>
          {supplier.purchase_invoices?.length > 0 ? (
            <div className="invoices-container">
              {supplier.purchase_invoices.map((invoice) => (
                <div key={invoice.id} className="invoice-card">
                  <p><strong>رقم الفاتورة:</strong> {invoice.id}</p>
                  <p><strong>صاحب المستودع:</strong> {invoice.warehouse_owner_name}</p>
                  <p><strong>تاريخ الفاتورة:</strong> {invoice.invoice_date}</p>
                  <p><strong>المجموع:</strong> {invoice.total_price}</p>
                  <p><strong>حالة الدفع:</strong> {invoice.payment_status}</p>
                  <p><strong>المدفوع:</strong> {invoice.paid_amount}</p>

                  <div className="items-container">
                    <p><strong>الأصناف:</strong></p>
                    <table>
                      <thead>
                        <tr>
                          <th>الاسم</th>
                          <th>الشركة</th>
                          <th>سعر البيع</th>
                          <th>الجملة</th>
                          <th>الكمية</th>
                          <th>تاريخ الصلاحية</th>
                          <th>باركود</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.company}</td>
                            <td>{item.selling_price}</td>
                            <td>{item.wholesale_price}</td>
                            <td>{item.quantity}</td>
                            <td>{item.expiry_date}</td>
                            <td>{item.barcode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد فواتير مرتبطة.</p>
          )}
        </div>
      </div>

      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")}/>
    </>
  );
}
