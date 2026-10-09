// ===== TOPLU SİPARİŞ SAYFASI =====
// Menü fiyatları panelden gelir (/api/menu); yoksa alttaki gömülü liste kullanılır.
const MENU_FALLBACK = [
  { ad: "Dürüm", fiyat: 90, kategori: "durum" },
  { ad: "Mega Dürüm", fiyat: 130, kategori: "durum" },
  { ad: "Doritos Dürüm", fiyat: 120, kategori: "durum" },
  { ad: "Mega Doritos Dürüm", fiyat: 150, kategori: "durum" },
  { ad: "Yarım Porsiyon (250gr)", fiyat: 200, kategori: "porsiyon" },
  { ad: "Tam Porsiyon (500gr)", fiyat: 280, kategori: "porsiyon" },
  { ad: "Aile Boyu (800gr)", fiyat: 450, kategori: "porsiyon" },
  { ad: "1 Kilo Çiğ Köfte", fiyat: 560, kategori: "porsiyon" },
  { ad: "Köfte Ekmek", fiyat: 200, kategori: "sicak" },
  { ad: "Gözleme", fiyat: 150, kategori: "gozleme" },
  { ad: "Bazlama Tost", fiyat: 150, kategori: "gozleme" },
  { ad: "Gözleme Menüsü (Kahvaltı)", fiyat: 200, kategori: "kahvalti" },
  { ad: "Bazlama Tost Menüsü (Kahvaltı)", fiyat: 200, kategori: "kahvalti" },
  { ad: "Küçük Ayran", fiyat: 20, kategori: "icecek" },
  { ad: "Büyük Ayran", fiyat: 40, kategori: "icecek" },
  { ad: "1L Ayran", fiyat: 80, kategori: "icecek" },
  { ad: "Kola", fiyat: 50, kategori: "icecek" },
  { ad: "1L Kola", fiyat: 90, kategori: "icecek" },
  { ad: "Fanta", fiyat: 60, kategori: "icecek" },
  { ad: "Ice Tea", fiyat: 50, kategori: "icecek" },
  { ad: "Fuse Tea", fiyat: 50, kategori: "icecek" },
  { ad: "Su", fiyat: 15, kategori: "icecek" },
  { ad: "Gazoz", fiyat: 40, kategori: "icecek" },
];

// Panelden guncel menu (yoksa gomulu liste)
let MENU = MENU_FALLBACK;
fetch("/api/menu").then((r) => (r.ok ? r.json() : null)).then((d) => {
  if (Array.isArray(d) && d.length) {
    MENU = d.map((u) => ({ ad: u.ad, fiyat: u.fiyat, kategori: u.kategori }));
    if (typeof topluCiz === "function" && document.getElementById("kisiList")) topluCiz();
  }
}).catch(() => {});

const WA_NO = "905378209122";
const TL = (n) => "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

// ---------- ÜRÜN SEÇENEKLERİ (ana menüyle aynı) ----------
const GARNITURLER = ["Marul", "Maydanoz", "Nar Ekşisi", "Limon", "Turşu", "Mısır", "Domates", "Soğan", "Acı Sos"];
const ACILAR = ["Acısız", "Az Acılı", "Orta", "Çok Acılı"];
const DURUM_EKSTRA = [
  { ad: "Burger Sos", fark: 10 },
  { ad: "Ranch Sos", fark: 10 },
  { ad: "Doritos Ekle", fark: 30 },
];
const PORS_SOS = ["Nar Ekşisi", "Acı Sos"];
const PORS_EKSTRA_ADET = [
  { ad: "Ekstra Lavaş", fark: 5 },
  { ad: "Ekstra Yeşillik Paketi", fark: 50 },
];
const KOFTE_ICI = ["Domates", "Soğan", "Marul", "Pul Biber", "Ketçap", "Mayonez"];
const TOST_ICI = ["Sucuk", "Kaşar", "Ketçap", "Mayonez"];
const GOZLEME_TIP = ["Sucuklu Kaşarlı", "Peynirli"];

