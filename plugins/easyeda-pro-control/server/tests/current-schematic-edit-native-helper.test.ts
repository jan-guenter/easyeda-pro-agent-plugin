/** Complete actual packaged-source reads and loader strings only. This does
 * not execute PowerShell, compile a native owner or launch an application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentSchematicEditNativeHelper } from "../src/current-schematic-edit-native-helper.ts";
import { CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY } from "../src/current-schematic-edit-native-identity.ts";
import { generateSchematicSavedReadbackNativeSource, schematicSavedReadbackNativeIdentity } from "../../scripts/schematic-saved-readback-native-source.ts";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

void test("exact helper custody fixes its purpose and rejects unsupported selectors before any native execution", async () => {
  for (const purpose of ["schematic-relevance-display-write209", "schematic-wire-edit209"] as const) {
    const captured = await captureCurrentSchematicEditNativeHelper("Synthetic-Distro", purpose); await captured.verify();
    assert.ok(Object.isFrozen(captured)); assert.ok(captured.bootstrap.includes(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.helper.sha256));
    assert.ok(captured.bootstrap.includes("[IO.FileShare]::Read")); assert.ok(captured.bootstrap.endsWith("finally{$file.Dispose()}"));
    assert.ok(captured.bootstrap.includes(purpose === "schematic-relevance-display-write209" ? "-SchematicRelevanceDisplayWrite209" : "-SchematicWireEdit209"));
    assert.equal(captured.bootstrap.includes("-StringPrecreate"), false);
  }
  assert.ok(Object.isFrozen(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.helper)); assert.ok(Object.isFrozen(CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY.compiler));
  await assert.rejects(captureCurrentSchematicEditNativeHelper("bad';command", "schematic-wire-edit209"), /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
  const rejected: unknown = Reflect.apply(captureCurrentSchematicEditNativeHelper, undefined, ["Synthetic-Distro", "pcb-via-write209"]); assert.ok(rejected instanceof Promise);
  await assert.rejects(rejected, /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
});

function isCapture(value: unknown): value is typeof captureCurrentSchematicEditNativeHelper { return typeof value === "function"; }

void test("the saved purpose reads only its separately pinned readonly helper and refuses later file substitution", async () => {
  const directory = await mkdtemp(join(tmpdir(), "schematic-saved-helper-"));
  try {
    const scripts = join(directory, "scripts"), sourceDirectory = join(directory, "server/src");
    await mkdir(sourceDirectory, { recursive: true }); await mkdir(scripts);
    const seed = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
    const data = generateSchematicSavedReadbackNativeSource(seed);
    for (const name of ["current-schematic-edit-native-helper.ts", "current-schematic-edit-native-identity.ts", "current-pcb-diagnostic-helper-source-profile.ts", "powershell-single-quoted-body.ts"]) {
      await copyFile(new URL(`../src/${name}`, import.meta.url), join(sourceDirectory, name));
    }
    await writeFile(join(sourceDirectory, "current-schematic-relevance-saved-native-identity.ts"), schematicSavedReadbackNativeIdentity(data));
    await writeFile(join(scripts, "schematic-saved-readback-native.ps1"), data.helper);
    await copyFile(new URL("../../scripts/schematic-edit-native.ps1", import.meta.url), join(scripts, "schematic-edit-native.ps1"));
    const module: unknown = await import(pathToFileURL(join(sourceDirectory, "current-schematic-edit-native-helper.ts")).href);
    assert.ok(typeof module === "object" && module !== null && "captureCurrentSchematicEditNativeHelper" in module && typeof module.captureCurrentSchematicEditNativeHelper === "function");
    assert.ok(isCapture(module.captureCurrentSchematicEditNativeHelper));
    const capture = module.captureCurrentSchematicEditNativeHelper;
    const saved = await capture("Synthetic-Distro", "schematic-relevance-saved-readback209"); await saved.verify();
    assert.ok(saved.bootstrap.includes("schematic-saved-readback-native.ps1")); assert.ok(saved.bootstrap.includes("-SchematicRelevanceSavedReadback209"));
    assert.equal(saved.bootstrap.includes("schematic-edit-native.ps1"), false);
    const writer = await capture("Synthetic-Distro", "schematic-relevance-display-write209"); await writer.verify();
    assert.ok(writer.bootstrap.includes("schematic-edit-native.ps1")); assert.equal(writer.bootstrap.includes("schematic-saved-readback-native.ps1"), false);
    await writeFile(join(scripts, "schematic-saved-readback-native.ps1"), data.helper.replace("schematic-native-exact-purpose-required", "schematic-native-other-purpose-required"));
    await assert.rejects(saved.verify(), /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
    await assert.rejects(capture("Synthetic-Distro", "schematic-relevance-saved-readback209"), /SCHEMATIC_NATIVE_HELPER_SOURCE/u);
    await writer.verify();
  } finally { await rm(directory, { recursive: true, force: true }); }
});
