module.exports = {
  apps: [
    {
      name: "gutenberg-api",
      script: "./apps/api/dist/index.js",
      cwd: "/www/wwwroot/gutenberg-platform",
      env_file: "/www/wwwroot/gutenberg-platform/apps/api/.env",
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
}
