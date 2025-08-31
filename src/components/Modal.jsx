import React from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

export default function Modal({ message, type = "error", onClose }) {
  if (!message) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p className={`modal-message ${type}`}>{message}</p>
        <button className="modal-close" onClick={onClose}>إغلاق</button>
      </div>
    </div>,
    document.body // 🚀 يضمن أن المودال يظهر فوق الكل
  );
}
