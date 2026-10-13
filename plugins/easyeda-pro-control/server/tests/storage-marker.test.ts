import assert from "node:assert/strict";
import { test } from "node:test";
import { STORAGE_MARKER_RESULT, buildStorageMarkerCreateExpression, buildStorageMarkerReadExpression, parseStorageMarkerDescriptor, validateStorageMarkerResult } from "../src/storage-marker.ts";
import { cacheName, fixture, initialProject, marker, markerKey, seed, settle } from "./helpers/storage-marker-fixture.ts";
import type { Fixture } from "./helpers/storage-marker-fixture.ts";

void test("one owned namespace/open/put with exact native Request/Response and readback", async () => {
  const state = fixture(); const result = await state.run(true);
  validateStorageMarkerResult(result, marker, "created-and-readback");
  assert.deepEqual(state.calls.map((call) => call.kind), ["has", "open", "keys", "put", "match", "body-read", "body-read", "keys"]);
  assert.deepEqual(state.calls[0]?.args, [cacheName]); assert.deepEqual(state.calls[1]?.args, [cacheName]);
  assert.deepEqual(state.calls[3]?.args, [markerKey, [], [["content-type", "application/octet-stream"], ["x-easyeda-pro-agent-marker", "1"]], [...new TextEncoder().encode(marker.bodyNonce)]]);
  assert.deepEqual(structuredClone(state.calls[4]?.args), [markerKey, { cacheName, ignoreSearch: false, ignoreMethod: false, ignoreVary: false }]);
  assert.equal(state.cleared, 1); assert.equal(state.entries.size, 1); assert.equal(state.cancellations, 0);
});
void test("existing marker read is noncreating and nonauthorizing", async () => {
  const state = fixture(); seed(state);
  const result = validateStorageMarkerResult(await state.run(), marker, "observed-present");
  assert.equal(Object.isFrozen(result), true); assert.equal(result["scope"], "point-in-time-plugin-owned-marker");
  assert.deepEqual(state.calls.map((call) => call.kind), ["match", "body-read", "body-read"]); assert.equal(state.entries.size, 1); assert.equal(state.cleared, 1);
});
for (const create of [false, true]) {
  for (const name of ["fetch(", "indexedDB", "register(", "unregister(", "getRegistrations", "rpcCall", "getUploadedData", "localProject_", "project_", "'delete'", "'add'", "'addAll'", "arrayBuffer(", ".text("]) {
    void test(`fixed ${create ? "create" : "read"} expression excludes ${name}`, () => {
      const program = create ? buildStorageMarkerCreateExpression(marker) : buildStorageMarkerReadExpression(marker);
      assert.equal(program.includes(name), false);
    });
  }
}
for (const create of [false, true]) {
  void test(`permanently unsettled body read cleans its retained reader at outer timeout ${create ? "create" : "read"}`, async () => {
    const state = fixture(); if (!create) { seed(state); }
    const at = create ? 6 : 2, pending = Promise.withResolvers<unknown>();
    state.overrides.set(at, pending.promise);
    const running = state.run(create); await settle(); assert.equal(state.calls.length, at);
    assert.ok(state.lastResponse?.body); const body = state.lastResponse.body;
    assert.equal(body.locked, true); state.timeout();
    await assert.rejects(running, /STORAGE_MARKER_REFUSED:TIMEOUT/u);
    assert.equal(state.cancellations, 1); assert.equal(body.locked, false); assert.equal(state.cleared, 1);
    await settle(); assert.equal(state.calls.length, at); assert.equal(state.cancellations, 1);
    assert.equal(state.calls.filter((call) => call.kind === "put").length, create ? 1 : 0);
    // Intentionally never settle the underlying pull. The outer cleanup must work.
  });
}
for (const name of ["'open'", "'put'", "'keys'", "'has'", "Cache'"]) {
  void test(`read expression cannot call ${name}`, () => { assert.equal(buildStorageMarkerReadExpression(marker).includes(name), false); });
}
for (const field of ["namespaceNonce", "keyNonce", "bodyNonce"]) {
  for (const invalid of ["", "a".repeat(63), "a".repeat(65), "A".repeat(64), "x".repeat(64), "project_native_v6", "https://foreign/", `${"../".repeat(21)}x`, "é".repeat(64), `${"a".repeat(63)}\n`, null, 1]) {
    void test(`descriptor rejects ${field} ${JSON.stringify(invalid)}`, () => {
      assert.throws(() => parseStorageMarkerDescriptor({ ...marker, [field]: invalid }), /STORAGE_MARKER_INPUT/u);
      assert.throws(() => buildStorageMarkerCreateExpression({ ...marker, [field]: invalid }), /STORAGE_MARKER_INPUT/u);
    });
  }
}
for (const input of [null, undefined, [], "marker", 1, { ...marker, namespace: "native" }, { ...marker, completed: true }, { ...marker, profile: "other" }]) {
  void test(`descriptor exact shape ${JSON.stringify(input)}`, () => { assert.throws(() => parseStorageMarkerDescriptor(input), /STORAGE_MARKER_INPUT/u); });
}
void test("descriptor/results reject getters and inherited/symbol/extra fields without invoking them", async () => {
  const state = fixture(); seed(state); const result = validateStorageMarkerResult(await state.run(), marker, "observed-present");
  for (const original of [marker, result]) {
    for (const key of Object.keys(original)) {
      let reads = 0; const input = { ...original }; Reflect.deleteProperty(input, key);
      Object.defineProperty(input, key, { get(): never { reads += 1; throw new Error("private"); } });
      assert.throws(() => original === marker ? parseStorageMarkerDescriptor(input) : validateStorageMarkerResult(input, marker, "observed-present")); assert.equal(reads, 0);
    }
    for (const input of [Object.create(original) as unknown, { ...original, [Symbol("extra")]: true }, { ...original, operationId: "forged" }]) {
      assert.throws(() => original === marker ? parseStorageMarkerDescriptor(input) : validateStorageMarkerResult(input, marker, "observed-present"));
    }
  }
  assert.equal(Object.isFrozen(parseStorageMarkerDescriptor(marker)), true);
});
void test("result must match descriptor, phase and all fields", async () => {
  const state = fixture(); seed(state); const result = validateStorageMarkerResult(await state.run(), marker, "observed-present");
  for (const field of Object.keys(result)) {
    assert.throws(() => validateStorageMarkerResult({ ...result, [field]: "other" }, marker, "observed-present"), /STORAGE_MARKER_RESULT/u);
    const missing = { ...result }; Reflect.deleteProperty(missing, field);
    assert.throws(() => validateStorageMarkerResult(missing, marker, "observed-present"), /STORAGE_MARKER_RESULT/u);
  }
  assert.equal(result["profile"], STORAGE_MARKER_RESULT);
  assert.throws(() => validateStorageMarkerResult(result, { ...marker, bodyNonce: "d".repeat(64) }, "observed-present"));
  assert.throws(() => validateStorageMarkerResult(result, marker, "created-and-readback"));
});
void test("missing marker never creates or repairs a namespace", async () => {
  const state = fixture(); await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:MATCH/u);
  assert.equal(state.exists, false); assert.deepEqual(state.calls.map((call) => call.kind), ["match"]);
});
for (const field of ["namespaceNonce", "keyNonce", "bodyNonce"]) {
  void test(`wrong journaled ${field} cannot match the existing marker`, async () => {
    const state = fixture(); seed(state);
    await assert.rejects(state.run(false, { ...marker, [field]: "d".repeat(64) }), /STORAGE_MARKER_REFUSED:/u);
    assert.equal(state.entries.size, 1); assert.equal(state.calls.some((call) => call.kind === "open" || call.kind === "put"), false);
  });
}
void test("creation refuses existing name even when the marker would match", async () => {
  const state = fixture(); seed(state); await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:HAS/u);
  assert.deepEqual(state.calls.map((call) => call.kind), ["has"]); assert.equal(state.entries.size, 1);
});
void test("empty existing cache cannot be repaired", async () => {
  const state = fixture(); state.exists = true;
  await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:MATCH/u); assert.equal(state.entries.size, 0);
});
void test("unexpected entries found after open prevent put and preserve the namespace", async () => {
  const state = fixture(); state.onCall = (call): void => { if (call.kind === "open") { state.entries.set("https://client/unexpected", { body: new Uint8Array(), headers: {} }); } };
  await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:OWN_KEYS/u);
  assert.deepEqual(state.calls.map((call) => call.kind), ["has", "open", "keys"]); assert.equal(state.entries.size, 1);
});

