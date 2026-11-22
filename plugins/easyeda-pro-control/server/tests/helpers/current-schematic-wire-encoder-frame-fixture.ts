/* oxlint-disable import/max-dependencies -- Exercise the original pipe and all typed encoder readers together, with only plan ownership substituted. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { PassThrough, Writable } from "node:stream";
import { runInThisContext } from "node:vm";
import { z } from "zod";
import { CurrentSchematicWireWriterV5Pipe, requireCurrentSchematicWireV5BundleSourceReceive } from "../../src/current-pcb-diagnostic-pipe.ts";
import { captureCurrentPcbStringClockReply as capture } from "../../src/current-pcb-string-clock-reply.ts";
import { currentSchematicRelevanceRawHandle, currentSchematicRelevanceRawProperties } from "../../src/current-schematic-relevance-action-raw-replies.ts";
import type { CurrentSchematicWireEncoderCheckpointReader } from "../../src/current-schematic-wire-encoder-checkpoint.ts";
import { compareCurrentSchematicWireEncoderFunction } from "../../src/current-schematic-wire-encoder-metadata.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET, currentSchematicWireEncoderComparison,
  currentSchematicWireEncoderMetadataCommand, currentSchematicWireEncoderSourceCommand,
} from "../../src/current-schematic-wire-encoder-protocol.ts";
import type { CurrentSchematicWireEncoderCommand } from "../../src/current-schematic-wire-encoder-protocol.ts";
import {
  currentSchematicWireEncoderSourceRow, currentSchematicWireEncoderScriptId as handle,
  qualifyCurrentSchematicWireEncoderSource, requireCurrentSchematicWireEncoderSourceCheckpoint,
} from "../../src/current-schematic-wire-encoder-source.ts";
import type { CurrentSchematicWireEncoderRole, CurrentSchematicWireEncoderSourceCheckpoint } from "../../src/current-schematic-wire-encoder-source.ts";

const scriptId = "fixture-schematic-script";
export const ENCODER_FIXTURE_SESSION = "fixture-renderer-session";
const roster = [
  { id: "selected-line", type: "LINE", role: "lineUpload" },
  { id: "attribute", type: "ATTR", role: "attributeUpload" },
  { id: "peer-bus", type: "BUS", role: "groupUpload" },
  { id: "peer-line", type: "LINE", role: "lineUpload" },
  { id: "text", type: "TEXT", role: "textUpload" },
  { id: "wire", type: "WIRE", role: "groupUpload" },
] as const satisfies readonly { id: string; type: string; role: CurrentSchematicWireEncoderRole }[];

function reply(id: number, result: object, sessionId?: string): Buffer {
  return Buffer.from(`${JSON.stringify({ id, result, sessionId })}\0`);
}

/** Send the installed source bytes through the same retained source frame
 * parser used by V5 title preparation, using an inert attached renderer. */
async function sourceCheckpoint(asset: string): Promise<CurrentSchematicWireEncoderSourceCheckpoint> {
  const input = new PassThrough();
  const output = new Writable({ write(_data, _encoding, complete): void { complete(); } });
  const pipe = new CurrentSchematicWireWriterV5Pipe(input, output);
  pipe.start();
  try {
    const attachment = pipe.attachTarget("fixture-renderer-target", () => assert.fail("Unexpected renderer event"));
    input.write(reply(1, { sessionId: ENCODER_FIXTURE_SESSION }));
    assert.equal(await attachment, ENCODER_FIXTURE_SESSION);
    const pending = pipe.observeSchematicWireV5Title({
      phase: "wire-v5-title-bundle-source", method: "Debugger.getScriptSource", params: { scriptId },
    });
    const frame = reply(2, { scriptSource: asset }, ENCODER_FIXTURE_SESSION);
    for (let offset = 0; offset < frame.length; offset += 65_536) {
      input.write(frame.subarray(offset, offset + 65_536));
    }
    const raw = await pending;
    const receipt = requireCurrentSchematicWireV5BundleSourceReceive(pipe, raw, ENCODER_FIXTURE_SESSION, scriptId);
    assert.deepEqual(receipt, { requestId: 2, sessionId: ENCODER_FIXTURE_SESSION, scriptId, frameBytes: frame.length - 1 });
    return qualifyCurrentSchematicWireEncoderSource(receipt.scriptId, raw);
  } finally {
    const closed = [once(input, "close"), once(output, "close")];
    input.destroy();
    output.destroy();
    await Promise.all(closed);
    pipe.releaseClosedListeners();
  }
}

const property = (name: string, value: object, writable: boolean): object =>
  ({ name, value, isOwn: true, writable, configurable: true, enumerable: writable });

