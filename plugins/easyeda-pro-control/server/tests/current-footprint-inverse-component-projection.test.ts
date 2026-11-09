import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbComponentSpatialNativeSource } from "../src/current-pcb-component-spatial-native-fragment.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOSED_COMPONENT_NATIVE_SOURCE as CLOSED, projectCurrentFootprintInverseComponentRuntime as project } from "../src/current-footprint-inverse-component-projection.ts";

void test("inverse projection closes only the exact noncloned Component implementation", () => {
  const prefix = 'actor/Main/cache/shared6/OpeningFunction="original";\n', suffix = "\noriginal-dispatch-and-source-roster";
  const original = currentPcbComponentSpatialNativeSource(false);
  const input = prefix + original + suffix;
  const next = project(input);
  assert.equal(next, prefix + CLOSED + suffix);
  assert.equal(project(next), next);
  assert.ok(Buffer.byteLength(original) - Buffer.byteLength(CLOSED) > 60_000);
  for (const name of ["ComponentWrapperFunction", "ComponentBindingsFunction", "ComponentReadFunction", "ComponentRegistrationFunction", "ComponentSpatialBirth", "ComponentScene", "ComponentSequence"]) {
    assert.equal(CLOSED.includes(name), false, name);
  }
  assert.match(CLOSED, /readonly bool componentSpatial209=false;/u);
  const bodies = [...CLOSED.matchAll(/\{throw Error\("inverse-component-purpose-closed"\);\}/gu)];
  assert.equal(bodies.length, 11);
  assert.equal(CLOSED.includes("SendMessage("), false);
  assert.equal(CLOSED.includes("TerminateJobObject("), false);
  assert.equal(CLOSED.includes("UnpackFixedProgram("), false);
});

void test("Component projection rejects unknown implementations and malformed owned boundaries", () => {
  const source = currentPcbComponentSpatialNativeSource(false);
  for (const changed of [
    source.replace("ComponentReadFunction=", "ComponentReadFunction ="),
    source.replace("// END GENERATED COMPONENT SPATIAL419", "// end changed"),
    `${source  }\n// BEGIN GENERATED COMPONENT SPATIAL419`,
    `${source  }\n// END GENERATED COMPONENT SPATIAL419`,
    CLOSED.replace('Error("inverse-component-purpose-closed")', 'Error("changed")'),
    currentPcbComponentSpatialNativeSource(true),
  ]) { assert.throws(() => project(changed), /INVERSE_COMPONENT_(?:BLOCK_ROSTER|SOURCE_MISMATCH)/u); }
});
