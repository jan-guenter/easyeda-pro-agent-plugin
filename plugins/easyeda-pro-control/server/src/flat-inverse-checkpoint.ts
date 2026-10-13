import { dirname, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, readArtifact } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import { canonicalJson, normalizeEasyedaProjectPath } from "./core.ts";

const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const receiptSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), source: z.string(), checkpoint: z.string(),
  receiptPath: z.string(), receiptSha256: digest, sourceSha256: digest, checkpointSha256: digest,
  sourceDumpSha256: digest, checkpointDumpSha256: digest }).catchall(z.unknown());

/** Recheck the retained flat observation's actual SQLite files after dispatch
 * authority awaits, immediately before callTool. Never create a new baseline.
 * Native autosave can still race a later instruction; terminal restoration
 * remains mandatory and no claim of an atomic filesystem/native CAS is made.
 */
export async function verifyFlatInverseCheckpoint(checkpoint: unknown, source: string): Promise<void> {
  const expected = receiptSchema.parse(checkpoint), expectedSource = normalizeEasyedaProjectPath(source);
  if (normalizeEasyedaProjectPath(expected.source) !== expectedSource) { throw new Error("Flat inverse checkpoint belongs to another source."); }
  const raw = await readArtifact(expected.receiptPath, 0, 65_536);
  const retained: unknown = JSON.parse(raw.text);
  if (!raw.eof || canonicalJson(retained) !== canonicalJson(expected)) { throw new Error("Flat inverse checkpoint receipt changed after preflight."); }
  const verified = await verifyCheckpoint(expected.receiptPath, { expectedSource, controlRoot: await controlRootCapability(),
    artifactRoots: [join(dirname(expectedSource), "backups"), join(controlDataDirectory(), "checkpoints")] });
  const fields = ["receiptPath", "source", "checkpoint", "sourceSha256", "checkpointSha256", "sourceDumpSha256", "checkpointDumpSha256"] as const;
  if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt ||
      fields.some((field) => verified[field] !== expected[field])) {
    throw new Error("Flat inverse durable baseline changed immediately before dispatch; no inverse was dispatched.");
  }
}
