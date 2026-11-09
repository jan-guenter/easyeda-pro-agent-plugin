/** Decode the emitted tables independently so a changed shared-program
 * index cannot silently select a different worker helper on the wire. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import { test } from "node:test";
import { currentSchematicRelevanceModifyStructureNativeSource } from "../src/current-schematic-relevance-modify-structure-native.ts";
import { currentSchematicRelevanceModifyStructureCases, currentSchematicRelevanceModifyStructureTemplate } from "../src/current-schematic-relevance-modify-structure-wire.ts";
import { currentSchematicRelevanceModifyControlPrograms } from "../src/current-schematic-relevance-modify-control-native.ts";

async function table(source: string, name: string): Promise<readonly (readonly string[])[]> {
  const match = new RegExp(`string\\[\\]\\[\\] ${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([A-Za-z\\d+/=]+)",([1-9]\\d*),@"([a-f\\d]{64})",@"([a-f\\d]{64})",([1-9]\\d*),([1-9]\\d*)\\);`, "u").exec(source);
  assert.ok(match?.[1] !== undefined);
  const packed = Buffer.from(match[1], "base64");
  const raw = await promisify(gunzip)(packed, { maxOutputLength: 65_536 });
  assert.equal(raw.length, Number(match[2]));
  assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]);
  assert.equal(createHash("sha256").update(packed).digest("hex"), match[4]);
  return raw.toString().split("\0").map(row => row.split("\t"));
}

void test("every emitted TEXT wave row restores the exact worker helper and original CDP message", async () => {
  const source = currentSchematicRelevanceModifyStructureNativeSource();
  const rows = await table(source, "Rows");
  const programs = [...currentSchematicRelevanceModifyControlPrograms()];
  for (const row of await table(source, "OwnPrograms")) {
    const value: unknown = JSON.parse(row[1] ?? "");
    assert.ok(typeof value === "string");
    programs[Number(row[0])] = value;
  }
  const commands = currentSchematicRelevanceModifyStructureCases();
  assert.equal(rows.length, commands.length);
  const smoke = /VerifySmoke\(Rows,EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\),Encode,Need\)/u.exec(source);
  assert.ok(smoke?.[1] !== undefined);
  const hashes = Buffer.from(smoke[1], "base64");
  assert.equal(hashes.length, commands.length * 32);
  for (const [index, command] of commands.entries()) {
    const expected = currentSchematicRelevanceModifyStructureTemplate(command), row = rows[index];
    assert.ok(row?.[3] !== undefined);
    let message = row[3].replaceAll(/"__schematic_modifystructure_program(\d+)__"/gu, (_value, raw: string) => {
      const program = programs[Number(raw)]; assert.ok(program !== undefined); return JSON.stringify(program);
    });
    for (const name of expected.names) {
      const value = expected.values[name]; assert.ok(value !== undefined);
      message = message.replaceAll(`__schematic_modifystructure_${name}__`, value);
    }
    assert.equal(message, JSON.stringify({ method: command.method, params: command.params }));
    const full = `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`;
    assert.deepEqual(createHash("sha256").update(full).digest(), hashes.subarray(index * 32, (index + 1) * 32));
  }
});
