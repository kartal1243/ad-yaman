// Seyir Terası Fast Food - Geliştirici Bilgisayarından Tek Tıkla Canlıya Deploy Scripti
// Çalıştırma: node scripts/deploy.js
const { Client } = require('ssh2');

const config = {
  host: process.env.VPS_HOST || '213.142.148.75',
  port: Number(process.env.VPS_PORT) || 22,
  username: process.env.VPS_USER || 'root',
  password: process.env.VPS_PASSWORD || 'glbN15jhoys48BzR',
  readyTimeout: 30000
};

console.log('📡 Sunucuya bağlanılıyor:', config.host);
const conn = new Client();

conn.on('ready', () => {
  console.log('✓ SSH bağlantısı kuruldu. Deploy scripti çalıştırılıyor...');
  
  const cmd = 'chmod +x /var/www/seyirterasifastfood.com.tr/scripts/*.sh 2>/dev/null; /bin/bash /var/www/seyirterasifastfood.com.tr/scripts/deploy-server.sh';
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('✗ HATA:', err);
      conn.end();
      process.exit(1);
    }
    stream.on('data', data => process.stdout.write(data.toString()));
    stream.stderr.on('data', data => process.stderr.write(data.toString()));
    stream.on('close', (code) => {
      console.log('\nDeploy tamamlandı (çıkış kodu:', code + ')');
      conn.end();
      process.exit(code);
    });
  });
});

conn.on('error', (err) => {
  console.error('✗ Bağlantı hatası:', err.message);
  process.exit(1);
});

conn.connect(config);
