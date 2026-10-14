module.exports = {
  apps: [
    {
      name: "seyirterasi",
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        PORT: 8001,
        NODE_ENV: "production"
      }
    }
  ]
};
