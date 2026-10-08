// ===== MENÜYÜ BURADAN DÜZENLE =====
// Yeni ürün: süslü parantezli satırı kopyala-yapıştır.
// kategori: "durum" | "porsiyon" | "sicak" | "gozleme"
// foto: assets/menu/ altındaki dosya. Boş ("") bırakırsan ikonlu kutu görünür.
const MENU = [
  { ad: "Dürüm", fiyat: 90, kategori: "durum", aciklama: "100gr çiğ köfte; marul, nar ekşisi + garnitür ile.", etiket: "Çok Satan", foto: "assets/menu/durum.jpg?v=5" },
  { ad: "Mega Dürüm", fiyat: 130, kategori: "durum", aciklama: "150gr çiğ köfte, çift lavaş; marul, nar ekşisi + garnitür.", etiket: "Favori", foto: "assets/menu/mega-durum.jpg?v=5" },
  { ad: "Doritos Dürüm", fiyat: 120, kategori: "durum", aciklama: "Çıtır Doritos + çiğ köfte; marul, nar ekşisi + garnitür.", foto: "assets/menu/doritos-durum.jpg?v=5" },
  { ad: "Mega Doritos Dürüm", fiyat: 150, kategori: "durum", aciklama: "Mega boy + bol Doritos; marul, nar ekşisi + garnitür.", etiket: "Yeni", foto: "assets/menu/mega-doritos-durum.jpg?v=5" },
  { ad: "Yarım Porsiyon (250gr)", fiyat: 200, kategori: "porsiyon", aciklama: "250gr çiğ köfte + 3 lavaş + yeşillik paketi + 2 nar ekşisi.", foto: "assets/menu/yarim-porsiyon.jpg?v=5" },
  { ad: "Tam Porsiyon (500gr)", fiyat: 280, kategori: "porsiyon", aciklama: "500gr çiğ köfte + 5 lavaş + yeşillik paketi + 3 nar ekşisi + acı sos.", etiket: "Avantajlı", foto: "assets/menu/tam-porsiyon.jpg?v=5" },
  { ad: "Aile Boyu (800gr)", fiyat: 450, kategori: "porsiyon", aciklama: "800gr çiğ köfte + 8 lavaş + yeşillik paketi + 4 nar ekşisi + acı sos.", foto: "assets/menu/aile-boyu.jpg?v=5" },
  { ad: "1 Kilo Çiğ Köfte", fiyat: 560, kategori: "porsiyon", aciklama: "1kg çiğ köfte + 10 lavaş + 5 nar ekşisi + yeşillik paketi + acı sos.", foto: "assets/menu/kilo-cigkofte.jpg?v=5" },
  { ad: "Köfte Ekmek", fiyat: 200, kategori: "sicak", aciklama: "Izgara köfte, sıcak ekmek arası + garnitür.", foto: "assets/menu/kofte-ekmek.jpg?v=5" },
  { ad: "Gözleme", fiyat: 150, kategori: "gozleme", aciklama: "El açması, sucuklu kaşarlı / peynirli seçenek.", foto: "assets/menu/gozleme.jpg?v=5" },
  { ad: "Bazlama Tost", fiyat: 150, kategori: "gozleme", aciklama: "Bazlamada sucuklu kaşarlı ve kaşarlı seçenek.", foto: "assets/menu/bazlama-tost.jpg?v=5" },
  { ad: "Küçük Ayran", fiyat: 20, kategori: "icecek", aciklama: "Yemeğin yanında klasik lezzet.", foto: "assets/menu/kucuk-ayran.jpg?v=5" },
  { ad: "Büyük Ayran", fiyat: 40, kategori: "icecek", aciklama: "Bol bol içene büyük boy.", foto: "assets/menu/buyuk-ayran.jpg?v=5" },
  { ad: "1L Ayran", fiyat: 80, kategori: "icecek", aciklama: "Ailecek, sofralık 1 litre.", foto: "assets/menu/litre-ayran.jpg?v=5" },
  { ad: "Kola", fiyat: 50, kategori: "icecek", aciklama: "Buz gibi kola.", foto: "assets/menu/kola.jpg?v=5" },
  { ad: "1L Kola", fiyat: 90, kategori: "icecek", aciklama: "Kalabalık masaya 1 litre.", foto: "assets/menu/litre-kola.jpg?v=5" },
  { ad: "Fanta", fiyat: 60, kategori: "icecek", aciklama: "Portakallı ferahlık.", foto: "assets/menu/fanta.jpg?v=5" },
  { ad: "Ice Tea", fiyat: 50, kategori: "icecek", aciklama: "Şeftalili soğuk çay.", foto: "assets/menu/ice-tea.jpg?v=5" },
  { ad: "Fuse Tea", fiyat: 50, kategori: "icecek", aciklama: "Bol aromalı soğuk çay.", foto: "assets/menu/fuse-tea.jpg?v=5" },
  { ad: "Su", fiyat: 15, kategori: "icecek", aciklama: "Pet şişe su.", foto: "assets/menu/su.jpg?v=5" },
  { ad: "Gazoz", fiyat: 40, kategori: "icecek", aciklama: "Klasik cam şişe gazoz.", foto: "assets/menu/gazoz.jpg?v=5" },
];

