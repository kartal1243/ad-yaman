// Seyir Terasi - Yonetim Paneli
const $ = (id) => document.getElementById(id);
const token = () => sessionStorage.getItem("seyir_admin_token") || "";
const TL = (n) => "₺" + Number(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
const KAT_AD = { durum: "Dürüm", porsiyon: "Porsiyon / Kilo", sicak: "Sıcak Lezzet", gozleme: "Gözleme & Tost", kahvalti: "Kahvaltı", icecek: "İçecek" };

function toast(msg, hata) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show" + (hata ? " hata" : "");
  clearTimeout(t._x);
  t._x = setTimeout(() => t.classList.remove("show"), 2400);
}
async function api(yol, opt = {}) {
  const r = await fetch(yol, {
    ...opt,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token(), ...(opt.headers || {}) },
  });
  const veri = await r.json().catch(() => ({}));
  if (r.status === 401) { cikis(); throw new Error("Oturum bitti, tekrar gir."); }
  if (!r.ok) throw new Error(veri.hata || "Bir hata oldu.");
  return veri;
}
function tarihYaz(iso) {
  try {
    return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso || ""; }
}

// ---------- GİRİŞ ----------
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loginHata").textContent = "";
  const btn = $("loginForm").querySelector("button");
  const eski = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Giriliyor...";
  try {
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sifre: $("sifre").value }),
    });
    const v = await r.json();
    if (!r.ok) throw new Error(v.hata || "Giriş olmadı.");
    sessionStorage.setItem("seyir_admin_token", v.token);
    panelAc();
  } catch (err) { $("loginHata").textContent = err.message; }
  btn.disabled = false;
  btn.innerHTML = eski;
});
function cikis() {
  sessionStorage.removeItem("seyir_admin_token");
  $("panel").hidden = true;
  $("loginWrap").style.display = "flex";
  $("sifre").value = "";
}
$("cikisBtn").addEventListener("click", cikis);
function panelAc() {
  $("loginWrap").style.display = "none";
  $("panel").hidden = false;
  tumVeriyiYukle();
}
if (token()) panelAc();

// ---------- SEKMELER ----------
$("sideNav").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
  $("sideNav").querySelectorAll("button").forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  document.querySelectorAll(".sekme").forEach((s) => (s.hidden = true));
  $("sekme-" + b.dataset.sekme).hidden = false;
  $("sekmeBaslik").textContent = b.textContent.trim();
  document.querySelector(".side").classList.remove("open");
  if (b.dataset.sekme === "siparis") siparisYukle();
  if (b.dataset.sekme === "ziyaret") ziyaretYukle();
  if (b.dataset.sekme === "galeri") galeriYukle();
}));
$("sideToggle").addEventListener("click", () => document.querySelector(".side").classList.toggle("open"));

// ---------- GENEL ----------
async function istatistikYukle() {
  try {
    const v = await api("/api/istatistik");
    $("kBugun").textContent = v.bugunZiyaret;
    $("kToplamZ").textContent = v.toplamZiyaret;
    $("kSiparis").textContent = v.toplamSiparis;
    $("kBekleyen").textContent = v.bekleyen;
    $("kCiro").textContent = TL(v.ciro);
    const rz = $("sipRozet");
    if (v.bekleyen > 0) { rz.hidden = false; rz.textContent = v.bekleyen; } else rz.hidden = true;
    // grafik
    const max = Math.max(1, ...v.gunler.map((g) => Math.max(g.ziyaret, g.siparis)));
    $("grafik").innerHTML = v.gunler.map((g) => `
      <div class="gun"><div class="barlar">
        <span class="bar z" title="${g.gun} ziyaret: ${g.ziyaret}" style="height:${Math.max(3, (g.ziyaret / max) * 150)}px"></span>
        <span class="bar s" title="${g.gun} siparis: ${g.siparis}" style="height:${Math.max(3, (g.siparis / max) * 150)}px"></span>
      </div><small>${g.gun.slice(5)}</small></div>`).join("");
    $("populer").innerHTML = v.populer.length
      ? v.populer.map((p) => `<div><span>${p.ad}</span><b>${p.adet} adet</b></div>`).join("")
      : "<div><span>Henüz sipariş yok</span></div>";
    $("sonSip").innerHTML = v.sonSiparisler.length
      ? v.sonSiparisler.map((s) => `<div><b>${s.isim}</b> — ${TL(s.tutar)} <span class="durum ${s.durum}">${s.durum}</span></div>`).join("")
      : "<div>Henüz sipariş yok</div>";
  } catch (e) { /* sessiz */ }
}
async function tumVeriyiYukle() {
  await Promise.all([istatistikYukle(), menuYukle()]);
}

