/* oxlint-disable max-classes-per-file -- This registration fixture substitutes the two constructor roles while exercising the actual upstream authentication scope. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { managedFixtureImportRequestSchema } from "../src/managed-fixture-import-runtime.ts";
import { inMemoryAuthenticatedUpstream } from "./helpers/in-memory-authenticated-upstream.ts";

void test("actual fixture registration retains one original index owner, authenticates import only and keeps cleanup unscoped", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_fixture_import",'); const end = source.indexOf("const transport =", start);
  assert.ok(start > 0 && end > start);
  const authenticated = inMemoryAuthenticatedUpstream({ content: [] });
  const runtime = { status: (): unknown => ({ state: "owned" }) };
  let allocations = 0, cleanups = 0;
  const sourceToken = Object.freeze({ projectUuid: "1".repeat(64), originalSourceSha256: "2".repeat(64) });
  type Invoke = (input: { request: unknown; expectedFingerprint?: Record<string, unknown> }) => Promise<unknown>;
  let invoke: Invoke | undefined;
  class Owner {
    readonly #assertOriginal: () => void;
    #released = false;
    public constructor(options: { assertOriginalOwner: () => void }) {
      options.assertOriginalOwner(); this.#assertOriginal = options.assertOriginalOwner; allocations += 1;
    }
    public inspect(): Record<string, unknown> { this.#assertOriginal(); return { originalOwnerRetained: true }; }
    public stageSourceForFreshOpening(id: string): typeof sourceToken {
      this.#assertOriginal(); assert.equal(this.#released, true); assert.equal(id, "fixture-import-registration"); return sourceToken;
    }
    public async execute(input: unknown): Promise<Record<string, unknown>> {
      this.#assertOriginal(); const request = managedFixtureImportRequestSchema.parse(input);
      if (request.action === "import-generated-fixture") {
        await authenticated.upstream.callTool("easyeda_execute", { code: "synthetic-fixed-import" }, 1000);
      } else {
        await assert.rejects(authenticated.upstream.callTool("easyeda_execute", {}, 1000), /requires a dispatch scope or its exact binding/u);
        cleanups += 1;
        if (request.action === "release-owner") { this.#released = true; }
      }
      this.#assertOriginal(); return { synthetic: true };
    }
  }
  const context = vm.createContext({ stagedComponentOpeningSource: undefined, z, resolve, process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets" } },
    privateFingerprintSchema: z.record(z.string(), z.unknown()), managedFixtureImportRequestSchema,
    // oxlint-disable-next-line typescript/no-extraneous-class -- The real registration constructs this separate cleanup role; this test checks only its owner's allocation and scope.
    ManagedFixtureImportCoordinator: Owner, OrdinaryTrackedOpenCleanup: class {},
    upstream: authenticated.upstream, engine: {}, ordinaryLaunchRuntime: runtime, windowsRuntime: runtime,
    fixtureImportCoordinator: undefined, stagedFixtureOpeningSource: undefined, stagedSchematicOpeningSource: undefined,
    hasGeneratedSchematicCustody: (): boolean => false, currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined,
    currentSchematicRenameOperationCoordinator: undefined, closedSymbolIndexReservation: undefined, scheduledShutdown: undefined,
    hasForwardSourceCustody: (): boolean => false,
    serializedGuarded: (handler: Invoke, options: { allowDuringOrphanRisk: boolean }): Invoke => {
      assert.equal(options.allowDuringOrphanRisk, true); return handler;
    },
    registerFacadeTool: (name: string, config: { annotations: { destructiveHint: boolean; idempotentHint: boolean } }, handler: Invoke): void => {
      assert.equal(name, "easyeda_control_fixture_import"); assert.equal(config.annotations.destructiveHint, true);
      assert.equal(config.annotations.idempotentHint, false); invoke = handler;
    } });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), context);
  assert.ok(invoke);
  await invoke({ request: { action: "inspect", operationId: "fixture-import-registration" } }); assert.equal(allocations, 0);
  await invoke({ request: { action: "import-generated-fixture", operationId: "fixture-import-registration", fixtureKind: "via-only",
    confirmDisposableFixture: true, confirmNativeImport: true, acceptPartialImportRetention: true }, expectedFingerprint: {} });
  assert.equal(allocations, 1); assert.equal(authenticated.calls(), 1);
  await invoke({ request: { action: "release-owner", operationId: "fixture-import-registration", confirmReleaseFixtureOwner: true } });
  assert.equal(cleanups, 1); assert.equal(authenticated.calls(), 1);
  await invoke({ request: { action: "stage-for-fresh-opening", operationId: "fixture-import-registration", confirmStageClosedFixture: true } });
  assert.equal(context["stagedFixtureOpeningSource"], sourceToken); assert.equal(authenticated.calls(), 1); assert.equal(cleanups, 1);
  await assert.rejects(invoke({ request: { action: "stage-for-fresh-opening", operationId: "fixture-import-registration", confirmStageClosedFixture: true } }), /once before its ordinary runtime release/u);
  context["ordinaryLaunchRuntime"] = { ...runtime };
  await assert.rejects(invoke({ request: { action: "release-owner", operationId: "fixture-import-registration", confirmReleaseFixtureOwner: true } }), /original index\/runtime allocation changed/u);
  assert.equal(cleanups, 1); assert.equal(allocations, 1);
});
