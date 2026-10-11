import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { extractToolPayload } from "../src/core.ts";
import { RECOVERY_NAVIGATION_FAILURE_STAGES, nativeFailureCategory } from "../src/native-diagnostics.ts";
import { SCHEMATIC_NATIVE_ID_GUARD_CODES, SCHEMATIC_NATIVE_ID_METHODS } from "../src/schematic-native-ids.ts";
import { SCHEMATIC_COMPONENT_PROPERTY_GUARD_CODES, SCHEMATIC_COMPONENT_PROPERTY_METHOD } from "../src/schematic-component-properties.ts";
import { METADATA_NATIVE_GUARD_CODES } from "../src/metadata-native-diagnostics.ts";
import { SYMBOL_PIN_ENUMERATION_GUARD_CODES, SYMBOL_PIN_ENUMERATION_METHOD } from "../src/symbol-pin-enumeration.ts";
import { SCHEMATIC_TEXT_GUARD_CODES, SCHEMATIC_TEXT_READ_METHODS } from "../src/schematic-text-read.ts";
// oxlint-disable-next-line import/max-dependencies -- This diagnostic matrix covers every fixed native classifier using its production guard inventory.
import { SCHEMATIC_NETGROUP_GUARD_CODES, SCHEMATIC_NETGROUP_READ_METHODS } from "../src/schematic-netgroup-read.ts";

const readinessStages = ["api", "project", "document", "owner", "pcb", "page", "container"];
void test("all seven project-open readiness refusals survive structured, text and nested envelopes without private suffixes", () => {
  for (const stage of readinessStages) {
    const message = `Recovery navigation refused: editor-readiness-${stage}`;
    const category = `native-preflight:RECOVERY_EDITOR_READINESS_${stage.toUpperCase()}`;
    assert.equal(nativeFailureCategory(message), category);
    for (const envelope of [
      { structuredContent: { ok: false, error: message } },
      { structuredContent: { success: false, error: { code: "EASYEDA_API_ERROR", message } } },
      { content: [{ type: "text", text: JSON.stringify({ success: false, result: { success: false, error: message } }) }] },
    ]) {
      assert.throws(() => extractToolPayload(envelope), { message: `The upstream EasyEDA tool reported ${"content" in envelope ? "failure or unavailability" : "failure"} [${category}].` });
    }
    for (const invalid of [`${message} /private/design.eprj2`, `${message}\n`, `${message}\0`, `${message}:PRIVATE_SECRET`, `Error: ${message}`,
      "Recovery navigation refused: editor-readiness-unknown", "x".repeat(1024)]) {
      assert.equal(nativeFailureCategory(invalid), null);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: invalid } }),
        { message: "The upstream EasyEDA tool reported failure [unclassified-upstream-failure]." });
    }
  }
});
void test("readiness diagnostic inventory covers every fixed readiness refusal emitted by navigation", async () => {
  const source = await readFile(new URL("../src/recovery-navigation.ts", import.meta.url), "utf8");
  const emitted = [...source.matchAll(/fail\('editor-readiness-([a-z-]+)'\)/gu)].map((match) => { assert.equal(typeof match[1], "string"); return String(match[1]); });
  assert.deepEqual([...new Set(emitted)].toSorted((left, right) => left.localeCompare(right)), readinessStages.toSorted((left, right) => left.localeCompare(right)));
});

void test("every fixed native navigation exception stage survives upstream code loss without private suffixes", async () => {
  const stages = RECOVERY_NAVIGATION_FAILURE_STAGES.filter((stage) => stage.startsWith("native-"));
  const source = await readFile(new URL("../src/recovery-navigation.ts", import.meta.url), "utf8");
  const emitted = [...source.matchAll(/(?:nativeCall\(|classifiedError\(error, )'(native-[a-z-]+)'/gu)].map((match) => {
    assert.equal(typeof match[1], "string"); return String(match[1]);
  });
  assert.deepEqual([...new Set(emitted)].toSorted(), [...stages].toSorted());
  for (const stage of stages) {
    const category = `native-preflight:RECOVERY_${stage.toUpperCase().replaceAll("-", "_")}`, message = `Recovery navigation refused: ${stage}`;
    assert.equal(nativeFailureCategory(message), category);
    for (const envelope of [{ structuredContent: { ok: false, error: message } },
      { structuredContent: { success: false, error: { code: "EASYEDA_API_ERROR", message } } },
      { content: [{ type: "text", text: JSON.stringify({ success: false, result: { success: false, error: message } }) }] }]) {
      assert.throws(() => extractToolPayload(envelope), { message: `The upstream EasyEDA tool reported ${"content" in envelope ? "failure or unavailability" : "failure"} [${category}].` });
    }
    for (const invalid of [`${message}\nPRIVATE`, `${message}\0`, `${message}:PRIVATE`, `PRIVATE ${message}`, "Recovery navigation refused: native-private"]) {
      assert.equal(nativeFailureCategory(invalid), null);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: invalid } }), { message: "The upstream EasyEDA tool reported failure [unclassified-upstream-failure]." });
    }
  }
});

