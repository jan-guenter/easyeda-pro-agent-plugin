/** Source-preserving constructor metadata and passive pre-event programs. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyEchoSource as source } from "../src/current-schematic-relevance-modify-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as ASSETS } from "../src/current-schematic-relevance-broadcast-callee-source.ts";
import { decodeCurrentSchematicRelevanceModifyEchoFunction as decode, requireCurrentSchematicRelevanceModifyEchoDescription as description } from "../src/current-schematic-relevance-modify-echo-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const handler = "K=>{this.onMessage(K.data)}";
const constructor = `class extends se{constructor(j,W=crypto.randomUUID()){super(W),this.bc=new BroadcastChannel(j),this.bc.onmessage=${handler}}`;
const prefix = "(()=>{class se{};const BroadcastChannel=class{};return new (";

/** Construct the arrow through its actual property assignment. Evaluating a
 * standalone arrow or inventing a semantic name would miss the native shape. */
async function inspectConstructor(session: Session, variant: 0 | 1, constructorText: string, constructorColumn: number): Promise<void> {
  const row = SOURCE[variant]; const expression = `${"\n".repeat(row.lineNumber) + " ".repeat(constructorColumn - prefix.length) + prefix + constructorText  }})("inert","inert").bc.onmessage})()`;
  const actual = await session.post("Runtime.evaluate", { expression, returnByValue: false }); assert.equal(actual.exceptionDetails, undefined); assert.equal(actual.result.type, "function"); assert.ok(actual.result.objectId !== undefined && typeof actual.result.description === "string");
  description(actual.result.description, variant);
  const reply = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  const location: unknown = reply.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value; assert.ok(location !== null && typeof location === "object");
  const script: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof script === "string");
  const result = decode(reply, variant, script); assert.equal(result.callbackReceiverVerified, false); assert.equal(result.trustedEventQualified, false); assert.equal(result.deliveryVerified, false); assert.equal(result.continuationAuthorized, false);
  assert.throws(() => { decode(reply, variant, "foreign-script"); });
  assert.throws(() => { decode(reply, variant === 0 ? 1 : 0, script); });
  const renamed = structuredClone(reply); const name = renamed.result.find(value => value.name === "name"); assert.ok(name?.value !== undefined); name.value.value = "handler"; assert.throws(() => { decode(renamed, variant, script); });
  const shifted = structuredClone(reply); const point = shifted.internalProperties?.find(value => value.name === "[[FunctionLocation]]"); assert.ok(point?.value?.value !== null && typeof point?.value?.value === "object"); Reflect.set(point.value.value, "columnNumber", row.columnNumber + 1); assert.throws(() => { decode(shifted, variant, script); });
  const duplicate = structuredClone(reply); const first = duplicate.result[0]; assert.ok(first !== undefined); duplicate.result.push(first); assert.throws(() => { decode(duplicate, variant, script); });
}

void test("constructor assignment has empty own name and exact V8 main/child locations", async () => {
  const session = new Session(); session.connect();
  try { await session.post("Runtime.enable"); for (const variant of [0, 1] as const) { const row = SOURCE[variant]; await inspectConstructor(session, variant, constructor, row.columnNumber - (row.start - row.constructorStart)); } }
  finally { session.disconnect(); }
  assert.throws(() => { description(`${handler  } `, 0); }); assert.throws(() => { description("K=>{this.onMessage(K.other)}", 1); });
});

void test("configured complete assets reproduce selected family constructor-created handlers", async context => {
  const sources = await Promise.all(ASSETS.map(row => readConfiguredEasyedaAsset(row.relativePath)));
  if (sources.every(value => value === null)) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const variant of [0, 1] as const) {
      const text = sources[variant]; assert.ok(typeof text === "string"); assert.equal(source(text), variant); const row = SOURCE[variant];
      const before = text.slice(0, row.constructorStart); const column = before.length - before.lastIndexOf("\n") - 1, line = before.split("\n").length - 1;
      assert.equal(line, row.lineNumber); assert.equal(text.slice(row.constructorStart, row.constructorEnd), constructor);
      await inspectConstructor(session, variant, text.slice(row.constructorStart, row.constructorEnd), column);
      assert.throws(() => { source(text.slice(0, -1)); }); assert.throws(() => { source(`${text  } `); });
      assert.throws(() => { source(`${text.slice(0, row.start)  }J${  text.slice(row.start + 1)}`); });
    }
  } finally { session.disconnect(); }
});
