import { useState } from "react";
import { useCollection } from "../hooks/useCollection";
import { COLLECTIONS } from "../services/collections";
import { sendPushNotification } from "../services/pushService";
import DataTable from "../components/DataTable";
import { Loading, ErrorState, Badge, formatDate } from "../components/ui";

const TEMPLATES = [
  {
    title: "⚡ Reducere Flash 20% la Torturi!",
    body: "Folosește codul EMANUELA20 la orice comandă plasată astăzi în laborator.",
    category: "flash",
    targetScreen: "Offers"
  },
  {
    title: "🤫 Rețetă Secretă Nouă Deblocată!",
    body: "Descoperă noul mousse artizanal cu fistic și fructe de pădure în meniul secret.",
    category: "secret",
    targetScreen: "Menu"
  },
  {
    title: "🍒 Degustare Gratuită Vineri!",
    body: "Te așteptăm la ora 18:00 la Târgu Mureș pentru noile sortimente de sezon.",
    category: "event",
    targetScreen: "Reservations"
  },
  {
    title: "🎂 Ai o felie cadou în cont!",
    body: "Verifică secțiunea de fidelitate din aplicație pentru a-ți activa cadoul dulce.",
    category: "loyalty",
    targetScreen: "Profile"
  }
];

export default function PushNotifications() {
  const { rows, loading, error, refresh } = useCollection(COLLECTIONS.NOTIFICATIONS);
  const { rows: users } = useCollection(COLLECTIONS.USERS);
  const { rows: tokens } = useCollection(COLLECTIONS.PUSH_TOKENS);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("flash");
  const [targetScreen, setTargetScreen] = useState("Offers");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setCategory(tpl.category);
    setTargetScreen(tpl.targetScreen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert("Te rugăm să completezi titlul și mesajul notificării.");
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      const res = await sendPushNotification({
        title: title.trim(),
        body: body.trim(),
        category,
        targetScreen,
        sentBy: "Webadmin"
      });

      setFeedback({
        type: "success",
        msg: `Notificarea a fost trimisă cu succes! Înregistrată pentru ${res.recipientsCount} dispozitive active.`
      });

      setTitle("");
      setBody("");
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        msg: `Eroare la trimitere: ${err.message}`
      });
    } finally {
      setSending(false);
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });

  const columns = [
    { key: "title", label: "Titlu", sortable: true },
    { key: "body", label: "Mesaj Notificare" },
    {
      key: "category",
      label: "Categorie",
      render: (r) => (
        <span style={{ fontSize: "0.8rem", textTransform: "capitalize", padding: "2px 8px", borderRadius: 4, background: "#fdf0f4", color: "#E92D79", fontWeight: "bold" }}>
          {r.category || "General"}
        </span>
      )
    },
    { key: "targetScreen", label: "Destinație", render: (r) => r.targetScreen || "Acasă" },
    { key: "sentBy", label: "Trimis de", render: (r) => r.sentBy || "Admin" },
    { key: "createdAt", label: "Dată Trimitere", render: (r) => formatDate(r.createdAt) },
    {
      key: "status",
      label: "Status",
      render: () => <Badge tone="success">Trimisă 🟢</Badge>
    }
  ];

  return (
    <div className="module">
      {/* Top Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: "1.5rem" }}>🔔</span>
          <h3 style={{ margin: "6px 0 2px 0", fontSize: "1.3rem", color: "#241A1C" }}>{rows.length}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#777" }}>Campanii Push Trimise</p>
        </div>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: "1.5rem" }}>📱</span>
          <h3 style={{ margin: "6px 0 2px 0", fontSize: "1.3rem", color: "#E92D79" }}>{tokens.length || users.length || "Activ"}</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#777" }}>Dispozitive / Membri Conectați</p>
        </div>
        <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <h3 style={{ margin: "6px 0 2px 0", fontSize: "1.3rem", color: "#2e7d32" }}>Instant (Expo)</h3>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#777" }}>Livrare Push în Timp Real</p>
        </div>
      </div>

      {/* Main Composer Box */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Form Card */}
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", color: "#241A1C" }}>
            📢 Compune o Notificare Push Nouă
          </h3>

          {/* Quick template buttons */}
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
              Șabloane rapide sugerate:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{ background: "#f8f9fa", border: "1px solid #ddd", fontSize: "0.75rem", borderRadius: "14px" }}
                >
                  {tpl.title.split(" ")[0]} {tpl.title.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend}>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
                Titlu Notificare:
              </label>
              <input
                type="text"
                placeholder="Ex: 🍰 Reducere 20% la Torturile cu Fructe!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                required
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
                Mesaj / Text Push:
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Folosește codul EMANUELA20 la orice comandă online sau în laborator!"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
                  Categorie:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                  <option value="flash">⚡ Ofertă Flash</option>
                  <option value="secret">🤫 Meniu Secret</option>
                  <option value="event">🍒 Eveniment / Degustare</option>
                  <option value="loyalty">🎁 Fidelitate / Cadou</option>
                  <option value="general">📢 Anunț General</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "4px" }}>
                  Ecran la deschidere în App:
                </label>
                <select
                  value={targetScreen}
                  onChange={(e) => setTargetScreen(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                  <option value="Offers">Oferte & Promoții</option>
                  <option value="Menu">Catalog Meniu</option>
                  <option value="Reservations">Rezervare Masă</option>
                  <option value="Profile">Profil & Portofel</option>
                </select>
              </div>
            </div>

            {feedback && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "6px",
                  marginBottom: "14px",
                  fontSize: "0.85rem",
                  background: feedback.type === "success" ? "#e8f5e9" : "#ffebee",
                  color: feedback.type === "success" ? "#2e7d32" : "#c62828"
                }}
              >
                {feedback.msg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{
                width: "100%",
                background: "#E92D79",
                borderColor: "#E92D79",
                padding: "12px",
                fontSize: "0.95rem",
                fontWeight: "bold"
              }}
            >
              {sending ? "Se trimite notificarea push…" : "🚀 Trimite Notificarea Push Către Toți Utilizatorii"}
            </button>
          </form>
        </div>

        {/* Live Device Preview Card */}
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#777", textTransform: "uppercase", letterSpacing: "1px" }}>
            👁️ Previzualizare Push pe Telefon
          </h4>

          {/* Smartphone Banner Mockup */}
          <div
            style={{
              background: "#1f1f23",
              color: "#fff",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              marginTop: "16px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "1rem" }}>🍰</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "0.5px", color: "#f2bf78" }}>
                  LABORATOR EMANUELA
                </span>
              </div>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)" }}>acum</span>
            </div>

            <div style={{ fontWeight: "bold", fontSize: "0.9rem", marginBottom: "4px", color: "#fff" }}>
              {title.trim() || "Titlu notificare demo..."}
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.85)", lineHeight: "1.3" }}>
              {body.trim() || "Mesajul notificării push va apărea direct pe ecranul blocat sau în bara de notificări a clientului."}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <span style={{ fontSize: "0.7rem", color: "#f2bf78", background: "rgba(242,191,120,0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                Deschide: {targetScreen}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "24px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", fontSize: "0.8rem", color: "#666" }}>
            ℹ️ Notificarea este transmisă prin protocolul securizat Expo Push către toate telefoanele care au aplicația instalată și este afișată instantaneu și în aplicația mobilă.
          </div>
        </div>
      </div>

      {/* History DataTable */}
      <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", color: "#241A1C" }}>
        📜 Istoric Notificări Push Trimise
      </h3>
      <DataTable
        columns={columns}
        rows={sorted}
        searchKeys={["title", "body", "category", "sentBy"]}
        emptyMessage="Nu a fost trimisă nicio notificare push încă."
      />
    </div>
  );
}