const GARNITURLER = ["Marul", "Maydanoz", "Nar Ekşisi", "Limon", "Turşu", "Mısır", "Domates", "Soğan", "Acı Sos"];
const ACILAR = ["Acısız", "Az Acılı", "Orta", "Çok Acılı"];
const WA_NO = "905378209122";

const TL = (n) => "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
const KAT_AD = { durum: "Dürüm", porsiyon: "Porsiyon / Kilo", sicak: "Sıcak Lezzet", gozleme: "Gözleme & Tost", icecek: "İçecek" };

// ---------- MENÜ KARTLARI ----------
const grid = document.getElementById("menuGrid");
function menuCiz(filtre = "durum") {
  grid.innerHTML = "";
  MENU.forEach((u, i) => {
    if (filtre !== "all" && u.kategori !== filtre) return;
    const el = document.createElement("div");
    el.className = "menu-card reveal show" + (u.etiket ? " populer" : "");
    el.innerHTML = `
      ${u.etiket ? `<span class="etiket">${u.etiket}</span>` : ""}
      <div class="dish-img"><i class="fa-solid fa-utensils"></i>${u.foto ? `<img src="${u.foto}" alt="${u.ad}" width="800" height="450" loading="lazy" decoding="async" onerror="this.remove()">` : ""}</div>
      <div class="menu-body">
        <span class="cat">${KAT_AD[u.kategori] || ""}</span>
        <h3>${u.ad}</h3>
        <p>${u.aciklama}</p>
        <div class="price-row">
          <span class="price">${TL(u.fiyat)}</span>
          <a class="order" href="tel:+905378209122" aria-label="${u.ad} için hemen ara"><i class="fa-solid fa-phone"></i></a>
        </div>
        <button class="add-btn" data-i="${i}"><i class="fa-solid fa-basket-shopping"></i> Sepete Ekle</button>
      </div>`;
    grid.appendChild(el);
  });
  grid.querySelectorAll(".add-btn").forEach((b) => b.addEventListener("click", () => modalAc(Number(b.dataset.i))));
}
menuCiz();

document.querySelectorAll(".filters button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    menuCiz(b.dataset.f);
  });
});

// ---------- MODAL ----------
let modalUrun = 0, modalAdet = 1, peAdet = [0, 0];
const modalWrap = document.getElementById("modalWrap");
const overlay = document.getElementById("overlay");
const drawer = document.getElementById("drawer");

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

