import React, { useState } from "react";
import Modal from "./Modal";
import "./PayDebt.css";

export default function PayDebt({ supplierId, onPaid, onClose }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://prog2025.goldyol.com/api/suppliers/${supplierId}/pay-debt`, {
        method: "POST",
        headers: {
          "Authorization": localStorage.getItem("auth_token") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, payment_method: method, notes }),
      });

      const data = await response.json();
      if (response.ok) {
        setModalMessage(data.message || "تم دفع المبلغ بنجاح");
        setModalType("success");
        onPaid(); // إعادة تحميل بيانات الموردين
        onClose();
      } else {
        setModalMessage(
          data.message || Object.values(data.errors || {}).flat().join(", ")
        );
        setModalType("error");
      }
    } catch (error) {
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      setModalType("error");
    }
  };

  return (
    <>
      <div className="pay-debt-backdrop" onClick={(e) => e.target.classList.contains("pay-debt-backdrop") && onClose()}>
        <div className="pay-debt-modal">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>دفع دين المورد</h2>
          <form onSubmit={handleSubmit}>
            <label>المبلغ:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <label>طريقة الدفع:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">نقداً</option>
              <option value="bank">تحويل بنكي</option>
            </select>

            <label>ملاحظات:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

            <button type="submit" className="pay-btn">دفع</button>
          </form>
        </div>
      </div>

      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </>
  );
}
