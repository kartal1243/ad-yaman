#!/bin/bash
# Seyir Terası Fast Food - Tek Komutla Sunucu Deploy Scripti
# Çalıştırma: /bin/bash /var/www/seyirterasifastfood.com.tr/scripts/deploy-server.sh
set -e

APP_DIR="/var/www/seyirterasifastfood.com.tr"
echo "=== [SEYİR TERASI] DEPLOY BAŞLIYOR ==="
cd "$APP_DIR"

# 1. Adım: Deploy öncesi data ve .env yedeği al
echo "[1/5] Canlı veriler yedekleniyor..."
/bin/bash "$APP_DIR/scripts/backup.sh"

# 2. Adım: Git güncellemelerini çek
echo "[2/5] Git origin main çekiliyor..."
git fetch origin main
git reset --hard origin/main
echo "✓ Git son commit: $(git log -1 --oneline)"

# 3. Adım: Bağımlılıkları kontrol et
echo "[3/5] Bağımlılıklar güncelleniyor..."
npm install --omit=dev --no-audit --no-fund --loglevel=error

# 4. Adım: PM2 servisini yeniden başlat
echo "[4/5] PM2 servisi yeniden yükleniyor..."
pm2 reload ecosystem.config.js --update-env

# 5. Adım: Sağlık kontrolü
echo "[5/5] Sağlık kontrolü yapılıyor..."
sleep 1
HTTP_KOD=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8001/ || echo "000")
if [ "$HTTP_KOD" -eq 200 ] || [ "$HTTP_KOD" -eq 304 ]; then
  echo "✓ Site başarıyla yayında! HTTP $HTTP_KOD"
  echo "=== [SEYİR TERASI] DEPLOY BAŞARIYLA TAMAMLANDI ==="
else
  echo "✗ UYARI: Sağlık kontrolü beklenmeyen kod döndürdü: $HTTP_KOD"
  exit 1
fi
