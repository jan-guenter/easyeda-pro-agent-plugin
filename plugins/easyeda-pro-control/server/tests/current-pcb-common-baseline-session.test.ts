/** Synthetic renderer replies with the real retained runner and isolated SQL
 * reader/crypto history. No EasyEDA or connected ownership is exercised. */
/* oxlint-disable import/max-dependencies -- Integration uses the existing real runner, encoders, failure projection, source-shaped fixtures and original SQL reader, not alternate implementations or forged issuance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CurrentPcbCommonBaselineSession } from "../src/current-pcb-common-baseline-session.ts";
import { currentPcbCommonBaselineFailure, currentPcbCommonBaselineFailureSchema, currentPcbCommonBaselineRefusal,
  currentPcbCommonBaselineResult } from "../src/current-pcb-common-baseline-validation.ts";
import { sha256Json } from "../src/core.ts";
import type { CurrentPcbCommonBaselineCommand, CurrentPcbCommonBaselineTransport } from "../src/current-pcb-common-baseline-runner.ts";
import { requireOriginalCurrentPcbCommonBaselineReplies } from "../src/current-pcb-common-baseline-runner.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ,
  CURRENT_PCB_COMMON_PACKET_RESULT, CURRENT_PCB_COMMON_PACKET_SEEDS } from "../src/current-pcb-common-packet-program.ts";
import { encodeCurrentPcbCommonPreference, encodeCurrentPcbCommonPresentation } from "../src/current-pcb-common-encoding.ts";
import { encodeCurrentPcbCommonRulesAndPrimitives } from "../src/current-pcb-common-rule-encoding.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { readCurrentPcbCommonHistoricalHeader } from "../src/current-pcb-common-stored-relation.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../src/current-pcb-diagnostic-model-scope.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { constructorReplies } from "./helpers/current-pcb-constructor-replies.ts";
import { PCB_COMMON_RULE_ENCODING_SETUP, pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const identity = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, documentUuid: IDS.target });
const header = JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" });
const meta = { title: "Empty PCB", parent: "", source: "", board: "", zIndex: null };
// This rule-rich fixture needs eleven chunks, not the smaller runner fixture's
// Nine: twelve original-scope calls + three seeds + eight advances + eleven
// Reads + three final graph results + two plain readers + one release.
const REQUEST_COUNT = 40;
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function wrapper(kind: "rpc-wrapper" | "save-handler"): readonly unknown[] {
    const point = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind];
    return [{ result: { type: "function", className: kind === "rpc-wrapper" ? "Function" : "AsyncFunction", description: "synthetic", objectId: kind } },
      { result: [["length", "number", point.parameterCount], ["name", "string", ""]].map(([name, type, value]) => ({
        name, value: { type, value }, writable: false, configurable: true, enumerable: false, isOwn: true })),
      internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "pcb", lineNumber: point.lineNumber, columnNumber: point.columnNumber } } },
        { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `${kind}-scopes` } },
      ] },
      { result: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => ({ name: String(index),
        value: { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `${kind}-${index}` },
        writable: true, configurable: true, enumerable: true, isOwn: true })) }];
}
function scopeReplies(): readonly unknown[] {
  return [...wrapper("rpc-wrapper"), ...wrapper("save-handler"), ...constructorReplies("common", "pcb")];
}
async function setup(changeSql = "", changeLive = "", headerText = header): Promise<{
  session: CurrentPcbCommonBaselineSession; before: Awaited<ReturnType<typeof inventory>>;
  commands: CurrentPcbCommonBaselineCommand[]; transport: CurrentPcbCommonBaselineTransport;
  setCurrent: (value: boolean) => void; invalidateAfterRelease: () => void;
}> {
  const context = pcbCommonFixture(`${PCB_COMMON_RULE_ENCODING_SETUP}
const env=scope.object.x.env,compiler=env._compiler;
env._id=${JSON.stringify(IDS.target)};env._tabId=${JSON.stringify(`${IDS.target}@${IDS.project}`)};
compiler.uuid=env._id;compiler.base.uuid=env._id;compiler.base.path=${JSON.stringify(IDS.project)};
compiler.project=compiler.base.path;compiler.isProject=true;compiler.docDetail=${JSON.stringify(meta)};
scope.object.Me._prevTrackWidth=1;
scope.object.Ke.manager.map.set(4,make("WA",{layerId:4,type:"BOTTOM_SILK",name:"Bottom",status:make("Ff",{state:0}),_activeColor:black,deactiveColor:black}));`);
  const sample = (source: string): ReturnType<typeof pcbStringReply> => pcbStringReply(callPcbStringObservation(context, source));
  const presentation = sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION), rules = sample(CURRENT_PCB_COMMON_RULES_FUNCTION);
  const encodedRules = encodeCurrentPcbCommonRulesAndPrimitives(rules, presentation), preference = sample(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION);
  const rows = [...encodeCurrentPcbCommonPresentation(presentation).rows, ...encodedRules.rows,
    ...encodeCurrentPcbCommonPreference(preference, rules).rows, encodedRules.panelize];
  const base = await fixture(), owner = base.before.tables.find(table => table.name === "history_data"); assert.ok(owner);
  const value = owner.rows[0]?.cells[owner.columns.findIndex(column => column["name"] === "dataStr")]; assert.ok(value?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(value.hex, "hex").toString() });
  const old = raw.split("|\n");
  const common = rows.map((row, index) => `${JSON.stringify({ type: row.dataType, ticket: 10 + index, id: row.id })}||${row.bodyText}`);
  const text = [old[0], `{"type":"DOCHEAD","ticket":1}||${headerText}`, `{"type":"META","ticket":1,"id":"META"}||${JSON.stringify(meta)}`, ...common, ...old.slice(3)].join("|\n");
  const structure = JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: {
    uuid: IDS.target, title: meta.title, board: "", parent_uuid: "", source: "", version: "1", updateTime: 1,
  } }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor } });
  mutate(base.path, `UPDATE history_data SET dataStr=${literal(encrypted(text, IDS.oldHead, IDS.oldKey))} WHERE id=7;
    UPDATE project_structures SET structure=${literal(structure)};${changeSql}`);
  const before = await inventory(base.path), commands: CurrentPcbCommonBaselineCommand[] = [], replies = scopeReplies();
  const packets = new Map<string, unknown>();
  const retainPacket = (packet: unknown): unknown => {
    const objectId = `packet-${packets.size}`; packets.set(objectId, packet);
    return { result: { type: "object", className: "Object", description: "Object", objectId } };
  };
  runInContext(changeLive, context);
  let afterRelease = false, current = true;
  const transport: CurrentPcbCommonBaselineTransport = {
    assertCurrent: (): void => { if (!current) { throw new Error("synthetic owner changed"); } },
    request: (command): Promise<unknown> => {
      commands.push(command);
      if (command.commonPhase === "release") { if (afterRelease) { current = false; } return Promise.resolve({}); }
      if (commands.length <= replies.length) {
        if (command.commonPhase === "constructors") {
          assert.equal(command.params.objectId, "save-handler-0");
          assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }]);
          runInContext(`globalThis.qualifiedCommonConstructors=(${command.params.functionDeclaration}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback);`, context);
        }
        return Promise.resolve(replies[commands.length - 1]);
      }
      assert.ok(command.method === "Runtime.callFunctionOn");
      if (command.commonPhase === "packet-advance" || command.commonPhase === "packet-read" || command.commonPhase === "packet-result") {
        const source = { "packet-advance": CURRENT_PCB_COMMON_PACKET_ADVANCE, "packet-read": CURRENT_PCB_COMMON_PACKET_READ,
          "packet-result": CURRENT_PCB_COMMON_PACKET_RESULT }[command.commonPhase];
        assert.equal(command.params.functionDeclaration, source); assert.equal(Object.hasOwn(command.params, "arguments"), false);
        assert.ok(packets.has(command.params.objectId)); context["originalPacket"] = packets.get(command.params.objectId);
        const observed: unknown = runInContext(`(${source}).call(originalPacket)`, context, { timeout: 2000 });
        return Promise.resolve(command.commonPhase === "packet-advance" ? retainPacket(observed) : pcbStringReply(observed));
      }
      if (command.commonPhase === "presentation-seed" || command.commonPhase === "rules-seed" || command.commonPhase === "preference-seed") {
        const source = { "presentation-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.presentation, "rules-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.rules,
          "preference-seed": CURRENT_PCB_COMMON_PACKET_SEEDS.preference }[command.commonPhase];
        assert.equal(command.params.functionDeclaration, source); assert.equal(command.params.objectId, "save-handler-0");
        assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }, { objectId: "constructors" }]);
        const observed: unknown = runInContext(`(${source}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,qualifiedCommonConstructors)`, context, { timeout: 2000 });
        return Promise.resolve(retainPacket(observed));
      }
      return Promise.resolve(sample(command.params.functionDeclaration));
    },
  };
  const session = new CurrentPcbCommonBaselineSession({ before, identity, transport, scriptId: "pcb", uniqueContextId: "original-context" });
  return { session, before, commands, transport, setCurrent: (next): void => { current = next; }, invalidateAfterRelease: (): void => { afterRelease = true; } };
}

void test("owned common session derives historical header and joins only its original five-reply runner", async () => {
  const value = await setup();
  const result = await value.session.observeAndJoin();
  const summary = currentPcbCommonBaselineResult(result);
  assert.equal(summary.schema, "easyeda-pro-control.pcb-common-baseline-observation.v1");
  assert.equal(summary.beforeSqlSha256, value.before.logicalSha256); assert.equal("relation" in summary, false);
  assert.equal(value.commands.length, REQUEST_COUNT); assert.equal(result.historicalHeader.headerText, header);
  assert.deepEqual(value.commands.filter(command => command.commonPhase.endsWith("-seed")).map(command => command.commonPhase),
    ["presentation-seed", "rules-seed", "preference-seed"]);
  assert.equal(value.commands.filter(command => command.commonPhase === "packet-read").length, 11);
  assert.equal(value.commands.filter(command => command.commonPhase === "packet-advance").length, 8);
  assert.equal(value.commands.filter(command => command.commonPhase === "packet-result").length, 3);
  assert.equal(result.relation.common.beforeSqlSha256, value.before.logicalSha256);
  assert.equal(result.originalRunnerIssued, true); assert.equal(result.historicalHeaderJoined, true);
  assert.equal(result.completeTargetCommonAndMetaMatched, true); assert.equal(result.relation.common.rows.length, 62);
  assert.equal(result.executionAuthorized, false); assert.equal(result.completeLiveBaselineVerified, false);
  assert.equal(result.closedFileOwnershipVerified, false); assert.equal(result.originalOwnerVerified, false);
  assert.equal(value.session.status().phase, "completed"); assert.equal(value.session.retainedFailure(), undefined);
  const observed = value.session.requireOriginalPacket(result);
  assert.equal(value.session.retainedObservation(), observed); assert.equal(Object.keys(requireOriginalCurrentPcbCommonBaselineReplies(observed)).length, 5);
  assert.throws(() => value.session.requireOriginalPacket(structuredClone(result)), /original completed packet/u);
  value.setCurrent(false); assert.throws(() => value.session.requireOriginalPacket(result), /synthetic owner changed/u);
  value.setCurrent(true); assert.throws(() => value.session.requireOriginalPacket(result), /original completed packet/u);
  await assert.rejects(value.session.observeAndJoin(), /attempt consumed/u); assert.equal(value.commands.length, REQUEST_COUNT);
});

void test("join failure retains the original observation and header without granting another attempt", async () => {
  const value = await setup("", 'scope.object.x.env._compiler.docDetail.title="Wrong title";');
  await assert.rejects(value.session.observeAndJoin(), /FAILED_STORED-RELATION/u);
  assert.equal(value.commands.length, REQUEST_COUNT); assert.equal(value.session.status().failurePhase, "stored-relation");
  assert.equal(value.session.status().packetRetained, false); assert.equal(value.session.retainedHistoricalHeader()?.headerText, header);
  const observed = value.session.retainedObservation(); assert.ok(observed);
  const replies = requireOriginalCurrentPcbCommonBaselineReplies(observed); assert.match(replies.metadata.result.value, /Wrong title/u);
  assert.ok(value.session.retainedFailure() instanceof Error);
  assert.equal(value.session.comparisonRefused(), true); assert.equal(value.session.requireOriginalComparisonRefusal(), observed);
  const failure = currentPcbCommonBaselineFailure(identity, "stored-relation", observed, value.session.retainedHistoricalHeader(), true);
  const refusal = currentPcbCommonBaselineRefusal(failure, sha256Json(observed));
  assert.equal(refusal.schema, "easyeda-pro-control.pcb-common-baseline-refusal.v1");
  assert.equal(refusal.executionAuthorized, false); assert.equal("packetSha256" in refusal, false);
  assert.equal(currentPcbCommonBaselineFailureSchema.safeParse({ ...failure,
    retainedReplySha256: { ...failure.retainedReplySha256, metadata: "0".repeat(64) } }).success, false);
  assert.throws(() => currentPcbCommonBaselineRefusal({ ...failure, nativeContinuationAllowed: false }, sha256Json(observed)), /UNAVAILABLE/u);
  value.setCurrent(false); assert.throws(() => value.session.requireOriginalComparisonRefusal(), /synthetic owner changed/u);
  value.setCurrent(true); assert.equal(value.session.comparisonRefused(), false);
  assert.throws(() => value.session.requireOriginalComparisonRefusal(), /original comparison refusal/u);
  await assert.rejects(value.session.observeAndJoin(), /attempt consumed/u); assert.equal(value.commands.length, REQUEST_COUNT);
});

void test("stale original lifetime before historical read or during cleanup never publishes a packet", async () => {
  const early = await setup(); early.setCurrent(false);
  await assert.rejects(early.session.observeAndJoin(), /FAILED_HISTORICAL-HEADER/u); assert.equal(early.commands.length, 0);
  const later = await setup(); later.invalidateAfterRelease();
  await assert.rejects(later.session.observeAndJoin(), /FAILED_OBSERVATION/u);
  assert.equal(later.commands.length, REQUEST_COUNT); assert.equal(later.session.retainedObservation(), null);
  assert.equal(later.session.status().packetRetained, false); assert.equal(later.commands.at(-1)?.commonPhase, "release");
  assert.equal(later.session.comparisonRefused(), false);
  const failure = currentPcbCommonBaselineFailure(identity, "observation", null, later.session.retainedHistoricalHeader(), false, later.session.retainedFailure());
  assert.equal(failure.runnerFailure?.phase, "owner-final"); assert.equal(failure.runnerFailure.cleanup, "released");
  assert.equal(failure.runnerFailure.constructor, null); assert.equal(failure.nativeContinuationAllowed, false);
});

void test("historical header retains raw byte order and refuses copied SQL, foreign targets or getter inputs", async () => {
  const value = await setup();
  const result = await readCurrentPcbCommonHistoricalHeader(value.before, identity);
  assert.equal(result.headerText, header); assert.equal(result.selected.ticket, 1); assert.equal(result.executionAuthorized, false);
  await assert.rejects(readCurrentPcbCommonHistoricalHeader(structuredClone(value.before), identity), /original/u);
  await assert.rejects(readCurrentPcbCommonHistoricalHeader(value.before, { ...identity, documentUuid: IDS.peer }), /active PCB target/u);
  let getterCalls = 0;
  const input = { before: value.before, identity, transport: value.transport, scriptId: "pcb", uniqueContextId: "original-context" };
  Object.defineProperty(input, "transport", { get(): CurrentPcbCommonBaselineTransport { getterCalls += 1; return value.transport; } });
  assert.throws(() => new CurrentPcbCommonBaselineSession(input), /own data input/u); assert.equal(getterCalls, 0);
  assert.throws(() => new CurrentPcbCommonBaselineSession(new Proxy(input, {})), /own plain input/u);
  const reordered = JSON.stringify({ editVersion: "3.0", version: "1", updateTime: 1, uuid: IDS.target, client: "b".repeat(16), docType: "PCB" });
  const alternate = await setup("", "", reordered);
  const alternateHeader = await readCurrentPcbCommonHistoricalHeader(alternate.before, identity);
  assert.equal(alternateHeader.headerText, reordered);
});

void test("owner loss across asynchronous SQL joining retains evidence but withholds the packet", async () => {
  const value = await setup();
  const session: CurrentPcbCommonBaselineSession = new CurrentPcbCommonBaselineSession({ before: value.before, identity, scriptId: "pcb", uniqueContextId: "original-context",
    transport: { request: value.transport.request, assertCurrent: (): void => {
      if (session.status().phase === "stored-relation") { throw new Error("synthetic owner lost during SQL join"); }
      value.transport.assertCurrent();
    } } });
  await assert.rejects(session.observeAndJoin(), /FAILED_STORED-RELATION/u);
  assert.equal(session.status().packetRetained, false); assert.ok(session.retainedObservation());
  assert.equal(value.commands.length, REQUEST_COUNT); assert.equal(session.status().failurePhase, "stored-relation");
  assert.equal(session.comparisonRefused(), false);
});