void test("native NetGroup diagnostics admit only exact fixed method/stage/code tuples", () => {
  for (const method of SCHEMATIC_NETGROUP_READ_METHODS) {
    for (const [code, label] of [...SCHEMATIC_NETGROUP_GUARD_CODES.map((entry) => [`SCH_NETGROUP_${entry}`, entry]), ["native-error", "EXCEPTION"]]) {
      const message = `Public SDK read could not produce a complete bounded observation; method=${method}|stage=call|code=${code}|getter=none`;
      const category = `native-schematic-netgroup:${method}:${label}`;
      assert.equal(nativeFailureCategory(message), category);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }), { message: `The upstream EasyEDA tool reported failure [${category}].` });
      for (const invalid of [`${message} private suffix`, `${message}\n`, `private ${message}`, message.replace("stage=call", "stage=projection"),
        message.replace("getter=none", "getter=net"), message.replace(method, "eda.private.method"), message.replace(`code=${code}`, "code=PRIVATE_SECRET")]) {
        assert.equal(nativeFailureCategory(invalid), null);
      }
    }
  }
});

void test("native Text diagnostics admit only exact fixed method/stage/code tuples", () => {
  for (const method of SCHEMATIC_TEXT_READ_METHODS) {
    for (const [code, label] of [...SCHEMATIC_TEXT_GUARD_CODES.map((entry) => [`SCH_TEXT_${entry}`, entry]), ["native-error", "EXCEPTION"]]) {
      const message = `Public SDK read could not produce a complete bounded observation; method=${method}|stage=call|code=${code}|getter=none`;
      const category = `native-schematic-text:${method}:${label}`;
      assert.equal(nativeFailureCategory(message), category);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }), { message: `The upstream EasyEDA tool reported failure [${category}].` });
      for (const invalid of [`${message} private suffix`, `${message}\n`, `private ${message}`, message.replace("stage=call", "stage=private"),
        message.replace("getter=none", "getter=value"), message.replace(method, "eda.private.method"), message.replace(`code=${code}`, "code=PRIVATE_SECRET")]) {
        assert.equal(nativeFailureCategory(invalid), null);
      }
    }
  }
});

void test("native Pin diagnostics admit only exact fixed method/stage/code tuples", () => {
  for (const [code, label] of [...SYMBOL_PIN_ENUMERATION_GUARD_CODES.map((entry) => [`SYMBOL_PIN_ENUM_${entry}`, entry]), ["native-error", "EXCEPTION"]]) {
    const message = `Public SDK read could not produce a complete bounded observation; method=${SYMBOL_PIN_ENUMERATION_METHOD}|stage=call|code=${code}|getter=none`;
    const category = `native-symbol-pins:${SYMBOL_PIN_ENUMERATION_METHOD}:${label}`;
    assert.equal(nativeFailureCategory(message), category);
    assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }), { message: `The upstream EasyEDA tool reported failure [${category}].` });
    for (const invalid of [`${message} private suffix`, `${message}\n`, `private ${message}`, message.replace("stage=call", "stage=private"),
      message.replace("getter=none", "getter=PinName"), message.replace(SYMBOL_PIN_ENUMERATION_METHOD, "eda.private.method"), message.replace(`code=${code}`, "code=PRIVATE_SECRET")]) {
      assert.equal(nativeFailureCategory(invalid), null);
    }
  }
});

