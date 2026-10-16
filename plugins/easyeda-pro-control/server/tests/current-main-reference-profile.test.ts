/* oxlint-disable import/max-dependencies -- Verify the fixed build transform, both compiler profiles and packaged binary provenance without native execution. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { test } from "node:test";
import { isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_MAIN_REFERENCE_HELPER_IDENTITY, CURRENT_MAIN_REFERENCE_RUNTIME_PINS, CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256,
  CURRENT_MAIN_REFERENCE_VERSIONS } from "../src/current-main-reference-helper-identity.ts";
import { MAIN_REFERENCE_HELPER_IDENTITY } from "../src/main-reference-helper-identity.ts";
import { RUNTIME_PINS } from "../src/closed-symbol-main-reference-runtime.ts";
import { compileMainReferenceV3Metadata } from "../src/closed-symbol-main-reference-v3-metadata.ts";
import { buildCurrentAgedSqlReferenceProgram, compileCurrentAgedSqlReferenceMetadata } from "../src/current-aged-sql-reference-program.ts";
import { ORDINARY_LAUNCH_PROFILE } from "../src/ordinary-launch.ts";
import { request } from "./helpers/main-reference-settlement-fixture.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node returns a ChildProcess while promisify consumes its callback.
const execFileAsync = promisify(execFile);

void test("current scratch compiler binds its distinct binary, runtime pins and assembly without changing historical output", async () => {
  const historical = await compileMainReferenceV3Metadata(request);
  const current = await compileCurrentAgedSqlReferenceMetadata(request);
  assert.deepEqual(await compileMainReferenceV3Metadata(request), historical);
  assert.deepEqual(historical.helperIdentity, MAIN_REFERENCE_HELPER_IDENTITY);
  assert.deepEqual(current.helperIdentity, CURRENT_MAIN_REFERENCE_HELPER_IDENTITY);
  assert.ok(Object.isFrozen(CURRENT_MAIN_REFERENCE_HELPER_IDENTITY));
  assert.ok(Object.isFrozen(CURRENT_MAIN_REFERENCE_RUNTIME_PINS));
  assert.notEqual(current.helperIdentity.sha256, historical.helperIdentity.sha256);
  assert.equal(current.runtimePinsSha256, sha256Json(CURRENT_MAIN_REFERENCE_RUNTIME_PINS));
  assert.equal(historical.runtimePinsSha256, sha256Json(RUNTIME_PINS));
  assert.equal(current.sourcePins["currentRuntimeProfileSha256"], CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256);
  assert.equal(current.sourcePins["nativeSourcesSha256"], current.helperIdentity.sourcesSha256);
  const fields: unknown = JSON.parse(current.stdin);
  assert.ok(isRecord(fields)); assert.ok(typeof fields["helperBase64"] === "string" && typeof fields["mainBase64"] === "string");
  const helper = Buffer.from(fields["helperBase64"], "base64");
  assert.equal(createHash("sha256").update(helper).digest("hex"), current.helperIdentity.sha256);
  assert.equal(helper.length, current.helperIdentity.bytes);
  assert.match(current.command, /-ceq'Easyeda\.CurrentMainReference'/u);
  assert.match(historical.command, /-ceq'Easyeda\.MainReference'/u);
  const program = buildCurrentAgedSqlReferenceProgram(request);
  assert.equal(Buffer.from(fields["mainBase64"], "base64").toString("utf8"), program);
  assert.match(program, /identity\.electron,"41\.2\.1-jlc-sa-win-x64\.5"/u);
  assert.doesNotMatch(program, /41\.2\.1-jlc-sa-win-x64\.2/u);
  assert.equal(current.mainSha256, sha256Text(program));
  assert.equal(CURRENT_MAIN_REFERENCE_RUNTIME_PINS["easyeda-pro.exe"], ORDINARY_LAUNCH_PROFILE.installedFiles[0].sha256);
});

void test("current scratch generated pins and build manifest retain the complete reviewed source transform", async () => {
  const raw = await readFile(new URL("../../scripts/main-reference-current-runtime.json", import.meta.url));
  assert.equal(createHash("sha256").update(raw).digest("hex"), CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256);
  const profile: unknown = JSON.parse(raw.toString("utf8")); assert.ok(isRecord(profile));
  assert.deepEqual(profile["runtimePins"], CURRENT_MAIN_REFERENCE_RUNTIME_PINS);
  assert.deepEqual(profile["versions"], CURRENT_MAIN_REFERENCE_VERSIONS);
  assert.equal(Object.keys(CURRENT_MAIN_REFERENCE_RUNTIME_PINS).length, 18);
  assert.equal(Object.entries(CURRENT_MAIN_REFERENCE_RUNTIME_PINS).filter(([name, hash]) => hash !== RUNTIME_PINS[name]).length, 10);
  const manifest: unknown = JSON.parse(await readFile(new URL("../bin/Easyeda.CurrentMainReference.build.json", import.meta.url), "utf8"));
  assert.ok(isRecord(manifest));
  assert.equal(manifest["sha256"], CURRENT_MAIN_REFERENCE_HELPER_IDENTITY.sha256);
  assert.equal(manifest["sourcesSha256"], CURRENT_MAIN_REFERENCE_HELPER_IDENTITY.sourcesSha256);
  assert.equal(manifest["runtimeProfileSha256"], CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256);
  assert.deepEqual(manifest["runtimeProfile"], profile);
  assert.deepEqual(manifest["transformedSources"], ["FixedFileData.cs", "MainReferenceEvidence.cs"]);
  assert.equal(manifest["independentBuildsEqual"], true); assert.equal(manifest["assemblyLoaded"], false);
});

void test("fixed build transform changes only two in-memory sources and refuses altered source, pin inventory or versions", async () => {
  const script = String.raw`
import copy, json, pathlib, runpy, sys
module = runpy.run_path(sys.argv[1])
root = pathlib.Path(sys.argv[1]).parent
profile = json.loads((root / "main-reference-current-runtime.json").read_bytes())
sources = {path.name: path.read_bytes() for path in (root / "main-reference/native").glob("*.cs")}
original = dict(sources)
transformed = module["current_runtime_sources"](sources, profile)
assert sources == original
assert {name for name in sources if transformed[name] != sources[name]} == {"FixedFileData.cs", "MainReferenceEvidence.cs"}
assert b'41.2.1-jlc-sa-win-x64.5' in transformed["MainReferenceEvidence.cs"]
assert b'41.2.1-jlc-sa-win-x64.2' in sources["MainReferenceEvidence.cs"]
for case in range(4):
    changed = copy.deepcopy(profile)
    selected = dict(sources)
    if case == 0: selected["FixedFileData.cs"] += b'\n'
    if case == 1: changed["runtimePins"]["extra.dll"] = "a" * 64
    if case == 2: changed["versions"]["electron"] = "unreviewed"
    if case == 3: changed["runtimePins"]["easyeda-pro.exe"] = "invalid"
    try: module["current_runtime_sources"](selected, changed)
    except RuntimeError: pass
    else: raise AssertionError("Malformed transform admitted")
print("fixed current transform checks passed")
`;
  const builder = fileURLToPath(new URL("../../scripts/build-main-reference-helper.py", import.meta.url));
  const output = await execFileAsync("python3", ["-I", "-B", "-c", script, builder], { encoding: "utf8", timeout: 10_000, maxBuffer: 4096 });
  assert.equal(output.stdout, "fixed current transform checks passed\n"); assert.equal(output.stderr, "");
});
