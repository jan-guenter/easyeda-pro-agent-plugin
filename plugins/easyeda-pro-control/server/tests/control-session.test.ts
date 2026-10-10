import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAXIMUM_REQUEST_BYTES,
  boundedLines,
  parseSessionRequest,
  runSessionRequests,
  sessionTransportEnvironment,
} from "../../scripts/control-session.ts";

async function* values<T>(items: readonly T[]): AsyncGenerator<T> {
  yield* await Promise.resolve(items);
}

void test("session preserves only the WSL share identity in addition to its configured environment", () => {
  const definition = { EASYEDA_CONTROL_DATA_DIR: "/private/control" };
  assert.deepEqual(sessionTransportEnvironment(definition, { WSL_DISTRO_NAME: "ReviewDistro", SECRET_TOKEN: "withheld", PATH: "/unreviewed" }), { ...definition, WSL_DISTRO_NAME: "ReviewDistro" });
  assert.deepEqual(sessionTransportEnvironment(definition, {}), definition);
  assert.deepEqual(definition, { EASYEDA_CONTROL_DATA_DIR: "/private/control" });
});

void test("session admits only strict facade requests", () => {
  assert.equal(parseSessionRequest('{"id":1,"tool":"easyeda_control_status"}').id, 1);
  assert.throws(() => parseSessionRequest('{"id":1,"tool":"easyeda_execute"}'));
  assert.throws(() => parseSessionRequest('{"id":1,"tool":"easyeda_control_status","command":"sh"}'));
  assert.throws(() => parseSessionRequest(" ".repeat(MAXIMUM_REQUEST_BYTES + 1)));
});

void test("framing preserves split UTF-8 and refuses oversized or incomplete lines", async () => {
  const bytes = Buffer.from('{"name":"µ"}\n');
  const lines: string[] = [];
  for await (const line of boundedLines(values([bytes.subarray(0, 10), bytes.subarray(10)]))) {
    lines.push(line);
  }
  assert.deepEqual(lines, ['{"name":"µ"}']);
  await assert.rejects(async () => {
    for await (const line of boundedLines(values([Buffer.alloc(MAXIMUM_REQUEST_BYTES + 1, 65)]))) {
      assert.fail(line);
    }
  });
  await assert.rejects(async () => {
    for await (const line of boundedLines(values([Buffer.from("{}")]))) {
      assert.fail(line);
    }
  });
});

void test("valid requests longer than a canonical terminal line dispatch unchanged", async () => {
  const request = {
    id: "long-read",
    tool: "easyeda_control_read",
    arguments: { fingerprint: "f".repeat(8192) },
  };
  const bytes = Buffer.from(`${JSON.stringify(request)}\n`);
  assert.ok(bytes.length > 4096 && bytes.length < MAXIMUM_REQUEST_BYTES);
  const dispatched: unknown[] = [];
  const outputs: unknown[] = [];
  const chunks = [bytes.subarray(0, 4096), bytes.subarray(4096)];
  await runSessionRequests(
    boundedLines(values(chunks)),
    new Set([request.tool]),
    (call) => {
      dispatched.push({ id: call.id, tool: call.tool, arguments: call.arguments });
      return Promise.resolve({ ok: true });
    },
    (output) => {
      outputs.push(output);
      return Promise.resolve();
    },
  );
  assert.deepEqual(dispatched, [request]);
  assert.deepEqual(outputs, [{ id: request.id, result: { ok: true } }]);
});

void test("unknown tools never dispatch and failures never retry or dispatch later lines", async () => {
  const outputs: unknown[] = [];
  let dispatched = 0;
  const invoke = (): Promise<unknown> => {
    dispatched += 1;
    return Promise.reject(new Error("private-test-secret"));
  };
  const emit = (value: unknown): Promise<void> => {
    outputs.push(value);
    return Promise.resolve();
  };
  await runSessionRequests(values(['{"id":1,"tool":"easyeda_control_unlisted"}']),
    new Set(["easyeda_control_status"]), invoke, emit);
  assert.equal(dispatched, 0);
  await runSessionRequests(values([
    '{"id":2,"tool":"easyeda_control_status"}',
    '{"id":3,"tool":"easyeda_control_status"}',
  ]), new Set(["easyeda_control_status"]), invoke, emit);
  assert.equal(dispatched, 1);
  assert.equal(JSON.stringify(outputs).includes("private-test-secret"), false);
});

void test("requests dispatch serially and explicit shutdown ends the session", async () => {
  const order: unknown[] = [];
  await runSessionRequests(values([
    '{"id":1,"tool":"easyeda_control_status"}',
    '{"id":2,"tool":"easyeda_control_context"}',
    '{"id":3,"shutdown":true}',
    '{"id":4,"tool":"easyeda_control_context"}',
  ]), new Set(["easyeda_control_status", "easyeda_control_context"]), (request) => {
    order.push(request.id);
    return Promise.resolve({ ok: true });
  }, async (value) => {
    order.push(value);
    await Promise.resolve();
  });
  assert.deepEqual(order, [
    1, { id: 1, result: { ok: true } },
    2, { id: 2, result: { ok: true } },
    { id: 3, closing: true },
  ]);
});