void test("native component-property diagnostics admit only exact fixed method/stage/code tuples", () => {
  for (const [code, label] of [...SCHEMATIC_COMPONENT_PROPERTY_GUARD_CODES.map((entry) => [`SCH_COMPONENT_PROPERTIES_${entry}`, entry]), ["native-error", "EXCEPTION"]]) {
    const message = `Public SDK read could not produce a complete bounded observation; method=${SCHEMATIC_COMPONENT_PROPERTY_METHOD}|stage=call|code=${code}|getter=none`;
    const category = `native-component-properties:${SCHEMATIC_COMPONENT_PROPERTY_METHOD}:${label}`;
    assert.equal(nativeFailureCategory(message), category);
    assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }), { message: `The upstream EasyEDA tool reported failure [${category}].` });
    for (const invalid of [`${message} private suffix`, `${message}\n`, `private ${message}`, message.replace("stage=call", "stage=private"),
      message.replace("getter=none", "getter=private"), message.replace(SCHEMATIC_COMPONENT_PROPERTY_METHOD, "eda.private.method"), message.replace(`code=${code}`, "code=PRIVATE_SECRET")]) {
      assert.equal(nativeFailureCategory(invalid), null);
    }
  }
});

void test("native schematic ID diagnostics admit only fixed complete method/stage/code tuples", () => {
  for (const method of SCHEMATIC_NATIVE_ID_METHODS) {
    for (const [code, label] of [...SCHEMATIC_NATIVE_ID_GUARD_CODES.map((entry) => [`SCH_NATIVE_IDS_${entry}`, entry]), ["native-error", "EXCEPTION"]]) {
      const message = `Public SDK read could not produce a complete bounded observation; method=${method}|stage=call|code=${code}|getter=none`;
      const category = `native-schematic-ids:${method}:${label}`;
      assert.equal(nativeFailureCategory(message), category);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }),
        { message: `The upstream EasyEDA tool reported failure [${category}].` });
      for (const invalid of [`${message} private suffix`, `${message}\n`, `private ${message}`, message.replace("stage=call", "stage=private"),
        message.replace("getter=none", "getter=private"), message.replace(method, "eda.private.method"), message.replace(`code=${code}`, "code=PRIVATE_SECRET")]) {
        assert.equal(nativeFailureCategory(invalid), null);
      }
    }
  }
});

void test("only exact reviewed native literal errors become diagnostics", () => {
  assert.equal(nativeFailureCategory("SCH_NATIVE_MANAGER_MISSING"), "native-preflight:SCH_NATIVE_MANAGER_MISSING");
  assert.equal(nativeFailureCategory("Recovery navigation refused: registry-membership"), "native-preflight:RECOVERY_REGISTRY_MEMBERSHIP");
  assert.equal(nativeFailureCategory("Recovery navigation refused: unrelated-editor-tab"), "native-preflight:RECOVERY_UNRELATED_EDITOR_TAB");
  assert.equal(nativeFailureCategory("Recovery navigation refused: tab-tree-leaf"), "native-preflight:RECOVERY_TAB_TREE_LEAF");
  assert.equal(nativeFailureCategory("EDITOR_TABS_CONTEXT_DRIFT"), "native-preflight:EDITOR_TABS_CONTEXT_DRIFT");
  assert.equal(nativeFailureCategory("Pad history changed unrelated records"), "native-preflight:PAD_HISTORY_COLLATERAL");
  assert.equal(nativeFailureCategory("Pad history changed unrelated records secret"), null);
  assert.equal(nativeFailureCategory("Footprint lifecycle metadata drift"), "native-lifecycle:FOOTPRINT_LIFECYCLE_METADATA");
  assert.equal(nativeFailureCategory("Footprint reopen identity failed"), "native-lifecycle:FOOTPRINT_LIFECYCLE_REOPEN");
  assert.equal(nativeFailureCategory("Footprint reopen identity failed private suffix"), null);
  for (const code of ["FOOTPRINT_LINE_OBJECT_INVALID", "FOOTPRINT_LINE_BASELINE_DRIFT", "FOOTPRINT_HISTORY_FRAME", "FOOTPRINT_HISTORY_IDENTITY", "FOOTPRINT_HISTORY_BASELINE", "FOOTPRINT_HISTORY_RESULT"]) {
    assert.equal(nativeFailureCategory(code), `native-preflight:${code}`);
    assert.equal(nativeFailureCategory(`${code} private suffix`), null);
  }
  for (const message of ["SCH_NATIVE_MANAGER_MISSING secret", "SCH_SECRET_KEY", "Error: SCH_NATIVE_MANAGER_MISSING", "Recovery navigation refused: registry-membership secret", {}, null]) {
    assert.equal(nativeFailureCategory(message), null);
  }
  assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: "LIBRARY_EXPORT_FILE_INVALID" } }), /native-preflight:LIBRARY_EXPORT_FILE_INVALID/u);
});

