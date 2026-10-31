/** Synthetic successful CDP replies exercise the actual polling unit used by
 * the original read-only owner. They prove neither source nor live UI admission. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintHeldCachePageReadiness } from "../src/current-footprint-held-cache-page-readiness.ts";
import { sha256Text } from "../src/core.ts";

const version = Object.freeze({ protocolVersion: "1.3", product: "Chrome/test", revision: "synthetic", userAgent: "synthetic", jsVersion: "synthetic" });
const page = (url = "https://client/editor?cll=info", attached = false): Readonly<Record<string, unknown>> =>
  ({ targetId: "original-page", type: "page", url, attached, title: "private-title" });

/** Supply replies through one retained transport and count attempted calls,
 * including failures. No real timer, CDP connection or application is used. */
function fixture(replies: readonly Readonly<Record<string, unknown>>[], backendWindowsPath?: string): Readonly<{
  observer: CurrentFootprintHeldCachePageReadiness;
  counts: { version: number; targets: number; pauses: number; current: number; ownerLost: boolean };
  transport: { assertCurrent: () => void; version: () => Promise<Readonly<Record<string, unknown>>>;
    targets: () => Promise<Readonly<Record<string, unknown>>>; pause: () => Promise<void> };
}> {
  const observer = new CurrentFootprintHeldCachePageReadiness(backendWindowsPath);
  const counts = { version: 0, targets: 0, pauses: 0, current: 0, ownerLost: false };
  const transport = {
    assertCurrent: (): void => { counts.current += 1; if (counts.ownerLost) { throw new Error("synthetic original owner lost"); } },
    version: (): Promise<Readonly<Record<string, unknown>>> => { counts.version += 1; return Promise.resolve(version); },
    targets: (): Promise<Readonly<Record<string, unknown>>> => {
      const next = replies[counts.targets]; counts.targets += 1;
      return next === undefined ? Promise.reject(new Error("synthetic unexpected extra request")) : Promise.resolve(next);
    },
    pause: (): Promise<void> => { counts.pauses += 1; return Promise.resolve(); },
  };
  return { observer, counts, transport };
}

void test("bounded readiness waits through valid empty and about:blank inventories and preserves the exact selected target", async () => {
  const ready = page(), replies = [{ targetInfos: [] }, { targetInfos: [page("about:blank")] }, { targetInfos: [ready] }, { targetInfos: [ready] }];
  const value = fixture(replies);
  const result = await value.observer.observeBrowser(value.transport);
  assert.deepEqual(result.targets, [ready]); assert.equal(result.targetId, "original-page"); assert.deepEqual(result.version, version);
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 4, 3]);
  const observation = value.observer.observation();
  assert.deepEqual(observation.samples.map(sample => sample.classification), ["empty", "about-blank", "ready", "ready"]);
  assert.deepEqual(observation.samples.map(sample => sample.inventorySha256), replies.map(reply => sha256Text(JSON.stringify(reply.targetInfos))));
  assert.equal(observation.uiSourceQualified, false); assert.equal(observation.cacheQualificationGranted, false);
  const text = JSON.stringify(observation); assert.ok(!text.includes("private-title") && !text.includes("original-page") && !text.includes("https://"));
  await assert.rejects(value.observer.observeBrowser(value.transport), /CONSUMED/u);
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 4, 3]);
});

void test("the installation-bound loading page permits waiting and never becomes the selected editor", async () => {
  const backend = String.raw`C:\Program Files\synthetic-easyeda\resources\app\app.js`;
  const url = "file:///C:/Program%20Files/synthetic-easyeda/resources/app/assets/view/index.html?activated=synthetic&version=3.2.209";
  const editor = page(), loading = { ...page(url), targetId: "loading-page" };
  for (const pages of [[loading, editor], [editor, loading]]) {
    const value = fixture([{ targetInfos: [loading] }, { targetInfos: pages }, { targetInfos: [editor] }, { targetInfos: [editor] }], backend);
    const result = await value.observer.observeBrowser(value.transport);
    assert.equal(result.targetId, "original-page"); assert.deepEqual(result.targets, [editor]);
    assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 4, 3]);
    assert.deepEqual(value.observer.observation().samples.map(sample => sample.classification), ["startup-loading", "ready-with-loading", "ready", "ready"]);
    value.observer.stage("frames"); assert.doesNotThrow(() => value.observer.observation());
    assert.ok(!JSON.stringify(value.observer.observation()).includes("activated"));
  }
});

