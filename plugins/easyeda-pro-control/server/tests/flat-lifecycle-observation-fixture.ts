import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import { readArtifact } from "../src/artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { schematicNativeSnapshotHash } from "../src/schematic-native-adapter.ts";
import { verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import type { fixture } from "./flat-display-fixture.ts";

type Fixture = ReturnType<typeof fixture>;
const inheritedKey = "Synthetic inherited observation witness";

/** This attribute deliberately has no source/history record. Its unchanged
 * native order and value admit an ID-only regeneration after reopening.
 */
export function withInheritedObservationWitness(value: Fixture): Fixture {
  const result = structuredClone(value);
  const component = result.native.components[0], symbol = result.evidence.observation.pages[0]?.symbols[0];
  assert.ok(component && symbol);
  const attribute = { id: "7".repeat(16), key: inheritedKey, value: "Inherited only", body: {
    parentId: component.id, key: inheritedKey, value: "Inherited only", x: null, y: null, zIndex: 999,
  } };
  component.attributes.push({ ...structuredClone(attribute), symbolValue: attribute.value, blockValue: null, instanceValue: null });
  component.attributes.sort((left, right) => left.id.localeCompare(right.id));
  symbol.attributes.push(structuredClone(attribute));
  result.evidence = { ...result.evidence, proof: verifySchematicFlatTopology(result.evidence.observation) };
  return result;
}

export function regenerateObservationWitness(value: Fixture): Fixture {
  const result = structuredClone(value);
  const attribute = result.native.components[0]?.attributes.find((entry) => entry.key === inheritedKey);
  const observed = result.evidence.observation.pages[0]?.symbols[0]?.attributes.find((entry) => entry.key === inheritedKey);
  assert.ok(attribute && observed);
  attribute.id = "8".repeat(16); observed.id = attribute.id;
  result.native.components[0]?.attributes.sort((left, right) => left.id.localeCompare(right.id));
  result.evidence = { ...result.evidence, proof: verifySchematicFlatTopology(result.evidence.observation) };
  return result;
}

export async function assertFlatLifecycleObservation(input: {
  readonly terminal: Record<string, unknown>;
  readonly journal: { readonly operationId: string; readonly planHash: string; readonly artifacts?: readonly { readonly path: string; readonly sha256: string; readonly bytes: number }[] };
  readonly binding: unknown;
  readonly context: unknown;
  readonly current: Fixture;
  readonly phase: "commit" | "retained-save" | "baseline-reconcile" | "inverse";
}): Promise<void> {
  const descriptor = input.terminal["flatLifecycleObservation"];
  assert.ok(isRecord(descriptor), "The terminal evidence must reference the actual final raw observation.");
  const registered = input.journal.artifacts?.find((entry) => canonicalJson(entry) === canonicalJson(descriptor));
  assert.ok(registered, "The terminal descriptor must exactly match a managed journal artifact.");
  assert.ok(registered.path.endsWith(`-flat-${input.phase}-observation.json`));
  const info = await stat(registered.path);
  assert.equal(info.mode % 0o1000, 0o600);
  const read = await readArtifact(registered.path, 0, registered.bytes);
  assert.equal(read.eof, true);
  const retained: unknown = JSON.parse(read.text); assert.ok(isRecord(retained));
  const expected = { schema: "easyeda-pro-control.flat-lifecycle-observation.v1", phase: input.phase,
    sourcePhase: ["inverse", "baseline-reconcile"].includes(input.phase) ? "before" : "after",
    operationId: input.journal.operationId, originalPlanHash: input.journal.planHash, flatBindingSha256: sha256Json(input.binding),
    context: input.context, sourceSha256: parseDocumentSource(input.current.native.source).sha256,
    nativeSha256: schematicNativeSnapshotHash(input.current.native), observerCheckpoint: input.current.evidence.checkpoint,
    projectBinding: input.current.evidence.projectBinding,
    ...(input.current.evidence.libraryHeaderEvidence === undefined ? {} : { libraryHeaderEvidence: input.current.evidence.libraryHeaderEvidence }),
    observation: input.current.evidence.observation, observationSha256: sha256Json(input.current.evidence.observation),
    topologyProof: verifySchematicFlatTopology(input.current.evidence.observation), compiledTopology: false };
  assert.deepEqual(retained, expected, "Retain the existing final observer exactly, without decoded history, authority or durability fields.");
  assert.notDeepEqual(retained.observerCheckpoint, input.terminal["checkpoint"], "Observer and later committed checkpoint remain distinct evidence.");
  assert.equal(Object.hasOwn(input.terminal, "observation"), false, "Terminal evidence links the separate raw artifact.");
}
