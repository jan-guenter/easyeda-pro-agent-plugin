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

/** Actual V8 pause delivery in a synthetic Node child. This owner deliberately
 * does not attest an EasyEDA native source, process, Worker or message peer. */
export async function ratlineCaptureInspector(context: TestContext, role: CurrentPcb209RatlineCaptureRole,
  loseAtPause = 0, pauseAtFinalReproof = false): Promise<Readonly<{ transport: CurrentPcb209RatlineCaptureTransport; commands: string[];
    run: () => Promise<unknown>; lose: () => void; regain: () => void; terminate: () => Promise<void>; counts: () => Readonly<{ pauses: number; resumes: number; subscribers: number }> }>> {
  const child = spawn(process.execPath, ["--inspect=127.0.0.1:0", "--input-type=commonjs", "-e", "setInterval(()=>{},1000)"], { stdio: ["pipe", "pipe", "pipe"] });
  const address = Promise.withResolvers<string>(); let stderr = "";
  child.stderr.on("data", (data: Buffer) => { stderr += data.toString("utf8"); const match = /ws:\/\/127\.0\.0\.1:\d+\/[a-f\d-]+/u.exec(stderr);
    if (match !== null) { address.resolve(match[0]); } });
  context.after(() => { child.kill(); });
  const socket = new WebSocket(await address.promise); await once(socket, "open"); context.after(() => { socket.close(); });
  const pending = new Map<number, PromiseWithResolvers<unknown>>();
  const subscribers = new Set<Parameters<CurrentPcb209RatlineCaptureTransport["subscribe"]>[0]>();
  const expectedPauses = CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role].sequence.length, extraPause = Promise.withResolvers<null>();
  let extraPauseRequested = false;
  let nextId = 1, ownerCurrent = true, pauses = 0, resumes = 0, terminated = false;
  const commands: string[] = [];
  socket.on("message", bytes => {
    let buffer: Buffer;
    if (Array.isArray(bytes)) { buffer = Buffer.concat(bytes); } else if (Buffer.isBuffer(bytes)) { buffer = bytes; } else { buffer = Buffer.from(bytes); }
    const event = z.looseObject({ id: z.number().optional(), method: z.string().optional(), params: z.unknown().optional(),
      result: z.unknown().optional(), error: z.unknown().optional() }).parse(JSON.parse(buffer.toString("utf8")));
    if (event.id !== undefined) {
      const reply = pending.get(event.id); pending.delete(event.id);
      if (event.error === undefined) { reply?.resolve(event.result); } else { reply?.reject(new Error(JSON.stringify(event.error))); }
    } else if (event.method === "Debugger.paused") {
      pauses += 1; if (pauses === loseAtPause) { ownerCurrent = false; }
      for (const subscriber of subscribers) { subscriber.paused(event.params); }
      if (pauses > expectedPauses) { extraPause.resolve(null); }
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
    expression: ratlineCaptureFixtureSource(role), sourceURL: `ratline-${role}-synthetic.js`, persistScript: true,
  }));
  const transport: CurrentPcb209RatlineCaptureTransport = {
    scriptId: compiled.scriptId,
    assertOriginalPinnedRealm: async source => {
      if (pauseAtFinalReproof && !extraPauseRequested && resumes === expectedPauses) {
        extraPauseRequested = true; await request("Debugger.pause", {}); await extraPause.promise;
      }
      await Promise.resolve(); assert.ok(ownerCurrent); assert.equal(child.exitCode, null);
      assert.equal(source, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role]); },
    assertOriginalTermination: async (): Promise<void> => { await Promise.resolve(); assert.ok(terminated); },
    request: command => request(command.method, command.params),
    subscribe: events => { subscribers.add(events); return (): void => { subscribers.delete(events); }; },
  };
  return { transport, commands, lose: (): void => { ownerCurrent = false; }, regain: (): void => { ownerCurrent = true; }, run: (): Promise<unknown> => request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true }),
    counts: (): Readonly<{ pauses: number; resumes: number; subscribers: number }> => ({ pauses, resumes, subscribers: subscribers.size }),
    terminate: async (): Promise<void> => { const closed = once(child, "exit"); child.kill(); await closed; terminated = true; } };
}
