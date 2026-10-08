// ===== TOPLU SİPARİŞ SAYFASI =====
// Menü fiyatları buradan güncellenir (index'teki script.js ile aynı tut).
const MENU = [
  { ad: "Dürüm", fiyat: 90, kategori: "durum" },
  { ad: "Mega Dürüm", fiyat: 130, kategori: "durum" },
  { ad: "Doritos Dürüm", fiyat: 110, kategori: "durum" },
  { ad: "Mega Doritos Dürüm", fiyat: 150, kategori: "durum" },
  { ad: "Yarım Porsiyon (250gr)", fiyat: 250, kategori: "porsiyon" },
  { ad: "Tam Porsiyon (500gr)", fiyat: 280, kategori: "porsiyon" },
  { ad: "Aile Boyu (800gr)", fiyat: 450, kategori: "porsiyon" },
  { ad: "1 Kilo Çiğ Köfte", fiyat: 560, kategori: "porsiyon" },
  { ad: "Köfte Ekmek", fiyat: 200, kategori: "sicak" },
  { ad: "Gözleme", fiyat: 150, kategori: "gozleme" },
  { ad: "Bazlama Tost", fiyat: 150, kategori: "gozleme" },
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

const WA_NO = "905378209122";
const TL = (n) => "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

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
    tutar += it.adet * MENU[it.urun].fiyat;
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
      msg += `\n- ${it.adet}x ${u.ad} (${TL(u.fiyat * it.adet)})`;
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
      const row = document.createElement("div");
      row.className = "ki-item";
      row.innerHTML = `<span>${it.adet}x ${u.ad} — ${TL(u.fiyat * it.adet)}</span><button aria-label="Sil"><i class="fa-solid fa-trash"></i></button>`;
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
      const varOlan = k.items.find((x) => x.urun === urun);
      if (varOlan) varOlan.adet = Math.min(20, varOlan.adet + adet);
      else k.items.push({ urun, adet });
      topluCiz();
      toastGoster(`${MENU[urun].ad} eklendi`);
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
    if (e.key === "Escape" && nav.classList.contains("open")) {
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
