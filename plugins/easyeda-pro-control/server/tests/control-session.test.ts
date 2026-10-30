import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  MAXIMUM_REQUEST_BYTES,
  boundedLines,
  parseSessionConfiguration,
  parseSessionRequest,
  runSessionRequests,
  sessionFailureDiagnostic,
  sessionMachineLaunchConfiguration,
  sessionTransportEnvironment,
} from "../../scripts/control-session.ts";
import { machineProfileSchema } from "../src/machine-profile.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";

async function* values<T>(items: readonly T[]): AsyncGenerator<T> {
  yield* await Promise.resolve(items);
}

void test("session selection requires the complete installed bundled-launch contract", async () => {
  const source = await readFile(new URL("../../.mcp.json", import.meta.url), "utf8");
  const configuration = parseSessionConfiguration(JSON.parse(source));
  const server = configuration.mcpServers.easyeda_pro_control;
  assert.deepEqual(server.args, ["server/dist/server.mjs", "--machine-launch"]);
  for (const candidate of [{ ...server, args: ["scripts/launch-machine.ts"] },
    { ...server, args: ["server/dist/server.mjs"] },
    { ...server, args: ["--machine-launch", "server/dist/server.mjs"] },
    { ...server, args: ["server/dist/server.mjs", "--machine-launch", "--profile", "/caller/profile"] },
    { ...server, command: "/private/node" }, { ...server, enabled: false },
    { ...server, env: { EASYEDA_CONTROL_DATA_DIR: "/caller/control" } }]) {
    assert.throws(() => parseSessionConfiguration({ mcpServers: { easyeda_pro_control: candidate } }));
  }
  assert.throws(() => parseSessionConfiguration({ mcpServers: { ...configuration.mcpServers, other: server } }));
});

void test("session preserves only the WSL share identity in addition to its configured environment", () => {
  const definition = { EASYEDA_CONTROL_DATA_DIR: "/private/control" };
  assert.deepEqual(sessionTransportEnvironment(definition, { WSL_DISTRO_NAME: "ReviewDistro", SECRET_TOKEN: "withheld", PATH: "/unreviewed" }), { ...definition, WSL_DISTRO_NAME: "ReviewDistro" });
  assert.deepEqual(sessionTransportEnvironment(definition, {}), definition);
  assert.deepEqual(definition, { EASYEDA_CONTROL_DATA_DIR: "/private/control" });
});

void test("startup diagnostics classify fixed causes without exposing private data or invoking exception hooks", () => {
  const secret = "private-startup-canary";
  const prefix = { error: "session-stopped", privateDiagnosticsWithheld: true };
  const filesystem = Object.assign(new Error(secret), { code: "ENOENT", errno: -2, path: secret, env: secret });
  assert.deepEqual(sessionFailureDiagnostic("plugin-root", filesystem), {
    ...prefix, phase: "plugin-root", reason: "operating-system-error", osCode: "ENOENT", errno: -2,
  });
  assert.deepEqual(sessionFailureDiagnostic("connect", { code: -32_001, message: secret, data: { token: secret } }), {
    ...prefix, phase: "connect", reason: "request-timeout", protocolCode: -32_001,
  });
  assert.deepEqual(sessionFailureDiagnostic("connect", { code: -32_000, message: secret }), {
    ...prefix, phase: "connect", reason: "connection-closed", protocolCode: -32_000,
  });
  assert.equal(sessionFailureDiagnostic("bundle-file-validate", new Error("bundle-drift")).reason, "bundle-drift");
  assert.equal(sessionFailureDiagnostic("bundle-file-validate", new Error(`bundle-drift: ${secret}`)).reason, "unclassified");
  assert.equal(sessionFailureDiagnostic("configuration-parse", new SyntaxError(secret)).reason, "json-rejected");
  let schemaFailure: unknown;
  try { parseSessionConfiguration({}); } catch (error) { schemaFailure = error; }
  assert.equal(sessionFailureDiagnostic("configuration-parse", schemaFailure).reason, "schema-rejected");
  let hooks = 0;
  const accessor = Object.defineProperties({}, {
    code: { get: (): never => { hooks += 1; throw new Error(secret); } },
    message: { get: (): never => { hooks += 1; throw new Error(secret); } },
    toJSON: { value: (): never => { hooks += 1; throw new Error(secret); } },
  });
  const proxy = new Proxy(filesystem, { getOwnPropertyDescriptor: (): never => { hooks += 1; throw new Error(secret); },
    getPrototypeOf: (): never => { hooks += 1; throw new Error(secret); } });
  const inherited: unknown = Object.create({ code: "ENOENT", errno: -2, message: "bundle-drift" });
  const outputs = [accessor, proxy, inherited, { message: secret, code: secret }, new Error(secret)].map(error => sessionFailureDiagnostic(secret, error));
  for (const output of outputs) { assert.deepEqual(output, { ...prefix, phase: "unclassified", reason: "unclassified" }); }
  const malformedErrno = sessionFailureDiagnostic("plugin-root", { code: "ENOENT", errno: secret });
  assert.equal(Object.hasOwn(malformedErrno, "errno"), false);
  assert.equal(JSON.stringify([...outputs, malformedErrno]).includes(secret), false);
  assert.equal(hooks, 0); assert.ok(JSON.stringify(outputs).length < 4096);
});