void test("upload barrier legacy literals and fixed stage wrappers classify without leaking arbitrary suffixes", () => {
  const codes = ["DEVICE_NATIVE_HOST_AMBIGUOUS", "DEVICE_NATIVE_BUS_MISSING", "PROJECT_UPLOAD_SCOPE_DRIFT", "PROJECT_UPLOAD_BARRIER_REFUSED"];
  for (const code of codes) {
    assert.equal(nativeFailureCategory(code), `native-preflight:${code}`);
    assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: code } }),
      { message: `The upstream EasyEDA tool reported failure [native-preflight:${code}].` });
    assert.equal(nativeFailureCategory(`${code} private suffix`), null);
    const message = `Project upload barrier refused: HOST:${code}`;
    assert.equal(nativeFailureCategory(message), `native-project-upload-barrier:HOST:${code}`);
    assert.equal(nativeFailureCategory(`${message}:private`), null);
    assert.equal(nativeFailureCategory(`${message} private suffix`), null);
  }
  for (const stage of ["HOST", "INITIAL_PROJECT", "UPLOAD", "ACKNOWLEDGMENT", "FINAL_PROJECT"]) {
    assert.equal(nativeFailureCategory(`Project upload barrier refused: ${stage}:EXCEPTION`), `native-project-upload-barrier:${stage}:EXCEPTION`);
  }
  for (const message of ["EXCEPTION", "Project upload barrier refused: CALLER:EXCEPTION", "Project upload barrier refused: HOST:PRIVATE",
    "Project upload barrier refused: HOST", "Error: Project upload barrier refused: HOST:EXCEPTION", "x".repeat(181), {}, null]) {
    assert.equal(nativeFailureCategory(message), null);
  }
  assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: "PROJECT_UPLOAD_BARRIER_REFUSED /private/path" } }),
    { message: "The upstream EasyEDA tool reported failure [unclassified-upstream-failure]." });
});

const operationStages = [
  { source: "editor-tab-lookups.ts", prefix: "Owned editor lookup refused at ", category: "native-editor-tab-lookup", stages: ["api", "before-context", "before-tree", "lookup", "after-tree"] },
  { source: "document-page-create.ts", prefix: "Closed empty page creation refused at ", category: "native-page-create", stages: ["host", "before-read", "permission", "create"] },
  { source: "project-symbol-create.ts", prefix: "Closed empty symbol creation refused at ", category: "native-symbol-create", stages: ["host", "before-read", "permission", "create"] },
  { source: "document-close.ts", prefix: "Clean document close refused at ", category: "native-document-close", stages: ["host", "before-state", "dispatch-state", "close", "terminal-removal", "after-state", "reconciliation"] },
  { source: "document-activation.ts", prefix: "Document activation refused: ", category: "native-document-activation", stages: ["api", "before-context", "before-tabs", "loaded-frames", "preferences", "dispatch-context", "activate", "target-readiness"] },
  { source: "document-page-rename.ts", prefix: "Closed page rename refused at ", category: "native-page-rename", stages: ["host", "before-read", "closed-target", "rename", "after-read"] },
  { source: "project-symbol-metadata.ts", prefix: "Symbol metadata operation refused at ", category: "native-symbol-metadata", stages: ["host", "permission", "before-read", "target-closed", "modify", "after-read"] },
];

void test("all fixed activation and metadata stages survive existing structured, text and nested failure envelopes", () => {
  for (const { prefix, category, stages } of operationStages) {
    for (const stage of stages) {
      const expected = `${category}:${stage}`, message = `${prefix}${stage}`;
      assert.equal(nativeFailureCategory(message), expected);
      for (const response of [
        { structuredContent: { ok: false, error: message } },
        { structuredContent: { success: false, error: { code: "EASYEDA_API_ERROR", message } } },
        { content: [{ type: "text", text: JSON.stringify({ success: false, result: { success: false, error: message } }) }] },
      ]) {
        const failure = "content" in response ? "failure or unavailability" : "failure";
        assert.throws(() => extractToolPayload(response), { message: `The upstream EasyEDA tool reported ${failure} [${expected}].` });
      }
    }
  }
});

void test("stage classifications never echo unknown, partial, prefixed or suffixed private errors", () => {
  for (const { prefix, stages } of operationStages) {
    for (const stage of stages) {
      const exact = `${prefix}${stage}`;
      for (const message of [`${exact} /private/design.eprj2`, `${exact}\nprivate stack`, `${exact}\n`, `${exact}\0`,
        `Error: ${exact}`, `${exact}:private-token`, `${prefix}unknown`, prefix, "x".repeat(129)]) {
        assert.equal(nativeFailureCategory(message), null);
        assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }),
          { message: "The upstream EasyEDA tool reported failure [unclassified-upstream-failure]." });
      }
    }
  }
  const privateError = { get message(): never { throw new Error("Private error getter must not be inspected."); } };
  assert.equal(nativeFailureCategory(privateError), null);
});

