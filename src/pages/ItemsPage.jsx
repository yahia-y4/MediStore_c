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
  const [searchTerm, setSearchTerm] = useState("");

  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");

  useEffect(() => {
    if (!token) return;
    fetchItems();
  }, [token]);

  const fetchItems = async () => {
    try {
      const res = await fetch("https://prog2025.goldyol.com/api/items", {
        headers: { Authorization: token },
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
      const res = await fetch(`https://prog2025.goldyol.com/api/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
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

  const updateToken = (newToken) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="items-page-content">
      <h1>إدارة الأدوية</h1>

      <input
        type="text"
        placeholder="ابحث بالاسم أو الكود..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="items-layout">
        <div className="add-section">
          <AddItem onItemAdded={fetchItems} />
        </div>

        <div className="list-section">
          <h2>قائمة الأدوية</h2>
          {filteredItems.length > 0 ? (
            <ul className="item-list">
              {filteredItems.map((i) => (
                <li key={i.id} className="item">
                  <div className="item-info">
                    <span className="item-name">{i.name}</span>
                    <span className="item-company">{i.company}</span>
                    <span className="item-price">
                      سعر البيع: {i.selling_price}
                    </span>
                    <span className="item-qty">الكمية: {i.quantity}</span>
                    <span className="item-expiry">
                      تاريخ الانتهاء: {i.expiry_date?.split("T")[0]}
                    </span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="view-btn"
                      onClick={() => setViewItemId(i.id)}
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => setEditItemId(i.id)}
                    >
                      تعديل
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(i.id)}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">لا يوجد أدوية</p>
          )}
        </div>
      </div>

      {viewItemId && (
        <ItemDetails itemId={viewItemId} onClose={() => setViewItemId(null)} />
      )}

      {editItemId && (
        <EditItem
          itemId={editItemId}
          onClose={() => setEditItemId(null)}
          onUpdated={fetchItems}
        />
      )}

      {/* المودال */}
      <Modal
        message={modalMessage}
        type={modalType}
        onClose={() => setModalMessage("")}
      />
    </div>
  );
}
