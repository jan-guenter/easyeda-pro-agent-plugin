import assert from "node:assert/strict";
import { test } from "node:test";
import type { ArtifactDescriptor } from "../src/artifacts.ts";
import { selectDesignPhaseDescriptor } from "../src/design-execution.ts";

const descriptor = (name: string): ArtifactDescriptor => ({ path: `/managed/operation/${name}`, bytes: 10, sha256: "ab".repeat(32) });

void test("retained phase selection matches the exact numbered basename and still rejects true duplicate phases", () => {
  const prepared = descriptor("02-prepared.json");
  const navigation = descriptor("09-target-open-prepared.json");
  const secondNavigation = descriptor("13-target-open-prepared.json");
  assert.equal(selectDesignPhaseDescriptor([prepared, navigation, secondNavigation], "prepared"), prepared);
  assert.equal(selectDesignPhaseDescriptor([navigation, secondNavigation], "prepared"), undefined);
  assert.equal(selectDesignPhaseDescriptor([descriptor("prepared.json"), descriptor("x-prepared.json")], "prepared"), undefined);
  const duplicate = descriptor("14-prepared.json");
  assert.throws(() => selectDesignPhaseDescriptor([prepared, navigation, duplicate], "prepared"), /ambiguous/u);
  assert.equal(selectDesignPhaseDescriptor([prepared, navigation, duplicate], "prepared", true), duplicate);
  assert.throws(() => selectDesignPhaseDescriptor([{ ...prepared, bytes: 0 }], "prepared"), /bound|ambiguous/u);
});
