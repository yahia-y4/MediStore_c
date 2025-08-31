import React, { useState } from "react";
import Modal from "./Modal";

export default function AddItem({ onItemAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    wholesale_price: "",
    profit_margin: "",
    selling_price: "",
    barcode: "",
    expiry_date: "",
    quantity: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // حساب سعر البيع تلقائيًا عند تغيير wholesale_price أو profit_margin
      if (name === "wholesale_price" || name === "profit_margin") {
        const price = parseFloat(updated.wholesale_price) || 0;
        const profit = parseFloat(updated.profit_margin) || 0;
        updated.selling_price = (price + price * (profit / 100)).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://prog2025.goldyol.com/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setModalMessage(data.message || "تم إضافة الدواء بنجاح");
        setModalType("success");
        setFormData({
          name: "",
          company: "",
          wholesale_price: "",
          profit_margin: "",
          selling_price: "",
          barcode: "",
          expiry_date: "",
          quantity: "",
        });
        if (onItemAdded) onItemAdded();
      } else {
        setModalMessage(Object.values(data.errors || {}).flat().join("، ") || "حدث خطأ");
        setModalType("error");
      }
    } catch {
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      setModalType("error");
    }
  };

  return (
    <div>
      <h2>إضافة دواء جديد</h2>
      <form onSubmit={handleSubmit} className="add-item-form">
        <label>اسم الدواء</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />

        <label>الشركة</label>
        <input type="text" name="company" value={formData.company} onChange={handleChange} required />

        <label>سعر الجملة</label>
        <input type="number" name="wholesale_price" value={formData.wholesale_price} onChange={handleChange} required />

        <label>نسبة الربح (%)</label>
        <input type="number" name="profit_margin" value={formData.profit_margin} onChange={handleChange} required />

        <label>سعر البيع</label>
        <input type="number" name="selling_price" value={formData.selling_price} readOnly />

        <label>الباركود</label>
        <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} required />

        <label>تاريخ الانتهاء</label>
        <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />

        <label>الكمية</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

        <button type="submit">إضافة</button>
      </form>

      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </div>
  );
}