void test("actual-like loader and editor-title transitions finish before sealing the final exact inventory", async () => {
  const backend = String.raw`C:\Program Files\synthetic-easyeda\resources\app\app.js`;
  const loading = { ...page("file:///C:/Program%20Files/synthetic-easyeda/resources/app/assets/view/index.html?activated=synthetic"), targetId: "loading-page" };
  const final = { ...page(), title: "EasyEDA Pro" }, initializing = { ...page(), title: "Initializing" }, opening = { ...page(), title: "Starting editor" };
  const replies = [...Array.from({ length: 5 }, () => ({ targetInfos: [] })), { targetInfos: [loading, initializing] },
    { targetInfos: [opening] }, { targetInfos: [final] }, { targetInfos: [final] }];
  const value = fixture(replies, backend); const observed = await value.observer.observeBrowser(value.transport);
  assert.deepEqual(observed.targets, [final]); assert.equal(observed.targetId, "original-page");
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 9, 8]);
  const observation = value.observer.observation(); assert.equal(observation.schema, "private.current-footprint-held-cache-startup-observation.v2");
  assert.deepEqual(observation.samples.map(sample => sample.classification), ["empty", "empty", "empty", "empty", "empty", "ready-with-loading", "ready", "ready", "ready"]);
  assert.notEqual(observation.samples[6]?.inventorySha256, observation.samples[7]?.inventorySha256);
  assert.equal(observation.samples[7]?.inventorySha256, observation.samples[8]?.inventorySha256);
  value.observer.stage("frames"); assert.doesNotThrow(() => value.observer.observation());
  assert.equal(JSON.stringify(observed.targets[0]), JSON.stringify(final));
  assert.ok(!JSON.stringify(observation).includes("Initializing") && !JSON.stringify(observation).includes("EasyEDA Pro"));
});

void test("a returning loader or any complete-inventory field change resets the exclusive candidate", async () => {
  const backend = String.raw`C:\Program Files\synthetic-easyeda\resources\app\app.js`;
  const editor = page(), loading = { ...page("file:///C:/Program%20Files/synthetic-easyeda/resources/app/assets/view/index.html?activated=synthetic"), targetId: "loading-page" };
  const sequences = [
    [{ targetInfos: [editor] }, { targetInfos: [loading, editor] }, { targetInfos: [editor] }, { targetInfos: [editor] }],
    [{ targetInfos: [{ ...editor, futureField: { phase: 1 } }] }, { targetInfos: [{ ...editor, futureField: { phase: 2 } }] },
      { targetInfos: [{ ...editor, futureField: { phase: 2 } }] }],
    [{ targetInfos: [editor] }, { targetInfos: [Object.fromEntries(Object.entries(editor).toReversed())] },
      { targetInfos: [Object.fromEntries(Object.entries(editor).toReversed())] }],
    [{ targetInfos: [editor] }, { targetInfos: [page("about:blank")] }, { targetInfos: [editor] }, { targetInfos: [editor] }],
  ];
  for (const replies of sequences) {
    const value = fixture(replies, backend); const observed = await value.observer.observeBrowser(value.transport);
    assert.deepEqual(observed.targets, replies.at(-1)?.targetInfos);
    assert.equal(value.counts.targets, replies.length); assert.equal(value.counts.pauses, replies.length - 1);
  }
});

