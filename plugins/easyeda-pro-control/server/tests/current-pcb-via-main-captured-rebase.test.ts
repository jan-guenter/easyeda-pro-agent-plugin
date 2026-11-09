/* oxlint-disable import/max-dependencies -- Independently compare all three finite protocols/wires and exercise the original BEGIN custody; none supplies a native owner. */
/** Production grammar, wire and BEGIN ledger on inert original-shaped events.
 * No native process, original facade enrollment, SQL, API or resume is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentPcbViaMainBeginCustody } from "../src/current-pcb-via-main-begin-custody.ts";
import type { CurrentPcbViaMainBeginHost, CurrentPcbViaMainBeginPause } from "../src/current-pcb-via-main-begin-custody.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as BEGIN } from "../src/current-pcb-via-main-begin-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as BEGIN_LIMITS, CURRENT_PCB_VIA_MAIN_BEGIN_SITES as SITES, currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand as Command } from "../src/current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainBeginTemplates } from "../src/current-pcb-via-main-begin-wire.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as HISTORY_LIMITS, currentPcbViaMainHistoryNativeCases, validateCurrentPcbViaMainHistoryCommand } from "../src/current-pcb-via-main-history-protocol.ts";
import { currentPcbViaMainHistoryTemplates } from "../src/current-pcb-via-main-history-wire.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_REQUESTS as STRUCTURE_LIMITS, currentPcbViaMainStructureNativeCases, validateCurrentPcbViaMainStructureCommand } from "../src/current-pcb-via-main-structure-protocol.ts";
import { currentPcbViaMainStructureTemplates } from "../src/current-pcb-via-main-structure-wire.ts";

/** A bounded explicit inert inspector array receipt. */
function array(id: string, length: number): unknown { return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: id } }; }
/** Drive the actual finite ledger with explicit transport receipts. The host
 * below has structural fixture data only, not a private Core registry entry. */
