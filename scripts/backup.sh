#!/bin/bash
# Seyir Terası Fast Food - data/ ve .env Günlük Otomatik Yedekleme Scripti
# Çalıştırma: /bin/bash /var/www/seyirterasifastfood.com.tr/scripts/backup.sh
set -e

BACKUP_DIR="/var/backups/seyirterasi"
APP_DIR="/var/www/seyirterasifastfood.com.tr"
TARIH=$(date +%Y%m%d_%H%M%S)
HEDEF="$BACKUP_DIR/data-backup-$TARIH.tar.gz"

mkdir -p "$BACKUP_DIR"

if [ -d "$APP_DIR/data" ]; then
  tar -czf "$HEDEF" -C "$APP_DIR" data .env 2>/dev/null || tar -czf "$HEDEF" -C "$APP_DIR" data
  BOYUT=$(du -h "$HEDEF" | cut -f1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Yedek başarıyla alındı: $HEDEF ($BOYUT)"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ HATA: $APP_DIR/data klasörü bulunamadı!"
  exit 1
fi

# 30 günden eski yedekleri otomatik temizle
find "$BACKUP_DIR" -type f -name "data-backup-*.tar.gz" -mtime +30 -delete 2>/dev/null || true
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 30 günden eski yedekler temizlendi."