void test("unstable title, persistent loader and a lone final editor exhaust the same sixteen-sample bound", async () => {
  const backend = String.raw`C:\Program Files\synthetic-easyeda\resources\app\app.js`;
  const loading = { ...page("file:///C:/Program%20Files/synthetic-easyeda/resources/app/assets/view/index.html?activated=synthetic"), targetId: "loading-page" };
  const sequences = [Array.from({ length: 16 }, (_unused, index) => ({ targetInfos: [{ ...page(), title: `Starting ${index}` }] })),
    Array.from({ length: 16 }, () => ({ targetInfos: [loading, page()] })),
    [...Array.from({ length: 15 }, () => ({ targetInfos: [] })), { targetInfos: [page()] }]];
  for (const replies of sequences) {
    const value = fixture(replies, backend); await assert.rejects(value.observer.observeBrowser(value.transport), /TARGET_LIMIT/u);
    assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 16, 15]);
    const observation = value.observer.observation(); assert.equal(observation.failureKind, "target-limit"); assert.equal(observation.samples.length, 16);
    await assert.rejects(value.observer.observeBrowser(value.transport), /CONSUMED/u); assert.equal(value.counts.targets, 16);
  }
  const lastPair = fixture([...Array.from({ length: 14 }, () => ({ targetInfos: [] })), { targetInfos: [page()] }, { targetInfos: [page()] }]);
  await lastPair.observer.observeBrowser(lastPair.transport); assert.deepEqual([lastPair.counts.targets, lastPair.counts.pauses], [16, 15]);
});

void test("invalid discovery after one editor candidate remains terminal without waiting or reselection", async () => {
  for (const final of [{ targetInfos: [page("https://foreign.invalid")] }, { targetInfos: [page(undefined, true)] },
    { targetInfos: [page(), { ...page(), targetId: "extra-editor" }] }, { targetInfos: [{ ...page(), attached: "false" }] }]) {
    const value = fixture([{ targetInfos: [page()] }, final]); await assert.rejects(value.observer.observeBrowser(value.transport));
    assert.deepEqual([value.counts.targets, value.counts.pauses], [2, 1]);
    const failureKind = value.observer.observation().failureKind;
    assert.ok(failureKind === "inventory" || failureKind === "selection");
  }
});

void test("foreign loaders, path aliases, attached loaders and extra editor pages cannot gain readiness", async () => {
  const backend = String.raw`C:\Program Files\synthetic-easyeda\resources\app\app.js`;
  const url = "file:///C:/Program%20Files/synthetic-easyeda/resources/app/assets/view/index.html?activated=synthetic";
  const loading = { ...page(url), targetId: "loading-page" };
  const variants = [[{ ...loading, url: url.replace("synthetic-easyeda", "foreign") }], [{ ...loading, url: url.replace("index.html", "%69ndex.html") }],
    [{ ...loading, url: `${url}#fragment` }], [{ ...loading, attached: true }, page()],
    [loading, page(), { ...page(), targetId: "extra-editor" }], [loading, { ...loading, targetId: "extra-loader" }]];
  for (const pages of variants) {
    const value = fixture([{ targetInfos: pages }], backend);
    await assert.rejects(value.observer.observeBrowser(value.transport), /READINESS_PAGE/u);
    assert.deepEqual([value.counts.targets, value.counts.pauses], [1, 0]);
    assert.equal(value.observer.observation().failureKind, "selection");
  }
  const unbound = fixture([{ targetInfos: [loading] }]);
  await assert.rejects(unbound.observer.observeBrowser(unbound.transport), /READINESS_PAGE/u);
  for (const pathname of [String.raw`C:\other\app.js`, String.raw`C:\a\..\resources\app\app.js`, String.raw`\\server\resources\app\app.js`]) {
    assert.throws(() => new CurrentFootprintHeldCachePageReadiness(pathname), /INSTALLATION_PATH/u);
  }
});

