const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../src/app");

function request(server, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    http
      .get({ hostname: "127.0.0.1", port, path }, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        });
      })
      .on("error", reject);
  });
}

describe("Basic Details API", () => {
  let server;

  it("starts and serves endpoints", async (t) => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))));

    const root = await request(server, "/");
    assert.equal(root.status, 200);
    assert.match(root.body.message, /Welcome/);

    const health = await request(server, "/health");
    assert.equal(health.status, 200);
    assert.equal(health.body.status, "healthy");

    const details = await request(server, "/api/details");
    assert.equal(details.status, 200);
    assert.equal(details.body.success, true);
    assert.equal(details.body.data.name, "Basic Details API");
    assert.equal(details.body.records.length, 3);

    const record = await request(server, "/api/details/1");
    assert.equal(record.status, 200);
    assert.equal(record.body.data.name, "Ada Lovelace");

    const missing = await request(server, "/api/details/99");
    assert.equal(missing.status, 404);

    const unknown = await request(server, "/nope");
    assert.equal(unknown.status, 404);
  });
});
