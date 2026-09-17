const express = require("express");
const { completePrompt, getDetailsFromPrompt } = require("./services/deepseekService");
const { createDetailsRouter } = require("./routes/details");
const { createDeepSeekRouter } = require("./routes/deepseek");

function createApp(deps = {}) {
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      message: "Welcome to the Basic Details REST API",
      docs: "/api/details",
      deepseek: {
        details: "/api/deepseek/details",
        chat: "/api/deepseek/chat",
      },
    });
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/details", createDetailsRouter());
  app.use(
    "/api/deepseek",
    createDeepSeekRouter({
      completePrompt: deps.completePrompt || completePrompt,
      getDetailsFromPrompt: deps.getDetailsFromPrompt || getDetailsFromPrompt,
    }),
  );

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
