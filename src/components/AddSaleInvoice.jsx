import React, { useState, useEffect } from "react";
import InvoiceModal from "./InvoiceModal";
import "./AddSaleInvoice.css";

export default function AddSaleInvoice({ onInvoiceAdded }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    buyer_name: "",
    warehouse_owner_name: "",
    invoice_date: "",
    items: [],
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  // جلب العناصر
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("https://prog2025.goldyol.com/api/items", {
          headers: { Authorization: localStorage.getItem("auth_token") || "" },
        });
        const data = await res.json();
        setItems(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  // حساب الإجمالي
  useEffect(() => {
    const sum = invoiceData.items.reduce((acc, i) => {
      return acc + parseFloat(i.selling_price) * Number(i.quantity);
    }, 0);
    setTotalPrice(sum.toFixed(2));
  }, [invoiceData.items]);

  const addItem = (item) => {
    if (invoiceData.items.find(i => i.item_id === item.id)) return;
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { 
          item_id: item.id, 
          quantity: 1, 
          selling_price: parseFloat(item.selling_price) || 0 
        }
      ]
    }));
  };

  const updateQuantity = (itemId, quantity) => {
    const qty = Math.max(Number(quantity), 1);
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.item_id === itemId ? { ...i, quantity: qty } : i
      )
    }));
  };

  const removeItem = (itemId) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.item_id !== itemId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        buyer_name: invoiceData.buyer_name,
        warehouse_owner_name: invoiceData.warehouse_owner_name,
        invoice_date: invoiceData.invoice_date,
        total_price: parseFloat(totalPrice),
        items: invoiceData.items.map(i => ({
          item_id: i.item_id,
          quantity: Number(i.quantity),
          selling_price: parseFloat(i.selling_price)
        }))
      };

      const res = await fetch("https://prog2025.goldyol.com/api/sale-invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setModalMessage("تم إنشاء فاتورة المبيعات بنجاح");
        setModalType("success");
        // إعادة تعيين البيانات
        setInvoiceData({
          buyer_name: "",
          warehouse_owner_name: "",
          invoice_date: "",
          items: [],
        });
        setTotalPrice(0);
        onInvoiceAdded && onInvoiceAdded();
      } else {
        setModalMessage(JSON.stringify(data.errors || data.message));
        setModalType("error");
      }
    } catch (err) {
      setModalMessage("حدث خطأ في الاتصال بالسيرفر");
      setModalType("error");
      console.error(err);
    }
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="add-sale-invoice">
      <h2>إضافة فاتورة بيع</h2>
      <form onSubmit={handleSubmit} className="invoice-form">
        <label>اسم العميل</label>
        <input
          type="text"
          value={invoiceData.buyer_name}
          onChange={(e) => setInvoiceData({ ...invoiceData, buyer_name: e.target.value })}
          required
        />

        <label>اسم صاحب المستودع</label>
        <input
          type="text"
          value={invoiceData.warehouse_owner_name}
          onChange={(e) => setInvoiceData({ ...invoiceData, warehouse_owner_name: e.target.value })}
          required
        />

        <label>تاريخ الفاتورة</label>
        <input
          type="date"
          value={invoiceData.invoice_date}
          onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
          required
        />

        <label>ابحث عن عنصر لإضافته</label>
        <input
          type="text"
          placeholder="اكتب اسم الدواء"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="items-search-results">
          {filteredItems.map(i => (
            <button type="button" key={i.id} onClick={() => addItem(i)}>
              {i.name} - سعر البيع: {i.selling_price}
            </button>
          ))}
        </div>

        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>الدواء</th>
                <th>عدد القطع</th>
                <th>سعر البيع</th>
                <th>الكمية</th>
                <th>السعر الكلي</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map(i => {
                const item = items.find(it => it.id === i.item_id);
                const total = (i.selling_price * i.quantity).toFixed(2);
                return (
                  <tr key={i.item_id}>
                    <td>{item?.name}</td>
                    <td>{item?.quantity || "-"}</td>
                    <td>{i.selling_price}</td>
                    <td>
                      <input
                        type="number"
                        value={i.quantity}
                        min="1"
                        onChange={(e) => updateQuantity(i.item_id, e.target.value)}
                      />
                    </td>
                    <td>{total}</td>
                    <td>
                      <button type="button" className="remove-btn" onClick={() => removeItem(i.item_id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="total-price">
          <strong>الإجمالي النهائي للفاتورة: </strong>{totalPrice}
        </div>

        <button type="submit">إضافة الفاتورة</button>
      </form>

      {modalMessage && (
        <InvoiceModal
          message={modalMessage}
          type={modalType}
          onClose={() => setModalMessage("")}
        />
      )}
    </div>
  );
}
