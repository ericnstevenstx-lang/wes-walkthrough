"use client";
import { useState, useEffect, useCallback } from "react";

const SB = "https://ulyycjtrshpsjpvbztkr.supabase.co";
const FN = (n) => `${SB}/functions/v1/${n}`;

function buildQuery(item) {
  if (!item) return "";
  const p = [];
  const mfr = item.manufacturer || "";
  if (mfr) p.push(String(mfr).split(" / ")[0].split("(")[0].trim());
  const eq = item.equipmentType || item.equipment_type || "";
  if (eq) p.push(String(eq).replace(/ *\(.*\)/, "").trim());
  const cat = item.catalogNumber || item.catalog_number || "";
  const mod = item.modelNumber || item.model_number || "";
  if (cat) p.push(cat);
  else if (mod) p.push(mod);
  const amps = item.amperageRating || item.amperage_rating || "";
  const kva = item.kvaRating || item.kva_rating || "";
  if (amps) p.push(amps + "A");
  else if (kva) p.push(kva + "KVA");
  const v = String(item.voltageRating || item.voltage_rating || "").replace(/[^0-9]/g, "");
  if (v) p.push(v + "V");
  return p.filter(Boolean).join(" ");
}

function PriceBar({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color || "#059669", fontFamily: "monospace" }}>
        {value != null ? `$${Number(value).toLocaleString()}` : "---"}
      </span>
    </div>
  );
}

function CompItem({ comp, source }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
      {comp.image && <img src={comp.image} alt="" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1e293b" }}>{comp.title}</div>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>{source === "ebay" ? (comp.seller || "eBay") : (comp.displayLink || "Dealer")}</div>
      </div>
      <div style={{ fontWeight: 700, color: comp.price ? "#059669" : "#94a3b8", fontFamily: "monospace", flexShrink: 0 }}>
        {comp.price ? `$${Number(comp.price).toLocaleString()}` : "Quote"}
      </div>
      <a href={source === "ebay" ? comp.itemUrl : comp.link} target="_blank" rel="noopener noreferrer"
        style={{ color: "#3b82f6", fontSize: 10, flexShrink: 0, textDecoration: "none" }}>View</a>
    </div>
  );
}

