// Seyir Terasi - Menu QR uretici
// Calistirma: npm run qr  (cikti: assets/qr/qr-menu.png)
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");

const SITE = "https://xn--seyirterasfastfood-n0c.com.tr";
const MENU_URL = SITE + "/?kaynak=qr#menu";
const OUT_DIR = path.join(__dirname, "..", "assets", "qr");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function uret() {
  await QRCode.toFile(path.join(OUT_DIR, "qr-menu.png"), MENU_URL, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#12225e", light: "#ffffff" }
  });
  await QRCode.toFile(path.join(OUT_DIR, "qr-menu-kucuk.png"), MENU_URL, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#12225e", light: "#ffffff" }
  });
  console.log("QR hedef:", MENU_URL);
  console.log("Uretildi: assets/qr/qr-menu.png + qr-menu-kucuk.png");
}
uret().catch((e) => { console.error("QR uretilemedi:", e.message); process.exit(1); });
