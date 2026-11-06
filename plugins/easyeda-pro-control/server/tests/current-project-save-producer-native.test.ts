/** Fixed current209 observation codecs, released-purpose refusals and complete
 * generator composition. No original owner, process or worker is allocated. */
/* oxlint-disable import/max-dependencies -- Compare the independently sealed old/new wire families and the actual full fragment composition. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { applyCurrentGeneratedInitialCacheNativeFragment as initialCache } from "../src/current-generated-initial-cache-native-fragment.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerWire } from "../src/current-project-save-producer-wire.ts";
import { applyCurrentProjectSaveProducerNativeFragment as producer } from "../src/current-project-save-producer-native-fragment.ts";
import { applyCurrentProjectSaveProducerGuardNativeFragment as guards } from "../src/current-project-save-producer-guard-native-fragment.ts";
import { applyCurrentProjectStructureTransportNativeFragment as transport } from "../src/current-project-structure-transport-native-fragment.ts";
import { applyCurrentProjectStructureNativeFragment as structure } from "../src/current-project-structure-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment as registration } from "../src/managed-fixture-registration-native-fragment.ts";
import { applyCurrentPcbViaWriteNativeFragment as via } from "../src/current-pcb-via-write-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment as schematic } from "../src/current-schematic-display-write-native-fragment.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { diagnosticNativeRequest } from "../src/current-pcb-diagnostic-protocol.ts";
import { spatialDiagnosticNativeRequest } from "../src/current-pcb-spatial-protocol.ts";

function compose(input: string): string { const base = registration(structure(input)), writers = schematic(via(base)); return producer(guards(transport(writers))); }
void test("121 observation templates roundtrip through only the two exact new writer births", () => {
  const cases = currentProjectSaveProducerNativeCases(); assert.equal(cases.length, 121);
  for (const command of cases) { for (const purpose of ["via", "schematic"] as const) {
    const encoded = Buffer.from(`${JSON.stringify({ id: 1, ...command, producerObserveCommand: true, sessionId: "original-worker" })}\0`), wire = currentProjectSaveProducerWire(command, 1, purpose);
    assert.deepEqual((purpose === "via" ? currentPcbViaWriteNativeRequest : currentSchematicDisplayWriteNativeRequest)(encoded), wire.request);
    assert.throws(() => diagnosticNativeRequest(encoded)); assert.throws(() => spatialDiagnosticNativeRequest(encoded));
    for (const key of ["sessionId", "functionDeclaration", "expression", "lineNumber", "columnNumber", "grant", "resume"]) { assert.equal(Object.hasOwn(wire.request, key), false); }
  } }
});
void test("full producer generation is idempotent and keeps source observation separate from every continuation", async () => {
  const base = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"), source = compose(base);
  assert.equal(compose(source), source); assert.equal(producer(source), source);
  for (const action of ["pcb-via-producer-observe", "schematic-display-producer-observe"]) { assert.equal(source.split(`        '${action}' {`).length, 2); }
  assert.ok(source.includes("viaProducerObserveRequests>=240")); assert.ok(source.includes("schematicProducerObserveArms.Count!=23"));
  assert.equal(source.includes("project-save-producer-resume"), false); assert.throws(() => producer(source.replace("$owner.SendViaProducerObserve", "$owner.ForeignViaProducerObserve")), /CHANGED/u);
});

void test("startup-only initial cache dispatch remains idempotent across whole writer regeneration and refuses changed owned blocks", async () => {
  const base = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8"), source = initialCache(compose(base));
  assert.equal(initialCache(compose(source)), source); assert.equal(initialCache(source), source);
  for (const action of ["pcb-via-initial-cache", "schematic-display-initial-cache", "pcb-via-initial-cache-complete", "schematic-display-initial-cache-complete"]) { assert.equal(source.split(`        '${action}' {`).length, 2); }
  assert.ok(source.includes("viaProducerPrefixEnrolled||!viaInitialCacheCompleted")); assert.ok(source.includes("schematicProducerPrefixEnrolled||!schematicInitialCacheCompleted"));
  assert.ok(source.includes("if ($line.Length -ge 32768)")); assert.throws(() => initialCache(source.replace("$owner.SendViaInitialCache", "$owner.UnownedInitialCache")), /CHANGED/u);
});
