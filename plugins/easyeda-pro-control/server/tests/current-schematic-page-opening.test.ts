import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCurrentSchematicPageOpeningProgram } from "../src/current-schematic-page-opening-program.ts";
import { currentSchematicPageOpeningRequestSchema, queryCurrentSchematicPageOpening, validateCurrentSchematicPageOpeningArguments } from "../src/current-schematic-page-opening.ts";
import { currentSchematicPageOpeningFixture, schematicOpeningTarget } from "./helpers/current-schematic-page-opening-fixture.ts";

void test("ordinary schematic page opens only its exact original empty project through the captured public receiver", async () => {
  const value = currentSchematicPageOpeningFixture();
  const before = await value.run("preflight");
  assert.equal(before.opened, false); assert.equal(value.evaluate("documentCalls"), 0);
  const result = await value.run("open", before.windowTabId);
  assert.equal(result.opened, true); assert.equal(result.nativeWorkMayRemain, true);
  assert.equal(result.startupCompletionVerified, false); assert.equal(result.explicitSaveDispatched, false);
  assert.equal(value.evaluate("documentCalls"), 1);
  await assert.rejects(value.run("open", before.windowTabId));
  assert.equal(value.evaluate("documentCalls"), 1);
});

void test("ordinary schematic opener rejects wrong project, branch, registry, split/tab and physical window before navigation", async () => {
  for (const before of ['gVars.currentProject.projectId="f".repeat(64);', 'gVars.currentProject.branchUuid="f".repeat(32);',
    String.raw`registration[target.projectUuid].path="C:\\Other.eprj2";`, 'info.tabs.push({tabId:"peer",data:{doctype:3,pid:target.projectUuid}});',
    'Tabs.containerIds.push("other");', 'frames.push({});', '_TAB_ID_="replacement-window";']) {
    const value = currentSchematicPageOpeningFixture({ before });
    await assert.rejects(value.run("open", "original-window")); assert.equal(value.evaluate("documentCalls"), 0);
  }
  assert.throws(() => buildCurrentSchematicPageOpeningProgram(schematicOpeningTarget, "open"));
});

void test("ordinary schematic opener rechecks native receivers around both registry and public-open awaits", async () => {
  const before = currentSchematicPageOpeningFixture({ afterRegistry: 'gVars.currentProject={...gVars.currentProject};' });
  await assert.rejects(before.run("open", "original-window")); assert.equal(before.evaluate("documentCalls"), 0);
  for (const openBody of ['opened();gVars.currentProject={...gVars.currentProject};return tabId;',
    'opened();_TAB_ID_="replacement";return tabId;', 'opened();info.tabs[1].data.doctype=2;return tabId;',
    'opened();return false;']) {
    const value = currentSchematicPageOpeningFixture({ openBody });
    await assert.rejects(value.run("open", "original-window")); assert.equal(value.evaluate("documentCalls"), 1);
  }
});

void test("ordinary schematic open has no timer race that could mislabel continuing native navigation as settled", async () => {
  const value = currentSchematicPageOpeningFixture({ openBody: 'await new Promise(resolve=>globalThis.finishOpen=resolve);opened();return tabId;' });
  let settled = false;
  const work = (async (): Promise<Awaited<ReturnType<typeof value.run>>> => { const result = await value.run("open", "original-window"); settled = true; return result; })();
  for (let i = 0; i < 12; i += 1) { await Promise.resolve(); }
  assert.equal(value.evaluate("documentCalls"), 1); assert.equal(settled, false);
  value.evaluate("finishOpen()"); const result = await work;
  assert.equal(result.opened, true); assert.equal(value.evaluate("documentCalls"), 1);
});

void test("ordinary schematic opening schemas retain exact checkpoint/effect authority and no replay controls", () => {
  const request = { action: "open", operationId: "sch209-open-fixture", target: schematicOpeningTarget,
    confirmOrdinaryProject: true, acceptNormalOpenEffects: true };
  assert.deepEqual(currentSchematicPageOpeningRequestSchema.parse(request), request);
  for (const extra of [{ code: "caller" }, { acceptNormalOpenEffects: false }, { confirmDisposableProject: true }, { retry: true }, { save: true }]) {
    assert.equal(validateCurrentSchematicPageOpeningArguments({ ...request, ...extra })["valid"], false);
  }
  const query = queryCurrentSchematicPageOpening({ includeSchemas: true });
  assert.equal(query["ordinaryProjectsSupported"], true); assert.equal(query["connectedValidation"], false);
  assert.match(JSON.stringify(query["limitations"]), /automatically persist or Save/u);
});