function peers(asset: string, variant: 0 | 1): readonly Readonly<{
  binding: Readonly<{ row: string; prototype: string; functionRemote: object }>;
  references: readonly string[];
  reads: readonly Readonly<{ handle: string; result: object }>[];
}>[] {
  return roster.map(({ id, role }) => {
    const method = `upload.${id}`, model = `model.${id}`, prototype = `proto.${id}`, row = `row.${id}`;
    const pin = currentSchematicWireEncoderSourceRow(variant, role);
    const functionRemote = { type: "function", className: "Function", objectId: method, description: asset.slice(pin.start, pin.end) };
    const fields = {
      result: [property("id", { type: "string", value: id }, true), property("model", { type: "object", objectId: model }, true)],
      internalProperties: [],
    };
    const metadata = {
      result: [property("name", { type: "string", value: pin.name }, false), property("length", { type: "number", value: pin.arity }, false)],
      internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, ...pin.location } } },
        { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function.prototype", description: "function () { [native code] }" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `scope.${id}`, description: "Scopes[1]" } },
      ],
    };
    return { binding: { row, prototype, functionRemote }, references: [row, model, prototype, method],
      reads: [{ handle: row, result: fields }, { handle: method, result: metadata }] };
  });
}

async function readerClass(plan: object): Promise<typeof CurrentSchematicWireEncoderCheckpointReader> {
  const text = await readFile(new URL("../../src/current-schematic-wire-encoder-checkpoint.ts", import.meta.url), "utf8");
  const body = stripTypeScriptTypes(text).replaceAll(/^import[\s\S]*?;\n/gmu, "").replace("export class", "class");
  const factory: unknown = runInThisContext(`(bindings => {
    const { z, capture, handle, CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET, currentSchematicRelevanceRawHandle,
      currentSchematicRelevanceRawProperties, compareCurrentSchematicWireEncoderFunction,
      requireCurrentSchematicWireEncoderSourceCheckpoint, currentSchematicWireEncoderMetadataCommand,
      currentSchematicWireEncoderComparison, requireOriginalCurrentSchematicWireEditPlan } = bindings;
    ${body}
    return CurrentSchematicWireEncoderCheckpointReader;
  })`);
  assert.equal(typeof factory, "function");
  assert.ok(typeof factory === "function");
  const constructor: unknown = Reflect.apply(factory, undefined, [{
    z, capture, handle, CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET, currentSchematicRelevanceRawHandle, currentSchematicRelevanceRawProperties,
    compareCurrentSchematicWireEncoderFunction, requireCurrentSchematicWireEncoderSourceCheckpoint,
    currentSchematicWireEncoderMetadataCommand, currentSchematicWireEncoderComparison,
    requireOriginalCurrentSchematicWireEditPlan: (candidate: unknown): object => {
      assert.equal(candidate, plan);
      return { argumentsValue: { operation: { lineId: roster[0].id, peers: [{ id: "CANVAS", type: "CANVAS" }, ...roster.slice(1)] } } };
    },
  }]);
  // The disposable-plan brand is synthetic. The reader retains its original body and ordinary realm.
  return z.custom<typeof CurrentSchematicWireEncoderCheckpointReader>(value => typeof value === "function").parse(constructor);
}

/** Model the exact reply sequence using real pinned upload descriptions and
 * synthetic Inspector handles. No encoder or application method is invoked. */
export async function exerciseEncoderWireFrames(asset: string, variant: 0 | 1): Promise<readonly CurrentSchematicWireEncoderCommand[]> {
  const qualified = await sourceCheckpoint(asset);
  assert.equal(qualified.variant, variant);
  const plan = { operationId: "fixture-wire-edit", profile: "private.current-schematic-wire-edit-plan.v1", executionAuthorized: false, saveAuthorized: false } as const;
  const Reader = await readerClass(plan);
  const selected = peers(asset, variant);
  const reads = selected.flatMap(peer => peer.reads);
  const references = ["native", "graph", ...selected.flatMap(peer => peer.references)];
  const comparison = currentSchematicWireEncoderComparison("membership", "holder", references);
  const observed = [currentSchematicWireEncoderSourceCommand(qualified.scriptId)];
  const reader = new Reader(plan, qualified, { holder: "holder", native: "native", graph: "graph", peers: selected.map(peer => peer.binding) }, {
    request: (command): Promise<unknown> => {
      const index = observed.length - 1;
      observed.push(command);
      const read = reads[index];
      if (read === undefined) {
        assert.equal(index, reads.length);
        assert.deepEqual(command, comparison);
        return Promise.resolve({ result: { type: "boolean", value: true } });
      }
      assert.deepEqual(command, currentSchematicWireEncoderMetadataCommand(read.handle));
      return Promise.resolve(read.result);
    },
    assertCurrent: (): void => { assert.equal(plan.executionAuthorized, false); },
  });
  const result = reader.observe();
  assert.equal(reader.observe(), result);
  const checkpoint = await result;
  assert.equal(checkpoint.normalRequests, 13);
  assert.equal(checkpoint.modelUploadDescriptorsCompared, 6);
  assert.equal(checkpoint.originalNativeOwnerJoined, false);
  assert.equal(checkpoint.executionAuthorized, false);
  return Object.freeze(observed);
}
