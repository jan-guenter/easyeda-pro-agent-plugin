/** Synthetic supplied data only. No genuine native owner/checkpoint, browser,
 * CacheStorage API, cache delete or project open is exercised. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { canonicalJson, sha256Text } from "../src/core.ts";
import { CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS as REQUIRED, decodeCurrentNativeRequestMetadataCatalogue } from "../src/current-native-request-metadata-intrinsics.ts";
import { CurrentPcbViaSavedCacheLedger } from "../src/current-pcb-via-saved-cache-ledger.ts";
import { decodeCurrentPcbViaSavedCacheMetadata } from "../src/current-pcb-via-saved-cache-metadata-programs.ts";
import { buildCurrentPcbViaSavedCacheBackupData, publishCurrentPcbViaSavedCacheBackupData, requireCurrentPcbViaSavedCacheBackupData, verifyCurrentPcbViaSavedCachePublishedData } from "../src/current-pcb-via-saved-cache-backup.ts";
import type { CurrentPcbViaSavedCacheMetadataDataSnapshot } from "../src/current-pcb-via-saved-cache-backup.ts";

const origin = "https://client", rawWindowsPath = `C:\\Synthetic\\CodexEasyedaFixture_${"1".repeat(32)}\\Codex_line_and_via_${"2".repeat(16)}.eprj2`, storageKey = `${origin}/`;
function fixture(): Readonly<{ prepared: object; cdp: ReturnType<CurrentPcbViaSavedCacheLedger["snapshot"]>; metadata: CurrentPcbViaSavedCacheMetadataDataSnapshot }> {
  const projectUuid = sha256Text(rawWindowsPath); const ledger = new CurrentPcbViaSavedCacheLedger(Object.freeze({ frameId: "frame", sessionId: "session", securityOrigin: origin, projectUuid }));
  const prepared = Object.freeze({ profile: "private.current-pcb-via-write-closed-checkpoint.v1", operationId: "pcb209-via-write-cache-data-fixture", completeOriginalClosedSqlVerified: true,
    target: { rawWindowsPath, projectUuid, branchUuid: "3".repeat(32), documentUuid: "4".repeat(32), sourceSha256: "5".repeat(64) }, preparationCheckpoint: { sha256: "6".repeat(64) }, vacuumProjection: { sourceLogicalSha256: "7".repeat(64) } });
  const accept = (command: Parameters<CurrentPcbViaSavedCacheLedger["prepare"]>[0], reply: unknown): void => { const plan = ledger.prepare(command); ledger.accept(plan, reply); };
  const caches = ["peer", `project_${projectUuid}_v6`, `localProject_${projectUuid}_v1`].map((cacheName, index) => ({ cacheId: `cache-${String(index)}`, securityOrigin: origin, storageKey, cacheName }));
  accept({ phase: "saved-cache-key", step: "initial" }, { storageKey }); accept({ phase: "saved-cache-track" }, {}); accept({ phase: "saved-cache-names", step: "before" }, { caches });
  const rows = [0, 1].map(ordinal => ({ requestURL: `${origin}/${ordinal === 0 ? "dataStr" : "localSave"}/fixture`, requestMethod: "GET", requestHeaders: [],
    responseTime: 1000, responseStatus: 200, responseStatusText: "", responseType: "default", responseHeaders: [{ name: "content-type", value: "text/plain;charset=UTF-8" }] }));
  for (const round of ["backup", "verify"] as const) {
    for (const ordinal of [0, 1] as const) { accept({ phase: "saved-cache-entries", round, ordinal }, { cacheDataEntries: [rows[ordinal]], returnCount: 1 }); }
    for (const ordinal of [0, 1] as const) { accept({ phase: "saved-cache-body", round, ordinal, entryIndex: 0 }, { response: { body: Buffer.from([0, 1, 255, ordinal]).toString("base64") } }); }
  }
  accept({ phase: "saved-cache-names", step: "after-backup" }, { caches });
  const catalogue = decodeCurrentNativeRequestMetadataCatalogue([{ index: 1, name: "Request", arity: 1, constructor: true }, { index: 2, name: "Headers", arity: 0, constructor: true }, { index: 3, name: "AbortSignal", arity: 0, constructor: true },
    ...REQUIRED.map((name, index) => ({ index: 8 + index, name: `get ${name}`, arity: 0, constructor: false })), { index: 23, name: "get aborted", arity: 0, constructor: false }, { index: 24, name: "get reason", arity: 0, constructor: false },
    { index: 25, name: "forEach", arity: 1, constructor: false }, { index: 26, name: "getSetCookie", arity: 0, constructor: false }]);
  const native = rows.map((row, ordinal) => decodeCurrentPcbViaSavedCacheMetadata({ schema: "private.pcb-via-saved-cache-metadata.v1", ordinal, existed: true, requestGetterNames: [...REQUIRED],
    entries: [{ request: { url: row.requestURL, method: "GET", headers: { pairs: [], setCookie: [] }, destination: "", referrer: "about:client", referrerPolicy: "", mode: "cors", credentials: "same-origin", cache: "default", redirect: "follow", integrity: "", keepalive: false,
      signal: { aborted: false, reasonUndefined: true }, body: null, bodyUsed: false }, response: { url: "", redirected: false, type: "default", status: 200, statusText: "", ok: true, headers: { pairs: [["content-type", "text/plain;charset=UTF-8"]], setCookie: [] }, bodyPresent: true, bodyUsed: false } }], completeNativeFetchMetadataCaptured: true, executionAuthorized: false }, catalogue));
  return Object.freeze({ prepared, cdp: ledger.snapshot(), metadata: Object.freeze({ catalogue, rounds: Object.freeze({ backup: native, verify: native }) }) });
}
void test("complete supported cache data joins both rounds and publishes exact bytes once without native authority", async () => {
  const f = fixture(); const data = buildCurrentPcbViaSavedCacheBackupData(f.prepared, f.cdp, f.metadata);
  requireCurrentPcbViaSavedCacheBackupData(data, f.prepared, f.cdp, f.metadata); assert.equal(data.totalEntries, 2); assert.equal(data.totalBodyBytes, 8); assert.equal(data.nativeProvenanceVerified, false); assert.equal(data.cacheDeletionAuthorized, false);
  assert.throws(() => { requireCurrentPcbViaSavedCacheBackupData(data, f.prepared, structuredClone(f.cdp), f.metadata); });
  const original = publishCurrentPcbViaSavedCacheBackupData(data); assert.equal(publishCurrentPcbViaSavedCacheBackupData(data), original); const published = await original;
  assert.equal(published.cacheDeletionAuthorized, false); assert.equal((await readFile(published.artifact.path, "utf8")), `${canonicalJson(data)}\n`); await verifyCurrentPcbViaSavedCachePublishedData(published, data);
  const bytes = Buffer.from(data.namespaces[0]?.entries[0]?.body.base64 ?? "", "base64"); assert.deepEqual(bytes, Buffer.from([0, 1, 255, 0]));
  await assert.rejects(verifyCurrentPcbViaSavedCachePublishedData(structuredClone(published), data)); assert.throws(() => publishCurrentPcbViaSavedCacheBackupData(structuredClone(data)));
  await writeFile(published.artifact.path, "changed synthetic backup"); await assert.rejects(verifyCurrentPcbViaSavedCachePublishedData(published, data)); assert.equal(publishCurrentPcbViaSavedCacheBackupData(data), original);
});
void test("missing native keys, changed repeated data and forged body bytes cannot produce a complete model", () => {
  const f = fixture(); const missing = structuredClone(f.metadata); const first = missing.rounds.backup[0]; assert.ok(first !== undefined); first.entries.length = 0;
  assert.throws(() => buildCurrentPcbViaSavedCacheBackupData(f.prepared, f.cdp, missing));
  const changed = structuredClone(f.cdp); const body = changed.rounds.verify[0]?.bodies[0]; assert.ok(body !== undefined); const corrupt = { ...body, sha256: "0".repeat(64) };
  const second = changed.rounds.verify[1]; assert.ok(second !== undefined);
  const altered = { ...changed, rounds: { ...changed.rounds, verify: [{ entries: changed.rounds.verify[0]?.entries ?? null, bodies: [corrupt] }, second] } };
  assert.throws(() => buildCurrentPcbViaSavedCacheBackupData(f.prepared, altered, f.metadata));
});
