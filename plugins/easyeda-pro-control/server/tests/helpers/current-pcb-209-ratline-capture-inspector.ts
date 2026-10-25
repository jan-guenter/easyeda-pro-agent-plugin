import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { WebSocket } from "ws";
import { z } from "zod";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES } from "../../src/current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureRole } from "../../src/current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureTransport } from "../../src/current-pcb-209-ratline-capture-runner.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "../../src/current-pcb-209-ratline-source.ts";
import { ratlineCaptureFixtureSource } from "./current-pcb-209-ratline-capture-fixture.ts";

async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The active setup, request or teardown wait reports the original failure.
  }
}
async function deadline<T>(work: Promise<T>, phase: string, milliseconds = 10_000): Promise<T> {
  const expired = Promise.withResolvers<never>();
  const timer = setTimeout(() => { expired.reject(new Error(`RATLINE_FIXTURE_DEADLINE_${phase}`)); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}

/** Actual V8 pause delivery in a synthetic Node child. This owner deliberately
 * does not attest an EasyEDA native source, process, Worker or message peer. */
export async function ratlineCaptureInspector(context: TestContext, role: CurrentPcb209RatlineCaptureRole,
  loseAtPause = 0, pauseAtFinalReproof = false, exitBeforeAddress = false,
  options: Readonly<{ holdPcbResult?: boolean; expectedPauses?: number; onScriptParsed?: (params: unknown) => void }> = {}): Promise<Readonly<{ transport: CurrentPcb209RatlineCaptureTransport; commands: string[];
    request: (method: string, params: object) => Promise<unknown>; run: () => Promise<unknown>; lose: () => void; regain: () => void; terminate: () => Promise<void>; counts: () => Readonly<{ pauses: number; resumes: number; subscribers: number }> }>> {
  // The hostile case is an owned child that exits normally before advertising
  // Any inspector. The old unbounded address wait could never settle here.
  const args = exitBeforeAddress ? ["--input-type=commonjs", "-e", "process.exitCode=0"] :
    ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", "setInterval(()=>{},1000)"];
  const child = spawn(process.execPath, args, { stdio: ["pipe", "pipe", "pipe"] });
  const address = Promise.withResolvers<string>(), closed = Promise.withResolvers<null>(), exited = Promise.withResolvers<null>();
  const pending = new Map<number, Readonly<{ reply: PromiseWithResolvers<unknown>; timer: ReturnType<typeof setTimeout> }>>();
  const subscribers = new Set<Parameters<CurrentPcb209RatlineCaptureTransport["subscribe"]>[0]>();
  const expectedPauses = options.expectedPauses ?? CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role].sequence.length, extraPause = Promise.withResolvers<null>();
  let extraPauseRequested = false;
  let nextId = 1, ownerCurrent = true, pauses = 0, resumes = 0, terminated = false;
  let failure: Error | null = null, socket: WebSocket | null = null, teardown: Promise<void> | null = null;
  let stderr = "";
  const commands: string[] = [];
  const fail = (error: Error): void => {
    failure ??= error; ownerCurrent = false; address.reject(failure); extraPause.reject(failure);
    for (const value of pending.values()) { clearTimeout(value.timer); value.reply.reject(failure); } pending.clear();
    for (const subscriber of subscribers) { subscriber.lost(); }
  };
  void observed(address.promise); void observed(extraPause.promise);
  child.once("error", error => { fail(error); });
  child.once("exit", (code, signal) => { terminated = true; exited.resolve(null);
    fail(new Error(`RATLINE_FIXTURE_CHILD_EXIT_${String(code)}_${String(signal)}`)); });
  child.once("close", () => { closed.resolve(null); });
  child.stderr.on("data", (data: Buffer) => {
    stderr += data.toString("utf8");
    if (stderr.length > 32_768) { fail(new Error("RATLINE_FIXTURE_STDERR_BOUND")); return; }
    const match = /ws:\/\/127\.0\.0\.1:\d+\/[a-f\d-]+/u.exec(stderr); if (match !== null) { address.resolve(match[0]); }
  });
  const terminate = (): Promise<void> => {
    if (teardown !== null) { return teardown; }
    // Publish teardown consumption before closing the socket or child. This
    // Owns only the synthetic Node fixture, never a host facade or EasyEDA.
    const complete = Promise.withResolvers<null>();
    teardown = (async (): Promise<void> => { await complete.promise; })();
    void (async (): Promise<void> => {
      try {
        socket?.terminate();
        if (!terminated && child.pid !== undefined) { child.kill(); }
        if (child.pid !== undefined) {
          try { await deadline(exited.promise, "CHILD_EXIT", 5000); }
          catch { child.kill("SIGKILL"); await deadline(exited.promise, "FORCED_FIXTURE_EXIT", 5000); }
        }
        await deadline(closed.promise, "CHILD_CLOSE", 5000); complete.resolve(null);
      } catch (error) { complete.reject(error); }
    })();
    return teardown;
  };
  context.after(terminate);
  const originalSocket = new WebSocket(await deadline(address.promise, "ADDRESS")); socket = originalSocket;
  originalSocket.on("error", error => { fail(error); });
  originalSocket.once("close", () => { fail(new Error("RATLINE_FIXTURE_SOCKET_CLOSED")); });
  await deadline(once(originalSocket, "open"), "SOCKET_OPEN");
  originalSocket.on("message", bytes => {
    let buffer: Buffer;
    if (Array.isArray(bytes)) { buffer = Buffer.concat(bytes); } else if (Buffer.isBuffer(bytes)) { buffer = bytes; } else { buffer = Buffer.from(bytes); }
    let value: unknown;
    try { value = JSON.parse(buffer.toString("utf8")) as unknown; } catch (error) { fail(new Error("RATLINE_FIXTURE_JSON", { cause: error })); return; }
    const parsed = z.looseObject({ id: z.number().optional(), method: z.string().optional(), params: z.unknown().optional(),
      result: z.unknown().optional(), error: z.unknown().optional() }).safeParse(value);
    if (!parsed.success) { fail(new Error("RATLINE_FIXTURE_MESSAGE")); return; } const event = parsed.data;
    if (event.id !== undefined) {
      const entry = pending.get(event.id); pending.delete(event.id); if (entry !== undefined) { clearTimeout(entry.timer); }
      if (event.error === undefined) { entry?.reply.resolve(event.result); } else { entry?.reply.reject(new Error(JSON.stringify(event.error))); }
    } else if (event.method === "Debugger.scriptParsed") {
      options.onScriptParsed?.(event.params);
    } else if (event.method === "Debugger.paused") {
      pauses += 1; if (pauses === loseAtPause) { ownerCurrent = false; }
      for (const subscriber of subscribers) { subscriber.paused(event.params); }
      if (pauses > expectedPauses) { extraPause.resolve(null); }
    } else if (event.method === "Debugger.resumed") {
      resumes += 1; for (const subscriber of subscribers) { subscriber.resumed(); }
    }
  });
  const request = (method: string, params: object): Promise<unknown> => {
    if (failure !== null) { return Promise.reject(failure); }
    const id = nextId; nextId += 1; const reply = Promise.withResolvers<unknown>();
    const timer = setTimeout(() => { fail(new Error(`RATLINE_FIXTURE_REQUEST_DEADLINE_${method}`)); }, 10_000);
    pending.set(id, { reply, timer }); commands.push(method);
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ws reports asynchronous send failure through this callback; retain it in the original pending-request owner.
    originalSocket.send(JSON.stringify({ id, method, params }), error => { if (error) { fail(error); } }); return reply.promise;
  };
  await request("Debugger.enable", {}); await request("Runtime.enable", {});
  const compiled = z.object({ scriptId: z.string() }).strict().parse(await request("Runtime.compileScript", {
    expression: ratlineCaptureFixtureSource(role, options.holdPcbResult), sourceURL: `ratline-${role}-synthetic.js`, persistScript: true,
  }));
  const transport: CurrentPcb209RatlineCaptureTransport = {
    scriptId: compiled.scriptId,
    assertOriginalPinnedRealm: async source => {
      if (pauseAtFinalReproof && !extraPauseRequested && resumes === expectedPauses) {
        extraPauseRequested = true; await request("Debugger.pause", {}); await deadline(extraPause.promise, "EXTRA_PAUSE");
      }
      await Promise.resolve(); assert.ok(ownerCurrent); assert.equal(child.exitCode, null);
      assert.equal(source, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role]); },
    assertOriginalTermination: async (): Promise<void> => { await Promise.resolve(); assert.ok(terminated); },
    request: command => request(command.method, command.params),
    subscribe: events => { subscribers.add(events); return (): void => { subscribers.delete(events); }; },
  };
  return { transport, commands, request, lose: (): void => { ownerCurrent = false; }, regain: (): void => { ownerCurrent = true; }, run: (): Promise<unknown> => request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true }),
    counts: (): Readonly<{ pauses: number; resumes: number; subscribers: number }> => ({ pauses, resumes, subscribers: subscribers.size }),
    terminate };
}
