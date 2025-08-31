import React, { useEffect, useState } from "react";
import AddSupplier from "../components/AddSupplier";
import Modal from "../components/Modal";
import SupplierDetails from "../components/SupplierDetails";
import PayDebt from "../components/PayDebt";
import "./SuppliersPage.css";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [viewSupplierId, setViewSupplierId] = useState(null);
  const [payDebtId, setPayDebtId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("https://prog2025.goldyol.com/api/suppliers", {
        headers: { "Authorization": localStorage.getItem("auth_token") || "" },
      });

      const data = await response.json();

      if (Array.isArray(data.data)) setSuppliers(data.data);
      else if (Array.isArray(data)) setSuppliers(data);
      else setSuppliers([]);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setSuppliers([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://prog2025.goldyol.com/api/suppliers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": localStorage.getItem("auth_token") || "" },
      });

      let data = {};
      try { data = await response.json(); } catch (e) { data = {}; }

      if (response.ok) {
        setModalMessage(data.message || "تم حذف المورد بنجاح");
        setModalType("success");
        fetchSuppliers();
      } else {
        setModalMessage(
          data.message || `لا يمكن حذف المورد${data.total_debt ? `، الديون: ${data.total_debt}` : ""}`
        );
        setModalType("error");
      }
    } catch (error) {
      console.error("Delete supplier error:", error);
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      setModalType("error");
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  // تصفية الموردين حسب الاسم أو رقم الهاتف
  const filteredSuppliers = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact_details?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="suppliers-page">
      <h1>إدارة الموردين</h1>

      <div className="suppliers-layout">
        {/* قسم إضافة المورد */}
        <div className="add-section" style={{ backgroundColor: "#001E33" }}>
          <h2>إضافة مورد جديد</h2>
          <AddSupplier onSupplierAdded={fetchSuppliers} />
        </div>

        {/* قسم قائمة الموردين مع خانة البحث */}
        <div className="list-section" id="list-section" >
          <h2 style={{ color: "#fff" }}>قائمة الموردين</h2>

          {/* خانة البحث فوق قائمة الموردين */}
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredSuppliers.length > 0 ? (
            <ul className="supplier-list">
              {filteredSuppliers.map((s) => (
                <li key={s.id} className="supplier-item">
                  <div className="supplier-info">
                    <span className="supplier-name">{s.name}</span>
                    <span className="supplier-contact">{s.contact_details}</span>
                  </div>
                  <div className="supplier-actions">
                    <span className="supplier-balance">الرصيد: {s.balance}</span>
                    <button
                      className="view-btn"
                      onClick={() => setViewSupplierId(s.id)}
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      className="pay-btn"
                      onClick={() => setPayDebtId(s.id)}
                    >
                      دفع الدين
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => setConfirmDeleteId(s.id)}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-suppliers">لا يوجد موردين</p>
          )}
        </div>
      </div>

      {/* Modal للرسائل */}
      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />

      {/* Confirm Modal للحذف */}
      {confirmDeleteId && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <p className="modal-message">هل أنت متأكد من حذف هذا المورد؟</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: 'wrap' }}>
              <button className="modal-close" onClick={() => setConfirmDeleteId(null)}>إلغاء</button>
              <button
                className="delete-btn"
                onClick={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Details Modal */}
      {viewSupplierId && (
        <SupplierDetails supplierId={viewSupplierId} onClose={() => setViewSupplierId(null)} />
      )}

      {/* Pay Debt Modal */}
      {payDebtId && (
        <PayDebt supplierId={payDebtId} onPaid={fetchSuppliers} onClose={() => setPayDebtId(null)} />
      )}
    </div>
  );
}
