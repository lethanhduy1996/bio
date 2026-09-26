const STORAGE_KEY = "duy_bio_links_v1";
const DEFAULT_LINKS = [
  {
    id: "tg-channel",
    title: "Kênh thông báo chính thức",
    subtitle: "t.me/ipahackgameioss",
    url: "https://t.me/ipahackgameioss",
    icon: "📢",
    accent: "#229ed9"
  },
  {
    id: "tg-chat",
    title: "Nhóm chat",
    subtitle: "t.me/ipahackgameios",
    url: "https://t.me/ipahackgameios",
    icon: "💬",
    accent: "#2ea6ff"
  },
  {
    id: "tg-admin",
    title: "Liên hệ Admin",
    subtitle: "@lethanhduyy",
    url: "https://t.me/lethanhduyy",
    icon: "👤",
    accent: "#7c5cff"
  }
];

const Bio = {
  normalize(list) {
    return (list || []).map((item, i) => ({
      id: item.id || "link-" + Date.now() + "-" + i,
      title: (item.title || "Liên kết").trim(),
      subtitle: (item.subtitle || item.url || "").trim(),
      url: (item.url || "#").trim(),
      icon: item.icon || "🔗",
      accent: item.accent || "#7c5cff"
    }));
  },

  readLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return this.normalize(parsed.links || parsed);
    } catch {
      return null;
    }
  },

  writeLocal(links) {
    const payload = { updatedAt: new Date().toISOString(), links: this.normalize(links) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  },

  async fetchFile() {
    try {
      const res = await fetch("links.json?ts=" + Date.now(), { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return this.normalize(data.links || data);
    } catch {
      return null;
    }
  },

  async getLinks() {
    const local = this.readLocal();
    if (local && local.length) return local;
    const file = await this.fetchFile();
    if (file && file.length) return file;
    return this.normalize(DEFAULT_LINKS);
  },

  render(selector, links) {
    const root = document.querySelector(selector);
    if (!root) return;
    if (!links.length) {
      root.innerHTML = '<div class="link-row"><div class="link-copy"><strong>Chưa có liên kết</strong><span>Admin chưa đăng link nào.</span></div></div>';
      return;
    }
    root.innerHTML = links.map(item => `
      <a class="link-row" href="${item.url}" target="_blank" rel="noopener">
        <div class="ico" style="background:${item.accent}22">${item.icon}</div>
        <div class="link-copy">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.subtitle || item.url)}</span>
        </div>
        <div class="go">↗</div>
      </a>
    `).join("");
  },

  async loadAndRender(selector) {
    const links = await this.getLinks();
    this.render(selector, links);
    return links;
  }
};

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