void test("diagnostic stage inventory exactly matches the reviewed generated programs", async () => {
  for (const { source, prefix, stages } of operationStages) {
    const text = await readFile(new URL(`../src/${source}`, import.meta.url), "utf8");
    const emitted = [...text.matchAll(/\bstage='([a-z-]+)'/gu)].map((match) => { assert.ok(typeof match[1] === "string"); return match[1]; });
    assert.deepEqual([...new Set(emitted)].toSorted((left, right) => left.localeCompare(right)), stages.toSorted((left, right) => left.localeCompare(right)));
    assert.ok(text.includes(`throw new Error('${prefix}'+stage`));
  }
});

void test("metadata subguard categories admit only fixed stage/code combinations and redact private suffixes", () => {
  for (const { prefix, category, stages } of operationStages.filter((entry) => ["native-page-rename", "native-symbol-metadata"].includes(entry.category))) {
    for (const stage of stages) {
      for (const code of METADATA_NATIVE_GUARD_CODES) {
        const expected = `${category}:${stage}:${code}`, message = `${prefix}${stage}:${code}`;
        assert.equal(nativeFailureCategory(message), expected);
        assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }),
          { message: `The upstream EasyEDA tool reported failure [${expected}].` });
        for (const invalid of [`${message}:private`, `${message}\n`, `${message}\0`, `${message} /private/path`, `Error: ${message}`]) {
          assert.equal(nativeFailureCategory(invalid), null);
        }
      }
      assert.equal(nativeFailureCategory(`${prefix}${stage}:UNKNOWN_PRIVATE_ERROR`), null);
    }
    assert.equal(nativeFailureCategory(`${prefix}private:PROJECT_PLACEHOLDER`), null);
  }
});

void test("every compiler-owned metadata guard has a reviewed diagnostic code", async () => {
  const codes: ReadonlySet<string> = new Set(METADATA_NATIVE_GUARD_CODES);
  for (const source of ["document-page-rename.ts", "project-symbol-metadata.ts", "device-runtime-guard.ts", "editor-tabs.ts"]) {
    const text = await readFile(new URL(`../src/${source}`, import.meta.url), "utf8");
    let scoped = text;
    if (source === "device-runtime-guard.ts") { scoped = text.slice(0, text.indexOf("export const DEVICE_NATIVE_ASSET_GUARD")); }
    if (source === "editor-tabs.ts") { scoped = text.slice(0, text.indexOf("export function buildEditorTabsReadCode")); }
    for (const match of scoped.matchAll(/throw new Error\('([A-Z_]+)'\)/gu)) {
      assert.ok(match[1] !== undefined && codes.has(match[1]), `${source}: ${String(match[1])}`);
    }
  }
});

void test("activation preference codes remain exact, bounded and limited to the three preference-check stages", () => {
  for (const stage of ["preferences", "dispatch-context", "target-readiness"]) {
    for (const code of ["PREFERENCES_READ_ERROR", "PREFERENCES_API_MISSING", "PREFERENCES_MISSING", "PREFERENCES_BOUND", "PREFERENCES_JSON_INVALID", "PREFERENCES_SHAPE",
      "PCB_COMMAND_TAB_MISSING", "PCB_COMMAND_TAB_WRITE_REQUIRED", "PCB_COMMAND_TAB_NOT_BOOLEAN"]) {
      const expected = `native-document-activation:${stage}:${code}`, message = `Document activation refused: ${stage}:${code}`;
      assert.equal(nativeFailureCategory(message), expected);
      assert.throws(() => extractToolPayload({ structuredContent: { ok: false, error: message } }),
        { message: `The upstream EasyEDA tool reported failure [${expected}].` });
      for (const invalid of [`${message}:private`, `${message}\n`, `${message}\0`, `${message} /private/path`, `Error: ${message}`]) {
        assert.equal(nativeFailureCategory(invalid), null);
      }
    }
  }
  for (const message of ["Document activation refused: preferences:PRIVATE", "Document activation refused: activate:PCB_COMMAND_TAB_MISSING",
    "Document activation refused: api:PREFERENCES_API_MISSING"]) { assert.equal(nativeFailureCategory(message), null); }
});
