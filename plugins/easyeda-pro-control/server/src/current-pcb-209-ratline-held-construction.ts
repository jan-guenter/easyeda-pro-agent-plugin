/** Retain the finite original reply transcript for one same-realm construction
 * join. The native channel supplies only its issued PCB commands and replies.
 * This supplies no Worker/CDP identity or imported-source continuation. */
import { z } from "zod";
import type { CurrentPcb209RatlineNativeCommand } from "./current-pcb-209-ratline-native-cases.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as PROGRAMS } from "./current-pcb-209-ratline-capture-program.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.object({ result: z.looseObject({ type: z.literal("object"), objectId: token }) }).strict();
const yes = z.object({ result: z.looseObject({ type: z.literal("boolean"), value: z.literal(true) }) }).strict();
const workerId = z.number().int().nonnegative();
const factoryValue = z.object({ nativeWorkerId: workerId }).strict();
const factory = z.object({ result: z.looseObject({ type: z.literal("object"), value: factoryValue }) }).strict();
const phases = ["creation-worker", "creation-this", "object-this", "object-t", "object-o", "relation-bridge", "object-this", "relation-factory"] as const;
type Command = CurrentPcb209RatlineNativeCommand | CurrentPcbWorkerStartupCommand;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_HELD_CONSTRUCTION_${code}`); } }

export class CurrentPcb209RatlineHeldConstruction {
  readonly #handles = new Map<number, string>();
  #next = 0;
  #consumed = false;
  #session: string | null = null;
  #constructionFrame: string | null = null;
  #bridgeFrame: string | null = null;
  public observeReply(phase: string, command: Command, reply: unknown): void {
    if (!phases.some(value => value === phase)) { return; }
    need(!this.#consumed && phase === phases[this.#next], "REPLY_SEQUENCE");
    need("sessionId" in command && (this.#session === null || this.#session === command.sessionId), "SESSION");
    this.#session = command.sessionId;
    const index = this.#next;
    if (index === 5 || index === 7) {
      need(command.method === "Runtime.callFunctionOn" && "objectId" in command.params && !command.params.awaitPromise, "RELATION");
      const expected = index === 5 ? [2, 3, 4] : [6, 3, 2, 4];
      const actual = [command.params.objectId, ...command.params.arguments.map(argument => argument.objectId)];
      need(command.params.functionDeclaration === (index === 5 ? PROGRAMS.bridge : PROGRAMS.factory) &&
        expected.length === actual.length && expected.every((slot, ordinal) => this.#handles.get(slot) === actual[ordinal]), "RELATION_HANDLES");
      if (index === 5) { yes.parse(reply); } else { factory.parse(reply); }
    } else {
      need(command.method === "Debugger.evaluateOnCallFrame", "SELECTION");
      if (index === 0) { this.#constructionFrame = command.params.callFrameId; }
      if (index === 1) { need(command.params.callFrameId === this.#constructionFrame, "CONSTRUCTION_FRAME"); }
      if (index === 2) { this.#bridgeFrame = command.params.callFrameId; }
      if (index === 3 || index === 4) { need(command.params.callFrameId === this.#bridgeFrame, "BRIDGE_FRAME"); }
      this.#handles.set(index, remote.parse(reply).result.objectId);
    }
    this.#next += 1;
  }
  public assertOriginalJoin(command: Command): void {
    need(!this.#consumed && this.#next === phases.length && command.method === "Runtime.callFunctionOn" &&
      command.sessionId === this.#session && "objectId" in command.params && !command.params.awaitPromise && command.params.functionDeclaration === PROGRAMS.construction,
    "JOIN_STATE");
    const actual = [command.params.objectId, ...command.params.arguments.map(argument => argument.objectId)], expected = [0, 3, 1, 6];
    need(expected.length === actual.length && expected.every((slot, index) => this.#handles.get(slot) === actual[index]), "JOIN_HANDLES");
  }
  public consumeOriginalJoin(command: Command): void { this.assertOriginalJoin(command); this.#consumed = true; }
  public observeOriginalJoinReply(reply: unknown): void { need(this.#consumed, "JOIN_UNCONSUMED"); yes.parse(reply); }
}
