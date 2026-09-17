const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");
const { parseModelContent } = require("../src/services/deepseekService");

function listen(app) {
  const server = http.createServer(app);

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function request(server, { method = "GET", path, body } = {}) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : {},
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        });
      },
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

describe("Basic Details API", () => {
  it("starts and serves local endpoints", async (t) => {
    const server = await listen(createApp());
    t.after(
      () =>
        new Promise((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve())),
        ),
    );

    const root = await request(server, { path: "/" });
    assert.equal(root.status, 200);
    assert.match(root.body.message, /Welcome/);
    assert.equal(root.body.deepseek.chat, "/api/deepseek/chat");

    const health = await request(server, { path: "/health" });
    assert.equal(health.status, 200);
    assert.equal(health.body.status, "healthy");

    const details = await request(server, { path: "/api/details" });
    assert.equal(details.status, 200);
    assert.equal(details.body.success, true);
    assert.equal(details.body.data.name, "Basic Details API");
    assert.equal(details.body.records.length, 3);

    const record = await request(server, { path: "/api/details/1" });
    assert.equal(record.status, 200);
    assert.equal(record.body.data.name, "Ada Lovelace");

    const missing = await request(server, { path: "/api/details/99" });
    assert.equal(missing.status, 404);

    const unknown = await request(server, { path: "/nope" });
    assert.equal(unknown.status, 404);
  });
});

describe("DeepSeek endpoints", () => {
  it("returns prompt data from DeepSeek mocks", async (t) => {
    const fakeDetails = {
      model: "deepseek-flash",
      prompt: "Return basic details",
      data: {
        name: "Basic Details API",
        version: "1.0.0",
        status: "ok",
      },
      usage: { total_tokens: 12 },
    };

    const app = createApp({
      getDetailsFromPrompt: async () => fakeDetails,
      completePrompt: async ({ prompt }) => ({
        model: "deepseek-flash",
        prompt,
        data: { answer: "hello from deepseek", prompt },
        usage: { total_tokens: 8 },
      }),
    });

    const server = await listen(app);
    t.after(
      () =>
        new Promise((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve())),
        ),
    );

    const details = await request(server, { path: "/api/deepseek/details" });
    assert.equal(details.status, 200);
    assert.equal(details.body.success, true);
    assert.equal(details.body.source, "deepseek");
    assert.equal(details.body.data.name, "Basic Details API");
    assert.equal(details.body.prompt, "Return basic details");

    const chat = await request(server, {
      method: "POST",
      path: "/api/deepseek/chat",
      body: { prompt: "Say hello as JSON" },
    });
    assert.equal(chat.status, 200);
    assert.equal(chat.body.data.answer, "hello from deepseek");
    assert.equal(chat.body.prompt, "Say hello as JSON");
  });

  it("validates prompt and DeepSeek config", async (t) => {
    const server = await listen(createApp());
    t.after(
      () =>
        new Promise((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve())),
        ),
    );

    const missingPrompt = await request(server, {
      method: "POST",
      path: "/api/deepseek/chat",
      body: {},
    });
    assert.equal(missingPrompt.status, 400);
    assert.equal(missingPrompt.body.error, "prompt is required");

    const details = await request(server, { path: "/api/deepseek/details" });
    assert.equal(details.status, 503);
    assert.match(details.body.error, /DEEPSEEK_API_KEY/);
  });
});

describe("parseModelContent", () => {
  it("parses JSON and falls back to text", () => {
    assert.deepEqual(parseModelContent('{"name":"Ada"}'), { name: "Ada" });
    assert.deepEqual(parseModelContent('prefix {"ok":true} suffix'), { ok: true });
    assert.deepEqual(parseModelContent("plain text"), { text: "plain text" });
  });
});