void test("missing plugin root reports its fixed startup phase before profile or transport startup", {
  skip: process.platform !== "linux" || process.arch !== "x64" || process.version !== "v24.18.0",
}, async () => {
  const isolation = await assertTestIsolation();
  const pluginRoot = join(isolation.directory, "missing-plugin"), profilePath = join(isolation.directory, "unread-profile.json");
  const completed = Promise.withResolvers<Readonly<{ code: string | number; signal: NodeJS.Signals | null; stdout: string; stderr: string }>>();
  execFile(process.execPath, [fileURLToPath(new URL("../../scripts/control-session.ts", import.meta.url)), "--plugin-root", pluginRoot], {
    env: { PATH: "/usr/bin:/bin", EASYEDA_MACHINE_PROFILE: profilePath }, encoding: "utf8", timeout: 10_000, maxBuffer: 32_768,
  },
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This owned child callback retains its expected nonzero exit, bounded output and status without serializing the private exception.
  (error, stdout, stderr) => { completed.resolve({ code: error?.code ?? 0, signal: error?.signal ?? null, stdout, stderr }); });
  const result = await completed.promise;
  assert.equal(result.code, 1); assert.equal(result.signal, null); assert.equal(result.stderr, "");
  const output: unknown = JSON.parse(result.stdout);
  assert.deepEqual(output, { error: "session-stopped", privateDiagnosticsWithheld: true,
    phase: "plugin-root", reason: "operating-system-error", osCode: "ENOENT", errno: -2 });
  assert.equal(result.stdout.includes(pluginRoot), false); assert.equal(result.stdout.includes(profilePath), false);
});

void test("foreground sessions enter the common launcher without carrying direct live configuration", () => {
  const profile = machineProfileSchema.parse({
    schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
    runtime: { nodeExecutable: "/fixture/node", nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) },
    upstream: { root: "/fixture/upstream", entrypoint: "/fixture/upstream/dist/index.js", serverVersion: "1.0.0" },
    easyeda: { assetsRoot: "/fixture/assets", pcbBundleVersion: "3.2.fixture", publicApiBundleVersion: "0.2.fixture" },
    controlDirectory: "/fixture/control",
  });
  assert.deepEqual(sessionMachineLaunchConfiguration("/fixture/control/machine-profile.json", profile, "/fixture/plugin"), {
    command: "/fixture/node",
    args: ["/fixture/plugin/server/dist/server.mjs", "--machine-launch"],
    cwd: "/fixture/plugin",
    env: { EASYEDA_MACHINE_PROFILE: "/fixture/control/machine-profile.json" },
  });
});

void test("session admits only strict facade requests", () => {
  assert.equal(parseSessionRequest('{"id":1,"tool":"easyeda_control_status"}').id, 1);
  assert.equal(parseSessionRequest('{"id":2,"tool":"easyeda_control_pcb209_opening"}').id, 2);
  assert.equal(parseSessionRequest('{"id":3,"tool":"easyeda_control_pcb209_worker_startup"}').id, 3);
  assert.throws(() => parseSessionRequest('{"id":1,"tool":"easyeda_execute"}'));
  assert.throws(() => parseSessionRequest('{"id":1,"tool":"easyeda_control_status","command":"sh"}'));
  for (const tool of ["easyeda_control_209_opening", "easyeda_control__opening", "easyeda_control_PCB209_opening", "easyeda_control_pcb209-opening"]) {
    assert.throws(() => parseSessionRequest(JSON.stringify({ id: 4, tool })));
  }
  assert.throws(() => parseSessionRequest(" ".repeat(MAXIMUM_REQUEST_BYTES + 1)));
});

void test("registered pcb209 tools dispatch serially while syntactically valid unlisted tools still stop without dispatch", async () => {
  const names = ["easyeda_control_pcb209_opening", "easyeda_control_pcb209_worker_startup"] as const;
  const order: unknown[] = [];
  await runSessionRequests(values([
    JSON.stringify({ id: 1, tool: names[0], arguments: { sample: "opening" } }),
    JSON.stringify({ id: 2, tool: names[1], arguments: { sample: "startup" } }),
    JSON.stringify({ id: 3, tool: "easyeda_control_pcb209_unlisted" }),
    JSON.stringify({ id: 4, tool: names[0] }),
  ]), new Set(names), (request) => {
    order.push({ id: request.id, tool: request.tool, arguments: request.arguments });
    return Promise.resolve({ ok: true });
  }, async output => { order.push(output); await Promise.resolve(); });
  assert.deepEqual(order, [
    { id: 1, tool: names[0], arguments: { sample: "opening" } }, { id: 1, result: { ok: true } },
    { id: 2, tool: names[1], arguments: { sample: "startup" } }, { id: 2, result: { ok: true } },
    { id: 3, error: "tool-not-admitted", dispatched: false },
  ]);
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
