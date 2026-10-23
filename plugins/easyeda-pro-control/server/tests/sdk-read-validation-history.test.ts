import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { parse } from "acorn";

import { extensionApiCoverageSummary, inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { queryPublicSdkReads, validatePublicSdkArguments } from "../src/public-sdk-catalog.ts";
import { publicSdkReadDescriptors, validatePublicSdkReadPayload } from "../src/public-sdk-read.ts";
import { getSdkReadValidationHistory } from "../src/sdk-read-validation-history.ts";

const methods = ["eda.pcb_Primitive.getPrimitiveByPrimitiveId", "eda.pcb_Primitive.getPrimitivesByPrimitiveId",
  "eda.lib_LibrariesList.getSystemLibraryUuid", "eda.sch_Primitive.getPrimitiveByPrimitiveId",
  "eda.sch_Primitive.getPrimitivesByPrimitiveId", "eda.sys_FontManager.getFontsList"];
const histories = (): ReturnType<typeof getSdkReadValidationHistory>[] => methods.map((method) => getSdkReadValidationHistory(method));
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
const record = (value: unknown): Record<string, unknown> => {
  assert.ok(isRecord(value));
  return value;
};
const rows = (value: unknown): Record<string, unknown>[] => {
  assert.ok(Array.isArray(value)); return value.map((entry) => record(entry));
};

void test("historical discovery indexes exactly R01-R09 across six exact fixed methods", () => {
  const indexed = histories().flatMap((history) => history.cases);
  const descriptors = new Map(publicSdkReadDescriptors().map((entry) => [entry.path, entry]));
  assert.deepEqual(indexed.map((entry) => entry.id).toSorted(), ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08", "R09"]);
  assert.equal(new Set(indexed.map((entry) => `${entry.generationId}:${entry.id}`)).size, 9);
  assert.equal(new Set(indexed.map((entry) => entry.method)).size, 6);
  for (const history of histories()) {
    assert.equal(history.scope, "historical-disposable-cases-only;not-runtime-admission");
    assert.equal(history.indexCoverage, "ledger-R01-R09-only;not-exhaustive");
    assert.equal(history.currentGenerationLiveValidation, "not-asserted-by-this-index");
    assert.equal(history.executionAuthorized, false); assert.equal(history.completeDeclaredContractValidated, false);
    assert.equal(history.unlistedMethods, "no-indexed-case;not-an-assertion-of-no-prior-tests");
    for (const entry of history.cases) {
      const descriptor = descriptors.get(entry.method); assert.ok(descriptor);
      assert.equal(entry.implementation, descriptor.implementation.kind); assert.ok(descriptor.documentTypes.includes(entry.documentType));
      assert.equal(entry.documentType, entry.id === "R01" || entry.id === "R02" ? 3 : 1);
      assert.equal(entry.implementation, entry.id === "R03" ? "public-method" : "native-task-equivalent");
      assert.match(entry.evidence.ledgerUrl, /^https:\/\/github\.com\/jan-guenter\/easyeda-pro-agent-plugin\/blob\/a805ffeef142a760eb8b86b2c466bd84f0b3b534\/docs\/api-connected-validation-ledger\.md#[a-z0-9-]+$/u);
      for (const digest of [entry.evidence.resultSha256, entry.evidence.receiptSha256, entry.evidence.independentReviewSha256].filter((value) => value !== null)) {
        assert.match(digest, /^[a-f0-9]{64}$/u);
      }
      assert.equal(entry.evidence.independentReview, "accepted-in-immutable-ledger");
      assert.equal(entry.evidence.independentReviewSha256 === null, entry.id === "R01" || entry.id === "R02");
      assert.deepEqual(entry.stages, ["two-matching-observations", "independent-receipt-review", "complete-source-correlation", "immutable-checkpoint-review"]);
      assert.ok(entry.exclusions.includes("no-current-generation-or-whole-method-validation"));
      assert.ok(entry.exclusions.includes("no-runtime-admission-or-execution-authority"));
      assert.ok(entry.exclusions.includes("no-writer-save-inverse-or-rollback-validation"));
      assert.ok(history.generations.some((generation) => generation.id === entry.generationId));
    }
  }
});

void test("historical argument domains retain literal selector, caller order and font limits", () => {
  const indexed = new Map(histories().flatMap((history) => history.cases).map((entry) => [entry.id, entry]));
  assert.equal(indexed.get("R01")?.argumentDomain, "id: one existing standalone STRING");
  assert.equal(indexed.get("R02")?.argumentDomain, "ids: one-element array containing the R01 STRING");
  assert.equal(indexed.get("R03")?.argumentDomain, "empty arguments");
  assert.equal(indexed.get("R04")?.argumentDomain, "id: one existing root Text");
  assert.equal(indexed.get("R05")?.argumentDomain, "ids: one-element array containing the R04 Text");
  assert.equal(indexed.get("R06")?.argumentDomain, "id: one root Wire with three orthogonal LINE children");
  assert.equal(indexed.get("R07")?.argumentDomain, "ids: two-element array in Wire then Text caller order");
  assert.equal(indexed.get("R08")?.argumentDomain, "ids: two-element array in Text then Wire caller order, opposite lexical ID order");
  assert.equal(indexed.get("R09")?.argumentDomain, "empty arguments");
  assert.match(indexed.get("R09")?.observedScope ?? "", /10 ordered configured titles, 52 UTF-16 code units/u);
  assert.equal(indexed.get("R09")?.exclusions.includes("no-installed-font-or-rendering-proof"), true);
  assert.equal(indexed.get("R09")?.exclusions.includes("no-current-account-or-persisted-preference-proof"), true);
  assert.equal(indexed.get("R06")?.exclusions.includes("no-resolved-net-or-custom-attribute-value-proof"), true);
});

void test("unindexed methods and sibling or case-mismatched selectors inherit no case or source review", () => {
  for (const method of ["", "eda.sys_FontManager.getFontsList ", "EDA.sys_FontManager.getFontsList", "eda.sys_FontManager.*",
    "eda.sys_FontManager", "eda.sch_PrimitiveBus.getAll", "eda.sch_PrimitiveText.getAll", "eda.pcb_Primitive.getSelectedPrimitives",
    "eda.lib_LibrariesList.getPersonalLibraryUuid", "eda.sch_Primitive.getPrimitiveByPrimitiveIdMissing"]) {
    const history = getSdkReadValidationHistory(method);
    assert.deepEqual(history.cases, []); assert.deepEqual(history.generations, []); assert.deepEqual(history.sourceReviews, []);
    assert.equal(history.externalProfile, null); assert.equal(history.executionAuthorized, false);
    assert.equal(history.unlistedMethods, "no-indexed-case;not-an-assertion-of-no-prior-tests");
  }
});

void test("historical generations retain original payloads and external tuple rather than current build identities", () => {
  const generations = new Map(histories().flatMap((history) => history.generations).map((generation) => [generation.id, generation]));
  assert.equal(generations.size, 3);
  assert.deepEqual([...generations.values()].map((generation) => [generation.id, generation.payloadCommit, generation.packageTree]), [
    ["G20261011-164600", "b2f60013123fb94d1fee2f3d6ddf2dad1f97fffe", "db98b5e1ef0bf5934e949e0904fbc9405c65deac"],
    ["G20261011-204104", "10972c0d68b11f87fffa5570c74c2294e1068aba", "fe9acf1d0da7caa942a6ac3599efc7b337995709"],
    ["G20261011-220050", "e566f2ab8bc73c8748e86c5f2cecdf5f2a86114b", "2cfe8e8e1054efd44eb4035bb4a569097b6ebdad"],
  ]);
  for (const generation of generations.values()) {
    assert.ok(generation.manifestUrl.includes(`/blob/${generation.payloadCommit}/`));
    assert.equal(generation.installedVersion, `0.3.0+codex.${generation.id.slice(1).replace("-", "")}`);
    for (const digest of [generation.facadeSourceSha256, generation.runtimeSha256, generation.manifestSha256]) { assert.match(digest, /^[a-f0-9]{64}$/u); }
    assert.equal(new Set(generation.adapterBindings.map((binding) => binding.path)).size, generation.adapterBindings.length);
  }
  for (const history of histories()) {
    assert.equal(history.externalProfile?.applicationVersion, "3.2.149.88089769");
    assert.equal(history.externalProfile?.publicApiVersion, "0.2.53.aee2f57a");
    assert.equal(history.externalProfile?.dispatcherBuildId, "ded07x99dcxb504");
    assert.equal(history.externalProfile?.dispatcherMethods, 67); assert.equal(history.externalProfile?.upstreamTools, 116);
    assert.equal(history.externalProfile?.nodeVersion, "24.18.0");
    assert.equal(history.externalProfile?.schematicSha256, "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f");
  }
  assert.deepEqual([...generations.values()].map((generation) => generation.adapterBindings.find((binding) => binding.path === "public-sdk-read.ts")?.sha256), [
    "429ae05953345040a0eab5d827e667cdfb39b33f48d925d3d94d8a6c5635f847", "fa6220e37eff8df1c6a33402282b90f6d91d0f22e2bd6957aca6327521c56d69",
    "a80476c3cc61b272feae138b53a6cc056630c744848ee5138b0f44cb63e08cf9",
  ]);
});

void test("adapter byte drift requires deliberate source review without rewriting historical bindings", async () => {
  const reviews = new Map(histories().flatMap((history) => history.sourceReviews).map((review) => [review.path, review]));
  assert.deepEqual([...reviews.keys()].toSorted(), ["configured-font-read.ts", "pcb-source-objects-read.ts", "pcb-source-objects.ts", "public-sdk-read.ts", "schematic-primitive-read.ts"]);
  const before = histories();
  for (const review of reviews.values()) {
    const font = review.path === "configured-font-read.ts";
    assert.equal(review.scope, "historical-case-index-review-only;no-live-evidence-transfer");
    assert.equal(review.reviewedOn, font ? "2026-10-23" : "2026-10-12");
    if (font) {
      assert.equal(review.reviewedSha256, "d0d2aabee1d9c6e14672b60972d388b340969a5f7e82a526d8e68f3ddafbd73f");
    }
    const actual = createHash("sha256").update(await readFile(new URL(`../src/${review.path}`, import.meta.url))).digest("hex");
    assert.equal(actual, review.reviewedSha256, `Historical SDK case review required for ${review.path}; do not automatically refresh its digest.`);
    for (const generation of before.flatMap((history) => history.generations)) {
      const binding = generation.adapterBindings.find((entry) => entry.path === review.path);
      if (binding !== undefined && review.path !== "public-sdk-read.ts") {
        assert.equal(binding.sha256, font ? "d662d4aeb294b779494ba63ca89c7bb9a2446d430f36302b2463cc96d2e8a1c1" : actual);
      }
    }
  }
  assert.deepEqual(histories(), before);
});

void test("historical case and generation commitments cannot be silently refreshed with current source reviews", () => {
  const historical = histories().map(({ generations, cases, externalProfile }) => ({ generations, cases, externalProfile }));
  // Reviewed against immutable ledger a805ffe and historical Git objects. This
  // Commitment excludes current source reviews and the module's own bytes.
  assert.equal(createHash("sha256").update(JSON.stringify(historical)).digest("hex"),
    "6f17d3aaa64fdbecf759a8f5fc559ad52af492bca6f603d5d2abbac814342b0a",
    "Historical SDK evidence changed; review the original ledger/Git bindings, never auto-refresh this commitment.");
});

void test("registry and catalog responses cannot mutate nested historical evidence", () => {
  const method = "eda.sys_FontManager.getFontsList";
  const before = getSdkReadValidationHistory(method), changed = getSdkReadValidationHistory(method);
  const entry = changed.cases[0], generation = changed.generations[0], review = changed.sourceReviews[0];
  assert.ok(generation); assert.ok(entry); assert.ok(review); assert.ok(changed.externalProfile);
  const binding = generation.adapterBindings[0]; assert.ok(binding);
  assert.ok(Reflect.set(binding, "sha256", "changed")); assert.ok(Reflect.set(generation, "payloadCommit", "changed"));
  assert.ok(Reflect.set(entry.evidence, "resultSha256", "changed")); assert.ok(Reflect.set(entry.exclusions, 0, "changed"));
  assert.ok(Reflect.set(entry.stages, 0, "changed")); assert.ok(Reflect.set(review, "reviewedSha256", "changed"));
  assert.ok(Reflect.set(changed.externalProfile, "applicationVersion", "changed"));
  assert.deepEqual(getSdkReadValidationHistory(method), before);
  const catalogEntry = rows(queryPublicSdkReads({ method })["entries"])[0]; assert.ok(catalogEntry);
  const catalogHistory = record(catalogEntry["historicalValidation"]); assert.ok(Reflect.set(catalogHistory, "executionAuthorized", true));
  assert.deepEqual(rows(queryPublicSdkReads({ method })["entries"])[0]?.["historicalValidation"], before);
});

void test("catalog-only decoration preserves live payloads, schemas, authority and coverage counts", () => {
  const beforeCoverage = inventoryExtensionApiCoverage(), descriptors = publicSdkReadDescriptors();
  const request = { method: "eda.sys_FontManager.getFontsList", arguments: {} };
  const raw = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: ["Synthetic title"], undefinedPaths: [] };
  const beforePayload = validatePublicSdkReadPayload(raw, request);
  for (const descriptor of descriptors) {
    const catalog = queryPublicSdkReads({ method: descriptor.path, includeSchemas: true }), entry = rows(catalog["entries"])[0]; assert.ok(entry);
    const { historicalValidation, liveValidation, inputSchemaSha256, ...unchanged } = entry;
    const { liveValidation: oldLabel, ...expected } = descriptor;
    assert.deepEqual(unchanged, expected); assert.equal(oldLabel, "not-yet-validated");
    assert.equal(liveValidation, "current-generation-unclaimed;historical-cases-separate");
    assert.deepEqual(historicalValidation, getSdkReadValidationHistory(descriptor.path));
    assert.equal(inputSchemaSha256, createHash("sha256").update(JSON.stringify(descriptor.inputSchema)).digest("hex"));
    assert.equal(catalog["offline"], true); assert.equal(catalog["executionAuthorized"], false);
  }
  assert.equal(descriptors.length, 182); assert.deepEqual(publicSdkReadDescriptors(), descriptors);
  assert.deepEqual(validatePublicSdkReadPayload(raw, request), beforePayload); assert.equal(beforePayload["liveValidation"], "not-yet-validated");
  assert.equal(Object.hasOwn(beforePayload, "historicalValidation"), false);
  assert.deepEqual(inventoryExtensionApiCoverage(), beforeCoverage);
  assert.equal(extensionApiCoverageSummary(beforeCoverage)["currentGenerationLiveValidatedMethods"], 0);
  assert.equal(validatePublicSdkArguments({ request })["executionAuthorized"], false);
  assert.equal(validatePublicSdkArguments({ request: { ...request, historicalValidation: { executionAuthorized: true } } })["valid"], false);
});

void test("historical cases remain complete across bounded schema and non-schema catalog pages", () => {
  for (const includeSchemas of [false, true]) {
    const found: string[] = [], seen: string[] = [];
    let offset = 0;
    for (;;) {
      const page = queryPublicSdkReads({ includeSchemas, offset, limit: 100 });
      const entries = rows(page["entries"]);
      assert.ok(Buffer.byteLength(JSON.stringify(entries), "utf8") <= 196_608); assert.ok(Buffer.byteLength(JSON.stringify(page), "utf8") < 262_144);
      assert.equal(page["returned"], entries.length); assert.ok(entries.length > 0);
      for (const entry of entries) {
        assert.equal(typeof entry["path"], "string"); seen.push(String(entry["path"]));
        const history = record(entry["historicalValidation"]);
        found.push(...rows(history["cases"]).map((item) => String(item["id"])));
      }
      if (page["nextOffset"] === null) { break; }
      assert.equal(page["nextOffset"], offset + entries.length); offset += entries.length;
    }
    assert.deepEqual(seen.toSorted(), publicSdkReadDescriptors().map((entry) => entry.path).toSorted());
    assert.equal(new Set(seen).size, 182); assert.deepEqual(found.toSorted(), ["R01", "R02", "R03", "R04", "R05", "R06", "R07", "R08", "R09"]);
  }
});

void test("historical registry is import-free and does not resolve private evidence or current runtime identity", async () => {
  const source = await readFile(new URL("../src/sdk-read-validation-history.ts", import.meta.url), "utf8");
  const parsed = parse(stripTypeScriptTypes(source), { ecmaVersion: "latest", sourceType: "module" });
  assert.ok(parsed.body.every((statement) => statement.type !== "ImportDeclaration"));
  assert.doesNotMatch(source, /\b(?:import\s*\(|require\s*\(|fetch\s*\(|process\.|readFile\s*\(|getFingerprint\s*\()/u);
  const serialized = JSON.stringify(histories());
  assert.doesNotMatch(serialized, /(?:\/root\/|\/mnt\/|[A-Za-z]:\\|\.eprj2|resultPath|receiptPath|fontTitles)/u);
  assert.ok(histories().every((history) => !history.executionAuthorized));
});
