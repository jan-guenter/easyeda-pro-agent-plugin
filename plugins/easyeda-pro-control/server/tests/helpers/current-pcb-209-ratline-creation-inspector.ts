import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { WebSocket } from "ws";
import { z } from "zod";
import type { CurrentPcb209RatlineCreationRole } from "../../src/current-pcb-209-ratline-creation-profile.ts";
import type { CurrentPcb209RatlineCreationTransport } from "../../src/current-pcb-209-ratline-creation-runner.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "../../src/current-pcb-209-ratline-source.ts";
import { ratlineCaptureFixtureSource } from "./current-pcb-209-ratline-capture-fixture.ts";

/** Real V8 constructor pauses with synthetic target inventory and attachments.
 * This child has no native Worker, EasyEDA owner or qualified installed source. */
export async function ratlineCreationInspector(context: TestContext, role: CurrentPcb209RatlineCreationRole, extraChildAtFinalProof = false): Promise<Readonly<{
  transport: CurrentPcb209RatlineCreationTransport; run: () => Promise<unknown>; terminate: () => Promise<void>;
  lose: () => void; counts: () => Readonly<{ pauses: number; resumes: number; childStarts: number; subscribers: number }>;
}>> {
  const child = spawn(process.execPath, ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", "setInterval(()=>{},1000)"], { stdio: ["pipe", "pipe", "pipe"] });
  const address = Promise.withResolvers<string>(); let stderr = "";
  child.stderr.on("data", (bytes: Buffer) => { stderr += bytes.toString("utf8"); const match = /ws:\/\/127\.0\.0\.1:\d+\/[a-f\d-]+/u.exec(stderr);
    if (match !== null) { address.resolve(match[0]); } });
  context.after(() => { child.kill(); });
  const socket = new WebSocket(await address.promise); await once(socket, "open"); context.after(() => { socket.close(); });
  const pending = new Map<number, PromiseWithResolvers<unknown>>(), subscribers = new Set<Parameters<CurrentPcb209RatlineCreationTransport["subscribe"]>[0]>();
  const parent = { targetId: "parent", type: role === "pcb" ? "page" : "worker", title: "pcb-ratline-worker", url: "https://client/editor", attached: true };
  const target = { targetId: "child", type: "worker", title: "pcb-ratline-worker", attached: true,
    url: `https://client/editor?entry=pcb-ratline-worker.js${role === "pcb" ? "&cll=0" : ""}` };
  let childStarts = 0, extra = false, inventories = 0, nextId = 1, owner = true, pauses = 0, resumes = 0, terminated = false;
  const emitAttachment = (second = false): void => {
    const event = { sessionId: "parent-session", params: { sessionId: second ? "second-session" : "child-session",
      targetInfo: second ? { ...target, targetId: "second" } : target, waitingForDebugger: true } };
    for (const subscriber of subscribers) { subscriber.attached(event); }
  };
  socket.on("message", bytes => {
    let buffer: Buffer;
    if (Array.isArray(bytes)) { buffer = Buffer.concat(bytes); } else if (Buffer.isBuffer(bytes)) { buffer = bytes; } else { buffer = Buffer.from(bytes); }
    const message = z.looseObject({ id: z.number().optional(), method: z.string().optional(), params: z.unknown().optional(),
      result: z.unknown().optional(), error: z.unknown().optional() }).parse(JSON.parse(buffer.toString("utf8")));
    if (message.id !== undefined) {
      const reply = pending.get(message.id); pending.delete(message.id);
      if (message.error === undefined) { reply?.resolve(message.result); } else { reply?.reject(new Error(JSON.stringify(message.error))); }
    } else if (message.method === "Debugger.paused") {
      pauses += 1; if (pauses === 2) { emitAttachment(); }
      for (const subscriber of subscribers) { subscriber.paused(message.params); }
    } else if (message.method === "Debugger.resumed") { resumes += 1; for (const subscriber of subscribers) { subscriber.resumed(); } }
  });
  const request = (method: string, params: object): Promise<unknown> => {
    const id = nextId; nextId += 1; const reply = Promise.withResolvers<unknown>(); pending.set(id, reply);
    socket.send(JSON.stringify({ id, method, params })); return reply.promise;
  };
  await request("Debugger.enable", {}); await request("Runtime.enable", {});
  const compiled = z.object({ scriptId: z.string() }).strict().parse(await request("Runtime.compileScript", {
    expression: ratlineCaptureFixtureSource(role), sourceURL: `creation-${role}-synthetic.js`, persistScript: true,
  }));
  const transport: CurrentPcb209RatlineCreationTransport = {
    scriptId: compiled.scriptId, parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalPinnedParentAndAutoAttach: async source => {
      await Promise.resolve(); assert.equal(source, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role]); assert.ok(owner); assert.equal(child.exitCode, null);
      if (extraChildAtFinalProof && !extra && inventories === 2) { extra = true; emitAttachment(true); }
    },
    assertOriginalTermination: async (): Promise<void> => { await Promise.resolve(); assert.ok(terminated); },
    request: command => {
      if (command.method === "Target.getTargets") { inventories += 1; return Promise.resolve({ targetInfos: pauses < 2 ? [parent] : [parent, target] }); }
      if (command.method === "Runtime.runIfWaitingForDebugger") { assert.ok(command.sessionId === "child-session" || command.sessionId === "second-session"); childStarts += 1; return Promise.resolve({}); }
      assert.equal(command.sessionId, "parent-session"); return request(command.method, command.params);
    },
    subscribe: events => { subscribers.add(events); return (): void => { subscribers.delete(events); }; },
  };
  return { transport, run: (): Promise<unknown> => request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true }),
    lose: (): void => { owner = false; for (const subscriber of subscribers) { subscriber.lost(); } },
    counts: (): Readonly<{ pauses: number; resumes: number; childStarts: number; subscribers: number }> => ({ pauses, resumes, childStarts, subscribers: subscribers.size }),
    terminate: async (): Promise<void> => { const exited = once(child, "exit"); child.kill(); await exited; terminated = true; } };
}
