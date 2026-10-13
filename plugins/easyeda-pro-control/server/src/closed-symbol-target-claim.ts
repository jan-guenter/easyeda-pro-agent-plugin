/** Internal permanent target reservation. No runtime, phase or completion authority. */
import { closeSync, constants, fstatSync, lstatSync, openSync, readSync } from "node:fs";
import type { BigIntStats } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive, readExactUtf8Artifact } from "./artifacts.ts";
import type { PublishedManagedAttachment } from "./artifacts.ts";
import type { ControlRootCapability, ControlRootDirectory } from "./control-root.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import type { ClosedSymbolPlan } from "./closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "./closed-symbol-native-profile.ts";
import { exactData, hashText, parseClosedSymbolValidationRequest, requireValue } from "./closed-symbol-validation-request.ts";
import type { ClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";

const PROFILE = "easyeda-pro-control.closed-symbol-validation-claim.v1";
const FAMILY = "easyeda-pro-control.project-symbol-closed-session.v1";
export const VALIDATION_ACTION_ID = "disposable-symbol-metadata-validation";
interface BoundInputs { readonly request: ClosedSymbolValidationRequest; readonly plan: ClosedSymbolPlan }
function inputs(rawRequest: unknown, rawPlan: ClosedSymbolPlan): BoundInputs {
  const request = parseClosedSymbolValidationRequest(rawRequest);
  const source = exactData(rawPlan, ["profile", "projectUuid", "branchUuid", "ownerUuid", "targetUuid", "activeUuid", "projectPath", "operation", "marker", "nativePinsSha256", "facadeSha256", "expectedFingerprintSha256"]);
  const marker = exactData(source["marker"], ["namespaceNonce", "keyNonce", "bodyNonce"]);
  const nonces = Object.freeze({ namespaceNonce: hashText(marker["namespaceNonce"]), keyNonce: hashText(marker["keyNonce"]), bodyNonce: hashText(marker["bodyNonce"]) });
  requireValue(new Set(Object.values(nonces)).size === 3, "Validation marker nonces must differ.");
  const operation = exactData(source["operation"], ["id", "action", "libraryUuid", "target", "patch"]);
  const patch = exactData(operation["patch"], ["name", "description"]), target = exactData(operation["target"], ["uuid"]);
  const plan: ClosedSymbolPlan = Object.freeze({ profile: FAMILY, projectUuid: request.target.projectUuid, branchUuid: request.target.branchUuid,
    ownerUuid: request.target.ownerUuid, targetUuid: request.target.symbolUuid, activeUuid: request.target.companionPcbUuid, projectPath: request.target.projectPath,
    operation: Object.freeze({ id: VALIDATION_ACTION_ID, action: "library.symbol.modify", libraryUuid: request.target.projectUuid,
      target: Object.freeze({ uuid: request.target.symbolUuid }), patch: request.metadata }), marker: nonces,
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: hashText(source["facadeSha256"]), expectedFingerprintSha256: hashText(source["expectedFingerprintSha256"]) });
  // Compare scalars before any serialization. Malformed data must not introduce
  // A toJSON/getter, cycle or unbounded caller tree into the canonical seal.
  for (const key of ["profile", "projectUuid", "branchUuid", "ownerUuid", "targetUuid", "activeUuid", "projectPath", "nativePinsSha256", "facadeSha256", "expectedFingerprintSha256"] as const) {
    requireValue(source[key] === plan[key], "Validation internal plan does not exactly bind the request and fixed profile.");
  }
  requireValue(operation["id"] === VALIDATION_ACTION_ID && operation["action"] === "library.symbol.modify" && operation["libraryUuid"] === request.target.projectUuid &&
    target["uuid"] === request.target.symbolUuid && patch["name"] === request.metadata.name && patch["description"] === request.metadata.description, "Validation operation does not match the fixed request.");
  return Object.freeze({ request, plan });
}
export interface ClosedSymbolTargetClaim {
  readonly profile: typeof PROFILE; readonly targetKey: string; readonly reservationPath: string;
  readonly artifact: Readonly<{ path: string; bytes: number; sha256: string }>;
  readonly requestSha256: string; readonly closedPlanSha256: string; readonly markerSha256: string;
  readonly attemptConsumed: true; readonly executionAuthorized: false; readonly completionProved: false;
}

/* oxlint-disable node/no-sync -- A fixed <=128-KiB final read and fixed-depth stats after async cleanup close the reproduced last-await gap; no arbitrary path or growing allocation. */
function sameFile(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "mode", "uid", "gid", "nlink", "size", "mtimeNs", "ctimeNs"] as const).every((key) => left[key] === right[key]);
}
function finalDirectory(path: string, device: bigint, inode: bigint, uid: bigint): void {
  const info = lstatSync(path, { bigint: true });
  requireValue(info.isDirectory() && !info.isSymbolicLink() && info.dev === device && info.ino === inode && info.mode % 512n === 0o700n &&
    info.uid === uid, "Validation reservation lineage changed.");
}
/** Bounded final check after all asynchronous cleanup. No further await or handle
 * closing callback may run between this check and returning the data receipt.
 */
