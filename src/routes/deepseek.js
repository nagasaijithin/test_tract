const express = require("express");

function sendError(res, error) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: error.message || "DeepSeek request failed",
  });
}

function createDeepSeekRouter({ completePrompt, getDetailsFromPrompt }) {
  const router = express.Router();

  router.get("/details", async (req, res) => {
    try {
      const result = await getDetailsFromPrompt();

      return res.json({
        success: true,
        source: "deepseek",
        model: result.model,
        prompt: result.prompt,
        data: result.data,
        usage: result.usage,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  router.post("/chat", async (req, res) => {
    try {
      const prompt = req.body?.prompt;
      const result = await completePrompt({ prompt });

      return res.json({
        success: true,
        source: "deepseek",
        model: result.model,
        prompt: result.prompt,
        data: result.data,
        usage: result.usage,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  return router;
}

module.exports = {
  createDeepSeekRouter,
};
