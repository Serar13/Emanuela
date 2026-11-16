import { useState, useEffect } from "react";
import { useCollection } from "../hooks/useCollection";
import { COLLECTIONS } from "../services/collections";
import { createDoc, updateDocById, deleteDocById } from "../services/firestore";
import Modal from "../components/Modal";
import { Loading, Badge } from "../components/ui";

const EMOJI_PALETTES = [
  {
    category: "🍰 Deserturi & Torturi",
    emojis: ["🎂", "🍰", "🧁", "🥧", "🍨", "🍧", "🍦", "🍮", "🍫", "🍩", "🍪", "🍬", "🍭", "🍯", "🧇", "🥞"]
  },
  {
    category: "🥐 Patiserie & Mic Dejun",
    emojis: ["🥐", "🥖", "🍞", "🥯", "🥨", "🥪", "🥧"]
  },
  {
    category: "🍓 Fructe & Proaspăt",
    emojis: ["🍓", "🍒", "🫐", "🍇", "🍋", "🍑", "🍎", "🍏", "🍌", "🥝", "🥭"]
  },
  {
    category: "☕ Cafea & Băuturi",
    emojis: ["☕", "🧋", "🍵", "🥤", "🥛", "🥂", "🍾", "🍷", "🧃"]
  },
  {
    category: "🎉 Evenimente & Cadouri",
    emojis: ["🎉", "🎁", "🎀", "🕯️", "💐", "🌸", "⭐", "👑", "🪄", "✨"]
  }
];

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function Categories() {
  const { rows, loading, refresh } = useCollection(COLLECTIONS.CATEGORIES, {
    orderByField: "sortOrder"
  });

  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", icon: "🍰", active: true });
  const [activePalette, setActivePalette] = useState("🍰 Deserturi & Torturi");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderToast, setOrderToast] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (rows) {
      // Sort items by sortOrder
      const sorted = [...rows].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
      setItems(sorted);
    }
  }, [rows]);

  if (loading && !items.length) return <Loading />;

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      icon: "🍰",
      active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      icon: item.icon || "🍰",
      active: item.active !== false
    });
    setModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      await updateDocById(COLLECTIONS.CATEGORIES, editingItem.id, {
        name: formData.name.trim(),
        icon: formData.icon || "🍰",
        active: !!formData.active
      });
    } else {
      const generatedSlug = slugify(formData.name);
      const nextSortOrder = items.length + 1;
      await createDoc(
        COLLECTIONS.CATEGORIES,
        {
          name: formData.name.trim(),
          slug: generatedSlug,
          icon: formData.icon || "🍰",
          sortOrder: nextSortOrder,
          active: !!formData.active
        },
        generatedSlug
      );
    }

    setModalOpen(false);
    refresh();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Ești sigur că vrei să ștergi categoria „${name}”?`)) {
      await deleteDocById(COLLECTIONS.CATEGORIES, id);
      refresh();
    }
  };

  const handleToggleActive = async (item) => {
    await updateDocById(COLLECTIONS.CATEGORIES, item.id, {
      active: !item.active
    });
    refresh();
  };

  // Drag and Drop reordering handlers
  const onDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Transparent or ghost image
    e.dataTransfer.setData("text/plain", index);
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const onDragLeave = () => {
    setDragOverIndex(null);
  };

  const onDrop = async (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...items];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign sequential sortOrder
    const withNewOrder = updated.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1
    }));

    setItems(withNewOrder);
    setDraggedIndex(null);
    setSavingOrder(true);

    try {
      // Save all updated sort orders to Firestore in parallel
      await Promise.all(
        withNewOrder.map((cat, idx) =>
          updateDocById(COLLECTIONS.CATEGORIES, cat.id, { sortOrder: idx + 1 })
        )
      );
      setOrderToast(true);
      setTimeout(() => setOrderToast(false), 3000);
    } catch (err) {
      console.error("Failed to reorder categories:", err);
      refresh();
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="crud-module categories-manager">
      <header className="crud-header">
        <div>
          <h2>Categorii produse</h2>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
            Trage categoriile de mânerul <strong>⋮⋮</strong> pentru a rearanja ordinea în care apar în meniu.
          </p>
        </div>

        <div className="crud-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {orderToast && (
            <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32", padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px" }}>
              ✓ Ordinea a fost salvată!
            </span>
          )}
          {savingOrder && (
            <span className="badge" style={{ background: "#fff3e0", color: "#e65100", padding: "6px 12px", borderRadius: "8px", fontSize: "12px" }}>
              Se salvează ordinea…
            </span>
          )}
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Adaugă categorie
          </button>
        </div>
      </header>

      <div className="data-table-toolbar" style={{ margin: "20px 0 16px" }}>
        <input
          type="search"
          placeholder="Caută categorie după nume…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "340px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "#fff" }}
        />
        <span className="muted" style={{ marginLeft: "14px", fontSize: "13px" }}>
          {filteredItems.length} {filteredItems.length === 1 ? "categorie" : "categorii"}
        </span>
      </div>

      <div className="data-table-card" style={{ background: "#fff", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50px", textAlign: "center" }}>Poziție</th>
              <th style={{ width: "40px" }}></th>
              <th style={{ width: "60px", textAlign: "center" }}>Pictogramă</th>
              <th>Nume Categorie</th>
              <th style={{ width: "120px" }}>Stare</th>
              <th style={{ width: "130px", textAlign: "right" }}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((cat, index) => {
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <tr
                  key={cat.id}
                  draggable={!search}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, index)}
                  style={{
                    cursor: search ? "default" : "grab",
                    opacity: isDragging ? 0.35 : 1,
                    backgroundColor: isDragOver ? "#fce4ec" : isDragging ? "#fff5f8" : "transparent",
                    borderTop: isDragOver ? "2px solid #e92d79" : "1px solid var(--border)",
                    transition: "background-color 0.15s ease"
                  }}
                >
                  <td style={{ textAlign: "center", fontWeight: "700", color: "#8c7e82", fontSize: "13px" }}>
                    #{index + 1}
                  </td>
                  <td style={{ textAlign: "center", color: "#b0a0a5", fontSize: "18px", userSelect: "none" }} title="Trage pentru a rearanja">
                    ⋮⋮
                  </td>
                  <td style={{ textAlign: "center", fontSize: "24px" }}>
                    {cat.icon || "🍰"}
                  </td>
                  <td style={{ fontWeight: "600", fontSize: "15px", color: "var(--text)" }}>
                    {cat.name}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleToggleActive(cat)}
                      style={{ padding: "4px 8px" }}
                    >
                      <Badge tone={cat.active ? "ok" : "default"}>
                        {cat.active ? "Activă" : "Inactivă"}
                      </Badge>
                    </button>
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => openEditModal(cat)}
                      style={{ padding: "6px 12px", marginRight: "6px" }}
                    >
                      Editează
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      style={{ padding: "6px 10px", color: "var(--danger)" }}
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filteredItems.length && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                  Nu a fost găsită nicio categorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Modal with Rich Emoji Picker Map */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Editează categoria: ${editingItem.name}` : "Adaugă o nouă categorie"}
      >
        <form onSubmit={handleSaveCategory}>
          <div style={{ display: "grid", gap: "18px" }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: "6px", fontWeight: "700", fontSize: "13px" }}>
                Nume categorie <b style={{ color: "#e92d79" }}>*</b>
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Torturi Aniversare, Monoporții, etc."
                required
                autoFocus
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "15px" }}
              />
            </label>

            {/* Interactive Emoji Map Picker */}
            <div>
              <span style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "13px" }}>
                Alege Emoji reprezentativ
              </span>

              {/* Selected Emoji Showcase */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px", padding: "12px 16px", background: "#fcf8f6", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "36px", lineHeight: 1 }}>{formData.icon || "🍰"}</span>
                <div>
                  <strong style={{ fontSize: "14px", display: "block" }}>Emoji selectat: {formData.icon}</strong>
                  <small style={{ color: "var(--muted)", fontSize: "12px" }}>Apasă pe oricare emoji din colecția de mai jos pentru a-l selecta</small>
                </div>
              </div>

              {/* Emoji Categories Navigation Tabs */}
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", marginBottom: "10px" }}>
                {EMOJI_PALETTES.map((pal) => (
                  <button
                    type="button"
                    key={pal.category}
                    onClick={() => setActivePalette(pal.category)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: "12px",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      background: activePalette === pal.category ? "#e92d79" : "#f5ede8",
                      color: activePalette === pal.category ? "#ffffff" : "#4a353c",
                      fontWeight: activePalette === pal.category ? "700" : "500",
                      border: "none"
                    }}
                  >
                    {pal.category}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))",
                gap: "8px",
                padding: "12px",
                background: "#ffffff",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                maxHeight: "160px",
                overflowY: "auto"
              }}>
                {EMOJI_PALETTES.find((p) => p.category === activePalette)?.emojis.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    style={{
                      fontSize: "22px",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: formData.icon === emoji ? "#fce4ec" : "transparent",
                      border: formData.icon === emoji ? "2px solid #e92d79" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { if (formData.icon !== emoji) e.currentTarget.style.backgroundColor = "#f9f1f3"; }}
                    onMouseLeave={(e) => { if (formData.icon !== emoji) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#e92d79" }}
              />
              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                Categorie activă (vizibilă clienților în aplicație și pe site)
              </span>
            </label>
          </div>

          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: "10px 22px" }}>
              {editingItem ? "Salvează modificările" : "Creează categoria"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
