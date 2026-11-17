import { useState, useMemo } from "react";
import { useCollection } from "../hooks/useCollection";
import { COLLECTIONS } from "../services/collections";
import { Loading, formatMoney } from "../components/ui";

export default function Statistics() {
  const { rows: locations, loading: locsLoading } = useCollection(COLLECTIONS.LOCATIONS);
  const { rows: orders, loading: ordersLoading } = useCollection(COLLECTIONS.ORDERS);
  const { rows: reservations, loading: resLoading } = useCollection(COLLECTIONS.RESERVATIONS);
  const { rows: events, loading: eventsLoading } = useCollection(COLLECTIONS.OFFER_REQUESTS);
  const { rows: reviews, loading: reviewsLoading } = useCollection(COLLECTIONS.REVIEWS);

  const [selectedLocation, setSelectedLocation] = useState("all");
  const [period, setPeriod] = useState("all");
  const [referenceTime] = useState(() => Date.now());

  const loading = locsLoading || ordersLoading || resLoading || eventsLoading || reviewsLoading;

  // Filter items by location and period
  const stats = useMemo(() => {
    if (!orders || !reservations) return null;

    const filterByDate = (dateVal) => {
      if (period === "all" || !dateVal) return true;
      const d = new Date(dateVal).getTime();
      if (isNaN(d)) return true;
      if (period === "today") return referenceTime - d <= 24 * 60 * 60 * 1000;
      if (period === "week") return referenceTime - d <= 7 * 24 * 60 * 60 * 1000;
      if (period === "month") return referenceTime - d <= 30 * 24 * 60 * 60 * 1000;
      return true;
    };

    // Filter orders
    const filteredOrders = orders.filter((o) => {
      const matchLoc = selectedLocation === "all" || o.storeId === selectedLocation || o.locationId === selectedLocation;
      const matchDate = filterByDate(o.createdAt?.toDate ? o.createdAt.toDate() : o.createdAt);
      return matchLoc && matchDate;
    });

    // Filter reservations
    const filteredReservations = reservations.filter((r) => {
      const matchLoc = selectedLocation === "all" || r.storeId === selectedLocation || r.locationId === selectedLocation;
      const matchDate = filterByDate(r.date || r.createdAt);
      return matchLoc && matchDate;
    });

    // Calculations
    const totalRevenue = filteredOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const completedOrders = filteredOrders.filter((o) => o.status === "delivered" || o.status === "ready").length;
    const avgOrderValue = filteredOrders.length ? totalRevenue / (filteredOrders.length || 1) : 0;

    const totalGuests = filteredReservations.reduce((sum, r) => sum + (Number(r.guests) || Number(r.persons) || 2), 0);
    const confirmedReservations = filteredReservations.filter((r) => r.status === "confirmed").length;

    // Per-location breakdown for all locations
    const locBreakdown = (locations || []).map((loc) => {
      const locOrders = orders.filter((o) => o.storeId === loc.id || o.locationId === loc.id);
      const locRev = locOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const locRes = reservations.filter((r) => r.storeId === loc.id || r.locationId === loc.id);
      return {
        id: loc.id,
        name: loc.name?.replace("Laborator Emanuela ", "") || loc.id,
        revenue: locRev,
        ordersCount: locOrders.length,
        reservationsCount: locRes.length
      };
    });

    // Top selling products based on orders items
    const productCounts = {};
    filteredOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.title || "Produs";
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          if (!productCounts[name]) productCounts[name] = { name, count: 0, revenue: 0 };
          productCounts[name].count += qty;
          productCounts[name].revenue += price * qty;
        });
      }
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Reviews summary
    const avgRating = reviews?.length
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : "5.0";

    const uniqueClientsCount = new Set([
      ...filteredOrders.map((o) => o.userId || o.customerName),
      ...filteredReservations.map((r) => r.userId || r.customerName)
    ].filter(Boolean)).size;

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      completedOrders,
      avgOrderValue,
      totalReservations: filteredReservations.length,
      totalGuests,
      confirmedReservations,
      locBreakdown,
      topProducts,
      avgRating,
      totalEvents: events?.length || 0,
      totalUsers: uniqueClientsCount
    };
  }, [orders, reservations, locations, events, reviews, selectedLocation, period, referenceTime]);

  if (loading || !stats) return <Loading />;

  const activeLocObj = locations?.find((l) => l.id === selectedLocation);
  const locTitle = selectedLocation === "all" ? "Toate locațiile (Consolidat)" : (activeLocObj?.name || selectedLocation);

  return (
    <div className="statistics-module" style={{ display: "grid", gap: "24px" }}>
      {/* Top Filter Bar */}
      <div
        className="stats-filter-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "16px 20px",
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text)" }}>📍 Filtrează după locație:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{
              padding: "9px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "#faf6f4",
              fontWeight: "600",
              fontSize: "14px",
              color: "var(--text)",
              cursor: "pointer"
            }}
          >
            <option value="all">🌟 Toate locațiile (Rețea completă)</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)", marginRight: "4px" }}>Perioadă:</span>
          {[
            { id: "all", label: "Tot timpul" },
            { id: "month", label: "Ultimele 30 zile" },
            { id: "week", label: "Ultimele 7 zile" },
            { id: "today", label: "Azi" }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn btn-ghost"
              onClick={() => setPeriod(p.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: period === p.id ? "700" : "500",
                background: period === p.id ? "#e92d79" : "#f4ece8",
                color: period === p.id ? "#ffffff" : "var(--text)",
                border: "none"
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
        {/* Revenue */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vânzări totale</span>
            <span style={{ fontSize: "24px" }}>💰</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#24161a", letterSpacing: "-0.02em" }}>
            {formatMoney(stats.totalRevenue)}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#6a7b6a" }}>
            Medie per comandă: <strong>{formatMoney(stats.avgOrderValue)}</strong>
          </p>
        </div>

        {/* Orders */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comenzi plasate</span>
            <span style={{ fontSize: "24px" }}>🛍️</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#24161a", letterSpacing: "-0.02em" }}>
            {stats.totalOrders}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--muted)" }}>
            Finalizate / Onorate: <strong style={{ color: "#2e7d32" }}>{stats.completedOrders}</strong>
          </p>
        </div>

        {/* Reservations */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rezervări mese</span>
            <span style={{ fontSize: "24px" }}>📅</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#24161a", letterSpacing: "-0.02em" }}>
            {stats.totalReservations}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--muted)" }}>
            Oaspeți estimați: <strong>{stats.totalGuests} persoane</strong>
          </p>
        </div>

        {/* Customer Satisfaction */}
        <div style={{ background: "#ffffff", padding: "22px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Satisfacție clienți</span>
            <span style={{ fontSize: "24px" }}>⭐</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#e6a655", letterSpacing: "-0.02em" }}>
            {stats.avgRating} <small style={{ fontSize: "16px", color: "#8c7e82" }}>/ 5.0</small>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--muted)" }}>
            Comunitate: <strong>{stats.totalUsers} clienți înregistrați</strong>
          </p>
        </div>
      </div>

      {/* Two Column Section: Location Performance + Top Bestsellers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        {/* Performance by Location */}
        <div style={{ background: "#ffffff", padding: "26px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>
            📊 Comparație performanță per locație
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--muted)" }}>
            Distribuția veniturilor și a comenzilor între locațiile fizice Emanuela
          </p>

          <div style={{ display: "grid", gap: "16px" }}>
            {stats.locBreakdown.map((loc) => {
              const maxRev = Math.max(...stats.locBreakdown.map((l) => l.revenue), 1);
              const pct = Math.round((loc.revenue / maxRev) * 100);

              return (
                <div key={loc.id} style={{ display: "grid", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                    <span style={{ fontWeight: "700", color: "var(--text)" }}>{loc.name}</span>
                    <span style={{ fontWeight: "800", color: "#e92d79" }}>{formatMoney(loc.revenue)}</span>
                  </div>

                  <div style={{ height: "10px", background: "#f0e5e0", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(pct, 6)}%`,
                        background: "linear-gradient(90deg, #e92d79 0%, #ff6b9d 100%)",
                        borderRadius: "999px",
                        transition: "width 0.5s ease"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
                    <span>{loc.ordersCount} comenzi</span>
                    <span>{loc.reservationsCount} rezervări</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Bestsellers */}
        <div style={{ background: "#ffffff", padding: "26px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>
            🍰 Cele mai apreciate delicii (Top vânzări)
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--muted)" }}>
            Produsele cele mai comandate pentru {locTitle}
          </p>

          <div style={{ display: "grid", gap: "14px" }}>
            {stats.topProducts.map((prod, index) => (
              <div
                key={prod.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#faf6f4",
                  borderRadius: "10px",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#e0d0d5",
                      color: "#24161a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "12px"
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <strong style={{ display: "block", fontSize: "14px", color: "var(--text)" }}>{prod.name}</strong>
                    <small style={{ color: "var(--muted)", fontSize: "12px" }}>{prod.count} porții comandate</small>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "14px", color: "#24161a" }}>{formatMoney(prod.revenue)}</strong>
                </div>
              </div>
            ))}

            {!stats.topProducts.length && (
              <p style={{ color: "var(--muted)", fontSize: "13px", textAlign: "center", padding: "30px 0" }}>
                Nu există date despre produse în intervalul selectat.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
