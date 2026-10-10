/* oxlint-disable import/max-dependencies -- Compose the existing checkpoint, profile, scope and transport guards rather than duplicating their contracts. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory } from "./artifacts.ts";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { verifySchematicNativeProfile } from "./native-profiles.ts";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";
import { deriveSchematicLayoutPageLoadScope } from "./schematic-layout-page-load.ts";
import { buildSchematicFlatTopologyExpression, verifySchematicFlatTopology } from "./schematic-flat-topology.ts";
import { wrapWithContextGuard } from "./runtime-scripts.ts";
import { assertUnchangedLibraryCheckpoint } from "./library-checkpoint.ts";

const services = { readNativeHistoryCheckpoint, verifySchematicNativeProfile, verifyDeviceAssociationNativeProfile };
type Host = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertContext" | "checkpoint" | "upstream">;
const checkpointHash = z.string().regex(/^[a-f0-9]{64}$/u);
const fileIdentity = z.object({ birthtimeNs: z.string().min(1), ctimeNs: z.string().min(1), dev: z.string().min(1), ino: z.string().min(1) });
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.string().min(1),
  source: z.string().min(1), checkpoint: z.string().min(1), sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity,
  sourceSha256: checkpointHash, checkpointSha256: checkpointHash, sourceDumpSha256: checkpointHash,
  checkpointDumpSha256: checkpointHash, receiptSha256: checkpointHash, receiptPath: z.string().min(1) }).catchall(z.unknown());

/** A separate diagnostic profile, never a replacement for historical compiled
 * transaction topology. The complete saved project supplies page membership;
 * every page must already be loaded. No navigation, annotation or Save occurs.
 * Service overrides are internal test seams, not MCP request fields.
 */
export async function readSchematicFlatTopology(engine: Host, expectedContext: ExpectedContext,
  overrides: Partial<typeof services> = {}): Promise<Record<string, unknown>> {
  if (expectedContext.document.documentType !== 1) { throw new Error("Flat topology requires an active schematic page."); }
  const dependencies = { ...services, ...overrides };
  await engine.assertBridgeDispatchAllowed();
  const bundles = await engine.upstream.installedEasyedaBundles?.();
  if (bundles === undefined) { throw new Error("Flat topology requires the reviewed native schematic and project implementations."); }
  const profile = async (): Promise<void> => {
    await dependencies.verifySchematicNativeProfile(bundles.assetsRoot);
    await dependencies.verifyDeviceAssociationNativeProfile(bundles.assetsRoot);
  };
  await profile();
  const context = await engine.assertContext(structuredClone(expectedContext));
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = checkpointSchema.parse(await engine.checkpoint({ source: context.project.path,
    outputDir, label: "flat-topology-membership" }));
  const unchanged = async (): Promise<void> => {
    const proof = await engine.checkpoint({ receiptPath: checkpoint.receiptPath });
    assertUnchangedLibraryCheckpoint(proof, checkpoint, "Flat topology requires unchanged complete checkpoint membership throughout the read.");
  };
  await unchanged();
  const projectUuid = context.project.uuid ?? context.project.projectUuid;
  if (typeof projectUuid !== "string") { throw new TypeError("Flat topology project identity is absent."); }
  const history = await dependencies.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid });
  const binding = deriveSchematicLayoutPageLoadScope(context, history);
  const scope = { projectUuid: binding.projectUuid, schematicUuid: binding.schematicUuid,
    activePageUuid: binding.activePageUuid, activeTabId: binding.activeTabId, pageIds: binding.pageUuids };
  const expression = buildSchematicFlatTopologyExpression(scope);
  const code = wrapWithContextGuard(`
const expected=${JSON.stringify(scope)};
const declared=async()=>{
 const schematic=await eda.dmt_Schematic.getCurrentSchematicInfo();
 if(schematic?.uuid!==expected.schematicUuid||schematic.parentProjectUuid!==expected.projectUuid||!Array.isArray(schematic.page)||schematic.page.length!==expected.pageIds.length)throw new Error('SCH_FLAT_SCOPE');
 const ids=schematic.page.map(page=>{if(typeof page?.uuid!=='string'||page.parentSchematicUuid!==expected.schematicUuid||(page.parentProjectUuid!==undefined&&page.parentProjectUuid!==expected.projectUuid))throw new Error('SCH_FLAT_SCOPE');return page.uuid;}).sort();
 if(new Set(ids).size!==ids.length||JSON.stringify(ids)!==JSON.stringify(expected.pageIds))throw new Error('SCH_FLAT_SCOPE');
};
await declared();
const payload=${expression};
await declared();
const json=JSON.stringify(payload),utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:'easyeda-pro-control.exact-json.v1',utf8Bytes,json};
if(new TextEncoder().encode(JSON.stringify(envelope)).byteLength>4194304)throw new Error('SCH_FLAT_TRANSPORT_BOUND');
return envelope;`, context);
  const observe = async (): Promise<ReturnType<typeof verifySchematicFlatTopology>> => {
    await engine.assertBridgeDispatchAllowed();
    await engine.assertContext(context);
    await unchanged();
    const raw = await engine.upstream.callTool("easyeda_execute", { code, timeoutMs: 60_000, confirmWrite: true }, 70_000);
    assertUpstreamReplySettled(raw);
    const payload = decodeExactReadEnvelope(extractToolPayload(raw));
    const proof = verifySchematicFlatTopology(payload);
    if (payload === null || typeof payload !== "object" || !("scope" in payload) || canonicalJson(payload.scope) !== canonicalJson(scope)) {
      throw new Error("Flat topology response substituted its checkpoint-bound scope.");
    }
    await engine.assertContext(context);
    await unchanged();
    return proof;
  };
  const first = await observe(), second = await observe();
  await profile();
  await unchanged();
  await engine.assertContext(context);
  if (canonicalJson(first) !== canonicalJson(second)) { throw new Error("Flat topology changed between complete observations."); }
  const result = { ok: true, kind: "schematic-flat-topology", documentType: 1, ...second,
    membership: { source: "complete-project-checkpoint", checkpointSha256: checkpoint.checkpointSha256, receiptPath: checkpoint.receiptPath },
    currentGenerationLiveValidated: false, transactionTopology: false };
  return { ...result, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(result),
    contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } };
}
