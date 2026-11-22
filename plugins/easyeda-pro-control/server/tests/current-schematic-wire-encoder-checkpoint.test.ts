/* oxlint-disable import/max-dependencies -- Exercise actual Inspector descriptors and the fixed Wire protocol in the same bounded source fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { join } from "node:path";
import { test } from "node:test";
import { Script } from "node:vm";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { compareCurrentSchematicWireEncoderFunction } from "../src/current-schematic-wire-encoder-metadata.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_MEMBERSHIP_PROGRAM, CURRENT_SCHEMATIC_WIRE_ENCODER_RETURN_PROGRAM } from "../src/current-schematic-wire-encoder-programs.ts";
import { currentSchematicWireEncoderComparison, currentSchematicWireEncoderFrame, validateCurrentSchematicWireEncoderCommand } from "../src/current-schematic-wire-encoder-protocol.ts";
import { qualifyCurrentSchematicWireEncoderSource, requireCurrentSchematicWireEncoderSourceCheckpoint, currentSchematicWireEncoderSourceRow as row } from "../src/current-schematic-wire-encoder-source.ts";

const relativePaths = [
  "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js",
  "pro-sch/3.2.193.5dbe8bb3/js/sch.js",
] as const;
const assets = process.env["EASYEDA_ASSETS_ROOT"];
const raw = z.strictObject({ result: z.looseObject({ objectId: z.string(), description: z.string() }) });
const scopeValue = z.looseObject({ value: z.unknown().optional() });
const scopeRow = z.looseObject({ name: z.string(), value: scopeValue });
const scope = z.looseObject({ internalProperties: z.array(scopeRow) });


void test("both complete installed sources pin their long encoder descriptor at the exact local Inspector location", {
  skip: assets === undefined && "Installed schematic assets are unavailable",
}, async () => {
  assert.ok(assets !== undefined);
  const session = new Session();
  session.connect();
  const published = "wireEncoderTestFunction";
  try {
    await session.post("Runtime.enable");
    await session.post("Debugger.enable");
    for (const variant of [0, 1] as const) {
      const original = await readFile(join(assets, relativePaths[variant]), "utf8");
      const parent = row(variant, "consistencyParentClass");
      const source = row(variant, "consistencyClass");
      const parentSource = original.slice(parent.start, parent.end);
      const base = /^class extends ([$A-Z_a-z][$\w]*)\{/u.exec(parentSource)?.[1];
      assert.ok(base !== undefined);
      const prefix = `const ${source.name}=`;
      const before = original.slice(0, source.start).split("\n");
      const column = before.at(-1)?.length;
      assert.ok(column !== undefined && column >= prefix.length && before.length >= 2);
      // Only class definitions are evaluated in Node. No constructor or
      // Vendor application code is invoked.
      const scaffold = `(() => {const ${base}=class{};const ${parent.name}=${parentSource};`;
      const padding = "\n".repeat(before.length - scaffold.split("\n").length);
      const pinned = original.slice(source.start, source.end);
      const program = `${scaffold}${padding}${" ".repeat(column - prefix.length)}${prefix}${pinned};globalThis.${published}=${source.name};})()`;
      new Script(program, { filename: `wire-encoder-proof-${String(variant)}.js` }).runInThisContext();
      const fn = raw.parse(await session.post("Runtime.evaluate", { expression: `globalThis.${published}`, silent: true })).result;
      const metadata = await session.post("Runtime.getProperties", { objectId: fn.objectId, ownProperties: true });
      const found = scope.parse(metadata).internalProperties.find(slot => slot.name === "[[FunctionLocation]]");
      const location = z.looseObject({ scriptId: z.string() }).parse(found?.value.value);
      const checkpoint = qualifyCurrentSchematicWireEncoderSource(location.scriptId, { scriptSource: original });
      assert.equal(checkpoint.variant, variant);
      assert.equal(Buffer.byteLength(fn.description), 21_265);
      assert.throws(() => captureCurrentPcbStringClockReply(fn), /PCB_STRING_CLOCK_REPLY_CAPTURE/u);
      const exact = compareCurrentSchematicWireEncoderFunction(checkpoint, "consistencyClass", metadata, fn);
      assert.equal(exact.objectId, fn.objectId);
      assert.equal(exact.originalNativeOwnerJoined, false);
      assert.throws(() => compareCurrentSchematicWireEncoderFunction(checkpoint, "consistencyClass", metadata,
        { ...fn, description: fn.description.slice(1) }), /WIRE_ENCODER_METADATA/u);
      assert.throws(() => { requireCurrentSchematicWireEncoderSourceCheckpoint({ ...checkpoint }); }, /WIRE_ENCODER_SOURCE/u);
      const read = currentSchematicWireEncoderFrame(checkpoint, "handler", "source-frame");
      assert.equal(read.method, "Debugger.evaluateOnCallFrame");
      assert.match(JSON.stringify(read), variant === 0 ? /\[this,Rb\]/u : /\[this,Ub\]/u);
    }
  } finally {
    Reflect.deleteProperty(globalThis, published);
    session.disconnect();
  }
});

void test("the readonly membership comparison joins each idMap model and prototype in source-map order", () => {
  const membership: unknown = new Script(`(${CURRENT_SCHEMATIC_WIRE_ENCODER_MEMBERSHIP_PROGRAM})`).runInThisContext();
  const returned: unknown = new Script(`(${CURRENT_SCHEMATIC_WIRE_ENCODER_RETURN_PROGRAM})`).runInThisContext();
  assert.ok(typeof membership === "function" && typeof returned === "function");
  const native = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is,
    Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray,
    // oxlint-disable-next-line typescript/unbound-method -- The exact unbound Map intrinsics are invoked only with the checked Map by the fixture program.
    Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get,
    undefined, undefined, undefined, Object.prototype, Array.prototype, Map.prototype];
  const sourceMap = new Map<string, number>();
  const idMap = new Map<string, unknown>();
  const rows = Array.from({ length: 6 }, (_, i) => {
    const id = `peer-${String(i)}`;
    const uploadTo = (): never => { throw new Error(`Vendor method must stay uncalled for ${id}`); };
    const prototype = Object.defineProperty({}, "uploadTo", { value: uploadTo, writable: true, configurable: true });
    const model: unknown = Object.create(prototype);
    sourceMap.set(id, 1);
    idMap.set(id, model);
    return { row: { id, model }, model, prototype, uploadTo };
  });
  idMap.set("marker-0", {});
  idMap.set("marker-1", {});
  const before = { tree: rows.map(peer => peer.row) };
  const ids = { idMap };
  const consistency = {};
  const page = { idManager: ids, consistencyImpl: consistency };
  const handler = { docManager: page, sourceCodeIdMap: sourceMap };
  Object.defineProperty(consistency, "decodeAndRealTimeSyncHandler", { value: handler });
  const binding = { page, consistency, handler, ids, index: idMap };
  const state = { owner: null as object | null, failed: false, saveAttempted: false, before };
  const holder = [binding, state];
  state.owner = holder;
  const graph = [binding, state, page, consistency, handler, ids, idMap, sourceMap, before, before.tree];
  const refs = rows.flatMap(peer => [peer.row, peer.model, peer.prototype, peer.uploadTo]);
  assert.equal(Reflect.apply(membership, holder, [native, graph, ...refs]), true);
  assert.throws(() => Reflect.apply(membership, holder, [native, graph, ...refs.slice(4), ...refs.slice(0, 4)]),
    /^WIRE_ENCODER_MEMBERSHIP$/u);
  idMap.set("peer-5", {});
  assert.throws(() => Reflect.apply(membership, holder, [native, graph, ...refs]), /^WIRE_ENCODER_MEMBERSHIP$/u);
  const encoder = {};
  assert.equal(Reflect.apply(returned, encoder, [native, encoder, [encoder, "source"], ["source"]]), true);
  assert.throws(() => Reflect.apply(returned, encoder, [native, encoder, [encoder, "source"], ["different"]]), /^WIRE_ENCODER_RETURN$/u);
});

void test("the finite encoder commands refuse replaced JavaScript and incomplete argument lists", () => {
  const request = currentSchematicWireEncoderComparison("membership", "holder",
    Array.from({ length: 26 }, (_, i) => `arg-${String(i)}`));
  assert.equal(request.method, "Runtime.callFunctionOn");
  assert.throws(() => validateCurrentSchematicWireEncoderCommand({
    ...request, params: { ...request.params, functionDeclaration: "function(){return true}" },
  }));
  assert.throws(() => validateCurrentSchematicWireEncoderCommand({
    ...request, params: { ...request.params, arguments: request.params.arguments.slice(1) },
  }));
});