const contexts: [string, (state: Fixture) => void][] = [
  ["origin", (s) => { s.sandbox["location"] = { href: "https://other/editor?cll=warn#", origin: "https://other" }; }],
  ["URL command", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=warn#id=target", origin: "https://client" }; }],
  ["mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "UNKNOWN-CLIENT-OFFLINE"; }],
  ["UI", (s) => { s.sandbox["UI"] = {}; }],
  ["gVars", (s) => { s.sandbox["gVars"] = {}; }],
  ["alias", (s) => { s.ui["gVars"] = {}; }],
  ["current project", (s) => { s.host["currentProject"] = {}; }],
  ["pending tabs", (s) => { s.host["sessionStorageTabs"] = new Set(["pending"]); }],
  ["command", (s) => { s.host["urlCmd"] = "open"; }],
  ["history", (s) => { s.host["isHistoryMode"] = true; }],
  ["project flag", (s) => { s.tabs["isOpenProjectDoc"] = false; }],
  ["other flag", (s) => { s.tabs["isOpenOtherDoc"] = false; }],
  ["active tab", (s) => { s.tabs["getActiveTab"] = (): string => "foreign"; }],
  ["tab type", (s) => { s.tab["data"] = { doctype: 3 }; }],
  ["SW controller", (s) => { s.controller.value = {}; }],
  ["navigator", (s) => { s.sandbox["navigator"] = {}; }],
  ["storage", (s) => { s.sandbox["caches"] = {}; }],
  ["document", (s) => { s.sandbox["document"] = {}; }],
  ["Response constructor", (s) => { s.sandbox["Response"] = Object; }],
  ["stream constructor", (s) => { s.sandbox["ReadableStream"] = Object; }],
  ["reader constructor", (s) => { s.sandbox["ReadableStreamDefaultReader"] = Object; }],
  ["bytes constructor", (s) => { s.sandbox["Uint8Array"] = Object; }],
];
for (const create of [false, true]) {
  for (const [label, mutate] of contexts) {
    void test(`${create ? "create" : "read"} rejects initial ${label} with zero calls`, async () => {
      const state = fixture(); seed(state); if (create) { state.exists = false; state.entries.clear(); } mutate(state);
      await assert.rejects(state.run(create), /STORAGE_MARKER_REFUSED:/u); assert.equal(state.calls.length, 0);
    });
  }
}
for (const field of Object.keys(initialProject())) {
  for (const kind of ["missing", "changed", "accessor"]) {
    void test(`source-native currentProject ${field}/${kind} refuses`, async () => {
      const project = initialProject(), state = fixture(); let reads = 0;
      if (kind === "missing") { Reflect.deleteProperty(project, field); }
      else if (kind === "changed") { project[field] = "changed"; }
      else { Object.defineProperty(project, field, { get(): never { reads += 1; throw new Error("private"); } }); }
      state.host["currentProject"] = project;
      await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:/u); assert.equal(state.calls.length, 0); assert.equal(reads, 0);
    });
  }
}
for (const create of [false, true]) {
  for (const at of create ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3]) {
    for (const [label, mutate] of contexts) {
      void test(`retains ${label} after awaited call ${at} ${create ? "create" : "read"}`, async () => {
        const state = fixture(); if (!create) { seed(state); }
        state.onCall = (_, index): void => { if (index === at) { mutate(state); } };
        await assert.rejects(state.run(create), /STORAGE_MARKER_REFUSED:/u);
        assert.equal(state.calls.length, at); assert.equal(state.cleared, 1);
      });
    }
    void test(`timeout after call ${at} ${create ? "create" : "read"} never replays after late settlement`, async () => {
      const state = fixture(); if (!create) { seed(state); }
      const pending = Promise.withResolvers<unknown>(); state.overrides.set(at, pending.promise);
      const running = state.run(create); await settle(); assert.equal(state.calls.length, at);
      state.timeout(); await assert.rejects(running, /STORAGE_MARKER_REFUSED:TIMEOUT/u);
      const absent: unknown = undefined; pending.resolve(absent); await settle(); assert.equal(state.calls.length, at); assert.equal(state.cleared, 1);
      assert.ok(state.calls.filter((call) => call.kind === "put").length <= 1);
    });
  }
}

