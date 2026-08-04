module.exports = {
  apps: [
    {
      name: 'medflow-api',
      script: './apps/api/dist/server.js',
      instances: 'max', // Spawns 1 worker process per CPU core
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