function chip(group, ad, fark, checked, radio) {
  const arti = fark > 0 ? ` (+${TL(fark)})` : "";
  const etiket = String(ad).split("|")[0];
  return `<label class="${radio ? "radio-chip" : "check-chip"}"><input type="${radio ? "radio" : "checkbox"}" name="${group}" value="${ad}"${checked ? " checked" : ""}>${etiket}${arti}</label>`;
}

// ---------- TOAST ----------
const toast = document.getElementById("toast");
let toastT;
function toastGoster(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- TOPLU SİPARİŞ ----------
let kisiler = [];
let kisiSeq = 0;

function menuOptions(sel = 0) {
  return MENU.map((u, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${u.ad} — ${TL(u.fiyat)}</option>`).join("");
}

function topluOzetHesapla() {
  let urunAdet = 0, tutar = 0;
  kisiler.forEach((k) => k.items.forEach((it) => {
    urunAdet += it.adet;
    tutar += it.adet * (it.birim || MENU[it.urun].fiyat);
  }));
  return { kisiSayi: kisiler.length, urunAdet, tutar };
}

function topluMesajKur() {
  const { kisiSayi, urunAdet, tutar } = topluOzetHesapla();
  if (!urunAdet) return "Sipariş bekleniyor...";
  const adres = document.getElementById("topluAdres").value.trim();
  const saat = document.getElementById("topluSaat").value;
  const odeme = document.getElementById("topluOdeme").value;
  let msg = `Merhaba! Toplu siparişimiz (${kisiSayi} kişi • ${urunAdet} ürün):\n--------------------------`;
  kisiler.forEach((k, idx) => {
    if (!k.items.length) return;
    const isim = (k.isim || "").trim() || `Kişi ${idx + 1}`;
    msg += `\n\n${isim}:`;
    k.items.forEach((it) => {
      const u = MENU[it.urun];
      const b = it.birim || u.fiyat;
      msg += `\n- ${it.adet}x ${u.ad} (${TL(b * it.adet)})`;
      if (it.det) msg += `\n  (${it.det})`;
    });
  });
  msg += `\n--------------------------\nToplam: ${TL(tutar)}`;
  if (adres) msg += `\nAdres: ${adres}`;
  msg += `\nSaat: ${saat}\nÖdeme: ${odeme}`;
  return msg;
}

function topluCiz() {
  const box = document.getElementById("kisiList");
  if (!box) return;
  box.innerHTML = "";
  kisiler.forEach((k, idx) => {
    const card = document.createElement("div");
    card.className = "kisi-card";
    const safeIsim = (k.isim || "").replace(/"/g, "&quot;");
    card.innerHTML = `
      <div class="kisi-top"><b>Kişi ${idx + 1}</b>
        <input placeholder="İsim (örn: Ahmet)" maxlength="30" value="${safeIsim}">
        <button class="kisi-x" aria-label="Kişiyi sil"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="kisi-row">
        <select class="kisi-urun">${menuOptions(0)}</select>
        <select class="kisi-adet">${Array.from({ length: 10 }, (_, n) => `<option value="${n + 1}">${n + 1} adet</option>`).join("")}</select>
        <button class="kisi-ekle-btn">Ekle</button>
      </div>
      <div class="kisi-items">${k.items.length ? "" : `<div class="bos">Henüz ürün yok — yukarıdan seçip Ekle'ye bas</div>`}</div>`;
    const itemsBox = card.querySelector(".kisi-items");
    k.items.forEach((it, ii) => {
      const u = MENU[it.urun];
      const b = it.birim || u.fiyat;
      const row = document.createElement("div");
      row.className = "ki-item";
      row.innerHTML = `<div class="ki-baslik"><div>${it.adet}x ${u.ad} — ${TL(b * it.adet)}</div>${it.det ? `<div class="si-det">${it.det}</div>` : ""}</div><button aria-label="Sil"><i class="fa-solid fa-trash"></i></button>`;
      row.querySelector("button").addEventListener("click", () => {
        k.items.splice(ii, 1);
        topluCiz();
      });
      itemsBox.appendChild(row);
    });
    card.querySelector("input").addEventListener("input", (e) => { k.isim = e.target.value; topluOzetGuncelle(); });
    card.querySelector(".kisi-x").addEventListener("click", () => {
      kisiler = kisiler.filter((x) => x.id !== k.id);
      topluCiz();
    });
    card.querySelector(".kisi-ekle-btn").addEventListener("click", () => {
      const urun = Number(card.querySelector(".kisi-urun").value);
      const adet = Number(card.querySelector(".kisi-adet").value);
      topluModalAc(k.id, urun, adet);
    });
    box.appendChild(card);
  });
  topluOzetGuncelle();
}

function topluOzetGuncelle() {
  const sayiEl = document.getElementById("topluSayi");
  const toplamEl = document.getElementById("topluToplam");
  const onizEl = document.getElementById("topluOnizleme");
  if (!sayiEl || !toplamEl || !onizEl) return;
  const { kisiSayi, urunAdet, tutar } = topluOzetHesapla();
  sayiEl.textContent = `${kisiSayi} kişi • ${urunAdet} ürün`;
  toplamEl.textContent = TL(tutar);
  document.querySelectorAll("#kisiList .kisi-card").forEach((card, idx) => {
    if (kisiler[idx]) kisiler[idx].isim = card.querySelector("input").value;
  });
  onizEl.textContent = topluMesajKur();
}

// ---------- ÜRÜN SEÇENEK MODALI (ana menüyle aynı seçenekler) ----------
let mKisi = 0, mUrun = 0, mAdet = 1;
let mPeAdet = [0, 0];
const modalWrap = document.getElementById("modalWrap");

function fabsTopluGuncelle() {
  const fabs = document.querySelector(".fabs");
  if (fabs) fabs.classList.toggle("gizli", modalWrap.classList.contains("open"));
}
function topluModalKapat() {
  modalWrap.classList.remove("open");
  document.body.style.overflow = "";
  fabsTopluGuncelle();
}

function topluModalAc(kisiId, urunIdx, adet) {
  const u = MENU[urunIdx];
  // İçecekte seçenek yok, direkt listeye ekle
  if (u.kategori === "icecek") {
    const k = kisiler.find((x) => x.id === kisiId);
    if (k) {
      k.items.push({ urun: urunIdx, adet, det: "", birim: u.fiyat });
      topluCiz();
      toastGoster(`${u.ad} eklendi`);
    }
    return;
  }
  mKisi = kisiId; mUrun = urunIdx; mAdet = adet; mPeAdet = [0, 0];
  document.getElementById("mNot").value = "";
  document.getElementById("mAd").textContent = u.ad;
  document.getElementById("mFiyat").textContent = TL(u.fiyat);
  const secs = document.getElementById("modalSecs");
  let h = "";
  if (u.kategori === "durum" || u.kategori === "porsiyon") {
    h += `<div class="m-sec"><b>Acı seviyesi <small>(çiğ köfteler için)</small></b><div class="radio-row">${ACILAR.map((a) => chip("aci", a, 0, a === "Orta", true)).join("")}</div></div>`;
  }
  if (u.kategori === "durum") {
    h += `<div class="m-sec"><b>Garnitürler</b><div class="check-grid">${GARNITURLER.map((g) => chip("garn", g, 0, true, false)).join("")}</div></div>`;
  }
  if (u.ad === "Köfte Ekmek") {
    h += `<div class="m-sec"><b>İçi nasıl olsun?</b><div class="check-grid">${KOFTE_ICI.map((g) => chip("kofteici", g, 0, ["Domates", "Soğan", "Marul"].includes(g), false)).join("")}</div></div>`;
  }
  if (u.ad.includes("Gözleme")) {
    h += `<div class="m-sec"><b>Hangisi olsun?</b><div class="radio-row">${GOZLEME_TIP.map((t) => chip("goztip", t, 0, t === "Sucuklu Kaşarlı", true)).join("")}</div></div>`;
  }
  if (u.ad.includes("Bazlama")) {
    h += `<div class="m-sec"><b>İçinde ne olsun?</b><div class="check-grid">${TOST_ICI.map((g) => chip("tost", g, 0, ["Sucuk", "Kaşar"].includes(g), false)).join("")}</div></div>`;
  }
  if (u.kategori === "durum") {
    const adKucuk = u.ad.toLocaleLowerCase("tr");
    const soslar = (adKucuk.includes("mega") && adKucuk.includes("doritos")) ? DURUM_EKSTRA.filter((e) => e.ad !== "Doritos Ekle") : DURUM_EKSTRA;
    h += `<div class="m-sec"><b>Ekstra sos & Doritos</b><div class="check-grid">${soslar.map((e) => chip("ekstra", e.ad + "|" + e.fark, e.fark, false, false)).join("")}</div></div>`;
  }
  if (u.kategori === "porsiyon") {
    h += `<div class="m-sec"><b>Soslar <small>(dahil)</small></b><div class="check-grid">${PORS_SOS.map((s) => chip("psos", s, 0, true, false)).join("")}</div></div>`;
    h += `<div class="m-sec"><b>Ekstralar</b>${PORS_EKSTRA_ADET.map((e, idx) => `<div class="m-row"><span>${e.ad} <small>(+${TL(e.fark)}/adet)</small></span><div class="stepper"><button data-pe="azalt" data-i="${idx}" aria-label="Azalt">−</button><b id="peVal${idx}">0</b><button data-pe="art" data-i="${idx}" aria-label="Arttır">+</button></div></div>`).join("")}</div>`;
  }
  secs.innerHTML = h;
  secs.querySelectorAll("[data-pe]").forEach((b) => b.addEventListener("click", () => {
    const idx = Number(b.dataset.i);
    mPeAdet[idx] = b.dataset.pe === "art" ? Math.min(20, mPeAdet[idx] + 1) : Math.max(0, mPeAdet[idx] - 1);
    document.getElementById("peVal" + idx).textContent = mPeAdet[idx];
  }));
  modalWrap.classList.add("open");
  document.body.style.overflow = "hidden";
  fabsTopluGuncelle();
}

document.getElementById("modalClose").addEventListener("click", topluModalKapat);
modalWrap.addEventListener("click", (e) => { if (e.target === modalWrap) topluModalKapat(); });
document.getElementById("mEkle").addEventListener("click", () => {
  const u = MENU[mUrun];
  const k = kisiler.find((x) => x.id === mKisi);
  if (!k) { topluModalKapat(); return; }
  const aciEl = document.querySelector('#modalSecs input[name="aci"]:checked');
  const aci = aciEl ? aciEl.value : "";
  const garn = [...document.querySelectorAll('#modalSecs input[name="garn"]:checked')].map((c) => c.value);
  const sos = [...document.querySelectorAll('#modalSecs input[name="psos"]:checked')].map((c) => c.value);
  const kofteici = [...document.querySelectorAll('#modalSecs input[name="kofteici"]:checked')].map((c) => c.value);
  const tost = [...document.querySelectorAll('#modalSecs input[name="tost"]:checked')].map((c) => c.value);
  const goztipEl = document.querySelector('#modalSecs input[name="goztip"]:checked');
  const goztip = goztipEl ? goztipEl.value : "";
  const ekstra = [...document.querySelectorAll('#modalSecs input[name="ekstra"]:checked')].map((c) => {
    const [ad, fark] = c.value.split("|");
    return { ad, fark: Number(fark) };
  });
  PORS_EKSTRA_ADET.forEach((e, idx) => {
    if (mPeAdet[idx] > 0) ekstra.push({ ad: `${mPeAdet[idx]}x ${e.ad}`, fark: mPeAdet[idx] * e.fark });
  });
  const not = document.getElementById("mNot").value.trim();
  const birim = u.fiyat + ekstra.reduce((t, e) => t + e.fark, 0);
  const parcalar = [];
  if (aci) parcalar.push(aci + " acılı");
  if (garn.length) parcalar.push(garn.join(", "));
  if (goztip) parcalar.push(goztip);
  if (tost.length) parcalar.push(tost.join(", "));
  if (kofteici.length) parcalar.push(kofteici.join(", "));
  if (sos.length) parcalar.push(sos.join(", "));
  ekstra.forEach((e) => parcalar.push("+" + e.ad));
  if (not) parcalar.push("📝 " + not);
  k.items.push({ urun: mUrun, adet: mAdet, det: parcalar.join(" • "), birim });
  topluModalKapat();
  topluCiz();
  toastGoster(`${u.ad} eklendi`);
});

const kisiEkleBtn = document.getElementById("kisiEkle");
if (kisiEkleBtn) {
  kisiEkleBtn.addEventListener("click", () => {
    kisiSeq += 1;
    kisiler.push({ id: kisiSeq, isim: "", items: [] });
    topluCiz();
  });
  ["topluAdres", "topluSaat", "topluOdeme"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", topluOzetGuncelle);
  });
  const gonderBtn = document.getElementById("topluGonder");
  if (gonderBtn) gonderBtn.addEventListener("click", () => {
    const { urunAdet } = topluOzetHesapla();
    if (!urunAdet) { toastGoster("Önce en az bir ürün ekle"); return; }
    const adresEl = document.getElementById("topluAdres");
    const adres = adresEl ? adresEl.value.trim() : "";
    if (adres.length < 8) { toastGoster("Teslimat adresini yazmadan gönderemezsin"); if (adresEl) adresEl.focus(); return; }
    // Panele toplu siparis kaydi (sessiz)
    try {
      const flat = [];
      kisiler.forEach((k, idx) => {
        const isim = (k.isim || "").trim() || `Kişi ${idx + 1}`;
        k.items.forEach((it) => {
          const u = MENU[it.urun] || {};
          flat.push({ ad: `${isim}: ${it.adet}x ${u.ad || "ürün"}`, adet: it.adet, tutar: (it.birim || u.fiyat || 0) * it.adet, det: it.det || "" });
        });
      });
      fetch("/api/siparis", {
        method: "POST", keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip: "toplu", isim: flat.length ? "Toplu sipariş" : "Toplu", adres, not: "", tutar: topluOzetHesapla().tutar, items: flat }),
      }).catch(() => {});
    } catch { /* panel kapaliysa sorun degil */ }
    window.open(`https://wa.me/${WA_NO}?text=${encodeURIComponent(topluMesajKur())}`, "_blank");
  });
  if (!kisiler.length) {
    kisiSeq += 1;
    kisiler.push({ id: kisiSeq, isim: "", items: [] });
    topluCiz();
  }
}

// ---------- MOBİL MENÜ ----------
const ham = document.getElementById("hamburger");
const nav = document.getElementById("navLinks");
if (ham && nav) {
  ham.addEventListener("click", () => {
    nav.classList.toggle("open");
    ham.querySelector("i").className = nav.classList.contains("open") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open");
    ham.querySelector("i").className = "fa-solid fa-bars";
  }));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalWrap.classList.contains("open")) { topluModalKapat(); return; }
    if (nav.classList.contains("open")) {
      nav.classList.remove("open");
      ham.querySelector("i").className = "fa-solid fa-bars";
    }
  });
}

// ---------- SCROLL ANİMASYONU ----------
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("show")), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- YIL ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Ziyaret kaydi (panel icin, sessiz)
try {
  fetch("/api/ziyaret", {
    method: "POST", keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sayfa: location.pathname, referrer: document.referrer || "" }),
  }).catch(() => {});
} catch { /* panel kapaliysa sorun degil */ }
