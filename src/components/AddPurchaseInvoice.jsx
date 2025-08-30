import React, { useState, useEffect } from "react";
import "./AddPurchaseInvoice.css";

export default function AddPurchaseInvoice({ onInvoiceAdded, showNotification }) {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    supplier_id: "",
    warehouse_owner_name: "",
    payment_status: "partial",
    paid_amount: 0,
    invoice_date: "",
    items: [],
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://prog2025.goldyol.com/api/items", {
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

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("http://prog2025.goldyol.com/api/suppliers", {
          headers: { Authorization: localStorage.getItem("auth_token") || "" },
        });
        const data = await res.json();
        setSuppliers(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const sum = invoiceData.items.reduce((acc, i) => {
      const item = items.find(it => it.id === i.item_id);
      if (!item) return acc;
      return acc + parseFloat(item.wholesale_price) * i.quantity;
    }, 0);
    setTotalPrice(sum.toFixed(2));
  }, [invoiceData.items, items]);

  const addItem = (item) => {
    if (invoiceData.items.find((i) => i.item_id === item.id)) return;
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, { item_id: item.id, quantity: 1 }],
    }));
  };

  const updateQuantity = (itemId, quantity) => {
    const qty = Math.max(Number(quantity), 1);
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.item_id === itemId ? { ...i, quantity: qty } : i
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...invoiceData, total_price: totalPrice };
      const res = await fetch("http://prog2025.goldyol.com/api/purchase-invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        showNotification && showNotification("تم إنشاء الفاتورة بنجاح!", "success");

        setInvoiceData({
          supplier_id: "",
          warehouse_owner_name: "",
          payment_status: "partial",
          paid_amount: 0,
          invoice_date: "",
          items: [],
        });

        onInvoiceAdded && onInvoiceAdded();
      } else {
        const errorMsg = data.errors
          ? JSON.stringify(data.errors)
          : data.message || "حدث خطأ أثناء إنشاء الفاتورة";
        showNotification && showNotification(errorMsg, "error");
      }
    } catch (err) {
      console.error(err);
      showNotification && showNotification("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="add-purchase-invoice">
      <h2>إضافة فاتورة شراء</h2>
      <form onSubmit={handleSubmit} className="invoice-form">
        {/* اختيار المورد */}
        <label>المورد</label>
        <select
          value={invoiceData.supplier_id}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, supplier_id: e.target.value })
          }
          required
        >
          <option value="">اختر المورد</option>
          {suppliers && suppliers.length > 0 ? (
            suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - الرصيد: {s.balance}
              </option>
            ))
          ) : (
            <option disabled>جارٍ التحميل...</option>
          )}
        </select>

        {/* باقي الحقول والجداول كما هي */}
        <label>اسم صاحب المستودع</label>
        <input
          type="text"
          value={invoiceData.warehouse_owner_name}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, warehouse_owner_name: e.target.value })
          }
          required
        />

        <label>حالة الدفع</label>
        <select
          value={invoiceData.payment_status}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, payment_status: e.target.value })
          }
        >
          <option value="partial">جزئي</option>
          <option value="full">كامل</option>
        </select>

        <label>المبلغ المدفوع</label>
        <input
          type="number"
          value={invoiceData.paid_amount}
          min="0"
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, paid_amount: e.target.value })
          }
        />

        <label>تاريخ الفاتورة</label>
        <input
          type="date"
          value={invoiceData.invoice_date}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, invoice_date: e.target.value })
          }
        />

        <label>ابحث عن عنصر لإضافته</label>
        <input
          type="text"
          placeholder="اكتب اسم الدواء"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="items-search-results">
          {filteredItems.map((i) => (
            <button key={i.id} type="button" onClick={() => addItem(i)}>
              {i.name} - سعر الشراء: {i.wholesale_price}
            </button>
          ))}
        </div>

        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>الدواء</th>
                <th>سعر الشراء</th>
                <th>الكمية</th>
                <th>السعر الكلي</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((i) => {
                const item = items.find((it) => it.id === i.item_id);
                const total = item ? (parseFloat(item.wholesale_price) * i.quantity).toFixed(2) : 0;
                return (
                  <tr key={i.item_id}>
                    <td>{item?.name}</td>
                    <td>{item?.wholesale_price}</td>
                    <td>
                      <input
                        type="number"
                        value={i.quantity}
                        min="1"
                        onChange={(e) => updateQuantity(i.item_id, e.target.value)}
                      />
                    </td>
                    <td>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="total-price">
          <strong>الإجمالي النهائي للفاتورة: </strong>
          {totalPrice}
        </div>

        <button type="submit">إضافة الفاتورة</button>
      </form>
    </div>
  );
}
