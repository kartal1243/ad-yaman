// Seyir Terasi Fast Food - mini backend (statik + yonetim paneli API)
// Calistirma: npm install && node server.js  (veya pm2: pm2 start ecosystem.config.js)
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const ROOT = __dirname;

// ---- .env dosyasini yukle (varsa) ----
const ENV_DOSYA = path.join(ROOT, ".env");
if (fs.existsSync(ENV_DOSYA)) {
  fs.readFileSync(ENV_DOSYA, "utf8").split("\n").forEach((satir) => {
    const s = satir.trim();
    if (!s || s.startsWith("#")) return;
    const idx = s.indexOf("=");
    if (idx !== -1) {
      const k = s.slice(0, idx).trim();
      const v = s.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (k && !process.env[k]) process.env[k] = v;
    }
  });
}

const DATA = path.join(ROOT, "data");
const MENU_DOSYA = path.join(DATA, "menu.json");
const SIPARIS_DOSYA = path.join(DATA, "siparisler.json");
const ZIYARET_DOSYA = path.join(DATA, "ziyaretler.json");
const GIRIS_DOSYA = path.join(DATA, "girisler.json");
const GALERI_KLASOR = path.join(ROOT, "assets", "galeri");
const MENU_FOTO_KLASOR = path.join(ROOT, "assets", "menu");
const QR_KLASOR = path.join(ROOT, "assets", "qr");
const MENU_QR_URL = "https://xn--seyirterasfastfood-n0c.com.tr/?kaynak=qr#menu";

const PORT = Number(process.env.PORT) || 8001;
const ADMIN_SIFRE = process.env.ADMIN_PASSWORD;
if (!ADMIN_SIFRE) {
  console.warn("UYARI: ADMIN_PASSWORD tanimlanmamis! Lutfen .env dosyasinda guclu bir ADMIN_PASSWORD belirleyin.");
}
const KATEGORILER = ["durum", "porsiyon", "sicak", "gozleme", "kahvalti", "icecek"];
const SIPARIS_DURUMLAR = ["yeni", "hazirlaniyor", "tamam", "iptal"];

fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(GALERI_KLASOR, { recursive: true });
fs.mkdirSync(MENU_FOTO_KLASOR, { recursive: true });
fs.mkdirSync(QR_KLASOR, { recursive: true });

function jsonOku(dosya, varsayilan) {
  try {
    if (!fs.existsSync(dosya)) return varsayilan;
    return JSON.parse(fs.readFileSync(dosya, "utf8"));
  } catch {
    return varsayilan;
  }
}
function jsonYaz(dosya, veri) {
  fs.writeFileSync(dosya, JSON.stringify(veri, null, 2), "utf8");
}
function bugun() {
  return new Date().toISOString().slice(0, 10);
}
function temizDosyaAdi(ad) {
  return String(ad || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_ğüşöçı.]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 80);
}

// ---- mini token auth (bellek ici, 12 saat gecerli) ----
const jetonlar = new Map(); // token -> { bitis }
function jetonUret() {
  const t = crypto.randomBytes(32).toString("hex");
  jetonlar.set(t, { bitis: Date.now() + 12 * 3600 * 1000 });
  return t;
}
function adminKontrol(req, res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : "";
  const kayit = jetonlar.get(t);
  if (!t || !kayit || kayit.bitis < Date.now()) {
    jetonlar.delete(t);
    return res.status(401).json({ hata: "Yetkisiz. Lutfen giris yap." });
  }
  next();
}

// ---- basit hiz siniri (public POST'lar icin, IP basina dakikada 60) ----
const kova = new Map();
function hizSiniri(req, res, next) {
  const ip = req.ip || "?";
  const simdi = Date.now();
  const pencere = simdi - 60 * 1000;
  const liste = (kova.get(ip) || []).filter((t) => t > pencere);
  liste.push(simdi);
  kova.set(ip, liste);
  if (liste.length > 60) return res.status(429).json({ hata: "Cok fazla istek, biraz bekle." });
  next();
}

