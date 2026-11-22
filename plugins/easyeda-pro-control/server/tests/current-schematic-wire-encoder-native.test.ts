import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_NATIVE_BUDGET as BUDGET, currentSchematicWireEncoderNativeRequest,
  currentSchematicWireEncoderNativeSource,
} from "../src/current-schematic-wire-encoder-native.ts";
import {
  CURRENT_SCHEMATIC_WIRE_ENCODER_PEER_BUDGET as PEER_BUDGET, currentSchematicWireEncoderComparison,
  currentSchematicWireEncoderMetadataCommand, currentSchematicWireEncoderSourceCommand,
} from "../src/current-schematic-wire-encoder-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS } from "../src/current-schematic-wire-writer-protocol.ts";

const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

void test("the native encoder checkpoint projects only source, metadata and membership handles", () => {
  const source = currentSchematicWireEncoderSourceCommand("script27");
  assert.deepEqual(currentSchematicWireEncoderNativeRequest(source), {
    phase: "wire-encoder-source", method: "Debugger.getScriptSource", fields: { scriptId: "script27" },
  });
  const metadata = currentSchematicWireEncoderMetadataCommand("16.1.17");
  assert.deepEqual(currentSchematicWireEncoderNativeRequest(metadata), {
    phase: "wire-encoder-metadata", method: "Runtime.getProperties", fields: { objectId: "16.1.17" },
  });
  const refs = Array.from({ length: 26 }, (_, index) => `ref${String(index)}`);
  const membership = currentSchematicWireEncoderComparison("membership", "holder", refs);
  const projected = currentSchematicWireEncoderNativeRequest(membership);
  assert.deepEqual(projected, {
    phase: "wire-encoder-compare", method: "Runtime.callFunctionOn",
    fields: { objectId: "holder", ...Object.fromEntries(refs.map((ref, index) => [`arg${String(index)}ObjectId`, ref])) },
  });
  assert.ok(Object.isFrozen(projected.fields));

  assert.throws(() => currentSchematicWireEncoderNativeRequest({ ...source, method: "Runtime.evaluate" }));
  assert.throws(() => currentSchematicWireEncoderNativeRequest({ ...metadata, params: { ...metadata.params, ObjectId: "extra" } }));
  assert.throws(() => currentSchematicWireEncoderNativeRequest({ ...membership, params: { ...membership.params, silent: false } }));
  assert.throws(() => currentSchematicWireEncoderNativeRequest(currentSchematicWireEncoderComparison("returnEquality", "holder",
    ["native", "receiver", "handlerReturn", "writerReturn"])), /WIRE_ENCODER_NATIVE_PHASE/u);
  assert.throws(() => currentSchematicWireEncoderNativeRequest({
    phase: "wire-encoder-frame", role: "delegation", variant: 0, method: "Debugger.evaluateOnCallFrame",
    params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, callFrameId: "held.0", expression: "[this]", returnByValue: false, includeCommandLineAPI: false },
  }), /WIRE_ENCODER_NATIVE_PHASE/u);
});

void test("all three generated native rows retain the exact closed wire shapes and fit 16 KiB", () => {
  assert.deepEqual(BUDGET, { source: 1, metadata: PEER_BUDGET.peers * 2, membership: 1, total: 1 + PEER_BUDGET.normal });
  const generated = currentSchematicWireEncoderNativeSource();
  const match = /EasyedaDiagnosticFixedTable\.Load\("([^"]+)",(\d+),"([a-f\d]{64})","([a-f\d]{64})",3,4\)/u.exec(generated);
  assert.ok(match !== null);
  const [, data, length, rawHash, packedHash] = match;
  assert.ok(data !== undefined && length !== undefined);
  const packed = Buffer.from(data, "base64");
  // oxlint-disable-next-line node/no-sync -- Read only this bounded generated table within the synchronous test.
  const raw = gunzipSync(packed, { maxOutputLength: 65_536 });
  assert.equal(hash(packed), packedHash);
  assert.equal(hash(raw), rawHash);
  assert.equal(raw.length, Number(length));

  const handle = "x".repeat(256);
  const commands = [
    currentSchematicWireEncoderSourceCommand(handle), currentSchematicWireEncoderMetadataCommand(handle),
    currentSchematicWireEncoderComparison("membership", handle, Array.from({ length: 26 }, () => handle)),
  ];
  const rows = raw.toString().split("\0");
  assert.equal(rows.length, commands.length);
  for (const [index, command] of commands.entries()) {
    const { phase, method, fields } = currentSchematicWireEncoderNativeRequest(command);
    const row = rows[index]?.split("\t");
    assert.deepEqual(row?.slice(0, 3), [phase, method, Object.keys(fields).join(",")]);
    const template = row?.[3];
    assert.ok(template !== undefined);
    const encoded = template.replaceAll(/"__wire_encoder_([A-Za-z0-9]+)__"/gu, (_match: string, name: string) => {
      const expected = fields[name];
      assert.ok(expected !== undefined);
      return JSON.stringify(expected);
    });
    const expected = JSON.stringify({ method, params: command.params });
    assert.equal(encoded, expected);
    assert.ok(Buffer.byteLength(`{"id":2147483647,${encoded.slice(1, -1)},"sessionId":"${handle}"}\0`) <= 16_384);
  }
});
