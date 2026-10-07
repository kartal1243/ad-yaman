// ===== MENÜYÜ BURADAN DÜZENLE KANKA =====
// Yeni ürün eklemek için süslü parantezli satırı kopyala-yapıştır.
// kategori: "durum" | "porsiyon" | "sicak" | "gozleme"
const MENU = [
  { ad: "Dürüm", fiyat: 90, kategori: "durum", aciklama: "Klasik Adıyaman çiğ köfte dürüm, marul + nar ekşisi ile.", etiket: "Çok Satan" },
  { ad: "Mega Dürüm", fiyat: 130, kategori: "durum", aciklama: "Double çiğ köfte, doymak isteyene ekstra dolu.", etiket: "Favori" },
  { ad: "Doritos Dürüm", fiyat: 110, kategori: "durum", aciklama: "Çıtır Doritos + çiğ köfte efsane ikilisi." },
  { ad: "Mega Doritos Dürüm", fiyat: 150, kategori: "durum", aciklama: "Mega boy + bol Doritos, en iddialımız.", etiket: "Yeni" },
  { ad: "Yarım Porsiyon (250gr)", fiyat: 250, kategori: "porsiyon", aciklama: "250gr çiğ köfte + lavaş + yeşillik tabağı." },
  { ad: "Tam Porsiyon (500gr)", fiyat: 280, kategori: "porsiyon", aciklama: "500gr çiğ köfte, 2-3 kişiye rahat yeter.", etiket: "Avantajlı" },
  { ad: "Aile Boyu (800gr)", fiyat: 450, kategori: "porsiyon", aciklama: "800gr çiğ köfte, kalabalık sofraların yıldızı." },
  { ad: "1 Kilo Çiğ Köfte", fiyat: 560, kategori: "porsiyon", aciklama: "Günlük taze, kilo ile al evde ye." },
  { ad: "Köfte Ekmek", fiyat: 200, kategori: "sicak", aciklama: "Izgara köfte, sıcak ekmek arası + garnitür." },
  { ad: "Gözleme", fiyat: 150, kategori: "gozleme", aciklama: "El açması, peynirli / patatesli seçenek." },
  { ad: "Bazlama Tost", fiyat: 150, kategori: "gozleme", aciklama: "Bazlamada çift kaşarlı çıtır tost." },
];

const TL = (n) => "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2 });

const grid = document.getElementById("menuGrid");
function menuCiz(filtre = "all") {
  grid.innerHTML = "";
  MENU.filter((u) => filtre === "all" || u.kategori === filtre).forEach((u) => {
    const el = document.createElement("div");
    el.className = "menu-card" + (u.etiket ? " populer" : "");
    el.innerHTML = `
      ${u.etiket ? `<span class="etiket">${u.etiket}</span>` : ""}
      <span class="cat">${u.kategori === "durum" ? "Dürüm" : u.kategori === "porsiyon" ? "Porsiyon / Kilo" : u.kategori === "gozleme" ? "Gözleme & Tost" : "Sıcak Lezzet"}</span>
      <h3>${u.ad}</h3>
      <p>${u.aciklama}</p>
      <div class="price-row">
        <span class="price">${TL(u.fiyat)}</span>
        <a class="order" href="tel:+905378209122" aria-label="${u.ad} sipariş ver"><i class="fa-solid fa-phone"></i></a>
      </div>`;
    grid.appendChild(el);
  });
}
menuCiz();

document.querySelectorAll(".filters button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    menuCiz(b.dataset.f);
  });
});

// Mobil menü
const ham = document.getElementById("hamburger");
const nav = document.getElementById("navLinks");
ham.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

// Scroll animasyonu
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("show")), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Header gölge + yıl
document.getElementById("year").textContent = new Date().getFullYear();