// ---- Panel Giris Deneme Siniri (Brute-Force Korumasi) ----
// 5 hatali denemede IP 15 dakika kilitlenir
const girisEngeller = new Map(); // ip -> { hataliSayisi, kilitBitis }
function girisLimiti(req, res, next) {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const simdi = Date.now();
  const durum = girisEngeller.get(ip);
  if (durum && durum.kilitBitis && durum.kilitBitis > simdi) {
    const kalanDakika = Math.ceil((durum.kilitBitis - simdi) / 60000);
    return res.status(429).json({
      hata: `Cok fazla hatali deneme yapildi. Guvenlik nedeniyle giris ${kalanDakika} dakika kilitlendi.`,
    });
  }
  next();
}
function girisHatasiKaydet(ip) {
  const simdi = Date.now();
  const durum = girisEngeller.get(ip) || { hataliSayisi: 0, kilitBitis: 0 };
  durum.hataliSayisi += 1;
  if (durum.hataliSayisi >= 5) {
    durum.kilitBitis = simdi + 15 * 60 * 1000; // 15 dakika kilit
    durum.hataliSayisi = 0;
  }
  girisEngeller.set(ip, durum);
}
function girisBasariliSifirla(ip) {
  girisEngeller.delete(ip);
}

// ---- upload ----
const depolama = (klasor) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, klasor),
    filename: (req, file, cb) => {
      const uzanti = path.extname(file.originalname || "").toLowerCase();
      const govde = temizDosyaAdi(path.basename(file.originalname || "foto", uzanti)) || "foto";
      cb(null, `${Date.now()}-${govde}${uzanti}`);
    },
  });
function resimFiltre(req, file, cb) {
  const uzanti = path.extname(file.originalname || "").toLowerCase();
  const tipOk = (file.mimetype || "").startsWith("image/");
  const uzantiOk = [".jpg", ".jpeg", ".png", ".webp"].includes(uzanti);
  if (tipOk && uzantiOk) return cb(null, true);
  cb(new Error("Sadece JPG/PNG/WebP yukleyebilirsin."));
}
const galeriYukleme = multer({ storage: depolama(GALERI_KLASOR), fileFilter: resimFiltre, limits: { fileSize: 6 * 1024 * 1024 } });
const menuFotoYukleme = multer({ storage: depolama(MENU_FOTO_KLASOR), fileFilter: resimFiltre, limits: { fileSize: 6 * 1024 * 1024 } });

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));

// ---- MENU ----
app.get("/api/menu", (req, res) => {
  res.json(jsonOku(MENU_DOSYA, []));
});
app.put("/api/menu", adminKontrol, (req, res) => {
  const liste = req.body && req.body.menu;
  if (!Array.isArray(liste) || !liste.length || liste.length > 200)
    return res.status(400).json({ hata: "Gecersiz menu listesi." });
  for (const u of liste) {
    if (!u || typeof u.ad !== "string" || !u.ad.trim() || u.ad.length > 60)
      return res.status(400).json({ hata: "Urun adi hatali: " + JSON.stringify(u && u.ad) });
    if (!Number.isFinite(Number(u.fiyat)) || Number(u.fiyat) < 0 || Number(u.fiyat) > 100000)
      return res.status(400).json({ hata: "Fiyat hatali: " + u.ad });
    if (!KATEGORILER.includes(u.kategori))
      return res.status(400).json({ hata: "Kategori hatali: " + u.ad });
  }
  const temiz = liste.map((u, i) => ({
    id: String(u.id || `u${Date.now()}-${i}`),
    ad: String(u.ad).trim(),
    fiyat: Math.round(Number(u.fiyat)),
    kategori: u.kategori,
    aciklama: String(u.aciklama || "").slice(0, 200),
    etiket: String(u.etiket || "").slice(0, 20),
    foto: String(u.foto || "").slice(0, 120),
  }));
  jsonYaz(MENU_DOSYA, temiz);
  res.json({ ok: true, adet: temiz.length });
});
app.post("/api/menu-foto", adminKontrol, menuFotoYukleme.single("foto"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya alinamadi." });
  res.json({ ok: true, url: `assets/menu/${req.file.filename}` });
});

