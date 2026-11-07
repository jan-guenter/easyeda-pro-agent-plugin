/* oxlint-disable import/max-dependencies -- Verify the complete production copy/SQL/qualifier and original Windows-only metadata seam, including exact command counts. */
/** Actual Linux FD/SQL/initial-model pipeline. Only WSL path translation and
 * native metadata/termination are explicitly synthetic; no Windows call runs. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, win32 } from "node:path";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { managedFixtureClosedFileMetadataSchema } from "../src/managed-fixture-destination.ts";
import type { ManagedFixtureDestinationObservation } from "../src/managed-fixture-destination.ts";
import { captureManagedFixtureClosedSnapshotWithWindowsMetadata } from "../src/managed-fixture-closed-snapshot.ts";
import { generateManagedFixtureArchiveData } from "../src/managed-fixture-generator.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

void test("v2 captures native Windows creation/mtime through exactly seven commands and requalifies every initial SQL/source row", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via");
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const path = join(directory, win32.basename(input.rawWindowsPath)); await copyFile(input.syntheticDatabasePath, path); const bytes = await readFile(path);
  const expectedBasename = win32.basename(input.rawWindowsPath), nativeDirectory = win32.dirname(input.rawWindowsPath), nonce = "2".repeat(64), ownerId = "1".repeat(32);
  const destination: ManagedFixtureDestinationObservation = { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce, ownerId, windowsDirectory: nativeDirectory,
    directoryIdentity: "12345678:1111111111111111", expectedBasename, entries: [expectedBasename], state: "held", deletionAuthorized: false,
    libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:3333333333333333", names: [], watchState: "pending" }] };
  const file = { windowsPath: input.rawWindowsPath, fileIdentity: "12345678:2222222222222222", bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"),
    createdFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceCreatedEpochMs) * 10_000n), modifiedFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceModifiedEpochMs) * 10_000n),
    createdEpochMs: input.sourceCreatedEpochMs, modifiedEpochMs: input.sourceModifiedEpochMs, watchState: "pending" as const, readOnlyFileLease: true as const };
  const commands: string[] = []; let exits = 0;
  const metadata = (kind: string): ReturnType<typeof managedFixtureClosedFileMetadataSchema.parse> => { commands.push(kind);
    return managedFixtureClosedFileMetadataSchema.parse({ schema: "easyeda-pro-control.fixture-closed-file-metadata.v1", destination: { ...destination, requestId: commands.length }, file }); };
  const url = new URL("../src/managed-fixture-closed-snapshot.ts", import.meta.url); const source = await readFile(url, "utf8"), sourceRequire = createRequire(url);
  const translation = source.split("\n").filter(line => line.startsWith("  const sourcePath = ")); assert.equal(translation.length, 1); const originalTranslation = translation[0]; assert.ok(originalTranslation !== undefined);
  const compiled = await transform(source.replace(originalTranslation, `  const sourcePath = ${JSON.stringify(path)};`), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [sourceRequire, loaded, loaded.exports]); const capture = loaded.exports["captureManagedFixtureClosedSnapshotWithWindowsMetadata"]; assert.ok(typeof capture === "function");
  const result: unknown = await Reflect.apply(capture, undefined, [{ archive: input.archive, destination, assertOriginalOwner: (): void => { assert.equal(destination.state, "held"); },
    observeOriginalTermination: (): Promise<void> => { exits += 1; return Promise.resolve(); },
    inspectOriginalDestination: (): Promise<ManagedFixtureDestinationObservation> => { commands.push("destination"); return Promise.resolve({ ...destination, requestId: commands.length }); },
    captureWindowsFileMetadata: (): Promise<ReturnType<typeof metadata>> => Promise.resolve(metadata("capture-file")),
    inspectWindowsFileMetadata: (): Promise<ReturnType<typeof metadata>> => Promise.resolve(metadata("file")) }]);
  assert.ok(result !== null && typeof result === "object" && "report" in result && "qualifiedTarget" in result && result.qualifiedTarget !== null && typeof result.qualifiedTarget === "object");
  const target = result.qualifiedTarget; assert.ok("sourceCreatedEpochMs" in target && "sourceModifiedEpochMs" in target);
  assert.equal(target.sourceCreatedEpochMs, file.createdEpochMs); assert.equal(target.sourceModifiedEpochMs, file.modifiedEpochMs);
  const linux = await stat(path); assert.notEqual(linux.birthtimeMs, file.createdEpochMs);
  assert.ok(result.report !== null && typeof result.report === "object" && "schema" in result.report && "sourceClockSource" in result.report);
  assert.equal(result.report.schema, "easyeda-pro-control.managed-fixture-closed-snapshot.v2"); assert.equal(result.report.sourceClockSource, "original-destination-windows-filetime");
  assert.deepEqual(commands, ["destination", "capture-file", "destination", "file", "destination", "file", "file"]); assert.equal(exits, 3);
});
void test("new Windows capture pins original callbacks before awaits and refuses replacement accessors before any file lease", async () => {
  const generated = generateManagedFixtureArchiveData("via-only"), pending = Promise.withResolvers<null>(); let fileCalls = 0, getterCalls = 0;
  const expectedBasename = generated.name.replace(/\.epro2$/u, ".eprj2"), ownerId = "1".repeat(32);
  const destination: ManagedFixtureDestinationObservation = { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce: "2".repeat(64), ownerId,
    windowsDirectory: `C:\\SyntheticTemp\\CodexEasyedaFixture_${ownerId}`, directoryIdentity: "12345678:1111111111111111", expectedBasename, entries: [expectedBasename], state: "held", deletionAuthorized: false,
    libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:2222222222222222", names: [], watchState: "pending" }] };
  const captureFile = (): Promise<never> => { fileCalls += 1; return Promise.reject(new Error("UNREACHABLE_NATIVE_FILE")); };
  const options = { archive: generated.bytes, destination, assertOriginalOwner: (): void => { assert.equal(destination.state, "held"); },
    observeOriginalTermination: async (): Promise<void> => { await pending.promise; }, inspectOriginalDestination: (): Promise<ManagedFixtureDestinationObservation> => Promise.resolve(destination),
    captureWindowsFileMetadata: captureFile, inspectWindowsFileMetadata: captureFile };
  const original = captureManagedFixtureClosedSnapshotWithWindowsMetadata(options);
  Object.defineProperty(options, "captureWindowsFileMetadata", { get: () => { getterCalls += 1; return captureFile; } }); pending.resolve(null);
  await assert.rejects(original, /identities changed/u); assert.equal(getterCalls, 0); assert.equal(fileCalls, 0);
});