function finalReservation(root: ControlRootCapability, parent: ControlRootDirectory, slot: ControlRootDirectory, artifact: PublishedManagedAttachment, expected: Buffer): void {
  requireValue(typeof process.getuid === "function", "Validation claim requires Linux UID support.");
  const uid = BigInt(process.getuid());
  const lineage = (): void => {
    finalDirectory(root.path, root.device, root.inode, uid);
    const rootInfo = fstatSync(root.handle.fd, { bigint: true });
    requireValue(rootInfo.isDirectory() && rootInfo.dev === root.device && rootInfo.ino === root.inode && rootInfo.uid === uid && rootInfo.mode % 512n === 0o700n, "Validation retained root changed.");
    finalDirectory(root.childDescriptorPath(parent.absolute), parent.info.dev, parent.info.ino, uid);
    finalDirectory(root.childDescriptorPath(slot.absolute), slot.info.dev, slot.info.ino, uid);
  };
  const boundPath = root.childDescriptorPath(artifact.path);
  lineage();
  const named = lstatSync(boundPath, { bigint: true });
  requireValue(named.isFile() && named.dev.toString() === artifact.identity.device && named.ino.toString() === artifact.identity.inode, "Validation claim named identity changed.");
  // oxlint-disable-next-line no-bitwise -- Exact retained-root child, read-only and no final symlink following.
  const descriptor = openSync(boundPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  let before: BigIntStats;
  try {
    before = fstatSync(descriptor, { bigint: true });
    requireValue(before.isFile() && before.nlink === 1n && before.mode % 512n === 0o600n && before.dev.toString() === artifact.identity.device && before.ino.toString() === artifact.identity.inode &&
      before.size === BigInt(expected.length) && before.uid === uid, "Validation claim file identity or authority changed.");
    const bytes = Buffer.alloc(expected.length + 1); let offset = 0;
    while (offset < bytes.length) {
      const count = readSync(descriptor, bytes, offset, bytes.length - offset, offset);
      if (count === 0) { break; } offset += count;
    }
    requireValue(offset === expected.length && bytes.subarray(0, offset).equals(expected) && sameFile(before, fstatSync(descriptor, { bigint: true })), "Validation claim bytes changed after publication cleanup.");
  } finally { closeSync(descriptor); }
  lineage();
  requireValue(sameFile(before, lstatSync(boundPath, { bigint: true })), "Validation claim pathname changed after final read.");
}
/* oxlint-enable node/no-sync */

/** Future index-only call. The public request has no owner-plan/hash/marker field. */
export async function claimClosedSymbolValidationTarget(rawRequest: unknown, ownerPlan: ClosedSymbolPlan): Promise<ClosedSymbolTargetClaim> {
  requireValue(typeof process.getuid === "function", "Validation claim requires Linux UID support.");
  const bound = inputs(rawRequest, ownerPlan), seal = canonicalJson(bound);
  const currentInputs = (): void => { requireValue(canonicalJson(inputs(rawRequest, ownerPlan)) === seal, "Validation claim inputs changed during publication."); };
  const targetKey = sha256Json({ profile: PROFILE, projectUuid: bound.request.target.projectUuid, symbolUuid: bound.request.target.symbolUuid });
  const parentPath = join(controlDataDirectory(), "closed-symbol-validation-claims-v1"), reservationPath = join(parentPath, targetKey);
  const closedPlanSha256 = sha256Json(bound.plan), markerSha256 = sha256Json(bound.plan.marker), requestSha256 = sha256Json(bound.request);
  const body = { profile: PROFILE, targetKey, createdAt: new Date().toISOString(), request: bound.request, plan: bound.plan,
    requestSha256, closedPlanSha256, markerSha256, expectedFingerprintSha256: bound.plan.expectedFingerprintSha256,
    attemptConsumed: true, executionAuthorized: false, completionProved: false };
  const bytes = Buffer.from(`${JSON.stringify(body)}\n`, "utf8");
  requireValue(bytes.length <= 131_072, "Validation claim exceeds its 128-KiB bound.");
  const root = await controlRootCapability(); currentInputs();
  const parent = await root.openDirectory(parentPath);
  let artifact: PublishedManagedAttachment | undefined, retainedSlot: ControlRootDirectory | undefined;
  try {
    currentInputs();
    // The directory is the permanent exclusive reservation, including absent/partial
    // Claim data. The ordinary publisher can unlink a failed file, never this slot.
    await mkdir(join(`/proc/self/fd/${parent.handle.fd}`, targetKey), { mode: 0o700 });
    await parent.handle.sync(); currentInputs();
    const slot = await root.openDirectory(reservationPath, false);
    retainedSlot = slot;
    try {
      await slot.handle.sync(); currentInputs();
      artifact = await publishManagedAttachmentExclusive(join(reservationPath, "claim.json"), "Closed-symbol permanent claim", bytes, PROFILE);
      currentInputs();
      await readExactUtf8Artifact({ path: artifact.path, bytes: artifact.bytes, sha256: artifact.sha256 });
      currentInputs();
      const finalSlot = await root.openDirectory(reservationPath, false);
      try { requireValue(finalSlot.info.dev === slot.info.dev && finalSlot.info.ino === slot.info.ino, "Validation reservation directory changed."); }
      finally { await finalSlot.handle.close(); }
      currentInputs(); await root.assertCurrent(); currentInputs();
    } finally { await slot.handle.close(); currentInputs(); }
  } finally { await parent.handle.close(); currentInputs(); }
  requireValue(artifact !== undefined && retainedSlot !== undefined, "Validation claim publication did not finish.");
  finalReservation(root, parent, retainedSlot, artifact, bytes); currentInputs();
  return Object.freeze({ profile: PROFILE, targetKey, reservationPath, artifact: Object.freeze({ path: artifact.path, bytes: artifact.bytes, sha256: artifact.sha256 }),
    requestSha256, closedPlanSha256, markerSha256, attemptConsumed: true, executionAuthorized: false, completionProved: false });
}
