import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { test } from "node:test";
import { setImmediate as waitImmediate } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { buildManagedFixtureImportPrograms, managedFixtureImportJobObservationSchema, validateManagedFixtureImportJobObservation } from "../src/managed-fixture-import-program.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";
import { buildManagedFixtureEnvironmentProgram, managedFixtureEnvironmentObservationSchema, managedFixtureEnvironmentRefusalSchema } from "../src/managed-fixture-environment-program.ts";

// Golden SHA-256 of the literal Windows path C:\PrivateFixtures\original\Fixture.eprj2.
const UUID = "bbd7e0ad75800669f5a66d2b188d835a3eafef02da50da748f58dd6cac5bda3d", plan = { operationId: "fixture-import-synthetic", nonce: "2".repeat(64),
  archiveName: "Fixture.epro2", destinationWindowsDirectory: "C:\\PrivateFixtures\\original", libraryWindowsDirectories: [String.raw`C:\SyntheticLibraries`] };
const PROJECT = { itemType: "Project", uuid: UUID, friendlyName: "Fixture", folderUuid: undefined, teamUuid: "synthetic-owner" };
const archive = managedProjectFootprintArchive([{ name: "project2.json", content: '{"title":"Fixture"}' },
  { name: "Fixture.epru", content: '{"type":"DOCHEAD"}||{"uuid":"1234567890abcdef","docType":"PCB"}|\n{"type":"META","id":"META"}||{"title":"Fixture"}|\n' }]);
const programs = buildManagedFixtureImportPrograms(plan, archive);
function fetchConfig(responseUrl = "https://client/api/client/config"): Promise<Response> {
    const response = Response.json({ success: true, result: { systemLib: plan.libraryWindowsDirectories, reuseBlock: plan.libraryWindowsDirectories, platform: "win32" } });
    Object.defineProperty(response, "url", { value: responseUrl }); return Promise.resolve(response);
}
function fixture(options: Readonly<{ throwSynchronously?: boolean; wrongReturn?: boolean; extraTab?: boolean; iframe?: boolean; responseUrl?: string; browserGlobals?: "lazy" | "inherited-fetch"; applicationAccessor?: boolean }> = {}): Readonly<{
  run: (program: string) => Promise<unknown>; calls: () => number; args: () => readonly unknown[];
  resolve: (value: unknown) => void; reject: (error: Error) => void; changeOwner: () => void; browserReads: () => number; configCalls: () => number;
}> {
  let count = 0; let captured: readonly unknown[] = []; let browserReads = 0, configCalls = 0;
  const pending = Promise.withResolvers<unknown>();
  const manager = { importProjectByProjectFile(...args: readonly unknown[]): unknown {
    count += 1; captured = args;
    if (options.throwSynchronously === true) { throw new Error("Synthetic partial failure"); }
    return options.wrongReturn === true ? { incomplete: true } : pending.promise;
  } };
  const location = { href: "https://client/editor?cll=debug", origin: "https://client" };
  const host = { currentProject: null as unknown };
  const root: Record<string, unknown> = { atob, crypto: webcrypto, File, Promise, Response, fetch: (url: unknown, input: unknown) => {
    configCalls += 1; assert.equal(url, "/api/client/config"); assert.equal(JSON.stringify(input), '{"method":"GET"}'); return fetchConfig(options.responseUrl);
  }, location, gVars: host,
    UI: { gVars: host }, PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    eda: { extensionUuid: "7e06d286b1ac846ef7eab9c7f2a9ee40", sys_FileManager: manager } };
  const lazyGlobal = (key: string): PropertyDescriptor => { const value = root[key];
    return { configurable: true, enumerable: true, get: (): unknown => {
      browserReads += 1; Object.defineProperty(root, key, { value, writable: true, configurable: true, enumerable: true }); return value;
    } };
  };
  if (options.browserGlobals === "lazy") {
    for (const key of ["fetch", "Response", "File", "atob"]) { Object.defineProperty(root, key, lazyGlobal(key)); }
  } else if (options.browserGlobals === "inherited-fetch") {
    const value = root["fetch"]; Reflect.deleteProperty(root, "fetch");
    Object.setPrototypeOf(root, { fetch: value });
  }
  const context = createContext(root);
  runInContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(selector){if(selector!=='iframe')throw new Error('selector');return {length:${options.iframe === true ? 1 : 0}};}};
