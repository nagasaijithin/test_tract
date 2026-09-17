require("dotenv").config({ quiet: true });

const DEFAULT_SYSTEM_PROMPT = [
  "You are a structured data assistant for a Node.js Express REST API.",
  "Always reply with valid JSON only.",
  "Do not wrap the JSON in markdown fences.",
  "Do not include extra commentary.",
].join(" ");

const DEFAULT_DETAILS_PROMPT = [
  "Return basic details about this service as JSON with exactly these keys:",
  "name, version, description, author, status, framework, runtime, summary.",
  'Use name "Basic Details API", version "1.0.0", framework "Express.js",',
  'runtime "Node.js", and status "ok".',
  "Keep description and summary short and clear.",
].join(" ");

const deepseekConfig = Object.freeze({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
  timeoutMs: Number(process.env.DEEPSEEK_TIMEOUT_MS) || 30000,
  temperature: Number(process.env.DEEPSEEK_TEMPERATURE) || 0.2,
  systemPrompt: process.env.DEEPSEEK_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
  detailsPrompt: process.env.DEEPSEEK_DETAILS_PROMPT || DEFAULT_DETAILS_PROMPT,
});

function assertDeepSeekConfig() {
  if (!deepseekConfig.apiKey) {
    const error = new Error(
      "DeepSeek is not configured. Set DEEPSEEK_API_KEY in your .env file.",
    );
    error.name = "DeepSeekConfigError";
    error.statusCode = 503;
    throw error;
  }
}

module.exports = {
  deepseekConfig,
  assertDeepSeekConfig,
};