export default function CompPanel({ item }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("ebay");
  const [ebay, setEbay] = useState(null);
  const [web, setWeb] = useState(null);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [fetched, setFetched] = useState(false);

  const query = buildQuery(item);
  const hasData = query.split(" ").length >= 2;

  const fetchEbay = useCallback(async () => {
    if (!query) return;
    setLoading(p => ({ ...p, ebay: true }));
    try {
      const r = await fetch(FN("ebay-comps"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const d = await r.json();
      if (d.error) setErrors(p => ({ ...p, ebay: d.error }));
      setEbay(d);
    } catch (e) { setErrors(p => ({ ...p, ebay: String(e) })); }
    setLoading(p => ({ ...p, ebay: false }));
  }, [query]);

  const fetchWeb = useCallback(async () => {
    if (!query) return;
    setLoading(p => ({ ...p, web: true }));
    try {
      const r = await fetch(FN("web-comps"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, num: 10 }) });
      const d = await r.json();
      if (d.error) setErrors(p => ({ ...p, web: d.error }));
      setWeb(d);
    } catch (e) { setErrors(p => ({ ...p, web: String(e) })); }
    setLoading(p => ({ ...p, web: false }));
  }, [query]);

  const fetchAll = useCallback(() => {
    if (!hasData) return;
    fetchEbay();
    fetchWeb();
    setFetched(true);
  }, [hasData, fetchEbay, fetchWeb]);

  useEffect(() => {
    if (open && !fetched && hasData) fetchAll();
  }, [open, fetched, hasData, fetchAll]);

  const grade = item?.grade || "B";
  const gm = { A: 1.0, B: 0.75, C: 0.45, D: 0.15 }[grade] || 0.75;
  const medians = [ebay?.stats?.median, web?.stats?.median].filter(Boolean);
  const recommended = medians.length > 0 ? Math.round((medians.reduce((a, b) => a + b, 0) / medians.length) * gm) : null;

  const tabBtn = (id, label, badge) => (
    <button onClick={() => setTab(id)} style={{
      padding: "6px 12px", fontSize: 12, fontWeight: tab === id ? 700 : 500,
      background: tab === id ? "#3d5e3f" : "#f1f5f9", color: tab === id ? "#fff" : "#64748b",
      border: "none", borderRadius: 4, cursor: "pointer", position: "relative",
    }}>
      {label}
      {badge > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  const exportCSV = () => {
    const rows = [];
    (ebay?.comps || []).forEach(c => rows.push({ Source: "eBay", Title: c.title, Price: c.price || "", URL: c.itemUrl || "" }));
    (web?.comps || []).forEach(c => rows.push({ Source: c.displayLink || "Dealer", Title: c.title, Price: c.price || "Quote", URL: c.link || "" }));
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const esc = v => { const s = String(v == null ? "" : v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `comps_${query.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: open ? "#ecfdf5" : "#f8fafc", border: `1px solid ${open ? "#a7f3d0" : "#e2e8f0"}`,
        borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1e293b",
      }}>
        <span>
          <span style={{ marginRight: 6 }}>[=]</span>
          Market Comps
          {recommended && <span style={{ marginLeft: 8, color: "#059669", fontFamily: "monospace" }}>~${recommended.toLocaleString()}</span>}
          {ebay?.stats && <span style={{ marginLeft: 6, fontSize: 11, color: "#94a3b8" }}>({ebay.stats.count} eBay)</span>}
        </span>
        <span style={{ fontSize: 16, color: "#94a3b8" }}>{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <div style={{ background: "#fff", borderRadius: 8, padding: 12, marginTop: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "55%" }}>
              {query || "Need more specs"}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={exportCSV} disabled={!ebay?.comps?.length && !web?.comps?.length}
                style={{ padding: "3px 8px", fontSize: 10, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", color: "#64748b" }}>CSV</button>
              <button onClick={fetchAll} disabled={!hasData || loading.ebay}
                style={{ padding: "3px 8px", fontSize: 10, background: "#3d5e3f", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                {loading.ebay || loading.web ? "..." : "Refresh"}
              </button>
            </div>
          </div>

          {recommended && (
            <div style={{
              padding: "10px 14px", background: "#ecfdf5", borderRadius: 6, marginBottom: 8,
              border: "1px solid #a7f3d0", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>RECOMMENDED (Grade {grade})</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", fontFamily: "monospace" }}>${recommended.toLocaleString()}</div>
            </div>
          )}

          {(ebay?.stats || web?.stats) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div style={{ background: "#f8fafc", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#3d5e3f", marginBottom: 4 }}>eBay ({ebay?.stats?.count || 0})</div>
                {ebay?.stats ? <>
                  <PriceBar label="Low" value={ebay.stats.low} color="#ef4444" />
                  <PriceBar label="Median" value={ebay.stats.median} color="#d97706" />
                  <PriceBar label="High" value={ebay.stats.high} color="#3b82f6" />
                </> : <div style={{ fontSize: 11, color: "#94a3b8", padding: 8 }}>No data</div>}
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", marginBottom: 4 }}>Dealers ({web?.stats?.count || 0})</div>
                {web?.stats ? <>
                  <PriceBar label="Low" value={web.stats.low} color="#ef4444" />
                  <PriceBar label="Median" value={web.stats.median} color="#d97706" />
                  <PriceBar label="High" value={web.stats.high} color="#3b82f6" />
                </> : <div style={{ fontSize: 11, color: "#94a3b8", padding: 8 }}>{loading.web ? "Loading..." : "No data"}</div>}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {tabBtn("ebay", "eBay", ebay?.comps?.length || 0)}
            {tabBtn("web", "Dealers", web?.comps?.length || 0)}
            {tabBtn("links", "Quick Links", 0)}
          </div>

          {tab === "ebay" && (
            <div>
              {errors.ebay && <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 4 }}>{errors.ebay}</div>}
              {loading.ebay && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>Searching eBay...</div>}
              {ebay?.comps?.length > 0 ? ebay.comps.slice(0, 8).map((c, i) => <CompItem key={i} comp={c} source="ebay" />)
                : !loading.ebay && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>{hasData ? "No results" : "Need equipment details"}</div>}
            </div>
          )}

          {tab === "web" && (
            <div>
              {errors.web && <div style={{ fontSize: 11, color: "#ef4444", marginBottom: 4 }}>{errors.web}</div>}
              {loading.web && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>Searching dealers...</div>}
              {web?.comps?.length > 0 ? web.comps.slice(0, 8).map((c, i) => <CompItem key={i} comp={c} source="web" />)
                : !loading.web && <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>{hasData ? "No results" : "Need equipment details"}</div>}
            </div>
          )}

          {tab === "links" && query && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { l: "eBay", u: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_ItemCondition=3000|7000` },
                { l: "SurplusRecord", u: `https://surplusrecord.com/listings/?keyword=${encodeURIComponent(query)}` },
                { l: "GovPlanet", u: `https://www.govplanet.com/search?q=${encodeURIComponent(query)}` },
                { l: "Bay Power", u: `https://www.baypower.com/?s=${encodeURIComponent(query)}` },
              ].map(s => (
                <a key={s.l} href={s.u} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "6px 12px", background: "#f1f5f9", color: "#3b82f6", borderRadius: 4, fontSize: 12, textDecoration: "none", border: "1px solid #e2e8f0" }}>
                  {s.l} ->
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
