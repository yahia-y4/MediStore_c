import React from "react";
import "./InvoiceModal.css";

export default function InvoiceModal({ message, type, onClose }) {
  return (
    <div className="invoice-modal-backdrop" onClick={onClose}>
      <div className="invoice-modal-content" onClick={e => e.stopPropagation()}>
        <h2>{type === "success" ? "نجاح" : "خطأ"}</h2>
        <p>{message}</p>
        <button className="invoice-modal-close" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