async function cursor(fault: "none" | "version" | "capture" | "duplicate", bookkeeping = false): Promise<readonly string[]> {
  const sent: string[] = []; const points = new Set<string>(); let nativeAttempt = false; let requestId = 0; let stage = 0; const identity = Object.freeze({});
  let custody: CurrentPcbViaMainBeginCustody | null = null;
  const { promise: rawGate, resolve: finishRaw } = Promise.withResolvers<boolean>();
  const pause = (): CurrentPcbViaMainBeginPause => {
    const roles = ["save", "save", "transaction", "run", "callback", "returned"] as const; const role = roles[stage]; assert.ok(role !== undefined);
    const site = role === "run" ? { lineNumber: 1025, columnNumber: 875, functionLine: 1025, functionColumn: 859, name: "" } : SITES[role];
    const frame = { callFrameId: `frame-${role}`, functionName: site.name, location: { scriptId: "script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "script", lineNumber: site.functionLine, columnNumber: site.functionColumn } };
    const callers = role === "run" ? [2040, 2514].map((columnNumber, index) => ({ location: { ...frame.location }, callFrameId: `caller-${String(index)}`, functionName: index === 0 ? "begin" : "inTransaction", functionLocation: { scriptId: "script", lineNumber: 1025, columnNumber } })) : [];
    return { identity, frameId: frame.callFrameId, raw: { reason: "other", hitBreakpoints: [`point-${role}`], callFrames: [frame, ...callers] }, sqlSite: role === "run" ? "run" : null, pendingEvents: 0, resumed: false, resumeAttempted: nativeAttempt };
  };
  const host: CurrentPcbViaMainBeginHost = {
    origin: { profile: "private.current-pcb-via-main-origin.v1" }, scriptId: "script", captureObjectId: "original-capture", assertCurrent: (): void => { assert.ok(stage <= 5); },
    actorSql: (): ReturnType<CurrentPcbViaMainBeginHost["actorSql"]> => ({ actorObjectId: "actor", sqlObjectId: "sql", dataStr: "original-body" }), pause,
    pendingRequestId: (): number => requestId, busy: (): boolean => true, pointCurrent: (id): boolean => points.has(id),
    registerPoint: (id): void => { points.add(id); }, removePoint: (id): void => { points.delete(id); },
    send: async (command): Promise<unknown> => {
      sent.push(command.phase); requestId += 1;
      if (command.phase === "via-main-begin-arm") { return { breakpointId: `point-${command.role}`, actualLocation: command.params.location }; }
      if (command.phase === "via-main-begin-frame" || command.phase === "via-main-begin-raw-frame") {
        if (fault === "duplicate" && command.role === "run") { await rawGate; }
        return array(`frame-packet-${command.role}`, { save: 4, transaction: 2, run: 7, callback: 8, returned: 2 }[command.role] - (command.phase === "via-main-begin-raw-frame" ? 1 : 0));
      }
      if (command.phase === "via-main-begin-join" || command.phase === "via-main-begin-rebase" || command.phase === "via-main-begin-bookkeeping") {
        if (command.role === "returned") { return { result: { type: "object", value: { schema: "private.current-pcb-via-main-begin-result.v1", originalNativeCallbackSucceeded: true, originalBeginAwaitCompleted: true, transactionDepth: 1, historySqlCompleted: false, furtherSelectedSqlAuthorized: false, persistenceVerified: false } } }; }
        return array(`packet-${command.role}`, BEGIN[command.role].length);
      }
      return {};
    },
    resume: (original, command): Promise<unknown> => {
      assert.equal(original, identity); assert.ok(custody !== null); requestId += 1;
      nativeAttempt = true; custody.consume(command, requestId); nativeAttempt = false; stage += 1; sent.push(command.phase); return Promise.resolve({});
    },
  };
  custody = new CurrentPcbViaMainBeginCustody(host); const cases = currentPcbViaMainBeginNativeCases();
  const request = (phase: Command["phase"], role: string, args: readonly string[] = []): Promise<unknown> => {
    const selected = bookkeeping && phase === "via-main-begin-join" && (role === "save" || role === "transaction" || role === "returned") ? "via-main-begin-bookkeeping" : phase;
    const sample = cases.find(item => item.phase === selected && item.role === role); assert.ok(sample !== undefined); const command = structuredClone(sample);
    if (command.phase === "via-main-begin-arm") { command.params.location.scriptId = "script"; }
    else if (command.phase === "via-main-begin-frame" || command.phase === "via-main-begin-raw-frame") { command.params.callFrameId = `frame-${role}`; }
    else if (command.phase === "via-main-begin-join" || command.phase === "via-main-begin-rebase" || command.phase === "via-main-begin-bookkeeping") { command.params.objectId = `frame-packet-${role}`; command.params.arguments = args.map(objectId => ({ objectId })); }
    return custody.request(command, false);
  };
  for (const role of ["save", "transaction", "callback", "returned"]) { await request("via-main-begin-arm", role); }
  for (const [role, args] of [["save", ["actor", "sql"]], ["transaction", ["packet-save"]]] as const) {
    await request("via-main-begin-step", role === "save" ? "actor" : "save"); await request("via-main-begin-frame", role); await request("via-main-begin-join", role, args);
  }
  await request("via-main-begin-step", "transaction");
  if (fault === "duplicate") {
    const first = request("via-main-begin-raw-frame", "run"); await assert.rejects(request("via-main-begin-raw-frame", "run"), /ORIGINAL_FRAME/u); finishRaw(true); await assert.rejects(first, /FAILED/u); return sent;
  }
  await request("via-main-begin-raw-frame", "run");
  if (fault === "version") { await assert.rejects(request("via-main-begin-join", "run", ["original-capture", "packet-transaction"]), /ORIGINAL_FRAME_PACKET/u); return sent; }
  await request("via-main-begin-rebase", "run", ["original-capture", "packet-transaction"]); await request("via-main-begin-step", "run"); await request("via-main-begin-raw-frame", "callback");
  if (fault === "capture") { await assert.rejects(request("via-main-begin-rebase", "callback", ["foreign-capture", "packet-run"]), /ORIGINAL_ARGUMENTS/u); return sent; }
  await request("via-main-begin-rebase", "callback", ["original-capture", "packet-run"]); await request("via-main-begin-step", "callback"); await request("via-main-begin-frame", "returned"); await request("via-main-begin-join", "returned", ["packet-callback"]);
  assert.equal(custody.result().persistenceVerified, false); return sent;
}
void test("captured BEGIN uses the original nineteen-command ledger and refuses version/capture swaps or duplicate inflight reads", async () => {
  for (const bookkeeping of [false, true]) { const positive = await cursor("none", bookkeeping); assert.equal(positive.length, BEGIN_LIMITS.normal); assert.equal(positive.filter(phase => phase === "via-main-begin-rebase").length, 2); assert.equal(positive.filter(phase => phase === "via-main-begin-bookkeeping").length, bookkeeping ? 3 : 0); }
  for (const fault of ["version", "capture", "duplicate"] as const) { const sent = await cursor(fault); assert.equal(sent.filter(phase => phase === "via-main-begin-raw-frame").length, fault === "capture" ? 2 : 1); assert.ok(sent.length < BEGIN_LIMITS.normal); }
});
void test("all legacy native rows stay byte-exact and the six new frame roles leave absolute caps and arbitrary source bounds unchanged", () => {
  const sets = [currentPcbViaMainBeginTemplates(), currentPcbViaMainHistoryTemplates(), currentPcbViaMainStructureTemplates()];
  const expected = ["fafa554898b8408ea85730de78773352ccce475a607cfaa00e91d9b2e78dd76d", "48211be3a173fe58cdba6339a1dab12c91d53797c443de86e4ffd2cdb4454e66", "72fdaff49c6c236f29f0da4d9e8472a6f559c475ba95698633942744ce67a3b6"];
  for (const [index, rows] of sets.entries()) { const legacy = rows.filter(row => !row.phase.includes("-raw-frame-") && !row.phase.includes("-rebase-") && !row.phase.includes("-bookkeeping-")); assert.equal(createHash("sha256").update(JSON.stringify(legacy)).digest("hex"), expected[index]); for (const row of rows) { assert.ok(Buffer.byteLength(row.template) < 65_536); } }
  assert.deepEqual([BEGIN_LIMITS.normal, HISTORY_LIMITS.normal, STRUCTURE_LIMITS.normal], [19, 88, 74]);
  const raw = [...currentPcbViaMainBeginNativeCases(), ...currentPcbViaMainHistoryNativeCases(), ...currentPcbViaMainStructureNativeCases()].filter(item => item.phase.endsWith("-raw-frame")); assert.equal(raw.length, 6);
  for (const command of raw) { assert.ok("expression" in command.params); assert.ok(!/\bF5\b/u.test(command.params.expression)); }
  const history = currentPcbViaMainHistoryNativeCases().find(item => item.phase === "via-main-history-rebase"); assert.ok(history?.phase === "via-main-history-rebase");
  assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...history, params: { ...history.params, functionDeclaration: `${history.params.functionDeclaration} ` } }));
  assert.throws(() => validateCurrentPcbViaMainHistoryCommand({ ...history, phase: "via-main-history-join" }));
});
void test("new fixed-source exceptions reject accessors and Proxy metadata before hooks and never accept false readonly flags", () => {
  const pairs = [[currentPcbViaMainBeginNativeCases(), validateCurrentPcbViaMainBeginCommand], [currentPcbViaMainHistoryNativeCases(), validateCurrentPcbViaMainHistoryCommand], [currentPcbViaMainStructureNativeCases(), validateCurrentPcbViaMainStructureCommand]] as const;
  let hooks = 0; const hook = (): never => { hooks += 1; throw new Error("untrusted command metadata"); };
  for (const [cases, validate] of pairs) {
    const command = cases.find(item => item.phase.endsWith("-rebase")); assert.ok(command !== undefined);
    const params = { ...command.params }; Object.defineProperty(params, "functionDeclaration", { enumerable: true, get: hook }); assert.throws(() => validate({ ...command, params }));
    assert.throws(() => validate({ ...command, params: new Proxy(command.params, { getPrototypeOf: hook, ownKeys: hook, getOwnPropertyDescriptor: hook }) }));
    assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
    assert.throws(() => validate({ ...command, params: { ...command.params, awaitPromise: true } }));
  }
  assert.equal(hooks, 0);
});