void test("readiness exhausts exactly sixteen valid target samples and fifteen waits with no further native attempt", async () => {
  const value = fixture(Array.from({ length: 16 }, () => ({ targetInfos: [page("about:blank")] })));
  await assert.rejects(value.observer.observeBrowser(value.transport), /TARGET_LIMIT/u);
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 16, 15]);
  const observation = value.observer.observation(); assert.equal(observation.stage, "browser-targets"); assert.equal(observation.failureKind, "target-limit");
  assert.equal(observation.samples.length, 16); assert.equal(observation.failed, true);
  await assert.rejects(value.observer.observeBrowser(value.transport), /CONSUMED/u); assert.equal(value.counts.targets, 16);
});

void test("unexpected, attached or extra pages refuse immediately without broadening the editor URL", async () => {
  for (const pages of [[page("https://client/editor")], [page("https://client/editor?cll=info\n")], [page("https://client/editor?cll=info", true)],
    [page(), { ...page("about:blank"), targetId: "extra-page" }], [page("https://private-project.example")]]) {
    const value = fixture([{ targetInfos: pages }]);
    await assert.rejects(value.observer.observeBrowser(value.transport), /READINESS_PAGE/u);
    assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 1, 0]);
    assert.equal(value.observer.observation().failureKind, "selection");
  }
});

void test("malformed successful discovery refuses without polling over invalid evidence", async () => {
  for (const reply of [{ targetInfos: [], unexpected: true }, { targetInfos: [page(), page()] }, { targetInfos: [{ ...page(), attached: "false" }] }]) {
    const value = fixture([reply]); await assert.rejects(value.observer.observeBrowser(value.transport));
    assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 1, 0]);
    assert.equal(value.observer.observation().failureKind, "inventory"); assert.equal(value.observer.observation().samples.length, 0);
  }
});

void test("a transport failure consumes one attempt and never schedules another target sample", async () => {
  const value = fixture([]); await assert.rejects(value.observer.observeBrowser(value.transport), /unexpected extra request/u);
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 1, 0]);
  assert.equal(value.observer.observation().failureKind, "transport-or-owner"); assert.equal(value.observer.observation().targetAttempts, 1);
});

void test("loss of the original owner during the readiness wait blocks the next query and preserves prior diagnostics", async () => {
  const value = fixture([{ targetInfos: [] }, { targetInfos: [page()] }]);
  value.transport.pause = (): Promise<void> => { value.counts.pauses += 1; value.counts.ownerLost = true; return Promise.resolve(); };
  await assert.rejects(value.observer.observeBrowser(value.transport), /original owner lost/u);
  assert.deepEqual([value.counts.version, value.counts.targets, value.counts.pauses], [1, 1, 1]);
  assert.equal(value.observer.observation().samples[0]?.classification, "empty");
});

void test("changed retained transport methods cannot continue polling", async () => {
  const value = fixture([{ targetInfos: [] }, { targetInfos: [page()] }]);
  value.transport.pause = (): Promise<void> => { value.transport.targets = (): Promise<Readonly<Record<string, unknown>>> => Promise.resolve({ targetInfos: [page()] }); return Promise.resolve(); };
  await assert.rejects(value.observer.observeBrowser(value.transport), /TRANSPORT_CHANGED/u); assert.equal(value.counts.targets, 1);
});

void test("startup diagnostics preserve a later source-stage failure without raw error text or qualification claims", async () => {
  const value = fixture([{ targetInfos: [page()] }, { targetInfos: [page()] }]); await value.observer.observeBrowser(value.transport);
  value.observer.stage("ui-source"); value.observer.fail(); value.observer.fail();
  const result = value.observer.observation(); assert.equal(result.stage, "ui-source"); assert.equal(result.failed, true);
  assert.equal(result.failureKind, "transport-or-owner"); assert.equal(result.uiSourceQualified, false);
  assert.throws(() => { value.observer.stage("ready"); }, /FAILED/u); assert.equal(value.observer.observation().stage, "ui-source");
});
