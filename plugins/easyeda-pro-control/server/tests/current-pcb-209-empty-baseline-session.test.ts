/** Synthetic renderer replies with the real retained runner and isolated SQL
 * reader/crypto history. No EasyEDA or connected ownership is exercised. */
/* oxlint-disable import/max-dependencies -- Integration uses the existing real runner, encoders, failure projection, source-shaped fixtures and original SQL reader, not alternate implementations or forged issuance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { assertEmptyStartupJournal } from "./helpers/current-pcb-209-empty-startup-journal.ts";
import { PCB209_EMPTY_ROOT_SETUP } from "./helpers/current-pcb-209-empty-root-fixture.ts";
import { CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT, CurrentPcb209EmptyBaselineSession } from "../src/current-pcb-209-empty-baseline-session.ts";
import type { CurrentPcb209EmptyBaselineCommand, CurrentPcb209EmptyBaselineTransport } from "../src/current-pcb-209-empty-baseline-session.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ,
  CURRENT_PCB_COMMON_PACKET_RESULT } from "../src/current-pcb-common-packet-program.ts";
import { encodeCurrentPcbCommonPreference, encodeCurrentPcbCommonPresentation } from "../src/current-pcb-common-encoding.ts";
import { encodeCurrentPcbCommonRulesAndPrimitives } from "../src/current-pcb-common-rule-encoding.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { CURRENT_PCB_209_COMMON_MODEL_LOCATIONS } from "../src/current-pcb-209-common-model-scope.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { constructorBundleReply, constructorTupleReply } from "./helpers/current-pcb-constructor-replies.ts";
import { CURRENT_PCB_209_COMMON_ALIASES, CURRENT_PCB_209_COMMON_CONSTRUCTORS } from "../src/current-pcb-209-common-profile.ts";
import { CURRENT_PCB_209_COMMON_PACKET_SEEDS } from "../src/current-pcb-209-common-program.ts";
import { PCB_COMMON_RULE_ENCODING_SETUP, pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const RAW_WINDOWS_PATH = String.raw`C:\Synthetic\empty-baseline.eprj2`;
const identity = Object.freeze({ projectUuid: sha256Text(RAW_WINDOWS_PATH), branchUuid: IDS.branch, documentUuid: IDS.target });
const header = JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" });
const meta = { title: "Empty PCB", parent: "", source: "", board: "", zIndex: null };
// The rule-rich common fixture spends40 requests; the original raw-root
// Bracket adds six scope hops, two observations and one group release.
const REQUEST_COUNT = 49;
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function wrapper(kind: "rpc-wrapper" | "save-handler"): readonly unknown[] {
    const point = CURRENT_PCB_209_COMMON_MODEL_LOCATIONS[kind];
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
function prop(name: string, value: unknown, configurable: boolean): unknown { return { name, value, writable: false, configurable, enumerable: false, isOwn: true }; }
function scopeReplies(): readonly unknown[] {
  return [...wrapper("rpc-wrapper"), ...wrapper("save-handler"), constructorBundleReply("common"), constructorTupleReply("common"), ...Object.values(CURRENT_PCB_209_COMMON_CONSTRUCTORS).map(profile => ({
    result: [prop("length", { type: "number", value: 0 }, true), prop("name", { type: "string", value: profile.name }, true),
      prop("prototype", { type: "object", className: profile.prototypeClassName, objectId: `prototype-${profile.name}` }, false)],
    internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "pcb", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
      { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scope-${profile.name}` } },
    ],
  }))];
}
async function setup(changeSql = "", changeLive = "", headerText = header, extraRaw = ""): Promise<{
  session: CurrentPcb209EmptyBaselineSession; before: Awaited<ReturnType<typeof inventory>>;
  commands: CurrentPcb209EmptyBaselineCommand[]; transport: CurrentPcb209EmptyBaselineTransport;
  setCurrent: (value: boolean) => void; invalidateAfterRelease: () => void;
}> {
  const context = pcbCommonFixture(`${PCB_COMMON_RULE_ENCODING_SETUP}
const env=scope.object.x.env,compiler=env._compiler;
env._id=${JSON.stringify(IDS.target)};env._tabId=${JSON.stringify(`${IDS.target}@${identity.projectUuid}`)};
compiler.uuid=env._id;compiler.base.uuid=env._id;compiler.base.path=${JSON.stringify(identity.projectUuid)};
compiler.project=compiler.base.path;compiler.isProject=true;compiler.docDetail=${JSON.stringify(meta)};
scope.object.Me._prevTrackWidth=1;
scope.object.Ke.manager.map.set(4,make("WA",{layerId:4,type:"BOTTOM_SILK",name:"Bottom",status:make("Ff",{state:0}),_activeColor:black,deactiveColor:black}));`);
  const sample = (source: string): ReturnType<typeof pcbStringReply> => pcbStringReply(callPcbStringObservation(context, source));
  const presentation = sample(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION), rules = sample(CURRENT_PCB_COMMON_RULES_FUNCTION);
  const encodedRules = encodeCurrentPcbCommonRulesAndPrimitives(rules, presentation), preference = sample(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION);
  const rows = [...encodeCurrentPcbCommonPresentation(presentation).rows, ...encodedRules.rows,
    ...encodeCurrentPcbCommonPreference(preference, rules).rows, encodedRules.panelize];
  const base = await fixture({ project: identity.projectUuid, branch: IDS.branch, target: IDS.target });
  const owner = base.before.tables.find(table => table.name === "history_data"); assert.ok(owner);
  const value = owner.rows[0]?.cells[owner.columns.findIndex(column => column["name"] === "dataStr")]; assert.ok(value?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(value.hex, "hex").toString() });
  const old = raw.split("|\n");
  const common = rows.map((row, index) => `${JSON.stringify({ type: row.dataType, ticket: 10 + index, id: row.id })}||${row.bodyText}`);
  const text = [old[0], `{"type":"DOCHEAD","ticket":1}||${headerText}`, `{"type":"META","ticket":1,"id":"META"}||${JSON.stringify(meta)}`, ...common, ...(extraRaw === "" ? [] : [extraRaw]), ...old.slice(3)].join("|\n");
  const structure = JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: {
    uuid: IDS.target, title: meta.title, board: "", parent_uuid: "", source: "", version: "1", updateTime: 1,
  } }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor } });
  mutate(base.path, `UPDATE history_data SET dataStr=${literal(encrypted(text, IDS.oldHead, IDS.oldKey))} WHERE id=7;
    UPDATE project_structures SET structure=${literal(structure)};${changeSql}`);
  const before = await inventory(base.path), commands: CurrentPcb209EmptyBaselineCommand[] = [], replies = scopeReplies();
  const packets = new Map<string, unknown>();
  const retainPacket = (packet: unknown): unknown => {
    const objectId = `packet-${packets.size}`; packets.set(objectId, packet);
    return { result: { type: "object", className: "Object", description: "Object", objectId } };
  };
  runInContext(changeLive, context);
  runInContext(`const aliasMap=${JSON.stringify(CURRENT_PCB_209_COMMON_ALIASES)};
const translated=Object.fromEntries(Object.entries(aliasMap).map(([role,native])=>[native,scope.object[role]]));
for(const role of Object.keys(aliasMap))delete scope.object[role];
Object.assign(scope.object,translated);scope.object.kFe=scope.object._Fe;delete scope.object._Fe;
for(const [role,profile] of Object.entries(${JSON.stringify(CURRENT_PCB_209_COMMON_CONSTRUCTORS)})){
  Object.defineProperty(Object.getPrototypeOf(scope.object[profile.owner]).constructor,"name",{value:profile.name});delete scope.object[role];
}`, context);
  runInContext(PCB209_EMPTY_ROOT_SETUP, context);
  let afterRelease = false, commonCount = 0, current = true, rootCount = 0;
  const transport: CurrentPcb209EmptyBaselineTransport = {
    assertCurrent: (): void => { if (!current) { throw new Error("synthetic owner changed"); } },
    request: (command): Promise<unknown> => {
      commands.push(command);
      if ("rootPhase" in command) {
        rootCount += 1;
        if (command.rootPhase === "release") { return Promise.resolve({}); }
        if (rootCount <= 6) { return Promise.resolve(replies[rootCount - 1]); }
        assert.ok(command.rootPhase === "before" || command.rootPhase === "after");
        return Promise.resolve(sample(command.params.functionDeclaration));
      }
      commonCount += 1;
      if (command.commonPhase === "release") { if (afterRelease) { current = false; } return Promise.resolve({}); }
      if (commonCount <= replies.length) {
        if (command.commonPhase === "constructors") {
          assert.equal(command.params.objectId, "save-handler-0");
          assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }]);
          runInContext(`globalThis.qualifiedCommonConstructors=(${command.params.functionDeclaration}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback);`, context);
        }
        return Promise.resolve(replies[commonCount - 1]);
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
        const source = { "presentation-seed": CURRENT_PCB_209_COMMON_PACKET_SEEDS.presentation, "rules-seed": CURRENT_PCB_209_COMMON_PACKET_SEEDS.rules,
          "preference-seed": CURRENT_PCB_209_COMMON_PACKET_SEEDS.preference }[command.commonPhase];
        assert.equal(command.params.functionDeclaration, source); assert.equal(command.params.objectId, "save-handler-0");
        assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }, { objectId: "constructors" }]);
        const observed: unknown = runInContext(`(${source}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,qualifiedCommonConstructors)`, context, { timeout: 2000 });
        return Promise.resolve(retainPacket(observed));
      }
      return Promise.resolve(sample(command.params.functionDeclaration));
    },
  };
  const session = new CurrentPcb209EmptyBaselineSession({ before, identity, transport, scriptId: "pcb", uniqueContextId: "original-context" });
  return { session, before, commands, transport, setCurrent: (next): void => { current = next; }, invalidateAfterRelease: (): void => { afterRelease = true; } };
}

void test("209 empty baseline brackets genuine common/SQL issuance with all raw roots", async () => {
  const value = await setup();
  const packet = await value.session.observeAndJoin();
  assert.equal(CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT, 3099);
  assert.equal(value.commands.length, REQUEST_COUNT);
  const phases = value.commands.map(command => "rootPhase" in command ? `root:${command.rootPhase}` : `common:${command.commonPhase}`);
  assert.ok(phases.indexOf("root:before") < phases.indexOf("common:wrapper"));
  assert.ok(phases.indexOf("root:after") > phases.indexOf("common:release"));
  assert.equal(phases.at(-1), "root:release");
  assert.equal(packet.common.relation.common.beforeSqlSha256, value.before.logicalSha256);
  assert.equal(packet.common.relation.common.documentCount, 2);
  assert.equal(packet.commonSqlJoinBracketedByEmptyRoots, true);
  assert.equal(packet.storedTargetContainsOnlyMatchedCommonAndMeta, true);
  assert.equal(packet.roots.rawManagersSampled, 17);
  assert.equal(packet.completeLiveBaselineVerified, false);
  assert.equal(packet.sourceSerializationObserved, false);
  assert.equal(packet.executionAuthorized, false);
  await assertEmptyStartupJournal(packet, RAW_WINDOWS_PATH, value.commands.length);
  value.session.requireOriginal(packet);
  assert.throws(() => { value.session.requireOriginal(structuredClone(packet)); }, /ORIGINAL_PACKET/u);
  value.setCurrent(false); assert.throws(() => { value.session.requireOriginal(packet); }, /synthetic owner changed/u);
  value.setCurrent(true); assert.throws(() => { value.session.requireOriginal(packet); }, /ORIGINAL_PACKET/u);
  await assert.rejects(value.session.observeAndJoin(), /CONSUMED/u);
});

void test("209 empty baseline refuses a saved geometry row even when every live raw manager is empty", async () => {
  const value = await setup("", "", header, '{"type":"LINE","ticket":99,"id":"surviving-line"}||{"x":0}');
  await assert.rejects(value.session.observeAndJoin(), /PCB209_EMPTY_ROOT_RUNNER_FAILED/u);
  assert.equal(value.session.status()["packetRetained"], false);
  assert.deepEqual(value.commands.filter(command => command.method === "Runtime.releaseObjectGroup").map(command =>
    "rootPhase" in command ? command.rootPhase : command.commonPhase), ["release", "release"]);
  assert.equal(value.commands.some(command => "rootPhase" in command && command.rootPhase === "after"), false);
  await assert.rejects(value.session.observeAndJoin(), /CONSUMED/u);
});

void test("209 empty baseline keeps both original cleanups available after owner loss", async () => {
  const value = await setup(); value.invalidateAfterRelease();
  await assert.rejects(value.session.observeAndJoin(), /PCB209_EMPTY_ROOT_RUNNER_FAILED/u);
  assert.equal(value.session.status()["packetRetained"], false);
  assert.equal(value.commands.at(-1)?.method, "Runtime.releaseObjectGroup");
  assert.equal(value.commands.filter(command => command.method === "Runtime.releaseObjectGroup").length, 2);
});