// ---------- MENÜ ----------
let MENU = [];
let fotoHedefSatir = -1;
async function menuYukle() {
  try {
    MENU = await api("/api/menu");
    menuCiz();
  } catch (e) { toast(e.message, true); }
}
function menuCiz() {
  const ara = ($("menuAra").value || "").toLocaleLowerCase("tr");
  const kat = $("menuKatFiltre").value || "";
  const govde = $("menuGovde");
  govde.innerHTML = "";
  MENU.forEach((u, i) => {
    if (kat && u.kategori !== kat) return;
    if (ara && !(u.ad || "").toLocaleLowerCase("tr").includes(ara)) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="foto-hucre">
        ${u.foto ? `<img class="mini-foto" src="/${u.foto}" alt="" onerror="this.remove()">` : `<span style="font-size:1.4rem">🍽️</span>`}
        <div><button class="btn btn-ghost btn-sm" data-foto="${i}" title="Foto yükle/değiştir"><i class="fa-solid fa-camera"></i></button></div>
      </td>
      <td><input value="${(u.ad || "").replace(/"/g, "&quot;")}" data-a="ad" data-i="${i}"></td>
      <td><input type="number" min="0" max="100000" value="${u.fiyat}" data-a="fiyat" data-i="${i}" style="width:90px"></td>
      <td><select data-a="kategori" data-i="${i}">${Object.keys(KAT_AD).map((k) => `<option value="${k}"${u.kategori === k ? " selected" : ""}>${KAT_AD[k]}</option>`).join("")}</select></td>
      <td><input value="${(u.aciklama || "").replace(/"/g, "&quot;")}" data-a="aciklama" data-i="${i}"></td>
      <td><input value="${(u.etiket || "").replace(/"/g, "&quot;")}" data-a="etiket" data-i="${i}" style="width:100px" placeholder="—"></td>
      <td><button class="sil-btn" data-sil="${i}" title="Sil"><i class="fa-solid fa-trash"></i></button></td>`;
    govde.appendChild(tr);
  });
  govde.querySelectorAll("input,select").forEach((el) => el.addEventListener("change", () => {
    const i = Number(el.dataset.i), a = el.dataset.a;
    MENU[i][a] = a === "fiyat" ? Math.max(0, Math.round(Number(el.value) || 0)) : el.value;
  }));
  govde.querySelectorAll("[data-sil]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    MENU.splice(Number(b.dataset.sil), 1);
    menuCiz();
  }));
  govde.querySelectorAll("[data-foto]").forEach((b) => b.addEventListener("click", () => {
    fotoHedefSatir = Number(b.dataset.foto);
    $("menuFotoInput").click();
  }));
}
$("menuAra").addEventListener("input", menuCiz);
$("menuKatFiltre").addEventListener("change", menuCiz);
$("urunEkleBtn").addEventListener("click", () => {
  MENU.push({ id: "u" + Date.now(), ad: "Yeni Ürün", fiyat: 100, kategori: "durum", aciklama: "", etiket: "", foto: "" });
  menuCiz();
  toast("Yeni ürün eklendi, düzenlemeyi unutma.");
});
$("menuKaydetBtn").addEventListener("click", async () => {
  const btn = $("menuKaydetBtn");
  const eski = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Kaydediliyor...";
  try {
    const v = await api("/api/menu", { method: "PUT", body: JSON.stringify({ menu: MENU }) });
    toast(`Menü yayınlandı (${v.adet} ürün). Site anında güncellendi.`);
  } catch (e) { toast(e.message, true); }
  btn.disabled = false;
  btn.innerHTML = eski;
});
$("menuFotoInput").addEventListener("change", async (e) => {
  const dosya = e.target.files[0];
  if (!dosya || fotoHedefSatir < 0) return;
  const form = new FormData();
  form.append("foto", dosya);
  try {
    const r = await fetch("/api/menu-foto", { method: "POST", headers: { Authorization: "Bearer " + token() }, body: form });
    const v = await r.json();
    if (!r.ok) throw new Error(v.hata || "Yüklenemedi.");
    MENU[fotoHedefSatir].foto = v.url;
    menuCiz();
    toast("Foto yüklendi. Kaydetmeyi unutma.");
  } catch (err) { toast(err.message, true); }
  e.target.value = "";
});

// ---------- GALERİ ----------
async function galeriYukle() {
  try {
    const liste = await api("/api/galeri");
    $("galeriGrid").innerHTML = liste.length ? liste.map((g) => `
      <div class="g-kart"><img src="/${g.url}" loading="lazy" alt="">
        <div><span>${g.dosya} • ${g.kb}KB</span><button data-sil-gal="${g.dosya}"><i class="fa-solid fa-trash"></i></button></div>
      </div>`).join("") : `<div class="bos-kutu">Henüz foto yok, yukarıdan yükle.</div>`;
    $("galeriGrid").querySelectorAll("[data-sil-gal]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm(b.dataset.silGal + " silinsin mi?")) return;
      try {
        await api("/api/galeri/" + encodeURIComponent(b.dataset.silGal), { method: "DELETE" });
        toast("Foto silindi.");
        galeriYukle();
      } catch (e) { toast(e.message, true); }
    }));
  } catch (e) { toast(e.message, true); }
}
$("galeriAlan").addEventListener("click", () => $("galeriInput").click());
$("galeriForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const dosyalar = [...$("galeriInput").files];
  if (!dosyalar.length) { toast("Önce foto seç.", true); return; }
  let ok = 0;
  for (const d of dosyalar.slice(0, 10)) {
    const form = new FormData();
    form.append("foto", d);
    try {
      const r = await fetch("/api/galeri", { method: "POST", headers: { Authorization: "Bearer " + token() }, body: form });
      if (r.ok) ok++;
    } catch { /* devam */ }
  }
  $("galeriInput").value = "";
  toast(`${ok} foto yüklendi.`);
  galeriYukle();
});

// ---------- SİPARİŞLER ----------
async function siparisYukle() {
  const f = $("sipFiltre").value;
  try {
    const liste = await api("/api/siparisler?limit=200" + (f ? `&durum=${f}` : ""));
    $("sipListe").innerHTML = liste.length ? liste.map((s) => `
      <div class="sip ${s.durum}">
        <div class="sip-top"><b>${s.isim}</b>
          <span class="durum ${s.durum}">${s.durum}</span>
          <span>${s.tip === "toplu" ? "👥 toplu" : "🧺 sepet"}</span>
          <b>${TL(s.tutar)}</b>
          <time>${tarihYaz(s.tarih)}</time>
        </div>
        <div class="sip-items">${(s.items || []).map((it) => `<div>${it.adet}x ${it.ad} — ${TL(it.tutar)}${it.det ? ` <small>(${it.det})</small>` : ""}</div>`).join("")}</div>
        <div class="sip-adr"><i class="fa-solid fa-location-dot"></i> ${s.adres}${s.not ? ` • 📝 ${s.not}` : ""}</div>
        <div class="sip-islem">
          ${["hazirlaniyor", "tamam", "iptal"].filter((d) => d !== s.durum).map((d) => `<button class="btn btn-sm ${d === "iptal" ? "btn-ghost" : "btn-dark"}" data-durum="${d}" data-id="${s.id}">${d}</button>`).join("")}
        </div>
      </div>`).join("") : `<div class="bos-kutu">Bu filtrede sipariş yok.</div>`;
    $("sipListe").querySelectorAll("[data-durum]").forEach((b) => b.addEventListener("click", async () => {
      try {
        await api("/api/siparisler/" + b.dataset.id, { method: "PATCH", body: JSON.stringify({ durum: b.dataset.durum }) });
        toast("Durum güncellendi.");
        siparisYukle();
        tumVeriyiYukle();
      } catch (e) { toast(e.message, true); }
    }));
  } catch (e) { toast(e.message, true); }
}
$("sipFiltre").addEventListener("change", siparisYukle);
$("sipYenile").addEventListener("click", siparisYukle);

// ---------- ZİYARETÇİLER ----------
async function ziyaretYukle() {
  try {
    const [tum, girisler] = await Promise.all([api("/api/ziyaretler?limit=500"), api("/api/girisler")]);
    const liste = tum.slice(0, 100);
    const bugun = new Date().toISOString().slice(0, 10);
    const haftaOnce = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    $("zBugun").textContent = tum.filter((z) => (z.gun || String(z.tarih).slice(0, 10)) === bugun).length;
    $("zHafta").textContent = tum.filter((z) => (z.gun || String(z.tarih).slice(0, 10)) >= haftaOnce).length;
    $("ziyGovde").innerHTML = liste.length ? liste.map((z) => `
      <tr><td>${tarihYaz(z.tarih)}</td><td>${z.sayfa || "/"}</td><td>${z.ip || "—"}</td><td>${z.referrer || "direkt"}</td></tr>`).join("")
      : `<tr><td colspan="4">Henüz ziyaret kaydı yok.</td></tr>`;
    $("girisGovde").innerHTML = girisler.length ? girisler.map((g) => `
      <tr><td>${tarihYaz(g.tarih)}</td><td>${g.sonuc === "basarili" ? "✅ başarılı" : "❌ hatalı"}</td><td>${g.ip || "—"}</td></tr>`).join("")
      : `<tr><td colspan="3">Henüz giriş kaydı yok.</td></tr>`;
  } catch (e) { toast(e.message, true); }
}
