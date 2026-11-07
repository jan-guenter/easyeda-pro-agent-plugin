/** Source receipts retain original submission, reply and script event identities.
 * This data cursor selects no worker, performs no poll and resumes no realm. */
import { types } from "node:util";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS as LIMIT, requireCurrentSchematicRelevanceDisplayObservedWorkerCondition as condition, requireCurrentSchematicRelevanceDisplayObservedWorkerProgram as program, qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource as qualify } from "./current-schematic-relevance-display-helper-source-catalogue.ts";

type Kind = "function" | "expression";
interface Submission { readonly command: object; readonly kind: Kind | null; readonly text: string | null; raw: unknown; verified: boolean }
interface Script { readonly id: string; readonly event: object; readonly done: PromiseWithResolvers<true>; verified: boolean }
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_HELPER_RECEIPT"); } }
function own(value: unknown): Readonly<Record<string, unknown>> { need(value !== null && typeof value === "object" && !types.isProxy(value)); const out: Record<string, unknown> = {}; for (const key of Reflect.ownKeys(value)) { need(typeof key === "string"); const d = Object.getOwnPropertyDescriptor(value, key); need(d !== undefined && Object.hasOwn(d, "value")); out[key] = d.value; } return out; }
export class CurrentSchematicRelevanceDisplayHelperReceipts {
  readonly #submissions = new WeakMap<object, Submission>(); readonly #pending: Submission[] = []; readonly #scripts: Script[] = []; readonly #byId = new Map<string, Script>(); readonly #conditions = new Set<string>();
  #reads = 0; #busy = false; #failed = false;
  public register(command: object): void {
    need(!this.#failed && !this.#submissions.has(command)); const c = own(command), params = own(c["params"]); let kind: Kind | null = null, text: string | null = null;
    if (c["method"] === "Runtime.callFunctionOn") { need(typeof params["functionDeclaration"] === "string"); kind = "function"; text = params["functionDeclaration"]; }
    else if (c["method"] === "Debugger.evaluateOnCallFrame" || c["method"] === "Runtime.evaluate") { need(typeof params["expression"] === "string"); kind = "expression"; text = params["expression"]; }
    if (kind !== null && text !== null) { program(kind, text); }
    if ((c["method"] === "Debugger.setBreakpoint" || c["method"] === "Debugger.setBreakpointOnFunctionCall") && params["condition"] !== undefined) { need(typeof params["condition"] === "string"); condition(params["condition"]); this.#conditions.add(params["condition"]); }
    const submission: Submission = { command, kind, text, raw: undefined, verified: false }; this.#submissions.set(command, submission); if (kind !== null) { need(this.#pending.length < LIMIT); this.#pending.push(submission); }
  }
  public observe(event: object, context: number, projectScript: string): void {
    const e = own(event), p = own(e["params"]); need(!this.#failed && e["method"] === "Debugger.scriptParsed" && p["url"] === "" && p["executionContextId"] === context && p["hasSourceURL"] !== true && p["isLiveEdit"] !== true && (p["scriptLanguage"] === undefined || p["scriptLanguage"] === "JavaScript"));
    const id = p["scriptId"]; need(typeof id === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(id) && id !== projectScript && !this.#byId.has(id) && this.#scripts.length < LIMIT);
    const done = Promise.withResolvers<true>(); 
    // oxlint-disable-next-line promise/prefer-await-to-then -- Retain rejection handling immediately; the original receipt and event reader still report this failure.
    void done.promise.catch(() => null); const script: Script = { id, event, done, verified: false }; this.#scripts.push(script); this.#byId.set(id, script);
  }
  public async verify(command: object, raw: unknown, read: (scriptId: string) => Promise<unknown>): Promise<void> {
    const submission = this.#submissions.get(command); need(!this.#failed && !this.#busy && submission !== undefined && !submission.verified && submission.raw === undefined && typeof read === "function" && !types.isProxy(read));
    submission.raw = raw; this.#busy = true;
    try {
      if (submission.kind === null) { submission.verified = true; }
      else {
        while (!submission.verified) {
          const script = this.#scripts.find(value => !value.verified); need(script !== undefined); this.#reads += 1; need(this.#reads <= LIMIT);
          const source = await read(script.id); need(!this.#failed); const result = own(source); need(Reflect.ownKeys(result).length === 1 && typeof result["scriptSource"] === "string");
          const expected = this.#pending[0]; const text = result["scriptSource"];
          if (expected !== undefined && expected.kind !== null && expected.text !== null && text === (expected.kind === "function" ? `(${expected.text})` : expected.text)) { qualify(source, expected.kind, expected.text); need(expected.raw !== undefined); expected.verified = true; this.#pending.shift(); }
          else { need(this.#conditions.has(text)); condition(text); qualify(source, "expression", text); }
          script.verified = true; script.done.resolve(true);
        }
      }
      need(submission.command === command && submission.raw === raw && submission.verified);
    } catch (error) { this.fail(); throw error; } finally { this.#busy = false; }
  }
  public async requireVerified(event: object): Promise<void> { const e = own(event); const p = own(e["params"]); const id = p["scriptId"]; need(typeof id === "string"); const script = this.#byId.get(id); need(!this.#failed && script !== undefined); await script.done.promise; need(!this.#failed && script.verified); }
  public fail(): void { if (!this.#failed) { this.#failed = true; for (const script of this.#scripts) { script.done.reject(new Error("SCHEMATIC_RELEVANCE_ORIGINAL_HELPER_FAILED")); } } }
}
