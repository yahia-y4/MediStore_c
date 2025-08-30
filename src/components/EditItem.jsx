import React, { useState, useEffect } from "react";
import Modal from "./Modal";

export default function EditItem({ itemId, onClose, onUpdated }) {
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`http://prog2025.goldyol.com/api/items/${itemId}`, {
          headers: { Authorization: localStorage.getItem("auth_token") || "" },
        });
        const data = await res.json();
        if (res.ok) {
          setItem(data.data);
          setFormData({
            name: data.data.name,
            company: data.data.company,
            wholesale_price: data.data.wholesale_price,
            profit_margin: data.data.profit_margin,
            selling_price: data.data.selling_price,
            barcode: data.data.barcode,
            expiry_date: data.data.expiry_date?.split("T")[0],
            quantity: data.data.quantity,
          });
        } else setModalMessage("حدث خطأ في جلب بيانات الدواء");
      } catch {
        setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      }
    };
    fetchItem();
  }, [itemId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://prog2025.goldyol.com/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        if (onUpdated) onUpdated();
        onClose();
      } else {
        setModalMessage(Object.values(data.errors || {}).flat().join("، ") || "حدث خطأ");
      }
    } catch {
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
    }
  };

  if (!item) return null;

  return (
    <div className="edit-item-modal">
      <h2>تعديل الدواء</h2>
      <form onSubmit={handleSubmit} className="edit-item-form">
        <label>اسم الدواء</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>الشركة</label>
        <input type="text" name="company" value={formData.company} onChange={handleChange} required />

        <label>سعر الجملة</label>
        <input type="number" name="wholesale_price" value={formData.wholesale_price} onChange={handleChange} required />

        <label>هامش الربح</label>
        <input type="number" name="profit_margin" value={formData.profit_margin} onChange={handleChange} required />

        <label>سعر البيع</label>
        <input type="number" name="selling_price" value={formData.selling_price} onChange={handleChange} required />

        <label>الباركود</label>
        <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} required />

        <label>تاريخ الانتهاء</label>
        <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />

        <label>الكمية</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
          <button type="button" className="modal-close" onClick={onClose}>إلغاء</button>
          <button type="submit" className="edit-btn">حفظ التعديلات</button>
        </div>
      </form>

      <Modal message={modalMessage} type="error" onClose={() => setModalMessage("")} />
    </div>
  );
}
