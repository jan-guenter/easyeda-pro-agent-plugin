/* oxlint-disable eslint/max-classes-per-file -- These two explicit inert receivers exercise the actual source method-identity and competing-custody guards together. */
/** Actual index guards and registration, with explicit inert coordinator/data
 * dependencies. This test supplies no native factory or completion authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteActionSchema } from "../src/current-schematic-relevance-display-write-contract.ts";

async function fixture(wrongFamily = false): Promise<Readonly<{ call: (request: unknown) => Promise<unknown>; counters: { stages: number; constructs: number; runs: number }; blockVia: () => void }>> {
  const counters = { stages: 0, constructs: 0, runs: 0 }, token = Object.freeze({ syntheticDataOnly: true }); let via = false;
  class Coordinator {
    #active = false;
    public constructor(_options: unknown, source: unknown) { assert.equal(source, token); counters.constructs += 1; Object.freeze(this); }
    public run(request: unknown): Promise<object> { currentSchematicRelevanceDisplayWriteActionSchema.parse(request); counters.runs += 1; this.#active = true; return Promise.resolve({ originalInertCoordinator: true }); }
    public inspect(): object { return { synthetic: true, active: this.#active }; }
    public diagnostic(): object { return { synthetic: true, active: this.#active }; }
    public hasActiveReservation(): boolean { return this.#active; }
    public shutdownOriginal(): Promise<void> { this.#active = false; return Promise.resolve(); }
  }
  class Data {
    readonly #pending = false;
    #unexpected(): never { throw new Error(`WRONG_STAGE:${String(this.#pending)}`); }
    public execute(): never { return this.#unexpected(); }
    public inspect(): object { return { pending: this.#pending }; }
    public hasPendingWork(): boolean { return this.#pending; }
    public hasActiveReservation(): boolean { return this.#pending; }
    public stageSourceForFreshOpening(): never { return this.#unexpected(); }
    public stageViaSourceForFreshOpening(): never { return this.#unexpected(); }
    public stageSchematicSourceForFreshOpening(): never { return this.#unexpected(); }
    public stageSchematicRelevanceDisplaySourceForFreshOpening(): object { assert.equal(this.#pending, false); counters.stages += 1; if (wrongFamily) { throw new Error("RELEVANCE_SCHEMATIC_DATA_REQUIRED"); } return token; }
  }
  const capture: { handler?: (input: { request: unknown }) => Promise<unknown> } = {};
  const scope = createContext({ z, CurrentSchematicRelevanceDisplayWriteCoordinator: Coordinator, ClosedGeneratedFixtureDataCoordinator: Data,
    CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteActionSchema, facadeToolRegistered, facadeMode: "public-utilities-only",
    registerFacadeTool: (name: string, _configuration: unknown, handler: (input: { request: unknown }) => Promise<unknown>): void => { assert.equal(name, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL); capture.handler = handler; },
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets" } }, resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: "/synthetic/control" },
    engine: { assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() }, assertNoUnresolvedOrdinaryLaunches: (): Promise<void> => Promise.resolve(),
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: "1".repeat(64), bytes: 1 } }, closedGeneratedDataCoordinator: new Data(),
    bridgeGate: new SerializedGate(), hasClosedGeneratedDataCustody: (): boolean => false, hasViaWriteCustody: (): boolean => via,
    success: (value: unknown): unknown => value, failure: (error: unknown): object => ({ refused: String(error) }),
  });
  for (const name of ["currentSchematicRelevanceDisplayWriteCoordinator", "currentPcbViaWriteCoordinator", "scheduledShutdown", "windowsRuntime", "ordinaryLaunchRuntime", "ordinaryLaunchCoordinator", "fixtureImportCoordinator", "stagedFixtureOpeningSource", "stagedSchematicOpeningSource", "stagedComponentOpeningSource", "generatedSchematicOpening", "generatedSchematicAllocation", "closedSymbolIndexReservation", "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator", "currentSchematicRenameOperationCoordinator", "currentPcbDiagnosticLifecycle", "currentPcbStringPrecreateLifecycle", "currentFootprintMainLifecycle", "currentFootprintHeldCacheValidation", "currentFootprintHeadAgeValidation", "currentFootprintForwardSourceValidation", "currentPcbWorkerStartupLifecycle", "closedGeneratedDataAllocation"]) { Reflect.set(scope, name, undefined); }
  Reflect.set(scope, "closedSymbolUnreservedFailure", { observed: false });
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8")); const body = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body;
  const functions = ["disposableOwnData", "disposableOwnerMethod", "assertClosedGeneratedDataMethods", "assertSchematicDisplayWriteMethods", "assertSchematicDisplayDataStage", "hasSchematicDisplayWriteCustody", "runFacadeGate", "guarded", "assertFreshClosedGeneratedDataEnvironment"];
  const constants = ["closedGeneratedDataMethods", "schematicDisplayWriteMethods", "schematicDisplayDataStage"];
  for (const name of [...constants, ...functions]) {
    const rows = body.filter(row => row.type === "FunctionDeclaration" && row.id?.name === name || row.type === "VariableDeclaration" && row.declarations.some(value => value.id.type === "Identifier" && value.id.name === name)); assert.equal(rows.length, 1);
    const row = rows[0]; assert.ok(row !== undefined); runInContext(source.slice(row.start, row.end), scope);
  }
  const rows = body.filter(row => row.type === "IfStatement" && source.slice(row.test.start, row.test.end).includes("CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL")); assert.equal(rows.length, 1);
  const row = rows[0]; assert.ok(row !== undefined); runInContext(source.slice(row.start, row.end).replaceAll("import.meta.dirname", "'/synthetic/module'"), scope); assert.ok(capture.handler !== undefined);
  const handler = capture.handler; return Object.freeze({ counters, blockVia: (): void => { via = true; }, call: (request: unknown): Promise<unknown> => handler({ request }) });
}
const prepare = Object.freeze({ action: "prepare", fixtureOperationId: "synthetic-fixture-original", operationId: "sch209-relevance-display-registration", patch: { x: 25 } });
void test("actual own7 registration uses only its distinct stage and permits its own retained custody", async () => {
  const f = await fixture(); const value: unknown = await f.call(prepare); assert.ok(value !== null && typeof value === "object" && "result" in value);
  await f.call({ action: "inspect", operationId: prepare.operationId }); assert.deepEqual(f.counters, { stages: 1, constructs: 1, runs: 2 });
});
void test("other-family source and a competing Via owner refuse before a schematic coordinator is constructed", async () => {
  const wrong = await fixture(true); const result = await wrong.call(prepare); assert.match(JSON.stringify(result), /RELEVANCE_SCHEMATIC_DATA_REQUIRED/u); assert.equal(wrong.counters.constructs, 0);
  const competing = await fixture(); competing.blockVia(); assert.match(JSON.stringify(await competing.call(prepare)), /original disposable Via/u); assert.deepEqual(competing.counters, { stages: 0, constructs: 0, runs: 0 });
});