for (const field of ["status", "statusText", "type", "url", "redirected", "bodyUsed", "headers", "body"]) {
  void test(`response own ${field} accessor refuses without being read`, async () => {
    const state = fixture(); seed(state); let reads = 0;
    state.response = (): Response => { const response = new Response(marker.bodyNonce); Object.defineProperty(response, field, { get(): never { reads += 1; throw new Error("private"); } }); return response; };
    await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:MATCH/u); assert.equal(reads, 0); assert.equal(state.calls.length, 1);
  });
}
for (const options of [{ status: 201 }, { statusText: "OK" }, { headers: { "content-type": "text/plain", "x-easyeda-pro-agent-marker": "1" } }, { headers: { "content-type": "application/octet-stream" } }, { headers: { "content-type": "application/octet-stream", "x-easyeda-pro-agent-marker": "1", extra: "unexpected" } }]) {
  void test(`wrong response metadata ${JSON.stringify(options)}`, async () => {
    const state = fixture(); seed(state); state.response = (): Response => new Response(marker.bodyNonce, options);
    await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:MATCH/u); assert.equal(state.calls.length, 1);
  });
}
for (const chunks of [[], [new Uint8Array(63)], [new Uint8Array(65)], [new TextEncoder().encode("d".repeat(64))], [new TextEncoder().encode(marker.bodyNonce), new Uint8Array([1])], Array.from({ length: 128 }, () => new Uint8Array())]) {
  void test(`missing/wrong/oversized/nonterminating body chunks ${chunks.length}/${chunks[0]?.byteLength}`, async () => {
    const state = fixture(); seed(state); state.bodyChunks = chunks;
    await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:BODY/u);
    assert.ok(state.calls.length <= 129); assert.equal(state.cleared, 1);
  });
}
for (const size of [1, 2, 7, 16, 31, 32, 63, 64]) {
  void test(`exact body accepts native chunking at ${size} bytes`, async () => {
    const state = fixture(); seed(state); const body = new TextEncoder().encode(marker.bodyNonce), chunks: Uint8Array[] = [];
    for (let offset = 0; offset < body.length; offset += size) { chunks.push(body.slice(offset, offset + size)); }
    state.bodyChunks = chunks; validateStorageMarkerResult(await state.run(), marker, "observed-present");
  });
}
void test("late put with lost acknowledgment remains readable but never gets a second write", async () => {
  const pending = Promise.withResolvers<unknown>(), state = fixture(); state.overrides.set(4, pending.promise);
  const running = state.run(true); await settle(); assert.equal(state.entries.size, 1); state.timeout();
  await assert.rejects(running, /STORAGE_MARKER_REFUSED:TIMEOUT/u); const absent: unknown = undefined; pending.resolve(absent); await settle();
  assert.deepEqual(state.calls.map((call) => call.kind), ["has", "open", "keys", "put"]);
  const fresh = fixture(); fresh.exists = state.exists; fresh.entries = state.entries;
  validateStorageMarkerResult(await fresh.run(), marker, "observed-present");
  assert.deepEqual(fresh.calls.map((call) => call.kind), ["match", "body-read", "body-read"]);
  // This models data reconciliation only; no generation/closure authority exists.
});

