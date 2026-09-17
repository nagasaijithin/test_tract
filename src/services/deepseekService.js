const OpenAI = require("openai");
const { assertDeepSeekConfig, deepseekConfig } = require("../config/deepseek");

function createDeepSeekClient(overrides = {}) {
  return new OpenAI({
    apiKey: overrides.apiKey ?? deepseekConfig.apiKey,
    baseURL: overrides.baseURL ?? deepseekConfig.baseURL,
    timeout: overrides.timeoutMs ?? deepseekConfig.timeoutMs,
  });
}

function parseModelContent(content) {
  if (!content || typeof content !== "string") {
    return { text: "" };
  }

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return { text: content };
      }
    }

    return { text: content };
  }
}

async function completePrompt({
  prompt,
  systemPrompt = deepseekConfig.systemPrompt,
  client,
} = {}) {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    const error = new Error("prompt is required");
    error.name = "ValidationError";
    error.statusCode = 400;
    throw error;
  }

  assertDeepSeekConfig();

  const openai = client || createDeepSeekClient();
  const completion = await openai.chat.completions.create({
    model: deepseekConfig.model,
    temperature: deepseekConfig.temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt.trim() },
    ],
  });

  const choice = completion.choices?.[0]?.message || {};
  const content = choice.content || "";

  return {
    model: completion.model || deepseekConfig.model,
    prompt: prompt.trim(),
    data: parseModelContent(content),
    usage: completion.usage || null,
  };
}

async function getDetailsFromPrompt(options = {}) {
  return completePrompt({
    prompt: options.prompt || deepseekConfig.detailsPrompt,
    systemPrompt: options.systemPrompt || deepseekConfig.systemPrompt,
    client: options.client,
  });
}

module.exports = {
  completePrompt,
  createDeepSeekClient,
  getDetailsFromPrompt,
  parseModelContent,
};
