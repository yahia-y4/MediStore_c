import React, { useEffect, useState } from "react";
import AddItem from "../components/AddItem";
import ItemDetails from "../components/ItemDetails";
import EditItem from "../components/EditItem";
import Modal from "../components/Modal";
import "./ItemsPage.css";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");
  const [viewItemId, setViewItemId] = useState(null);
  const [editItemId, setEditItemId] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("http://prog2025.goldyol.com/api/items", {
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (res.ok) setItems(data.data || []);
      else setItems([]);
    } catch {
      setItems([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://prog2025.goldyol.com/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("auth_token") || "" },
      });
      const data = await res.json();
      if (res.ok) {
        setModalMessage(data.message || "تم حذف الدواء بنجاح");
        setModalType("success");
        fetchItems();
      } else {
        setModalMessage("حدث خطأ أثناء الحذف");
        setModalType("error");
      }
    } catch {
      setModalMessage("حصل خطأ في الاتصال بالسيرفر");
      setModalType("error");
    }
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <div className="items-page-content">
      <h1>إدارة الأدوية</h1>

      <div className="items-layout">
        {/* قسم إضافة الدواء ثابت */}
        <div className="add-section">
          <AddItem onItemAdded={fetchItems} />
        </div>

        {/* قائمة عرض الأدوية */}
        <div className="list-section">
          <h2>قائمة الأدوية</h2>
          {items.length > 0 ? (
            <ul className="item-list">
              {items.map(i => (
                <li key={i.id} className="item">
                  <div className="item-info">
                    <span className="item-name">{i.name}</span>
                    <span className="item-company">{i.company}</span>
                    <span className="item-price">سعر البيع: {i.selling_price}</span>
                    <span className="item-qty">الكمية: {i.quantity}</span>
                    <span className="item-expiry">تاريخ الانتهاء: {i.expiry_date?.split("T")[0]}</span>
                  </div>
                  <div className="item-actions">
                    <button className="view-btn" onClick={() => setViewItemId(i.id)}>عرض التفاصيل</button>
                    <button className="edit-btn" onClick={() => setEditItemId(i.id)}>تعديل</button>
                    <button className="delete-btn" onClick={() => handleDelete(i.id)}>حذف</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="no-items">لا يوجد أدوية</p>}
        </div>
      </div>

      {/* مودال عرض التفاصيل */}
      {viewItemId && <ItemDetails itemId={viewItemId} onClose={() => setViewItemId(null)} />}

      {/* مودال تعديل الدواء */}
      {editItemId && <EditItem itemId={editItemId} onClose={() => setEditItemId(null)} onUpdated={fetchItems} />}

      {/* مودال الرسائل */}
      <Modal message={modalMessage} type={modalType} onClose={() => setModalMessage("")} />
    </div>
  );
}
