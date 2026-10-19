import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ValidationStdioTransport } from "../../scripts/validation-stdio-transport.ts";

function fixture(source: string): ValidationStdioTransport {
  return new ValidationStdioTransport({ command: process.execPath, args: ["--input-type=module", "-e", source],
    cwd: import.meta.dirname, env: { ...process.env } });
}

void test("validation transport keeps SDK framing and closes its original child through EOF", async () => {
  const transport = fixture(`
    let text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      text += chunk;
      if (text.includes("\\n")) {
        const request = JSON.parse(text);
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: { echoed: true } }) + "\\n");
      }
    });
    process.stdin.resume();
  `);
  const reply = Promise.withResolvers<unknown>();
  // oxlint-disable-next-line unicorn/prefer-add-event-listener -- The MCP Transport contract defines callbacks, not EventTarget methods.
  transport.onmessage = (message): void => { reply.resolve(message); };
  // oxlint-disable-next-line unicorn/prefer-add-event-listener -- The MCP Transport contract defines callbacks, not EventTarget methods.
  transport.onerror = (error): void => { reply.reject(error); };
  try {
    await transport.start();
    assert.equal(transport.closureVerified, false);
    await transport.send({ jsonrpc: "2.0", id: 7, method: "synthetic" });
    assert.deepEqual(await reply.promise, { jsonrpc: "2.0", id: 7, result: { echoed: true } });
  } finally {
    await transport.verifyClosed();
  }
  assert.equal(transport.closureVerified, true);
  const closed = transport.close();
  assert.equal(transport.close(), closed);
  await closed;
  await assert.rejects(transport.start(), /cannot be started/u);
  await assert.rejects(transport.send({ jsonrpc: "2.0", method: "after-close" }), /not connected/u);
});

void test("validation transport retains nonzero exit failure instead of reporting clean closure", async () => {
  const transport = fixture("process.stdin.resume(); process.stdin.on('end', () => { process.exitCode = 7; });");
  await transport.start();
  await transport.close();
  await assert.rejects(transport.verifyClosed(), /code=7, signal=null/u);
  assert.equal(transport.closureVerified, true);
  await assert.rejects(transport.verifyClosed(), /code=7, signal=null/u);
});

void test("validation transport reports spawn failure and observes original child close", async () => {
  const transport = new ValidationStdioTransport({ command: "/not-an-existing-validation-executable", args: [], cwd: import.meta.dirname, env: {} });
  await assert.rejects(transport.start(), /ENOENT/u);
  await transport.close();
  await assert.rejects(transport.verifyClosed(), /exited unsuccessfully/u);
  assert.equal(transport.closureVerified, true);
});

void test("SDK initialization failure preserves its error and detached EOF close failure", async () => {
  const transport = fixture(`
    let text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      text += chunk;
      if (text.includes("\\n")) {
        const request = JSON.parse(text);
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32603, message: "synthetic initialize refusal" } }) + "\\n");
      }
    });
    process.stdin.on("end", () => { process.exitCode = 7; });
    process.stdin.resume();
  `);
  const client = new Client({ name: "synthetic-validation-client", version: "0.0.0" }, { capabilities: {} });
  await assert.rejects(client.connect(transport), /synthetic initialize refusal/u);
  await client.close();
  await assert.rejects(transport.verifyClosed(), /code=7, signal=null/u);
  assert.equal(transport.closureVerified, true);
});

void test("validation EOF timeout retains uncertainty and never escalates to a signal", async (context) => {
  const transport = fixture("process.stdin.resume(); process.stdin.on('end', () => { setTimeout(() => {}, 100); });");
  const observed = Promise.withResolvers<null>();
  // oxlint-disable-next-line unicorn/prefer-add-event-listener -- The MCP Transport contract defines callbacks, not EventTarget methods.
  transport.onclose = (): void => { observed.resolve(null); };
  await transport.start();
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const close = transport.close();
  const rejected = assert.rejects(transport.verifyClosed(), /no signal sent, retain its smoke directory/u);
  context.mock.timers.tick(10_001);
  await rejected;
  assert.equal(transport.closureVerified, false);
  context.mock.timers.reset();
  await observed.promise;
  assert.equal(transport.closureVerified, true);
  assert.equal(transport.close(), close);
  await assert.rejects(transport.verifyClosed(), /no signal sent/u);
});
