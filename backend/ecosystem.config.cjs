// PM2 ecosystem config — must use .cjs because package.json has "type": "module"
module.exports = {
  apps: [
    {
      name: 'warroom',
      script: 'dist/server.js',
      cwd: '/var/www/warroom/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 8787,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/warroom/error.log',
      out_file: '/var/log/warroom/out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