function modalAc(i) {
  modalUrun = i; modalAdet = 1; peAdet = [0, 0];
  document.getElementById("adetVal").textContent = "1";
  document.getElementById("mNot").value = "";
  const u = MENU[i];
  document.getElementById("mAd").textContent = u.ad;
  document.getElementById("mFiyat").textContent = TL(u.fiyat);
  const secs = document.getElementById("modalSecs");
  let h = "";
  if (u.kategori !== "icecek") {
    h += `<div class="m-sec"><b>Acı seviyesi <small>(çiğ köfteler için)</small></b><div class="radio-row">${ACILAR.map((a) => chip("aci", a, 0, a === "Orta", true)).join("")}</div></div>`;
  }
  if (u.kategori === "durum") {
    h += `<div class="m-sec"><b>Garnitürler</b><div class="check-grid">${GARNITURLER.map((g) => chip("garn", g, 0, true, false)).join("")}</div></div>`;
  }
  if (u.ad === "Köfte Ekmek") {
    h += `<div class="m-sec"><b>İçi nasıl olsun?</b><div class="check-grid">${KOFTE_ICI.map((g) => chip("kofteici", g, 0, ["Domates", "Soğan", "Marul"].includes(g), false)).join("")}</div></div>`;
  }
  if (u.ad === "Gözleme") {
    h += `<div class="m-sec"><b>Hangisi olsun?</b><div class="radio-row">${GOZLEME_TIP.map((t) => chip("goztip", t, 0, t === "Sucuklu Kaşarlı", true)).join("")}</div></div>`;
  }
  if (u.ad === "Bazlama Tost") {
    h += `<div class="m-sec"><b>İçinde ne olsun?</b><div class="check-grid">${TOST_ICI.map((g) => chip("tost", g, 0, ["Sucuk", "Kaşar"].includes(g), false)).join("")}</div></div>`;
  }
  if (u.kategori === "durum") {
    h += `<div class="m-sec"><b>Ekstra sos & Doritos</b><div class="check-grid">${DURUM_EKSTRA.map((e) => chip("ekstra", e.ad + "|" + e.fark, e.fark, false, false)).join("")}</div></div>`;
  }
  if (u.kategori === "porsiyon") {
    h += `<div class="m-sec"><b>Soslar <small>(dahil)</small></b><div class="check-grid">${PORS_SOS.map((s) => chip("psos", s, 0, true, false)).join("")}</div></div>`;
    h += `<div class="m-sec"><b>Ekstralar</b>${PORS_EKSTRA_ADET.map((e, idx) => `<div class="m-row"><span>${e.ad} <small>(+${TL(e.fark)}/adet)</small></span><div class="stepper"><button data-pe="azalt" data-i="${idx}" aria-label="Azalt">−</button><b id="peVal${idx}">0</b><button data-pe="art" data-i="${idx}" aria-label="Arttır">+</button></div></div>`).join("")}</div>`;
  }
  secs.innerHTML = h;
  secs.querySelectorAll("[data-pe]").forEach((b) => b.addEventListener("click", () => {
    const idx = Number(b.dataset.i);
    peAdet[idx] = b.dataset.pe === "art" ? Math.min(20, peAdet[idx] + 1) : Math.max(0, peAdet[idx] - 1);
    document.getElementById("peVal" + idx).textContent = peAdet[idx];
  }));
  modalWrap.classList.add("open");
  document.body.style.overflow = "hidden";
  fabsGuncelle();
}
function modalKapat() { modalWrap.classList.remove("open"); document.body.style.overflow = ""; fabsGuncelle(); }
document.getElementById("modalClose").addEventListener("click", modalKapat);
modalWrap.addEventListener("click", (e) => { if (e.target === modalWrap) modalKapat(); });
document.getElementById("adetArt").addEventListener("click", () => { modalAdet = Math.min(20, modalAdet + 1); document.getElementById("adetVal").textContent = modalAdet; });
document.getElementById("adetAzalt").addEventListener("click", () => { modalAdet = Math.max(1, modalAdet - 1); document.getElementById("adetVal").textContent = modalAdet; });

// ---------- SEPET ----------
let sepet = [];
const toast = document.getElementById("toast");
let toastT;
function toastGoster(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => toast.classList.remove("show"), 2200);
}

document.getElementById("mEkle").addEventListener("click", () => {
  const u = MENU[modalUrun];
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
    if (peAdet[idx] > 0) ekstra.push({ ad: `${peAdet[idx]}x ${e.ad}`, fark: peAdet[idx] * e.fark });
  });
  const not = document.getElementById("mNot").value.trim();
  const birim = u.fiyat + ekstra.reduce((t, e) => t + e.fark, 0);
  const key = [u.ad, aci, [...garn].sort().join("+"), sos.join("+"), goztip, [...tost].sort().join("+"), [...kofteici].sort().join("+"), ekstra.map((e) => e.ad).join("+"), not].join("|");
  const varOlan = sepet.find((s) => s.key === key);
  if (varOlan) varOlan.adet = Math.min(20, varOlan.adet + modalAdet);
  else {
    const parcalar = [];
    if (aci) parcalar.push(aci + " acılı");
    if (garn.length) parcalar.push(garn.join(", "));
    if (goztip) parcalar.push(goztip);
    if (tost.length) parcalar.push(tost.join(", "));
    if (kofteici.length) parcalar.push(kofteici.join(", "));
    if (sos.length) parcalar.push(sos.join(", "));
    ekstra.forEach((e) => parcalar.push("+" + e.ad));
    if (not) parcalar.push("📝 " + not);
    sepet.push({ key, ad: u.ad, fiyat: u.fiyat, birim, adet: modalAdet, det: parcalar.join(" • ") });
  }
  modalKapat();
  sepetCiz();
  toastGoster(`${u.ad} sepete eklendi`);
});

