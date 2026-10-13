/* oxlint-disable import/max-dependencies -- Execute the exact TypeScript-erased preparation function with delayed filesystem dependencies; no production injection seam is added. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import { normalizeEasyedaProjectPath } from "../src/core.ts";
import { nativeLibraryHeaderEvidence } from "../src/native-library-header-evidence.ts";
import { buildRecoveryNavigationCode, deriveRecoveryNavigationTarget } from "../src/recovery-navigation.ts";
import type { prepareRecoveryNavigation } from "../src/recovery-navigation.ts";
import { context, fixture } from "./flat-display-fixture.ts";

void test("navigation preparation captures context, checkpoint, options and assets before its first await", async () => {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/recovery-navigation.ts", import.meta.url), "utf8"));
  const module = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const declaration = module.body.find((node) => node.type === "ExportNamedDeclaration" && node.declaration?.type === "FunctionDeclaration" &&
    node.declaration.id?.name === "prepareRecoveryNavigation");
  assert.ok(declaration?.type === "ExportNamedDeclaration" && declaration.declaration?.type === "FunctionDeclaration");
  assert.equal(declaration.declaration.async, true);
  const body = source.slice(declaration.declaration.start, declaration.declaration.end);
  for (const preserve of [false, true]) {
    const value = fixture();
    const receipt = structuredClone(value.evidence.checkpoint);
    const input = { expectedContext: structuredClone(context), preCheckpoint: structuredClone(receipt), assetsRoot: "/original-assets",
      navigation: { navigate: false, requireExclusiveTabs: true, requireEditorReadiness: false },
      ...(preserve ? { libraryAtomHeaders: "preserve" as const } : {}) };
    const gate = Promise.withResolvers<boolean>();
    const requested: unknown[] = [];
    const implementation: unknown = runInNewContext(`(${body})`, { structuredClone, Error, dirname, join, normalizeEasyedaProjectPath,
      verifyLibraryNativeProfile: (assets: string): Promise<boolean> => { requested.push(assets); return gate.promise; },
      checkpointBindingSchema: { parse: (checkpoint: unknown): unknown => structuredClone(checkpoint) },
      verifyCheckpoint: (path: string): Promise<unknown> => { requested.push(path); return Promise.resolve({ ...receipt, checkpointMatchesReceipt: true }); },
      controlRootCapability: (): Promise<object> => Promise.resolve({}), controlDataDirectory: (): string => "/isolated-fixture",
      readNativeHistoryCheckpoint: (request: unknown): Promise<unknown> => { requested.push(request); return Promise.resolve(value.evidence.history); },
      nativeLibraryHeaderEvidence, deriveRecoveryNavigationTarget, buildRecoveryNavigationCode });
    assert.equal(typeof implementation, "function");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Acorn selected the exact maintained async function; only its read-only dependency globals are isolated.
    const prepare = implementation as typeof prepareRecoveryNavigation;
    const pending = prepare(input); assert.deepEqual(requested, ["/original-assets"]);
    input.expectedContext.document.documentType = 4; input.expectedContext.document.uuid = "foreign-footprint";
    input.expectedContext.project.path = "/different-project.eprj2"; input.preCheckpoint.checkpointSha256 = "f".repeat(64);
    input.preCheckpoint.receiptPath = "/different.receipt.json"; input.assetsRoot = "/different-assets";
    input.navigation.navigate = true; input.navigation.requireExclusiveTabs = false; input.navigation.requireEditorReadiness = true;
    Reflect.deleteProperty(input, "libraryAtomHeaders");
    gate.resolve(true); const result = await pending;
    assert.deepEqual(requested.slice(0, 2), ["/original-assets", receipt.receiptPath]);
    assert.equal(JSON.stringify(requested[2]), JSON.stringify({ checkpointPath: receipt.checkpoint, expectedSha256: receipt.checkpointSha256,
      projectUuid: context.project.uuid, ...(preserve ? { libraryAtomHeaders: "preserve" } : {}) }));
    const target = deriveRecoveryNavigationTarget(context, value.evidence.history); assert.deepEqual(result.target, target);
    const owner = value.evidence.history.projectOwnerUuid; assert.ok(owner !== undefined);
    assert.equal(result.code, buildRecoveryNavigationCode(target, { navigate: false, requireExclusiveTabs: true, requireEditorReadiness: false,
      checkpointProjectOwnerUuid: owner }));
    assert.equal(result.libraryHeaderEvidence !== undefined, preserve);
  }
});