gVars.currentProject={branchUuid:''};gVars.isHistoryMode=false;
globalThis.start={tabId:'tab_page1',isAbleDelete:false,group:'start_blank',draggable:true,data:{doctype:-1},isDisplayNone:false};
globalThis.container={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs { static getActiveTab(){return this.currentTabId;} static getContainerInfo(id){if(id!==container.id)throw new Error('container');return container;} }
Tabs.currentTabId='tab_page1';Tabs.belongContainer='editor-window-main';Tabs.containerIds=['editor-window-main'];Tabs.containerTree={id:'editor-window-main'};UI.tabBar=Tabs;
${options.extraTab === true ? "container.tabs.push({tabId:'unexpected-document'});" : ""}`, context);
  if (options.applicationAccessor === true) { Object.defineProperty(root, "UI", lazyGlobal("UI")); }
  return { run: async (program) => { const result: unknown = runInContext(`(async function(){${program}})()`, context); return await result; },
    calls: () => count, args: () => captured, resolve: (value) => {
      root["syntheticValue"] = value;
      const sameRealm: unknown = runInContext("typeof syntheticValue==='object' && syntheticValue!==null ? JSON.parse(JSON.stringify(syntheticValue)) : syntheticValue", context);
      pending.resolve(sameRealm);
    }, reject: pending.reject,
    changeOwner: () => { host.currentProject = { projectId: "unexpected" }; }, browserReads: () => browserReads, configCalls: () => configCalls };
}
function observation(value: unknown): ReturnType<typeof managedFixtureImportJobObservationSchema.parse> {
  return managedFixtureImportJobObservationSchema.parse(value);
}

void test("environment refusals retain the exact failed stage without importer dispatch or config values", async () => {
  const shell = fixture({ extraTab: true });
  const beforeFetch = managedFixtureEnvironmentRefusalSchema.parse(await shell.run(buildManagedFixtureEnvironmentProgram()));
  assert.equal(beforeFetch.stage, "empty-start-page"); assert.equal(beforeFetch.configGetAttempted, false);
  assert.equal(beforeFetch.reason, "empty-start-page-refused"); assert.equal(shell.calls(), 0);
  const metadata = fixture({ responseUrl: "" });
  const afterFetch = managedFixtureEnvironmentRefusalSchema.parse(await metadata.run(buildManagedFixtureEnvironmentProgram()));
  assert.equal(afterFetch.stage, "response-metadata"); assert.equal(afterFetch.configGetAttempted, true);
  assert.equal(afterFetch.responseReceived, true); assert.equal(afterFetch.responseTextAttempted, false);
  assert.equal(afterFetch.responseStatus, 200); assert.equal(afterFetch.responseUrl, "empty");
  assert.equal(metadata.calls(), 0); assert.equal(afterFetch.effectsUnknown, true); assert.equal(afterFetch.retryAllowed, false);
  for (const change of [{ configGetAttempted: false }, { responseReceived: false }, { stage: "owner-before-fetch" }, { stage: "response-text" }]) {
    assert.equal(managedFixtureEnvironmentRefusalSchema.safeParse({ ...afterFetch, ...change }).success, false);
  }
});

void test("fixed preflight reads platform globals after the empty guard, including lazy and inherited bindings", async () => {
  const alteredApplication = fixture({ browserGlobals: "lazy", applicationAccessor: true });
  const applicationRefusal = managedFixtureEnvironmentRefusalSchema.parse(await alteredApplication.run(buildManagedFixtureEnvironmentProgram()));
  assert.equal(applicationRefusal.stage, "capture-context");
  assert.equal(applicationRefusal.schema, "easyeda-pro-control.fixture-import-environment-refusal.v2");
  assert.ok("captureMember" in applicationRefusal); assert.equal(applicationRefusal.captureMember, "UI");
  assert.equal(alteredApplication.browserReads(), 0); assert.equal(alteredApplication.configCalls(), 0);
  const unready = fixture({ browserGlobals: "lazy", extraTab: true });
  const refused = managedFixtureEnvironmentRefusalSchema.parse(await unready.run(buildManagedFixtureEnvironmentProgram()));
  assert.equal(refused.stage, "empty-start-page"); assert.equal(unready.browserReads(), 0); assert.equal(unready.configCalls(), 0);
  for (const browserGlobals of ["lazy", "inherited-fetch"] as const) {
    const native = fixture({ browserGlobals });
    if (browserGlobals === "inherited-fetch") { assert.equal(await native.run("return Object.hasOwn(globalThis,'fetch');"), false); }
    const result = managedFixtureEnvironmentObservationSchema.parse(await native.run(buildManagedFixtureEnvironmentProgram()));
    assert.equal(result.mode, "HALF_OFFLINE"); assert.equal(native.configCalls(), 1); assert.equal(native.calls(), 0);
    if (browserGlobals === "lazy") { assert.equal(native.browserReads(), 2); }
  }
});

void test("tracked import captures lazy standard globals only after the empty editor guard", async () => {
  const unready = fixture({ browserGlobals: "lazy", extraTab: true });
  await assert.rejects(unready.run(programs.launchAndWait), /EDITOR_SHELL_READ_FAILED/u);
  assert.equal(unready.browserReads(), 0); assert.equal(unready.calls(), 0); assert.equal(unready.configCalls(), 0);
  const native = fixture({ browserGlobals: "lazy" });
  const pending = observation(await native.run(programs.launch));
  assert.equal(pending.sdkOutcome, "pending"); assert.equal(native.calls(), 1); assert.equal(native.browserReads(), 4);
  native.resolve(PROJECT); await Promise.resolve();
  assert.equal(observation(await native.run(programs.observe)).sdkOutcome, "fulfilled-project");
  assert.equal(native.calls(), 1); assert.equal(native.browserReads(), 4);
});

void test("synthetic original import Promise remains pending across repeated observations and is never redispatched", async () => {
  const native = fixture(); const first = observation(await native.run(programs.launch));
  assert.equal(first.state, "pending"); assert.equal(first.originalPromiseRetained, true);
  for (let index = 0; index < 3; index += 1) { assert.equal(observation(await native.run(programs.observe)).sdkOutcome, "pending"); }
  assert.equal(native.calls(), 1);
  const args = native.args(); assert.equal(args[1], "EasyEDA Pro");
  assert.deepEqual(structuredClone(args[3]), { operation: "Offline Client Local Path", folderPath: plan.destinationWindowsDirectory });
  const file = args[0]; assert.ok(file instanceof File);
  assert.equal(Object.hasOwn(file, "path"), false);
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), archive);
  native.resolve(PROJECT);
  await Promise.resolve();
  const settled = observation(await native.run(programs.observe));
  assert.equal(settled.state, "sdk-settled"); assert.equal(settled.returnedUuid, UUID);
  assert.equal(settled.expectedProjectUuid, UUID); assert.equal(settled.expectedIdentityMatched, true);
  for (const key of ["delayedNativeJobsCompleted", "registrationVerified", "closedSqlVerified", "originalClosureVerified", "retryAllowed", "executionAuthorized"] as const) {
    assert.equal(settled[key], false);
  }
  await assert.rejects(native.run(programs.launch), /REFUSED/u);
  assert.equal(native.calls(), 1);
});

void test("synthetic rejection and missing or unexpected native returns preserve possible partial effects and forbid retry", async () => {
  for (const outcome of ["rejected", "fulfilled-undefined", "fulfilled-other", "synchronous-throw"] as const) {
    const native = fixture({ throwSynchronously: outcome === "synchronous-throw", wrongReturn: outcome === "fulfilled-other" });
    await native.run(programs.launch);
    if (outcome === "rejected") { native.reject(new Error("Synthetic delayed native failure")); }
    else if (outcome === "fulfilled-undefined") { native.resolve(void 0); }
    await Promise.resolve();
    const result = observation(await native.run(programs.observe));
    assert.equal(result.sdkOutcome, outcome);
    assert.equal(result.originalPromiseRetained, outcome !== "synchronous-throw" && outcome !== "fulfilled-other");
    assert.equal(result.nativeEffectsMayHaveOccurred, true); assert.equal(result.retryAllowed, false);
    await assert.rejects(native.run(programs.launch)); assert.equal(native.calls(), 1);
  }
});

void test("tracked launch remains outstanding through the original Promise and reports settlement without replay", async () => {
  for (const rejected of [false, true]) {
    const native = fixture(); let transportReturned = false;
    const tracked = (async (): Promise<ReturnType<typeof observation>> => { const value = await native.run(programs.launchAndWait); transportReturned = true; return observation(value); })();
    // Digest is asynchronous; wait for the original import dispatch, then
    // Independently observe its retained pending state through the fixed slot.
    for (let index = 0; native.calls() === 0 && index < 100; index += 1) { await waitImmediate(); }
    assert.equal(native.calls(), 1); assert.equal(transportReturned, false);
    assert.equal(observation(await native.run(programs.observe)).state, "pending");
    if (rejected) { native.reject(new Error("Synthetic original job rejection")); } else { native.resolve(PROJECT); }
    const result = await tracked;
    assert.equal(result.sdkOutcome, rejected ? "rejected" : "fulfilled-project");
    assert.equal(result.originalPromiseRetained, true); assert.equal(native.calls(), 1);
    await assert.rejects(native.run(programs.launchAndWait), /REFUSED/u);
  }
  const unexpected = fixture({ wrongReturn: true });
  const result = observation(await unexpected.run(programs.launchAndWait));
  assert.equal(result.sdkOutcome, "fulfilled-other"); assert.equal(result.originalPromiseRetained, false);
});

void test("synthetic owner drift retains the original acknowledgment while blocking any completion claim", async () => {
  const native = fixture(); await native.run(programs.launch); native.changeOwner(); native.resolve(PROJECT);
  await Promise.resolve();
  const result = observation(await native.run(programs.observe));
  assert.equal(result.ownerIntact, false); assert.equal(result.returnedUuid, UUID); assert.equal(result.executionAuthorized, false);
  const unopened = fixture(); await assert.rejects(unopened.run(programs.observe), /ORIGINAL_JOB_MISSING/u);
  unopened.changeOwner(); await assert.rejects(unopened.run(programs.launch)); assert.equal(unopened.calls(), 0);
});

void test("internal program grammar rejects path substitution and contradictory serialized job evidence", () => {
  for (const destinationWindowsDirectory of [String.raw`C:\..\escape`, String.raw`C:\unsafe.\dir`, String.raw`\\server\share`, "C:\\a\\", "/mnt/c/fixture", String.raw`C:\CON\target`, String.raw`C:\space \target`]) {
    assert.throws(() => buildManagedFixtureImportPrograms({ ...plan, destinationWindowsDirectory }, archive));
  }
  assert.throws(() => managedFixtureImportJobObservationSchema.parse({ schema: "easyeda-pro-control.managed-fixture-import-job-observation.v1" }));
});

void test("import requires the original exact empty StartPage before its only dispatch", async () => {
  for (const options of [{ extraTab: true }, { iframe: true }]) {
    const native = fixture(options);
    await assert.rejects(native.run(programs.launchAndWait), /EDITOR_SHELL_READ_FAILED/u);
    assert.equal(native.calls(), 0);
  }
});

void test("serialized observations cannot substitute another archive or operation", async () => {
  const native = fixture(); const first = await native.run(programs.launch);
  assert.equal(validateManagedFixtureImportJobObservation(first, plan, archive).state, "pending");
  assert.throws(() => validateManagedFixtureImportJobObservation(first, { ...plan, nonce: "3".repeat(64) }, archive));
  assert.throws(() => managedFixtureImportJobObservationSchema.parse({ ...observation(first), state: "sdk-settled" }));
});

void test("an unexpected cloud or local project identity remains visible without becoming registration evidence", async () => {
  const native = fixture(); await native.run(programs.launch);
  native.resolve({ ...PROJECT, uuid: "a".repeat(32) }); await Promise.resolve();
  const result = observation(await native.run(programs.observe));
  assert.equal(result.sdkOutcome, "fulfilled-project"); assert.equal(result.returnedUuid, "a".repeat(32));
  assert.equal(result.expectedIdentityMatched, false); assert.equal(result.registrationVerified, false);
  assert.equal(validateManagedFixtureImportJobObservation(result, plan, archive).expectedIdentityMatched, false);
  assert.throws(() => validateManagedFixtureImportJobObservation({ ...result, expectedIdentityMatched: true }, plan, archive));
});