function sepetCiz() {
  const adetTop = sepet.reduce((t, s) => t + s.adet, 0);
  const tutar = sepet.reduce((t, s) => t + s.adet * (s.birim || s.fiyat), 0);
  document.getElementById("cartCount").textContent = adetTop;
  document.getElementById("cartCount").classList.toggle("bos", adetTop === 0);
  document.getElementById("drawerCount").textContent = adetTop ? `(${adetTop})` : "";
  document.getElementById("cartTotal").textContent = TL(tutar);
  const box = document.getElementById("drawerItems");
  if (!sepet.length) {
    box.innerHTML = `<div class="sepet-bos"><i class="fa-solid fa-basket-shopping"></i><p>Sepetin boş kanka.<br>Menüden bir şeyler ekle.</p><button class="btn btn-red btn-sm" id="bosMenuBtn">Menüye Dön</button></div>`;
    document.getElementById("bosMenuBtn").addEventListener("click", () => { drawerKapat(); document.getElementById("menu").scrollIntoView({ behavior: "smooth" }); });
    return;
  }
  box.innerHTML = "";
  sepet.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "sepet-item";
    el.innerHTML = `
      <div class="si-top"><b>${s.adet}x ${s.ad}</b><span>${TL(s.adet * (s.birim || s.fiyat))}</span></div>
      ${s.det ? `<div class="si-det">${s.det}</div>` : ""}
      <div class="si-btns">
        <button data-a="azalt" aria-label="Azalt">−</button><button data-a="art" aria-label="Arttır">+</button>
        <button data-a="sil" class="sil"><i class="fa-solid fa-trash"></i></button>
      </div>`;
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.a === "art") s.adet = Math.min(20, s.adet + 1);
      if (b.dataset.a === "azalt") s.adet -= 1;
      if (b.dataset.a === "sil") s.adet = 0;
      sepet = sepet.filter((x) => x.adet > 0);
      sepetCiz();
    }));
    box.appendChild(el);
  });
}
sepetCiz();

function fabsGuncelle() {
  const gizle = (typeof drawer !== "undefined" && drawer.classList.contains("open")) || (typeof modalWrap !== "undefined" && modalWrap.classList.contains("open"));
  const fabs = document.querySelector(".fabs");
  if (fabs) fabs.classList.toggle("gizli", gizle);
}
function drawerAc() { drawer.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow = "hidden"; fabsGuncelle(); }
function drawerKapat() { drawer.classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow = ""; fabsGuncelle(); }
document.getElementById("cartBtn").addEventListener("click", drawerAc);
document.getElementById("drawerClose").addEventListener("click", drawerKapat);
overlay.addEventListener("click", drawerKapat);
document.getElementById("cartClear").addEventListener("click", () => { sepet = []; sepetCiz(); });

// WhatsApp siparişi
document.getElementById("waOrder").addEventListener("click", () => {
  if (!sepet.length) { toastGoster("Sepetin boş, önce ürün ekle"); return; }
  const isim = document.getElementById("custName").value.trim();
  const not = document.getElementById("custNote").value.trim();
  const tutar = sepet.reduce((t, s) => t + s.adet * (s.birim || s.fiyat), 0);
  let msg = "Merhaba! Seyir Terası Fast Food siparişim:\n--------------------------\n";
  sepet.forEach((s) => {
    const birim = s.birim || s.fiyat;
    msg += `\n${s.adet}x ${s.ad} — ${TL(birim * s.adet)}`;
    if (s.det) msg += `\n(${s.det})`;
  });
  msg += `\n--------------------------\nToplam: ${TL(tutar)}`;
  if (isim) msg += `\nİsim: ${isim}`;
  if (not) msg += `\nNot: ${not}`;
  window.open(`https://wa.me/${WA_NO}?text=${encodeURIComponent(msg)}`, "_blank");
});

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
    const isim = k.isim.trim() || `Kişi ${idx + 1}`;
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
    card.innerHTML = `
      <div class="kisi-top"><b>Kişi ${idx + 1}</b>
        <input placeholder="İsim (örn: Ahmet)" maxlength="30" value="${k.isim.replace(/"/g, "&quot;")}">
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
  if (!sayiEl) return;
  const { kisiSayi, urunAdet, tutar } = topluOzetHesapla();
  sayiEl.textContent = `${kisiSayi} kişi • ${urunAdet} ürün`;
  toplamEl.textContent = TL(tutar);
  // isimleri canlı tut
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
  // başlangıçta 1 kişi hazır gelsin
  if (!kisiler.length) {
    kisiSeq += 1;
    kisiler.push({ id: kisiSeq, isim: "", items: [] });
    topluCiz();
  }
}

// Mobil menü
const ham = document.getElementById("hamburger");
const nav = document.getElementById("navLinks");
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
  if (modalWrap.classList.contains("open")) modalKapat();
  else if (drawer.classList.contains("open")) drawerKapat();
  else if (nav.classList.contains("open")) { nav.classList.remove("open"); ham.querySelector("i").className = "fa-solid fa-bars"; }
});

// Scroll animasyonu
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("show")), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Yıl
document.getElementById("year").textContent = new Date().getFullYear();
