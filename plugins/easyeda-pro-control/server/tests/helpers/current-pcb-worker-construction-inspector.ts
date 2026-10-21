import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { WebSocket } from "ws";
import { z } from "zod";
import type { CurrentPcbWorkerConstructionTransport } from "../../src/current-pcb-worker-construction-contract.ts";
import { workerConstructionFixtureSource } from "./current-pcb-worker-construction-fixture.ts";

/** This launches only this test's synthetic Node process, never EasyEDA or a
 * plugin facade. Its ordinary OS process is not native runtime admission. */
export async function constructionInspector(context: TestContext, loseAtPause = 0): Promise<Readonly<{
  transport: CurrentPcbWorkerConstructionTransport; commands: string[];
  counts: () => Readonly<{ pauses: number; resumes: number }>; lose: () => void;
  run: () => Promise<unknown>; completed: () => Promise<boolean>; interrupt: () => Promise<void>;
}>> {
  const child = spawn(process.execPath, ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", "setInterval(()=>{},1000)"], { stdio: ["pipe", "pipe", "pipe"] });
  const address = Promise.withResolvers<string>(); let stderr = "";
  child.stderr.on("data", (data: Buffer) => {
    stderr += data.toString("utf8"); const match = /ws:\/\/127\.0\.0\.1:\d+\/[a-f\d-]+/u.exec(stderr);
    if (match !== null) { address.resolve(match[0]); }
  });
  context.after(() => { child.kill(); });
  const socket = new WebSocket(await address.promise); await once(socket, "open");
  context.after(() => { socket.close(); });
  const pending = new Map<number, PromiseWithResolvers<unknown>>();
  const subscribers = new Set<Parameters<CurrentPcbWorkerConstructionTransport["subscribe"]>[0]>();
  let nextId = 1, ownerCurrent = true, pauses = 0, resumes = 0;
  const commands: string[] = [];
  socket.on("message", bytes => {
    let buffer: Buffer;
    if (Array.isArray(bytes)) { buffer = Buffer.concat(bytes); }
    else if (Buffer.isBuffer(bytes)) { buffer = bytes; }
    else { buffer = Buffer.from(bytes); }
    const event = z.looseObject({ id: z.number().optional(), method: z.string().optional(), params: z.unknown().optional(),
      result: z.unknown().optional(), error: z.unknown().optional() }).parse(JSON.parse(
        buffer.toString("utf8")));
    if (event.id !== undefined) {
      const reply = pending.get(event.id); pending.delete(event.id);
      if (event.error === undefined) { reply?.resolve(event.result); } else { reply?.reject(new Error(JSON.stringify(event.error))); }
    } else if (event.method === "Debugger.paused") {
      pauses += 1; if (pauses === loseAtPause) { ownerCurrent = false; }
      for (const subscriber of subscribers) { subscriber.paused(event.params); }
    } else if (event.method === "Debugger.resumed") {
      resumes += 1; for (const subscriber of subscribers) { subscriber.resumed(); }
    }
  });
  const request = (method: string, params: object): Promise<unknown> => {
    const id = nextId; nextId += 1; const reply = Promise.withResolvers<unknown>(); pending.set(id, reply);
    commands.push(method); socket.send(JSON.stringify({ id, method, params })); return reply.promise;
  };
  await request("Debugger.enable", {}); await request("Runtime.enable", {});
  const compiled = z.object({ scriptId: z.string() }).strict().parse(await request("Runtime.compileScript", {
    expression: workerConstructionFixtureSource(), sourceURL: "worker-construction-synthetic.js", persistScript: true,
  }));
  const transport: CurrentPcbWorkerConstructionTransport = {
    scriptId: compiled.scriptId,
    assertOriginalPinnedWorker: async (): Promise<void> => { await Promise.resolve(); assert.ok(ownerCurrent); assert.equal(child.exitCode, null); },
    request: command => request(command.method, command.params),
    subscribe: events => { subscribers.add(events); return (): void => { subscribers.delete(events); }; },
  };
  return { transport, commands, counts: (): Readonly<{ pauses: number; resumes: number }> => ({ pauses, resumes }),
    lose: (): void => { ownerCurrent = false; },
    interrupt: async (): Promise<void> => {
      const observed = Promise.withResolvers<null>();
      const listener = { paused: (): void => { observed.resolve(null); }, resumed: (): void => {
        // Only the pause is awaited here.
      },
        lost: (): void => { observed.reject(new Error("Synthetic inspector lost")); } };
      subscribers.add(listener);
      try { await request("Debugger.pause", {}); await observed.promise; } finally { subscribers.delete(listener); }
    },
    run: (): Promise<unknown> => request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true }),
    completed: async (): Promise<boolean> => z.object({ result: z.object({ type: z.literal("boolean"), value: z.boolean() }).strict() }).strict()
      .parse(await request("Runtime.evaluate", { expression: "globalThis.CONSTRUCTION_COMPLETE===true", returnByValue: true })).result.value,
  };
}
