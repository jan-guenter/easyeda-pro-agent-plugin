/** No fixture can synthesize genuine completed writer custody. These checks
 * exercise the production entry guard and prove no getters or I/O are used. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { completeOriginalGeneratedSchematicRelevanceClosedLifecycle, requireOriginalGeneratedSchematicRelevanceClosedLifecycle } from "../src/generated-schematic-relevance-closed-lifecycle.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "../src/current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "../src/generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayClosedSnapshot } from "../src/generated-schematic-relevance-display-closed-snapshot.ts";

void test("copied lifecycle and drained packets refuse before supplied getters, files or replacement allocation", () => {
  let reads = 0; const forged = Object.defineProperty({}, "target", { get: (): never => { reads += 1; throw new Error("must not inspect"); } });
  assert.throws(() => requireOriginalGeneratedSchematicRelevanceClosedLifecycle({ profile: "private.generated-schematic-relevance-closed-lifecycle.v1" }));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Explicit serialized forgeries must stop at the genuine drained-token registry before inspecting any supplied object.
  const owner = forged as CurrentSchematicRelevanceDisplayWriteOwner;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate malformed argument identity shares the getter-bearing sentinel.
  const args = forged as GeneratedSchematicRelevanceDisplayNativeArguments;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate malformed closed capture shares the getter-bearing sentinel.
  const snapshot = forged as GeneratedSchematicRelevanceDisplayClosedSnapshot;
  assert.throws(() => completeOriginalGeneratedSchematicRelevanceClosedLifecycle(owner, args, { profile: "private.current-schematic-relevance-display-save-drained.v1" }, forged, snapshot));
  assert.equal(reads, 0);
});
