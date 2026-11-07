import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { validateSdkPublicReadersFingerprint } from "./sdk-public-readers-runtime.ts";
import { CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES, currentSchematicPageReadRequestSchema, validateCurrentSchematicPageReadResult } from "./current-schematic-page-read.ts";
import { buildCurrentSchematicPageReadProgram } from "./current-schematic-page-read-program.ts";
import { CURRENT_SCHEMATIC_PAGE_READ_IMPLEMENTATION, verifyCurrentSchematicPageReadImplementation } from "./current-schematic-page-read-profile.ts";

/** Use the caller's existing serialized authenticated bridge. No controller,
 * project opening, writer allocation, arbitrary code or retry is available. */
export async function readCurrentSchematicPage(engine: SdkLocalEngine, input: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const expected = structuredClone(expectedFingerprint), request = currentSchematicPageReadRequestSchema.parse(input);
  validateSdkPublicReadersFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const status = await engine.status();
  const initial = structuredClone(status.stableFingerprint);
  validateSdkPublicReadersFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "SCH209 page expected runtime");
  await verifyCurrentSchematicPageReadImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildCurrentSchematicPageReadProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope)) > CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES) { throw new Error("SCH209_PAGE_REPLY_BOUND"); }
  const result = validateCurrentSchematicPageReadResult(request, decodeExactReadEnvelope(envelope));
  await verifyCurrentSchematicPageReadImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const after = await engine.status(); validateSdkPublicReadersFingerprint(after.stableFingerprint);
  if (canonicalJson(after.stableFingerprint) !== canonicalJson(initial)) { throw new Error("SCH209_PAGE_RUNTIME_CHANGED"); }
  const response = { ...result, runtimeAdmission: { profile: "easyeda-pro-control.schematic-page-read209-runtime.v1",
    implementation: CURRENT_SCHEMATIC_PAGE_READ_IMPLEMENTATION, fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    connectedValidation: "not-recorded", executionAuthorized: false, saveAuthorized: false } };
  if (Buffer.byteLength(JSON.stringify(response)) > CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES) { throw new Error("SCH209_PAGE_RESULT_BOUND"); }
  return response;
}