// ---- QR (panelden yeniden uretme) ----
app.post("/api/qr-yenile", adminKontrol, async (req, res) => {
  try {
    const QRCode = require("qrcode");
    await QRCode.toFile(path.join(QR_KLASOR, "qr-menu.png"), MENU_QR_URL, {
      width: 1024, margin: 2, errorCorrectionLevel: "H",
      color: { dark: "#12225e", light: "#ffffff" },
    });
    await QRCode.toFile(path.join(QR_KLASOR, "qr-menu-kucuk.png"), MENU_QR_URL, {
      width: 512, margin: 2, errorCorrectionLevel: "M",
      color: { dark: "#12225e", light: "#ffffff" },
    });
    res.json({ ok: true, url: MENU_QR_URL });
  } catch (e) {
    res.status(500).json({ hata: "QR uretilemedi." });
  }
});

// ---- GALERI ----
app.get("/api/galeri", (req, res) => {
  let dosyalar = [];
  try {
    dosyalar = fs.readdirSync(GALERI_KLASOR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  } catch { /* yoksa bos */ }
  const liste = dosyalar
    .map((f) => {
      const tam = path.join(GALERI_KLASOR, f);
      let stat = null;
      try { stat = fs.statSync(tam); } catch { return null; }
      return { dosya: f, url: `assets/galeri/${f}`, kb: Math.round(stat.size / 1024), tarih: stat.mtime };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  res.json(liste);
});
app.post("/api/galeri", adminKontrol, galeriYukleme.single("foto"), (req, res) => {
  if (!req.file) return res.status(400).json({ hata: "Dosya alinamadi." });
  res.json({ ok: true, dosya: req.file.filename, url: `assets/galeri/${req.file.filename}` });
});
app.delete("/api/galeri/:dosya", adminKontrol, (req, res) => {
  const ad = path.basename(req.params.dosya || "");
  if (!/^[\w\-ğüşöçı]+\.(jpe?g|png|webp)$/i.test(ad)) return res.status(400).json({ hata: "Gecersiz dosya adi." });
  const tam = path.join(GALERI_KLASOR, ad);
  if (!tam.startsWith(GALERI_KLASOR)) return res.status(400).json({ hata: "Gecersiz yol." });
  try {
    fs.unlinkSync(tam);
  } catch {
    return res.status(404).json({ hata: "Dosya bulunamadi." });
  }
  res.json({ ok: true });
});

// ---- SIPARIS (site, her WhatsApp siparisi oncesi buraya duser) ----
app.post("/api/siparis", hizSiniri, (req, res) => {
  const b = req.body || {};
  const isim = String(b.isim || "").trim().slice(0, 40);
  const adres = String(b.adres || "").trim().slice(0, 140);
  const not = String(b.not || "").trim().slice(0, 120);
  const odeme = String(b.odeme || "Nakit").trim().slice(0, 30);
  const tip = b.tip === "toplu" ? "toplu" : "sepet";
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  const tutar = Math.round(Number(b.tutar) || 0);
  if (isim.length < 2 || adres.length < 8 || !items.length)
    return res.status(400).json({ hata: "Eksik siparis bilgisi." });
  const kayit = {
    id: `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    tarih: new Date().toISOString(),
    tip, isim, adres, not, odeme,
    items: items.map((it) => ({
      ad: String(it.ad || "").slice(0, 60),
      adet: Math.min(20, Math.max(1, Number(it.adet) || 1)),
      tutar: Math.round(Number(it.tutar) || 0),
      det: String(it.det || "").slice(0, 200),
    })),
    tutar, durum: "yeni",
  };
  const liste = jsonOku(SIPARIS_DOSYA, []);
  liste.push(kayit);
  jsonYaz(SIPARIS_DOSYA, liste.slice(-2000));
  res.json({ ok: true, id: kayit.id });
});
app.get("/api/siparisler", adminKontrol, (req, res) => {
  const { durum, limit } = req.query;
  let liste = jsonOku(SIPARIS_DOSYA, []);
  if (durum && SIPARIS_DURUMLAR.includes(durum)) liste = liste.filter((s) => s.durum === durum);
  liste = liste.slice().reverse().slice(0, Math.min(500, Number(limit) || 100));
  res.json(liste);
});
app.patch("/api/siparisler/:id", adminKontrol, (req, res) => {
  const { durum } = req.body || {};
  if (!SIPARIS_DURUMLAR.includes(durum)) return res.status(400).json({ hata: "Gecersiz durum." });
  const liste = jsonOku(SIPARIS_DOSYA, []);
  const s = liste.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ hata: "Siparis bulunamadi." });
  s.durum = durum;
  jsonYaz(SIPARIS_DOSYA, liste);
  res.json({ ok: true });
});

// ---- ZIYARET ----
app.post("/api/ziyaret", hizSiniri, (req, res) => {
  const b = req.body || {};
  const kayit = {
    tarih: new Date().toISOString(),
    gun: bugun(),
    sayfa: String(b.sayfa || "/").slice(0, 60),
    referrer: String(b.referrer || "").slice(0, 120),
    ip: String(req.ip || "").slice(0, 45),
  };
  const liste = jsonOku(ZIYARET_DOSYA, []);
  liste.push(kayit);
  jsonYaz(ZIYARET_DOSYA, liste.slice(-5000));
  res.json({ ok: true });
});
app.get("/api/ziyaretler", adminKontrol, (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  res.json(jsonOku(ZIYARET_DOSYA, []).slice().reverse().slice(0, limit));
});

// ---- ISTATISTIK (panel ozeti) ----
app.get("/api/istatistik", adminKontrol, (req, res) => {
  const ziyaretler = jsonOku(ZIYARET_DOSYA, []);
  const siparisler = jsonOku(SIPARIS_DOSYA, []);
  const gunler = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    gunler.push({ gun: d, ziyaret: 0, siparis: 0 });
  }
  const harita = Object.fromEntries(gunler.map((g) => [g.gun, g]));
  ziyaretler.forEach((z) => { if (harita[z.gun]) harita[z.gun].ziyaret += 1; });
  siparisler.forEach((s) => {
    const g = String(s.tarih || "").slice(0, 10);
    if (harita[g]) harita[g].siparis += 1;
  });
  const urunSayi = {};
  siparisler.forEach((s) => (s.items || []).forEach((it) => {
    urunSayi[it.ad] = (urunSayi[it.ad] || 0) + (it.adet || 0);
  }));
  const populer = Object.entries(urunSayi).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([ad, adet]) => ({ ad, adet }));
  const ciro = siparisler.filter((s) => s.durum !== "iptal").reduce((t, s) => t + (s.tutar || 0), 0);
  res.json({
    toplamZiyaret: ziyaretler.length,
    bugunZiyaret: ziyaretler.filter((z) => z.gun === bugun()).length,
    toplamSiparis: siparisler.length,
    bekleyen: siparisler.filter((s) => s.durum === "yeni").length,
    ciro, gunler, populer,
    sonSiparisler: siparisler.slice().reverse().slice(0, 5),
  });
});

// ---- GIRIS (denemeler IP ile kaydedilir) ----
function girisKaydet(sonuc, req) {
  try {
    const liste = jsonOku(GIRIS_DOSYA, []);
    liste.push({ tarih: new Date().toISOString(), sonuc, ip: String(req.ip || "").slice(0, 45) });
    jsonYaz(GIRIS_DOSYA, liste.slice(-200));
  } catch { /* sessiz */ }
}
app.post("/api/login", [hizSiniri, girisLimiti], (req, res) => {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const sifre = String((req.body || {}).sifre || "");
  if (!ADMIN_SIFRE) {
    return res.status(500).json({ hata: "Sunucu hatasi: Admin sifresi .env dosyasinda tanimli degil." });
  }
  if (!sifre || sifre !== ADMIN_SIFRE) {
    girisHatasiKaydet(ip);
    girisKaydet("hatali", req);
    const durum = girisEngeller.get(ip);
    if (durum && durum.kilitBitis && durum.kilitBitis > Date.now()) {
      return res.status(429).json({ hata: "5 hatali deneme yapildi. Guvenlik nedeniyle giris 15 dakika kilitlendi." });
    }
    const kalan = 5 - (durum ? durum.hataliSayisi : 0);
    return res.status(401).json({ hata: `Sifre yanlis. Kalan deneme hakki: ${kalan}` });
  }
  girisBasariliSifirla(ip);
  girisKaydet("basarili", req);
  res.json({ ok: true, token: jetonUret() });
});
app.get("/api/girisler", adminKontrol, (req, res) => {
  res.json(jsonOku(GIRIS_DOSYA, []).slice().reverse().slice(0, 100));
});

// ---- PANEL KISA YOLU (/admin ve /admin.html ikisi de acilir) ----
app.get("/admin", (req, res) => res.sendFile(path.join(ROOT, "admin.html")));

// ---- SITEMAP (dinamik: menu fotolari + galeri + gercek lastmod) ----
const SITE_URL = "https://xn--seyirterasfastfood-n0c.com.tr";
function xmlKacis(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
}
function mutlakUrl(goreli) {
  const yol = String(goreli || "").replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  return `${SITE_URL}/${yol}`;
}
function mtime(dosya) {
  try { return fs.statSync(dosya).mtime.getTime(); } catch { return 0; }
}
function enYeniTarih(dosyalar) {
  const t = Math.max(0, ...dosyalar.map(mtime));
  return new Date(t || Date.now()).toISOString().slice(0, 10);
}
function galeriDosyalari() {
  try {
    return fs.readdirSync(GALERI_KLASOR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch { return []; }
}
function sitemapUret() {
  const menu = jsonOku(MENU_DOSYA, []);
  const galeri = galeriDosyalari();
  const menuFotolar = [...new Set(menu.map((u) => u && u.foto).filter((f) => f && fs.existsSync(path.join(ROOT, f))))];
  const galeriYollar = galeri.map((f) => `assets/galeri/${f}`);

  const sayfalar = [
    {
      loc: `${SITE_URL}/`,
      lastmod: enYeniTarih([
        path.join(ROOT, "index.html"), path.join(ROOT, "script.js"), path.join(ROOT, "styles.css"), MENU_DOSYA,
        ...galeri.map((f) => path.join(GALERI_KLASOR, f)),
      ]),
      changefreq: "weekly",
      priority: "1.0",
      resimler: ["assets/logo.png", ...menuFotolar, ...galeriYollar],
    },
    {
      loc: `${SITE_URL}/toplu.html`,
      lastmod: enYeniTarih([path.join(ROOT, "toplu.html"), path.join(ROOT, "toplu.js"), MENU_DOSYA]),
      changefreq: "weekly",
      priority: "0.8",
      resimler: ["assets/logo.png"],
    },
  ];

  const govde = sayfalar.map((s) => {
    const resimler = s.resimler.slice(0, 1000)
      .map((r) => `    <image:image><image:loc>${xmlKacis(mutlakUrl(r))}</image:loc></image:image>`)
      .join("\n");
    return [
      "  <url>",
      `    <loc>${xmlKacis(s.loc)}</loc>`,
      `    <lastmod>${s.lastmod}</lastmod>`,
      `    <changefreq>${s.changefreq}</changefreq>`,
      `    <priority>${s.priority}</priority>`,
      resimler,
      "  </url>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${govde}\n</urlset>\n`;
}
app.get("/sitemap.xml", (req, res) => {
  try {
    res.type("application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(sitemapUret());
  } catch (e) {
    res.status(500).type("text/plain").send("sitemap uretilemedi");
  }
});

// ---- statik site (API disindakiler) ----
app.use(express.static(ROOT, { extensions: ["html"], maxAge: "1h" }));
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes("Sadece")) return res.status(400).json({ hata: err.message });
  next(err);
});

app.listen(PORT, () => console.log(`Seyir Terasi panel+site acik: http://localhost:${PORT}  (admin: /admin.html)`));
