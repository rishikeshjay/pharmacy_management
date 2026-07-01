import { useState, useMemo, useEffect } from "react";

const CATEGORIES = [
  "Antibiotic", "Analgesic", "Antacid", "Antidiabetic",
  "Vitamin", "Antihistamine", "Antihypertensive", "Other",
];

const INITIAL_ITEMS = [
  { id: 1, name: "Paracetamol 500mg",  cat: "Analgesic",        mfg: "Cipla",        stock: 320, price: 2.5,  exp: "2026-11-30", reorder: 100 },
  { id: 2, name: "Amoxicillin 250mg",  cat: "Antibiotic",       mfg: "Sun Pharma",   stock: 45,  price: 8.0,  exp: "2026-03-15", reorder: 80  },
  { id: 3, name: "Omeprazole 20mg",    cat: "Antacid",          mfg: "Dr. Reddy's",  stock: 0,   price: 6.5,  exp: "2027-01-10", reorder: 60  },
  { id: 4, name: "Metformin 500mg",    cat: "Antidiabetic",     mfg: "Mankind",      stock: 210, price: 3.2,  exp: "2025-12-31", reorder: 100 },
  { id: 5, name: "Vitamin D3 1000IU",  cat: "Vitamin",          mfg: "Abbott",       stock: 18,  price: 12.0, exp: "2026-08-20", reorder: 50  },
  { id: 6, name: "Cetirizine 10mg",    cat: "Antihistamine",    mfg: "Cipla",        stock: 150, price: 1.8,  exp: "2027-04-15", reorder: 70  },
  { id: 7, name: "Atenolol 50mg",      cat: "Antihypertensive", mfg: "Zydus",      stock: 90,  price: 4.5,  exp: "2026-06-30", reorder: 80  },
];

function getStatus(item) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(item.exp);
  const diff = (exp - today) / (1000 * 60 * 60 * 24);
  if (item.stock === 0) return "out";
  if (diff < 0) return "expired";
  if (diff <= 90) return "expiring";
  if (item.stock <= item.reorder) return "low";
  return "ok";
}

