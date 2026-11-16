import { useState } from "react";
import { useCollection } from "../hooks/useCollection";
import { updateDocById } from "../services/firestore";
import { COLLECTIONS, ORDER_STATUSES } from "../services/collections";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { Loading, ErrorState, Badge, formatMoney, formatDate, statusTone } from "../components/ui";

export default function Orders() {
  const { rows, loading, error } = useCollection(COLLECTIONS.ORDERS);
  const { rows: locations } = useCollection(COLLECTIONS.LOCATIONS);
  const [details, setDetails] = useState(null);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const locName = (id) => locations.find((l) => l.id === id)?.name || id || "—";
  const setStatus = (row, status) => updateDocById(COLLECTIONS.ORDERS, row.id, { status });

  // Newest first.
  const sorted = [...rows].sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });

  const columns = [
    { key: "id", label: "ID", render: (r) => <code>{r.id.slice(0, 8)}</code> },
    {
      key: "customerName",
      label: "Client",
      sortable: true,
      render: (r) => (
        <div>
          <span>{r.customerName || "—"}</span>
          {r.isGiftSurprise && (
            <span style={{ marginLeft: 6, fontSize: "0.75rem", background: "#fff3e0", color: "#e65100", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>
              🎁 Cadou
            </span>
          )}
        </div>
      )
    },
    {
      key: "items",
      label: "Produse",
      render: (r) => (
        <button className="btn btn-xs" onClick={() => setDetails(r)}>
          {(r.items?.length || 0)} produse
        </button>
      )
    },
    { key: "total", label: "Total", sortable: true, sortValue: (r) => Number(r.total) || 0, render: (r) => formatMoney(r.total) },
    {
      key: "source",
      label: "Sursă / Tip",
      render: (r) => (
        <div>
          <Badge tone={r.source === "mobile" ? "info" : "default"}>{r.source || "—"}</Badge>
          <span style={{ display: "block", fontSize: "0.75rem", color: "#666", marginTop: 2 }}>
            {r.fulfillmentType === "delivery" ? "🚗 Livrare" : "🏢 Ridicare"}
          </span>
        </div>
      )
    },
    { key: "locationId", label: "Locație / Zonă", render: (r) => r.locationName || locName(r.locationId) },
    { key: "createdAt", label: "Creată", sortable: true, sortValue: (r) => r.createdAt?.toMillis?.() ?? 0, render: (r) => formatDate(r.createdAt) },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge>
    },
    {
      key: "_set",
      label: "Schimbă status",
      render: (r) => (
        <select value={r.status} onChange={(e) => setStatus(r, e.target.value)} className="status-selector">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )
    }
  ];

  return (
    <div className="module">
      <DataTable columns={columns} rows={sorted} searchKeys={["customerName", "id"]} emptyMessage="Nicio comandă încă." />
      {details && (
        <Modal title={`Comandă ${details.id.slice(0, 8)}`} onClose={() => setDetails(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <p><strong>Client:</strong> {details.customerName || "—"} ({details.customerPhone || "Fără telefon"})</p>
            <p><strong>Sursă:</strong> {details.source} · <strong>Modalitate:</strong> {details.fulfillmentType === "delivery" ? "Livrare la domiciliu" : "Ridicare din locație"}</p>
            <p><strong>Locație:</strong> {details.locationName || locName(details.locationId)}</p>
            <p><strong>Status Plată:</strong> {details.paymentStatus === "paid_stripe" ? "💳 Plătit Online (Stripe)" : "💵 La primire (Numerar / POS)"}</p>
          </div>

          {/* Special Surprise Gift Box */}
          {details.isGiftSurprise && details.giftDetails && (
            <div style={{ background: "#fffde7", border: "1.5px dashed #fbc02d", borderRadius: 8, padding: 14, margin: "14px 0" }}>
              <h4 style={{ margin: "0 0 6px 0", color: "#f57f17", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🎁</span> COMANDĂ CADOU SURPRIZĂ CU FELICITARE
              </h4>
              <p style={{ margin: "4px 0" }}>
                <strong>Destinatar:</strong> {details.giftDetails.recipientName || "—"} ({details.giftDetails.recipientPhone || "Fără telefon"})
              </p>
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#555" }}>
                  💌 Text de transcris manual pe felicitarea caligrafică:
                </label>
                <div style={{ background: "#ffffff", padding: "10px", borderRadius: "6px", fontStyle: "italic", border: "1px solid #e0e0e0", marginTop: "4px", fontSize: "0.9rem", color: "#222" }}>
                  "{details.giftDetails.cardMessage || 'Fără mesaj'}"
                </div>
              </div>
              {details.giftDetails.isAnonymous && (
                <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "#d84315", fontWeight: "bold" }}>
                  🔒 Notă: Clientul dorește ca expeditorul să rămână anonim până la deschiderea felicitării!
                </p>
              )}
            </div>
          )}

          {/* Delivery Address Details */}
          {details.deliveryAddress && (
            <div style={{ background: "#f8f9fa", padding: "10px", borderRadius: "6px", marginBottom: "14px", border: "1px solid #eee" }}>
              <p style={{ margin: 0 }}><strong>Adresă Livrare:</strong> {details.deliveryAddress.address}, {details.deliveryAddress.city}</p>
              {details.deliveryAddress.notes && <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#666" }}><strong>Instrucțiuni curier:</strong> {details.deliveryAddress.notes}</p>}
            </div>
          )}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Produs</th>
                <th>Cant.</th>
                <th>Preț</th>
              </tr>
            </thead>
            <tbody>
              {(details.items || []).map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td>{it.quantity}</td>
                  <td>{formatMoney(it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="modal-total">Total: {formatMoney(details.total)}</p>
        </Modal>
      )}
    </div>
  );
}
