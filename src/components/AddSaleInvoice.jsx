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
    const item = items.find(i => i.id === itemId);
    const maxQty = item?.quantity || 1;
    let qty = Number(quantity);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > maxQty) qty = maxQty;

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

  const validatePayload = (payload) => {
    if (!payload.buyer_name.trim()) return "اسم العميل مطلوب";
    if (!payload.warehouse_owner_name.trim()) return "اسم صاحب المستودع مطلوب";
    if (!payload.invoice_date) return "تاريخ الفاتورة مطلوب";
    if (!payload.items || payload.items.length === 0) return "يجب إضافة عنصر واحد على الأقل";
    for (let i of payload.items) {
      if (!i.item_id) return "هناك عنصر غير محدد";
      if (!i.quantity || i.quantity < 1) return "يجب أن تكون الكمية أكبر من صفر";
      if (!i.selling_price || isNaN(i.selling_price)) return "سعر البيع غير صالح";
      const item = items.find(it => it.id === i.item_id);
      if (i.quantity > item?.quantity) return `الكمية المطلوبة للعنصر ${item.name} أكبر من المخزون`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalPrice = invoiceData.items.reduce(
      (acc, i) => acc + parseFloat(i.selling_price) * Number(i.quantity),
      0
    );

    const payload = {
      buyer_name: invoiceData.buyer_name,
      warehouse_owner_name: invoiceData.warehouse_owner_name,
      invoice_date: invoiceData.invoice_date,
      total_price: totalPrice,
      items: invoiceData.items.map(i => ({
        item_id: i.item_id,
        quantity: Number(i.quantity),
        selling_price: parseFloat(i.selling_price)
      }))
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setModalMessage(validationError);
      setModalType("error");
      return;
    }

    try {
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

        // تحديث كميات العناصر في الواجهة مباشرة
        setItems(prevItems =>
          prevItems.map(it => {
            const soldItem = invoiceData.items.find(i => i.item_id === it.id);
            if (soldItem) {
              return { ...it, quantity: it.quantity - soldItem.quantity };
            }
            return it;
          })
        );

        // إعادة تعيين بيانات الفاتورة
        setInvoiceData({
          buyer_name: "",
          warehouse_owner_name: "",
          invoice_date: "",
          items: [],
        });

        onInvoiceAdded && onInvoiceAdded();
      } else {
        console.log(data)
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
              {i.name} - سعر البيع: {i.selling_price} - الكمية المتوفرة: {i.quantity}
            </button>
          ))}
        </div>

        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>الدواء</th>
                <th>سعر البيع</th>
                <th>الكمية المتوفرة</th>
                <th>الكمية المختارة</th>
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
                    <td>{i.selling_price}</td>
                    <td>{item?.quantity || "-"}</td>
                    <td>
                      <input
                        type="number"
                        value={i.quantity}
                        min="1"
                        max={item?.quantity || 1}
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
          <strong>الإجمالي النهائي للفاتورة: </strong>
          {invoiceData.items.reduce((acc, i) => acc + i.selling_price * i.quantity, 0).toFixed(2)}
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
