import React, { useState } from "react";
import Modal from "./Modal";
import "./AddSupplier.css";

export default function AddSupplier({ onSupplierAdded }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch("http://prog2025.goldyol.com/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify({ name, contact_details: contact }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalMessage(data.message || "تمت إضافة المورد بنجاح");
        setModalType("success");
        setName("");
        setContact("");
        if (onSupplierAdded) onSupplierAdded();
      } else {
        setErrors(data.errors || {});
        setModalMessage("حصلت بعض الأخطاء، يرجى التحقق");
        setModalType("error");
      }
    } catch (error) {
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      setModalType("error");
    }
  };

  return (
    <>
      <form className="add-supplier-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المورد</label>
          <input
            type="text"
            value={name}
            placeholder="أدخل اسم المورد"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>معلومات الاتصال</label>
          <input
            type="text"
            value={contact}
            placeholder="أدخل رقم الهاتف أو التفاصيل"
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        <button type="submit">إضافة المورد</button>
      </form>

      <Modal
        message={modalMessage}
        type={modalType}
        onClose={() => setModalMessage("")}
      />
    </>
  );
}
