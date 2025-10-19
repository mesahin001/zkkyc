module.exports = {
  apps: [
    {
      name: 'zkkyc-frontend',
      script: 'npm',
      args: 'start -- -p 3000',
      cwd: '/var/www/zkkyc/packages/nextjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'zkkyc-admin',
      script: 'npm',
      args: 'start -- -p 3002',
      cwd: '/var/www/zkkyc/packages/nextjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
};
