module.exports = {
  apps: [
    {
      name: "gutenberg-api",
      script: "dist/index.js",
      cwd: "/www/wwwroot/gutenberg-platform/apps/api",
      env_file: "/www/wwwroot/gutenberg-platform/apps/api/.env",
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
