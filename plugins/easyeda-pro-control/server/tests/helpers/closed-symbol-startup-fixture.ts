import assert from "node:assert/strict";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { ClosedSymbolStartupStage } from "../../src/closed-symbol-startup.ts";
import { buildStartupProgram } from "../../src/closed-symbol-startup-program.ts";
import type { StartupPhase } from "../../src/closed-symbol-startup-program.ts";
import { fixture } from "./closed-symbol-startup-runtime-fixture.ts";
import { startupFixture } from "./closed-symbol-startup-browser-fixture.ts";

const admissions = { "baseline-marker-create": "baseline-admission", "edit-marker-read": "edit-admission", "verify-marker-read": "verify-admission" } as const;
export async function prepared(phase: StartupPhase = "baseline-marker-create"): Promise<{
  value: Awaited<ReturnType<typeof fixture>>; browser: ReturnType<typeof startupFixture>; stage: ClosedSymbolStartupStage;
  calls: { count: number; before: (() => void | Promise<void>) | undefined; after: (() => void | Promise<void>) | undefined; failed: boolean; returned: unknown };
}> {
  const value = await fixture(admissions[phase]); await value.stage.admit(value.journal, value.phase);
  const browser = startupFixture(phase), stage = new ClosedSymbolStartupStage(value.engine, value.runtime, value.stage);
  const calls = { count: 0, before: undefined as (() => void | Promise<void>) | undefined, after: undefined as (() => void | Promise<void>) | undefined, failed: false, returned: undefined as unknown };
  const original = value.upstream.callTool.bind(value.upstream);
  value.upstream.callTool = async (name, args, timeout, binding): ReturnType<typeof original> => {
    if (String(args?.["code"]).includes("runtime-identity")) { return original(name, args, timeout, binding); }
    assert.equal(name, "easyeda_execute"); assert.equal(args?.["code"], buildStartupProgram(browser.input));
    assert.equal(args["timeoutMs"], 60_000); assert.equal(args["confirmWrite"], true);
    assert.equal(timeout, 70_000); assert.ok(binding !== undefined); calls.count += 1;
    const before = await loadClosedSymbolJournal(value.operationId);
    assert.equal(before.events.at(-1)?.step, phase); assert.equal(before.events.at(-1)?.kind, "intent"); assert.equal(before.journal.orphanedCallPossible, true);
    await calls.before?.();
    if (calls.failed) { throw new Error("synthetic uncertain native transport"); }
    const result = await browser.run(); await calls.after?.();
    const returned: Awaited<ReturnType<typeof original>> = { content: [{ type: "text", text: JSON.stringify(result) }] };
    calls.returned = returned; return returned;
  };
  return { value, browser, stage, calls };
}
