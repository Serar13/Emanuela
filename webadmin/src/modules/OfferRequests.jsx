import { useState } from "react";
import { useCollection } from "../hooks/useCollection";
import { updateDocById } from "../services/firestore";
import { COLLECTIONS, OFFER_REQUEST_STATUSES } from "../services/collections";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import { Loading, ErrorState, Badge, formatDate, statusTone } from "../components/ui";

export default function OfferRequests() {
  const { rows, loading, error } = useCollection(COLLECTIONS.OFFER_REQUESTS);
  const [details, setDetails] = useState(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const setStatus = (row, status) => updateDocById(COLLECTIONS.OFFER_REQUESTS, row.id, { status });

  const handleOpenDetails = (row) => {
    setDetails(row);
    setQuotePrice(row.quotedPrice || "");
    setQuoteNotes(row.quoteNotes || "");
  };

  const handleSaveQuote = async () => {
    if (!details) return;
    setIsSavingQuote(true);
    try {
      await updateDocById(COLLECTIONS.OFFER_REQUESTS, details.id, {
        status: "quoted",
        quotedPrice: quotePrice,
        quoteNotes: quoteNotes,
        quotedAt: new Date().toISOString()
      });
      setDetails((prev) => ({
        ...prev,
        status: "quoted",
        quotedPrice: quotePrice,
        quoteNotes: quoteNotes
      }));
      alert("Oferta a fost salvată cu succes!");
    } catch (err) {
      console.error(err);
      alert("Eroare la salvarea ofertei: " + err.message);
    } finally {
      setIsSavingQuote(false);
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });

  const columns = [
    { key: "customerName", label: "Client", sortable: true },
    {
      key: "eventType",
      label: "Tip / Produs",
      render: (r) => (
        <div>
          <span>{r.productName || r.eventType || "—"}</span>
          {r.source === "mobile_ai_chat" && (
            <span style={{ marginLeft: 6, fontSize: "0.75rem", background: "#fdf0f4", color: "#E92D79", padding: "2px 6px", borderRadius: 4, fontWeight: "bold" }}>
              🤖 Chat AI
            </span>
          )}
        </div>
      )
    },
    { key: "phone", label: "Telefon" },
    { key: "createdAt", label: "Primită", render: (r) => formatDate(r.createdAt) },
    {
      key: "quotedPrice",
      label: "Ofertă",
      render: (r) => (r.quotedPrice ? <strong style={{ color: "#2e7d32" }}>{r.quotedPrice} RON</strong> : <span style={{ color: "#888" }}>În așteptare</span>)
    },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <button className="btn btn-xs" onClick={() => handleOpenDetails(r)}>
          Vezi discuția
        </button>
      )
    },
    {
      key: "_set",
      label: "Schimbă status",
      render: (r) => (
        <select value={r.status} onChange={(e) => setStatus(r, e.target.value)} className="status-selector">
          {OFFER_REQUEST_STATUSES.map((s) => (
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
      <DataTable
        columns={columns}
        rows={sorted}
        searchKeys={["customerName", "eventType", "productName", "phone"]}
        emptyMessage="Nicio cerere de ofertă sau conversație AI înregistrată."
      />
      {details && (
        <Modal title={`Cerere & Discuție · ${details.customerName}`} onClose={() => setDetails(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <p><strong>Email:</strong> {details.email || "—"}</p>
            <p><strong>Telefon:</strong> {details.phone || "—"}</p>
            <p><strong>Produs solicitat:</strong> {details.productName || "—"}</p>
            <p><strong>Sursă:</strong> {details.source === "mobile_ai_chat" ? "Aplicație Mobilă (Agent AI)" : (details.source || "Formular Web")}</p>
          </div>

          {/* AI Chat Transcript or Message */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>
              💬 Istoric Conversație cu Clientul:
            </h4>
            {Array.isArray(details.messages) && details.messages.length > 0 ? (
              <div style={{ maxHeight: "280px", overflowY: "auto", background: "#faf7f8", padding: "12px", borderRadius: "8px", border: "1px solid #eee" }}>
                {details.messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: m.sender === "user" ? "flex-end" : "flex-start"
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#888", marginBottom: "2px" }}>
                      {m.sender === "user" ? "👤 Client" : "🤖 Agent AI"} ({m.timestamp || "—"})
                    </span>
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        maxWidth: "80%",
                        fontSize: "0.85rem",
                        lineHeight: "1.4",
                        background: m.sender === "user" ? "#E92D79" : "#ffffff",
                        color: m.sender === "user" ? "#ffffff" : "#241A1C",
                        border: m.sender === "user" ? "none" : "1px solid #e0d0d8"
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : details.aiChatTranscript ? (
              <pre style={{ whiteSpace: "pre-wrap", background: "#f8f9fa", padding: "12px", borderRadius: "8px", fontSize: "0.85rem" }}>
                {details.aiChatTranscript}
              </pre>
            ) : (
              <p className="msg-block">{details.message || "Fără mesaj adițional."}</p>
            )}
          </div>

          {/* Quoting Section for the Shop / Admin */}
          <div style={{ background: "#fdf8f4", border: "1px solid #f2e2d0", borderRadius: "8px", padding: "14px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#b85d19", fontSize: "0.95rem" }}>
              🏷️ Formulează Ofertă de Preț pentru Client:
            </h4>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Preț propus (RON):</label>
              <input
                type="number"
                placeholder="Ex: 350"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                style={{ width: "120px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                Detalii ofertă / componență / condiții:
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Tort 3 kg mousse ciocolată & fructe, decor personalizat inclus, ridicare sâmbătă la ora 14:00."
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveQuote}
              disabled={isSavingQuote || !quotePrice}
              style={{ background: "#E92D79", borderColor: "#E92D79", color: "#fff" }}
            >
              {isSavingQuote ? "Se salvează..." : "Salvează Oferta & Marcat ca Ofertat (Quoted)"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