const STATUS_CONFIG = {
  ok:       { label: "In stock",      color: "#166534", bg: "#dcfce7", border: "#bbf7d0" },
  low:      { label: "Low stock",     color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  out:      { label: "Out of stock",  color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
  expiring: { label: "Expiring soon", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  expired:  { label: "Expired",       color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
};

const CAT_COLORS = {
  Antibiotic:      { color: "#1e40af", bg: "#dbeafe" },
  Analgesic:       { color: "#6b21a8", bg: "#f3e8ff" },
  Antacid:         { color: "#065f46", bg: "#d1fae5" },
  Antidiabetic:    { color: "#9a3412", bg: "#ffedd5" },
  Vitamin:         { color: "#854d0e", bg: "#fef9c3" },
  Antihistamine:   { color: "#155e75", bg: "#cffafe" },
  Antihypertensive:{ color: "#be185d", bg: "#fce7f3" },
  Other:           { color: "#374151", bg: "#f3f4f6" },
};

const EMPTY_FORM = { name: "", cat: CATEGORIES[0], mfg: "", stock: "", price: "", exp: "", reorder: "50" };

function Badge({ children, color, bg, border }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "2px 9px", borderRadius: 20,
      color, background: bg, border: `1px solid ${border || bg}`,
    }}>{children}</span>
  );
}

function MetricCard({ label, value, valueColor }) {
  return (
    <div style={{
      background: "#f9fafb", borderRadius: 10, padding: "14px 18px",
      border: "0.5px solid #e5e7eb",
    }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: valueColor || "#111827" }}>{value}</div>
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14, padding: "1.5rem",
          width: 460, maxWidth: "95vw", border: "0.5px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: "1.2rem", color: "#111827" }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", fontSize: 14, padding: "7px 10px",
  border: "1px solid #d1d5db", borderRadius: 8, outline: "none",
  background: "#fff", color: "#111827", boxSizing: "border-box",
};

export default function PharmacyInventory({ user, onLogout }) {
  // 1. Check local storage first, fallback to INITIAL_ITEMS if empty
  const [items, setItems] = useState(() => {
    const savedData = localStorage.getItem("pharmacy_inventory");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return INITIAL_ITEMS;
  });

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // 2. Save items to localStorage every time the items array changes
  useEffect(() => {
    localStorage.setItem("pharmacy_inventory", JSON.stringify(items));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => {
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.mfg.toLowerCase().includes(q);
      const matchCat = !filterCat || i.cat === filterCat;
      const matchSt = !filterStatus || getStatus(i) === filterStatus;
      return matchQ && matchCat && matchSt;
    });
  }, [items, search, filterCat, filterStatus]);

  const metrics = useMemo(() => {
    const low = items.filter(i => getStatus(i) === "low").length;
    const expiring = items.filter(i => ["expiring", "expired"].includes(getStatus(i))).length;
    const val = items.reduce((s, i) => s + i.stock * i.price, 0);
    return { total: items.length, low, expiring, val };
  }, [items]);

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(id) {
    const item = items.find(i => i.id === id);
    setEditId(id);
    setForm({
      name: item.name, cat: item.cat, mfg: item.mfg,
      stock: String(item.stock), price: String(item.price),
      exp: item.exp, reorder: String(item.reorder),
    });
    setFormError("");
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.exp) {
      setFormError("Medicine name and expiry date are required.");
      return;
    }
    
    const payload = {
      name: form.name.trim(),
      cat: form.cat,
      mfg: form.mfg.trim(),
      stock: parseInt(form.stock) || 0,
      price: parseFloat(form.price) || 0,
      exp: form.exp,
      reorder: parseInt(form.reorder) || 50,
    };

    if (editId !== null) {
      // Editing existing item
      setItems(prev => prev.map(i => i.id === editId ? { ...i, ...payload } : i));
    } else {
      // Adding new item - Calculate the next available ID dynamically
      const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      setItems(prev => [...prev, { id: newId, ...payload }]);
    }
    
    setModalOpen(false);
  }

  function handleDelete(id) {
    if (window.confirm("Remove this medicine from inventory?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  }

  const colW = ["22%","13%","14%","10%","10%","11%","12%","8%"];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>Pharmacy Inventory</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>Manage medicines, stock & expiry</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0 }}>{user.email}</p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{user.role}</p>
            </div>
          )}
          <button
            onClick={openAdd}
            style={{ fontSize: 13, fontWeight: 500, padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
          >+ Add medicine</button>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{ fontSize: 13, fontWeight: 500, padding: "8px 14px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}
            >Logout</button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        <MetricCard label="Total medicines" value={metrics.total} />
        <MetricCard label="Low stock" value={metrics.low} valueColor="#d97706" />
        <MetricCard label="Expiring soon" value={metrics.expiring} valueColor="#dc2626" />
        <MetricCard label="Inventory value" value={`₹${metrics.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} valueColor="#059669" />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem" }}>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or manufacturer..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 160 }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 150 }}>
          <option value="">All status</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
          <option value="expiring">Expiring soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 12, overflowX: "auto", overflowY: "auto", maxHeight: 420, marginBottom: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {colW.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Medicine","Category","Manufacturer","Stock","Price (₹)","Expiry","Status",""].map((h, i) => (
                <th key={i} style={{
                  padding: "10px 14px", textAlign: i === 7 ? "right" : "left",
                  fontSize: 11, fontWeight: 500, color: "#9ca3af",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  borderBottom: "0.5px solid #e5e7eb",
                  position: "sticky", top: 0, background: "#f9fafb", zIndex: 1,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "2.5rem", color: "#9ca3af", fontSize: 14 }}>No medicines found</td></tr>
            ) : filtered.map(item => {
              const s = getStatus(item);
              const sc = STATUS_CONFIG[s];
              const cc = CAT_COLORS[item.cat] || CAT_COLORS.Other;
              const expDate = new Date(item.exp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              return (
                <tr key={item.id} style={{ borderBottom: "0.5px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#111827" }}>{item.name}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge color={cc.color} bg={cc.bg}>{item.cat}</Badge>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#6b7280" }}>{item.mfg}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#111827" }}>{item.stock.toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>₹{item.price.toFixed(2)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>{expDate}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge color={sc.color} bg={sc.bg} border={sc.border}>{sc.label}</Badge>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => openEdit(item.id)} style={{ fontSize: 12, padding: "3px 10px", border: "0.5px solid #d1d5db", borderRadius: 6, background: "transparent", color: "#374151", cursor: "pointer", marginRight: 4 }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ fontSize: 12, padding: "3px 10px", border: "0.5px solid #fca5a5", borderRadius: 6, background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} title={editId !== null ? "Edit medicine" : "Add medicine"} onClose={() => setModalOpen(false)}>
        <FormField label="Medicine name">
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 500mg" />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Category">
            <select style={inputStyle} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Manufacturer">
            <input style={inputStyle} value={form.mfg} onChange={e => setForm(f => ({ ...f, mfg: e.target.value }))} placeholder="e.g. Cipla" />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Stock (units)">
            <input style={inputStyle} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
          </FormField>
          <FormField label="Price per unit (₹)">
            <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Expiry date">
            <input style={inputStyle} type="date" value={form.exp} onChange={e => setForm(f => ({ ...f, exp: e.target.value }))} />
          </FormField>
          <FormField label="Reorder level (units)">
            <input style={inputStyle} type="number" min="0" value={form.reorder} onChange={e => setForm(f => ({ ...f, reorder: e.target.value }))} placeholder="50" />
          </FormField>
        </div>
        {formError && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{formError}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1.25rem" }}>
          <button onClick={() => setModalOpen(false)} style={{ fontSize: 13, padding: "7px 16px", border: "0.5px solid #d1d5db", borderRadius: 8, background: "transparent", color: "#374151", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ fontSize: 13, fontWeight: 500, padding: "7px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Save medicine</button>
        </div>
      </Modal>
    </div>
  );
}