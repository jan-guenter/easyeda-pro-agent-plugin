/** Real V8 script parsing, instrumentation and construction pauses with a
 * synthetic parent/worker attachment. This is not Windows/EasyEDA admission. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { WebSocket } from "ws";
import { z } from "zod";
import type { CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../../src/current-pcb-worker-startup-contract.ts";
import { workerConstructionFixtureSource } from "./current-pcb-worker-construction-fixture.ts";

export async function workerStartupInspector(context: TestContext): Promise<Readonly<{
  dependency: CurrentPcbWorkerStartupDependency;
  profile: Readonly<{ relativePath: string; scriptBytes: number; scriptSha256: string }>;
  commands: string[];
  completion: Promise<unknown>;
  completed: () => Promise<boolean>;
  stopped: () => Promise<void>;
}>> {
  const child = spawn(process.execPath, ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", "setInterval(()=>{},1000)"], { stdio: ["pipe", "pipe", "pipe"] });
  const address = Promise.withResolvers<string>(); let stderr = "";
  child.stderr.on("data", (bytes: Buffer) => {
    stderr += bytes.toString("utf8"); const match = /ws:\/\/127\.0\.0\.1:\d+\/[a-f\d-]+/u.exec(stderr);
    if (match !== null) { address.resolve(match[0]); }
  });
  context.after(() => { child.kill(); });
  const socket = new WebSocket(await address.promise); await once(socket, "open"); context.after(() => { socket.close(); });
  const commands: string[] = [], pending = new Map<number, PromiseWithResolvers<unknown>>();
  const subscribers = new Set<(event: CurrentPcbWorkerStartupEvent) => void>();
  const scriptIds = new Set<string>();
  const relativePath = "synthetic/project-worker.js", source = workerConstructionFixtureSource(), url = `file:///${relativePath}`;
  const completion = Promise.withResolvers<unknown>(); let contextId = 0, contextUniqueId = "", instrumented = false, nextId = 1;
  const emit = (method: string, params: Readonly<Record<string, unknown>>, sessionId = "worker-session"): void => {
    for (const subscriber of subscribers) { subscriber({ method, params, sessionId }); }
  };
  socket.on("message", bytes => {
    let buffer: Buffer;
    if (Array.isArray(bytes)) { buffer = Buffer.concat(bytes); }
    else if (Buffer.isBuffer(bytes)) { buffer = bytes; }
    else { buffer = Buffer.from(bytes); }
    const message = z.looseObject({ id: z.number().optional(), method: z.string().optional(),
      params: z.record(z.string(), z.unknown()).optional(), result: z.unknown().optional(), error: z.unknown().optional() }).parse(JSON.parse(buffer.toString("utf8")));
    if (message.id !== undefined) {
      const entry = pending.get(message.id); pending.delete(message.id);
      if (message.error === undefined) { entry?.resolve(message.result); } else { entry?.reject(new Error(JSON.stringify(message.error))); }
      return;
    }
    if (message.method === undefined || message.params === undefined) { return; }
    if (message.method === "Runtime.executionContextCreated") {
      const parsed = z.object({ context: z.looseObject({ id: z.number(), uniqueId: z.string() }) }).strict().parse(message.params);
      contextId = parsed.context.id; contextUniqueId = parsed.context.uniqueId; return;
    }
    if (message.method === "Debugger.scriptParsed") {
      if (message.params["url"] === url) {
        scriptIds.add(z.string().parse(message.params["scriptId"])); emit(message.method, message.params);
      } else if (instrumented && message.params["url"] === "" && scriptIds.size > 0) { emit(message.method, message.params); }
      return;
    }
    if (message.method === "Debugger.paused" || message.method === "Debugger.resumed") { emit(message.method, message.params); }
  });
  const request = (method: string, params: object): Promise<unknown> => {
    const id = nextId; nextId += 1; const entry = Promise.withResolvers<unknown>(); pending.set(id, entry);
    socket.send(JSON.stringify({ id, method, params })); return entry.promise;
  };
  const dependency: CurrentPcbWorkerStartupDependency = {
    parentTargetId: "parent-target", parentSessionId: "parent-session",
    assertOriginalOwner: async (): Promise<void> => { await Promise.resolve(); assert.equal(child.exitCode, null); },
    assertOriginalTermination: async (): Promise<void> => { await Promise.resolve(); assert.ok(child.exitCode !== null || child.signalCode !== null); },
    subscribe: event => { subscribers.add(event); return (): void => { subscribers.delete(event); }; },
    request: async command => {
      commands.push(command.method);
      if (command.method === "Target.setAutoAttach") {
        emit("Target.attachedToTarget", { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker-target", attached: true, type: "worker", title: "synthetic", url } }, "parent-session"); return {};
      }
      if (command.method === "Runtime.enable") {
        const reply = await request(command.method, command.params);
        emit("Runtime.executionContextCreated", { context: { id: contextId, uniqueId: contextUniqueId, name: "synthetic", origin: url } }); return reply;
      }
      if (command.method === "Runtime.runIfWaitingForDebugger") {
        const running = (async (): Promise<void> => {
          try {
            const compiled = z.object({ scriptId: z.string() }).strict().parse(await request("Runtime.compileScript", { expression: source, sourceURL: url, persistScript: true }));
            completion.resolve(await request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true }));
          } catch (error) { completion.reject(error); }
        })();
        void running; return {};
      }
      if (command.method === "Debugger.setInstrumentationBreakpoint") { instrumented = true; }
      return request(command.method, command.params);
    },
  };
  return { dependency, profile: { relativePath, scriptBytes: Buffer.byteLength(source), scriptSha256: createHash("sha256").update(source).digest("hex") },
    commands, completion: completion.promise,
    completed: async (): Promise<boolean> => z.object({ result: z.object({ type: z.literal("boolean"), value: z.boolean() }).strict() }).strict()
      .parse(await request("Runtime.evaluate", { expression: "globalThis.CONSTRUCTION_COMPLETE===true", returnByValue: true })).result.value,
    stopped: async (): Promise<void> => { const exited = once(child, "exit"); child.kill(); await exited; },
  };
}