for (const value of [undefined, null, 0, "false", true]) {
  void test(`creation requires exact false absence ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.overrides.set(1, value);
    await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:HAS/u); assert.equal(state.calls.length, 1); assert.equal(state.exists, false);
  });
}
for (const value of [undefined, null, {}, []]) {
  void test(`creation rejects wrong open receiver ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.overrides.set(2, value);
    await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:/u); assert.equal(state.calls.length, 2); assert.equal(state.entries.size, 0);
  });
}
for (const value of [null, {}, [undefined], [new Request("https://client/foreign")]]) {
  void test(`creation rejects wrong initial keys ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.overrides.set(3, value);
    await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:OWN_KEYS/u); assert.equal(state.calls.length, 3);
  });
}
for (const value of [null, false, true, "unexpected"]) {
  void test(`unexpected put return does not retry or claim readback ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.overrides.set(4, value);
    await assert.rejects(state.run(true), /STORAGE_MARKER_REFUSED:PUT/u); assert.equal(state.calls.length, 4); assert.equal(state.entries.size, 1);
  });
}
for (const at of [2, 3]) {
  for (const kind of ["header value", "extra header", "body shadow", "reader constructor", "location identity", "top", "window", "timer"]) {
    void test(`response/context drift during body read ${at}/${kind}`, async () => {
      const state = fixture(); seed(state); let accessors = 0;
      state.onCall = (_, index): void => {
        if (index !== at) { return; }
        assert.ok(state.lastResponse);
        if (kind === "header value") { state.lastResponse.headers.set("x-easyeda-pro-agent-marker", "2"); }
        else if (kind === "extra header") { state.lastResponse.headers.set("extra", "private"); }
        else if (kind === "body shadow") { Object.defineProperty(state.lastResponse, "body", { get(): never { accessors += 1; throw new Error("private"); } }); }
        else if (kind === "reader constructor") { state.sandbox["ReadableStreamDefaultReader"] = Object; }
        else if (kind === "location identity") { state.sandbox["location"] = { href: "https://client/editor?cll=warn#", origin: "https://client" }; }
        else if (kind === "timer") { state.sandbox["setTimeout"] = (): number => 7; }
        else { state.sandbox[kind] = {}; }
      };
      await assert.rejects(state.run(), /STORAGE_MARKER_REFUSED:BODY/u); assert.equal(state.calls.length, at); assert.equal(accessors, 0);
    });
  }
}
for (const create of [false, true]) {
  for (const at of create ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3]) {
    void test(`native exception at ${at}/${create ? "create" : "read"} is sanitized without repeat`, async () => {
      const state = fixture(); if (!create) { seed(state); }
      state.onCall = (_, index): void => { if (index === at) { throw new Error("unrelated private native content"); } };
      await assert.rejects(state.run(create), (error: unknown): boolean => error instanceof Error ? /^STORAGE_MARKER_REFUSED:[A-Z_]+$/u.test(error.message) : Object.prototype.toString.call(error) === "[object Error]" && !String(error).includes("private"));
      assert.equal(state.calls.length, at);
    });
  }
}
