/* oxlint-disable max-classes-per-file -- The registration constructs two distinct production owners; both constructors need independent inert doubles. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { ordinaryLaunchRequestSchema } from "../src/ordinary-launch.ts";

void test("ordinary launcher registration keeps quarantine and exact shared runtime allocation", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_open",', start);
  assert.ok(start > 0 && end > start);
  interface Options { assertAllowed: () => Promise<void>; allocateRuntime: (identity: object) => unknown }
  let options: Options | undefined;
  let invoke: ((input: { request: unknown }) => Promise<unknown>) | undefined;
  let checks = 0, quarantine = false;
  const requests: unknown[] = [], runtimeOptions: unknown[] = [];
  class Coordinator {
    private readonly input: Options;
    public constructor(input: Options) { this.input = input; options = input; }
    public async run(request: unknown): Promise<object> {
      await this.input.assertAllowed(); requests.push(request); return { inspected: true };
    }
  }
  // oxlint-disable-next-line typescript/no-extraneous-class -- The real callback uses new; this constructor double records identity without acquiring a native resource.
  class Runtime { public constructor(input: unknown) { runtimeOptions.push(input); } }
  const environment = { EASYEDA_ASSETS_ROOT: "/mnt/d/Apps/EasyEDA/resources/app/assets" };
  const scope = vm.createContext({ z, ordinaryLaunchRequestSchema, OrdinaryLaunchCoordinator: Coordinator, WindowsControlRuntime: Runtime,
    process: { env: environment }, resolve: (): string => "/synthetic/plugin", upstream: {},
    ordinaryLaunchCoordinator: undefined, ordinaryLaunchRuntime: undefined, windowsRuntime: undefined,
    closedSymbolIndexReservation: undefined, scheduledShutdown: undefined,
    assertOrdinaryRuntimeAllocationAllowed: (): void => { checks += 1; },
    engine: { assertBridgeDispatchAllowed: (): Promise<void> => quarantine ? Promise.reject(new Error("quarantine")) : Promise.resolve() },
    serializedGuarded: (handler: typeof invoke, guardOptions?: unknown): typeof invoke => { assert.equal(guardOptions, undefined); return handler; },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType } }, handler: typeof invoke): void => {
      assert.equal(name, "easyeda_control_launch");
      assert.equal(config.inputSchema.request.safeParse({ action: "launch", operationId: "fixture", confirmLaunch: true,
        acceptExistingProfileEffects: true, args: [] }).success, false);
      invoke = handler;
    },
  });
  // Actual registration body with synthetic owners only; never starts a facade,
  // Helper, bridge or app and never accesses real control data.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  quarantine = true;
  await assert.rejects(invoke({ request: { action: "inspect", operationId: "fixture" } }), /quarantine/u);
  assert.equal(requests.length, 0); assert.equal(runtimeOptions.length, 0);
  quarantine = false;
  await invoke({ request: { action: "inspect", operationId: "fixture" } });
  assert.ok(options);
  const identity = { expectedExecutableSha256: "a".repeat(64), reviewedExecutionScopeSha256: "b".repeat(64) };
  const runtime = options.allocateRuntime(identity);
  assert.equal(checks, 1);
  assert.equal(scope["windowsRuntime"], runtime); assert.equal(scope["ordinaryLaunchRuntime"], runtime);
  const allocated = runtimeOptions[0];
  assert.ok(allocated !== null && typeof allocated === "object" && "expectedExecutableSha256" in allocated);
  assert.equal(allocated["expectedExecutableSha256"], identity.expectedExecutableSha256);
  await options.assertAllowed();
  assert.throws(() => options?.allocateRuntime(identity), /already allocated/u);
  scope["windowsRuntime"] = {};
  await assert.rejects(options.assertAllowed(), /unavailable or changed/u);
  scope["windowsRuntime"] = runtime; scope["scheduledShutdown"] = Promise.resolve();
  await assert.rejects(options.assertAllowed(), /unavailable or changed/u);
});
