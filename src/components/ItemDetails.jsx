import React, { useEffect, useState } from "react";
import Modal from "./Modal";

export default function ItemDetails({ itemId, onClose }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`https://prog2025.goldyol.com/api/items/${itemId}`, {
          headers: { Authorization: localStorage.getItem("auth_token") || "" },
        });
        const data = await res.json();
        if (res.ok) setItem(data.data);
        else setModalMessage("حدث خطأ أثناء جلب بيانات الدواء");
      } catch (err) {
        setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) return <Modal message="جاري التحميل..." type="info" onClose={onClose} />;

  if (!item) return <Modal message={modalMessage || "لم يتم العثور على الدواء"} type="error" onClose={onClose} />;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>تفاصيل الدواء</h2>
        <p><strong>الاسم:</strong> {item.name}</p>
        <p><strong>الشركة:</strong> {item.company}</p>
        <p><strong>سعر الجملة:</strong> {item.wholesale_price}</p>
        <p><strong> نسبة الربح (%) :</strong> {item.profit_margin}</p>
        <p><strong>سعر البيع:</strong> {item.selling_price}</p>
        <p><strong>الباركود:</strong> {item.barcode}</p>
        <p><strong>تاريخ الانتهاء:</strong> {item.expiry_date?.split("T")[0]}</p>
        <p><strong>الكمية:</strong> {item.quantity}</p>

        <button className="modal-close" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
