import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readExactUtf8Artifact } from "./artifacts.ts";
import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { EDITOR_OBSERVATION_209_UI, verifyEditorObservation209Ui } from "./editor-observation209-profile.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { NETLIST_FILES_FORMAT, NETLIST_FILES_MAX_RESULT_BYTES, netlistCompareFilesRequestSchema,
  netlistPrepareFileRequestSchema, parseNetlistFileText } from "./netlist-files.ts";
import { buildNetlistFilesProgram, validateNetlistFilesResult } from "./netlist-files-program.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE, selectSdkPublicUtilitiesRuntimeProfile } from "./sdk-public-utilities-profile.ts";

/** Caller text becomes one exclusive managed artifact. No caller-selected
 * destination, external read, app call, exporter or design file is involved.
 */
export async function prepareNetlistFile(input: unknown): Promise<Record<string, unknown>> {
  const request = netlistPrepareFileRequestSchema.parse(input);
  const model = parseNetlistFileText(request.text);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "netlist-inputs"));
  const artifact = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.tel`), "Prepared netlist input",
    Buffer.from(request.text, "utf8"), "netlist-input");
  return { offline: true, localArtifactWritten: true, executionAuthorized: false,
    file: { schema: "easyeda-pro-control.netlist-file.v1", format: NETLIST_FILES_FORMAT, name: request.name,
      path: artifact.path, bytes: artifact.bytes, sha256: artifact.sha256 },
    summary: { componentCount: model.componentCount, pinCount: model.pinCount, netCount: model.netCount } };
}

function require209(fingerprint: unknown): void {
  if (selectSdkPublicUtilitiesRuntimeProfile(fingerprint) !== SDK_PUBLIC_UTILITIES_209_PROFILE) {
    throw new Error("Netlist File comparison requires the exact reviewed 3.2.209 runtime.");
  }
}

/** Existing serialized authenticated bridge only. Complete ASCII inputs are
 * independently checked before their sole public File/File comparison program.
 */
export async function compareNetlistFiles(engine: SdkLocalEngine, input: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const expected = structuredClone(expectedFingerprint), request = netlistCompareFilesRequestSchema.parse(input);
  require209(expected);
  const left = await readExactUtf8Artifact(request.left), right = await readExactUtf8Artifact(request.right);
  const program = buildNetlistFilesProgram(request, left.text, right.text);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  require209(initial); assertExpectedFingerprint(initial); assertSubset(initial, expected, "Netlist comparison expected runtime");
  await verifyEditorObservation209Ui(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", { code: program, timeoutMs: 60_000, confirmWrite: true }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > NETLIST_FILES_MAX_RESULT_BYTES) { throw new Error("Netlist comparison reply exceeds its byte bound."); }
  const result = validateNetlistFilesResult(request, left.text, right.text, decodeExactReadEnvelope(envelope));
  await verifyEditorObservation209Ui(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const final = finalStatus.stableFingerprint;
  require209(final);
  if (canonicalJson(final) !== canonicalJson(initial)) { throw new Error("Netlist comparison runtime changed around execution."); }
  const response = { ...result, inputs: { left: request.left, right: request.right }, runtimeAdmission: {
    profile: "easyeda-pro-control.netlist-files-runtime-209.v1", fingerprintSha256: sha256Json(initial), uiImplementation: EDITOR_OBSERVATION_209_UI,
    beforeAndAfterChecked: true, liveValidation: "not-recorded" } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > NETLIST_FILES_MAX_RESULT_BYTES) { throw new Error("Netlist comparison result exceeds its byte bound."); }
  return response;
}
