const LINKS_KEY = "duy_bio_links_v1";
const CATALOG_KEY = "duy_bio_catalog_v1";
const DEFAULT_LINKS = [
  { id: "tg-channel", title: "Kênh thông báo chính thức", subtitle: "t.me/ipahackgameioss", url: "https://t.me/ipahackgameioss", icon: "📢", accent: "#229ed9" },
  { id: "tg-chat", title: "Nhóm chat", subtitle: "t.me/ipahackgameios", url: "https://t.me/ipahackgameios", icon: "💬", accent: "#2ea6ff" },
  { id: "tg-admin", title: "Liên hệ Admin", subtitle: "@lethanhduyy", url: "https://t.me/lethanhduyy", icon: "👤", accent: "#7c5cff" }
];
function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
const Bio = {
  normalizeLinks(list) {
    return (list || []).map((item, i) => ({
      id: item.id || "link-" + Date.now() + "-" + i,
      title: (item.title || "Liên kết").trim(),
      subtitle: (item.subtitle || item.url || "").trim(),
      url: (item.url || "#").trim(),
      icon: item.icon || "🔗",
      accent: item.accent || "#7c5cff",
      kind: item.kind || "social"
    }));
  },
  normalizeCatalog(list) {
    return (list || []).map((item, i) => ({
      id: item.id || "item-" + Date.now() + "-" + i,
      group: (item.group || "esign").toLowerCase() === "ksign" ? "ksign" : "esign",
      title: (item.title || "Liên kết").trim(),
      subtitle: (item.subtitle || "").trim(),
      url: (item.url || "").trim()
    }));
  },
  read(key) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  write(key, payload) { localStorage.setItem(key, JSON.stringify(payload)); return payload; },
  async fetchJSON(path) {
    try { const res = await fetch(path + "?ts=" + Date.now(), { cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
  },
  async getLinks() {
    const local = this.read(LINKS_KEY);
    if (local && (local.links || local).length) return this.normalizeLinks(local.links || local);
    const file = await this.fetchJSON("links.json");
    if (file && (file.links || file).length) return this.normalizeLinks(file.links || file);
    return this.normalizeLinks(DEFAULT_LINKS);
  },
  saveLinks(links) { return this.write(LINKS_KEY, { updatedAt: new Date().toISOString(), links: this.normalizeLinks(links) }); },
  async getCatalog() {
    const local = this.read(CATALOG_KEY);
    if (local && Array.isArray(local.items)) return this.normalizeCatalog(local.items);
    const file = await this.fetchJSON("catalog.json");
    if (file && Array.isArray(file.items)) return this.normalizeCatalog(file.items);
    return [];
  },
  saveCatalog(items) { return this.write(CATALOG_KEY, { updatedAt: new Date().toISOString(), items: this.normalizeCatalog(items) }); },
  renderLinks(selector, links) {
    const root = document.querySelector(selector);
    if (!root) return;
    if (!links.length) { root.innerHTML = '<div class="link-row"><div class="link-copy"><strong>Chưa có liên kết</strong></div></div>'; return; }
    root.innerHTML = links.map(item => `<a class="link-row" href="${item.url}" target="_blank" rel="noopener"><div class="ico" style="background:${item.accent}22">${item.icon}</div><div class="link-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle || item.url)}</span></div><div class="go">↗</div></a>`).join("");
  },
  renderCatalog(selector, items, group) {
    const root = document.querySelector(selector);
    if (!root) return;
    const filtered = items.filter(x => x.group === group);
    if (!filtered.length) { root.innerHTML = '<div class="empty">Chưa có mục nào. Vào Admin (key: duyle) để up link.</div>'; return; }
    root.innerHTML = filtered.map(item => `<div class="install-card"><div class="badge ${item.group === "ksign" ? "k" : ""}">${item.group === "ksign" ? "K" : "E"}</div><div class="install-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle || item.group.toUpperCase())}</span></div><a class="install-btn" href="${item.url}" target="_blank" rel="noopener">CÀI ĐẶT</a></div>`).join("");
  }
};
