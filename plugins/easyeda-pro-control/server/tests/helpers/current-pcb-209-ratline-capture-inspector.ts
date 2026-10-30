import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { WebSocket } from "ws";
import { z } from "zod";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES } from "../../src/current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureRole } from "../../src/current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureTransport } from "../../src/current-pcb-209-ratline-capture-runner.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "../../src/current-pcb-209-ratline-source.ts";
// oxlint-disable-next-line import/max-dependencies -- The original IPC challenge adds a Node builtin while retaining all source/transport fixture dependencies.
import { ratlineCaptureFixtureSource } from "./current-pcb-209-ratline-capture-fixture.ts";
import type { RatlineCaptureFixtureOptions } from "./current-pcb-209-ratline-capture-fixture.ts";

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
 * does not attest an EasyEDA native source, process, Worker or message peer.
 * Compilation waits for a nonce-matched IPC packet after the child's first
 * event-loop turn and for its original default execution context. Context loss
 * permanently refuses further requests; teardown keeps the original child. */
export async function ratlineCaptureInspector(context: Pick<TestContext, "after" | "diagnostic">, role: CurrentPcb209RatlineCaptureRole,
  loseAtPause = 0, pauseAtFinalReproof = false, exitBeforeAddress = false,
  options: Readonly<{ holdPcbResult?: boolean; expectedPauses?: number; onScriptParsed?: (params: unknown) => void; onWorkerTermination?: () => void; onPublication?: () => void; world?: RatlineCaptureFixtureOptions["world"] }> = {}): Promise<Readonly<{ transport: CurrentPcb209RatlineCaptureTransport; commands: string[];
    originalContext: () => Readonly<{ id: number; uniqueId: string; childReady: true }>;
    observeContextForTest: (method: string, params: unknown) => void;
    request: (method: string, params: object) => Promise<unknown>; run: () => Promise<unknown>; lose: () => void; regain: () => void; terminate: () => Promise<void>; counts: () => Readonly<{ pauses: number; resumes: number; subscribers: number }> }>> {
  // The hostile case is an owned child that exits normally before advertising
  // Any inspector. The old unbounded address wait could never settle here.
  const parseJson = JSON.parse.bind(JSON), stringifyJson = JSON.stringify.bind(JSON);
  const readyChallenge = randomBytes(16).toString("hex");
  const ready = Promise.withResolvers<null>();
  const args = exitBeforeAddress ? ["--input-type=commonjs", "-e", "process.exitCode=0"] :
    ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", `setImmediate(()=>process.send({kind:"fixture-ready",challenge:${JSON.stringify(readyChallenge)}}));setInterval(()=>{},1000)`];
  const child = spawn(process.execPath, args, { stdio: ["pipe", "pipe", "pipe", "ipc"] });

  const address = Promise.withResolvers<string>(), closed = Promise.withResolvers<null>(), exited = Promise.withResolvers<null>();
  const pending = new Map<number, Readonly<{ method: string; reply: PromiseWithResolvers<unknown>; timer: ReturnType<typeof setTimeout> }>>();
  const subscribers = new Set<Parameters<CurrentPcb209RatlineCaptureTransport["subscribe"]>[0]>();
  const expectedPauses = options.expectedPauses ?? CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role].sequence.length, extraPause = Promise.withResolvers<null>();
  let extraPauseRequested = false;
  let nextId = 1, ownerCurrent = true, pauses = 0, resumes = 0, terminated = false;
  let failure: Error | null = null, failureBeforeTeardown = false, socket: WebSocket | null = null, teardown: Promise<void> | null = null;
  let stderr = "";
  let childReady = false;
  const contextReady = Promise.withResolvers<null>();
  let originalContext: Readonly<{ id: number; uniqueId: string; childReady: true }> | null = null;
  const commands: string[] = [];
  const pendingContext = (): Readonly<{ pendingRequestCount: number; pendingMethods: readonly string[]; pendingMethodsTruncated: boolean }> => Object.freeze({
    pendingRequestCount: pending.size, pendingMethods: Object.freeze([...pending.values()].slice(0, 16).map(value => value.method.slice(0, 80))),
    pendingMethodsTruncated: pending.size > 16 });
  let initialFailurePending: ReturnType<typeof pendingContext> | null = null;
  const boundedStderr = (): string => {
    let text = Buffer.from(stderr, "utf8").subarray(0, 32_768).toString("utf8");
    // A boundary inside a multibyte character can add one replacement glyph.
    if (Buffer.byteLength(text) > 32_768) { text = text.slice(0, -1); }
    return text;
  };
  const failureContext = (): Readonly<Record<string, unknown>> => Object.freeze({ role, childPid: child.pid ?? null, ...pendingContext(), initialFailurePending,
    childExitCode: child.exitCode, childSignalCode: child.signalCode, teardownConsumed: teardown !== null,
    childStderr: boundedStderr(), childStderrTruncated: Buffer.byteLength(stderr) > 32_768,
    pauses, resumes, subscribers: subscribers.size, childReady, originalContext });
  const fail = (error: Error): void => {
    if (failure === null) { failureBeforeTeardown = teardown === null; initialFailurePending = pendingContext(); }
    failure ??= error; ownerCurrent = false; address.reject(failure); extraPause.reject(failure); ready.reject(failure); contextReady.reject(failure);
    for (const value of pending.values()) { clearTimeout(value.timer); value.reply.reject(failure); } pending.clear();
    for (const subscriber of subscribers) { subscriber.lost(); }
  };
  void observed(address.promise); void observed(extraPause.promise); void observed(ready.promise); void observed(contextReady.promise);
  child.on("message", message => {
    const parsed = z.discriminatedUnion("kind", [z.object({ kind: z.literal("fixture-ready"), challenge: z.string() }).strict(),
      z.object({ kind: z.enum(["worker-termination", "publication"]) }).strict()]).safeParse(message);
    if (!parsed.success) { fail(new Error("RATLINE_FIXTURE_IPC_PACKET")); return; }
    const value = parsed.data;
    if (value.kind === "fixture-ready") {
      if (childReady || value.challenge !== readyChallenge || !child.connected || child.exitCode !== null || child.signalCode !== null) {
        fail(new Error("RATLINE_FIXTURE_READY_IDENTITY")); return;
      }
      childReady = true; ready.resolve(null); return;
    }
    if (value.kind === "worker-termination") { options.onWorkerTermination?.(); } else { options.onPublication?.(); }
  });
  /** Reprove original child readiness and retained context identity without
   * borrowing a later context or reviving a failed request after teardown. */
  const requireContext = (): Readonly<{ id: number; uniqueId: string; childReady: true }> => {
    if (failure !== null) { throw failure; }
    if (!childReady || !child.connected || child.exitCode !== null || child.signalCode !== null || originalContext === null) {
      throw new Error("RATLINE_FIXTURE_ORIGINAL_CONTEXT");
    }
    return originalContext;
  };
  /** Retain the original default-context event. Repeated identical
   * notifications are legal; replacement, destruction or clearing is sticky.
   * The returned test-only observer seam injects negative protocol events into
   * this same state machine and grants no EasyEDA context authority. */
  const observeContext = (method: string, params: unknown): void => {
    try {
      if (method === "Runtime.executionContextCreated") {
        const auxData = z.looseObject({ isDefault: z.boolean() });
        const contextSchema = z.looseObject({ id: z.number().int().positive().max(2_147_483_647), uniqueId: z.string().min(1).max(256), auxData });
        const value = z.object({ context: contextSchema }).strict().parse(params).context;
        if (!value.auxData.isDefault) { return; }
        if (originalContext !== null && (value.id !== originalContext.id || value.uniqueId !== originalContext.uniqueId)) {
          throw new Error("RATLINE_FIXTURE_CONTEXT_CHANGED");
        }
        if (!childReady) { throw new Error("RATLINE_FIXTURE_CONTEXT_BEFORE_READY"); }
        originalContext ??= Object.freeze({ id: value.id, uniqueId: value.uniqueId, childReady: true }); contextReady.resolve(null);
      } else if (method === "Runtime.executionContextDestroyed") {
        const value = z.looseObject({ executionContextId: z.number().int().positive(), executionContextUniqueId: z.string().optional() }).parse(params);
        if (originalContext !== null && (value.executionContextId === originalContext.id || value.executionContextUniqueId === originalContext.uniqueId)) {
          throw new Error("RATLINE_FIXTURE_CONTEXT_DESTROYED");
        }
      } else if (method === "Runtime.executionContextsCleared" && originalContext !== null) { throw new Error("RATLINE_FIXTURE_CONTEXT_CLEARED"); }
    } catch (error) { fail(error instanceof Error ? error : new Error("RATLINE_FIXTURE_CONTEXT_EVENT", { cause: error })); }
  };
  child.once("error", error => { fail(error); });
  child.once("exit", (code, signal) => { terminated = true; exited.resolve(null);
    fail(new Error(`RATLINE_FIXTURE_CHILD_EXIT_${String(code)}_${String(signal)}`, { cause: failureContext() })); });
  child.once("close", () => {
    // The socket can fail before Node reports why the original child exited.
    // Keep that later observation without changing the first rejection.
    if (failureBeforeTeardown) {
      // JSON escapes C0 controls. Escape the remaining terminal controls and
      // Line separators as well; diagnostic data never becomes console syntax.
      const text = JSON.stringify({ event: "ratline-fixture-child-close", ...failureContext() });
      context.diagnostic(text.replaceAll(/[\u007F-\u009F\u2028\u2029]/gu, value => `\\u${value.codePointAt(0)?.toString(16).padStart(4, "0")}`));
    }
    closed.resolve(null);
  });
  assert.ok(child.stderr !== null); child.stderr.on("data", (data: Buffer) => {
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
  const inspectorAddress = await deadline(address.promise, "ADDRESS");
  await deadline(ready.promise, "READY");
  const originalSocket = new WebSocket(inspectorAddress); socket = originalSocket;
  originalSocket.on("error", error => { fail(error); });
  originalSocket.once("close", () => { fail(new Error("RATLINE_FIXTURE_SOCKET_CLOSED", { cause: failureContext() })); });
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
    } else if (event.method !== undefined && event.method.startsWith("Runtime.executionContext")) {
      observeContext(event.method, event.params);
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
  /** Preserve each original pending request and recheck the retained context
   * after its reply. Compilation/execution cannot silently choose a default
   * realm or a caller-selected replacement. Context checks use only the single
   * serialized envelope, followed by an original-context reproof. No original
   * params getter or toJSON hook runs again before the same bytes are sent.
   * Failure never retries a command or leaves a pre-serialization pending entry. */
  const request = async (method: string, params: object): Promise<unknown> => {
    if (failure !== null) { throw failure; }
    const retainedContext = originalContext === null ? null : requireContext();
    const id = nextId; nextId += 1;
    // Reserve an ID before serialization can reenter, but retain no pending
    // Request or timer until checking the exact inert envelope being sent.
    const serialized = stringifyJson({ id, method, params });
    const envelope = z.object({ id: z.literal(id), method: z.literal(method), params: z.record(z.string(), z.unknown()) }).strict().parse(parseJson(serialized));
    if ((method === "Runtime.compileScript" || method === "Runtime.runScript") &&
      (retainedContext === null || !Object.hasOwn(envelope.params, "executionContextId") || envelope.params["executionContextId"] !== retainedContext.id)) {
      throw new Error("RATLINE_FIXTURE_EXPLICIT_CONTEXT_REQUIRED");
    }
    if (retainedContext !== null && requireContext() !== retainedContext) { throw new Error("RATLINE_FIXTURE_CONTEXT_CHANGED"); }
    const reply = Promise.withResolvers<unknown>();
    const timer = setTimeout(() => { fail(new Error(`RATLINE_FIXTURE_REQUEST_DEADLINE_${method}`)); }, 10_000);
    pending.set(id, { method, reply, timer }); commands.push(method);
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ws reports asynchronous send failure through this callback; retain it in the original pending-request owner.
    originalSocket.send(serialized, error => { if (error) { fail(error); } });
    const value = await reply.promise;
    if (retainedContext !== null && requireContext() !== retainedContext) { throw new Error("RATLINE_FIXTURE_CONTEXT_CHANGED"); }
    return value;
  };
  await request("Debugger.enable", {}); await request("Runtime.enable", {});
  await deadline(contextReady.promise, "CONTEXT_READY");
  const capturedContext = requireContext();
  const compiled = z.object({ scriptId: z.string() }).strict().parse(await request("Runtime.compileScript", {
    expression: ratlineCaptureFixtureSource(role, options.holdPcbResult, { signalWorkerTermination: options.onWorkerTermination !== undefined, ...(options.world === undefined ? {} : { world: options.world }) }), sourceURL: `ratline-${role}-synthetic.js`, persistScript: true, executionContextId: capturedContext.id,
  }));
  assert.equal(requireContext(), capturedContext);
  const transport: CurrentPcb209RatlineCaptureTransport = {
    scriptId: compiled.scriptId,
    assertOriginalPinnedRealm: async source => {
      if (pauseAtFinalReproof && !extraPauseRequested && resumes === expectedPauses) {
        extraPauseRequested = true; await request("Debugger.pause", {}); await deadline(extraPause.promise, "EXTRA_PAUSE");
      }
      await Promise.resolve(); assert.ok(ownerCurrent); assert.equal(child.exitCode, null); assert.equal(requireContext(), capturedContext);
      assert.equal(source, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role]); },
    assertOriginalTermination: async (): Promise<void> => { await Promise.resolve(); assert.ok(terminated); },
    request: command => request(command.method, command.params),
    subscribe: events => { subscribers.add(events); return (): void => { subscribers.delete(events); }; },
  };
  return { transport, commands, request, originalContext: requireContext, observeContextForTest: observeContext, lose: (): void => { ownerCurrent = false; }, regain: (): void => { ownerCurrent = true; }, run: (): Promise<unknown> => { const current = requireContext(); assert.equal(current, capturedContext);
      return request("Runtime.runScript", { scriptId: compiled.scriptId, executionContextId: current.id, returnByValue: true }); },
    counts: (): Readonly<{ pauses: number; resumes: number; subscribers: number }> => ({ pauses, resumes, subscribers: subscribers.size }),
    terminate };
}
