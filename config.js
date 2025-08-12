module.exports = {
  apps: [
    {
      name: "DiscHub",
      script: "index.js",
      env: {
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
        FRONTEND_CHANNEL_ID: process.env.FRONTEND_CHANNEL_ID,
        BACKEND_CHANNEL_ID: process.env.BACKEND_CHANNEL_ID,
      },
    },
  ],
};
