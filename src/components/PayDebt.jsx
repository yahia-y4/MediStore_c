import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import "./PayDebt.css";

export default function PayDebt({ supplierId, totalDebt, onPaid, onClose }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [borderColor, setBorderColor] = useState("#ccc"); // لون الحقل الافتراضي

  // تحديث لون الحد عند تغيّر المبلغ
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (totalDebt === 0) {
      setBorderColor("#ccc");
    } else if (numAmount >= totalDebt * 0.8) {
      setBorderColor("#e74c3c"); // أحمر عند الاقتراب من الحد
    } else {
      setBorderColor("#ccc");
    }
  }, [amount, totalDebt]);

  const handleAmountChange = (e) => {
    let value = e.target.value;

    // السماح بالقيمة الفارغة أثناء الكتابة
    if (value === "") {
      setAmount("");
      return;
    }

    // تحويل القيمة إلى رقم
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;

    // لا يسمح بتجاوز الحد الأقصى
    if (numValue > totalDebt) numValue = totalDebt;
    if (numValue < 0) numValue = 0;

    setAmount(numValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalDebt === 0) {
      setModalMessage("لا يوجد دين لهذا المورد");
      setModalType("error");
      return;
    }

    try {
      const response = await fetch(
        `https://prog2025.goldyol.com/api/suppliers/${supplierId}/pay-debt`,
        {
          method: "POST",
          headers: {
            "Authorization": localStorage.getItem("auth_token") || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount, payment_method: method, notes }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setModalMessage(data.message || "تم دفع المبلغ بنجاح");
        setModalType("success");
        onPaid();
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
      <div
        className="pay-debt-backdrop"
        onClick={(e) => e.target.classList.contains("pay-debt-backdrop") && onClose()}
      >
        <div className="pay-debt-modal">
          <h2>دفع دين المورد</h2>
          <form onSubmit={handleSubmit}>
            <label>المبلغ (الحد الأقصى: {totalDebt})</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="ادخل المبلغ"
              min={0}
              max={totalDebt}
              disabled={totalDebt === 0}
              style={{ borderColor }}
              required
            />
            {totalDebt > 0 && (
              <small className="max-amount-warning">
            
              </small>
            )}

            <label>طريقة الدفع:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} disabled={totalDebt === 0}>
              <option value="cash">نقداً</option>
              <option value="bank">تحويل بنكي</option>
            </select>

            <label>ملاحظات:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب ملاحظات إن وجدت"
              rows={3}
              disabled={totalDebt === 0}
            />

            <button type="submit" className="pay-btn" disabled={totalDebt === 0}>
              دفع
            </button>
          </form>
        </div>
      </div>

      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </>
  );
}
