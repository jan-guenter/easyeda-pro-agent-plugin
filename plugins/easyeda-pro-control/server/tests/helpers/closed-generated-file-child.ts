/** Synthetic original transport only. No Windows file/process/application API. */
import { createInterface } from "node:readline";

const [nonce, windowsPath, sha256, bytesRaw, mode] = process.argv.slice(2);
const observation = { leaseId: "a".repeat(32), windowsPath, parentDirectory: windowsPath?.slice(0, windowsPath.lastIndexOf("\\")),
  directoryIdentity: `${"1".repeat(8)}:${"2".repeat(16)}`, fileIdentity: `${"1".repeat(8)}:${"3".repeat(16)}`, sha256, bytes: Number(bytesRaw),
  createdEpochMs: 1000, modifiedEpochMs: 2000, watchState: "pending", privateDirectoryOwnerVerified: true, readOnlyFileLease: true, oldRuntimeAdopted: false };
let malformedEmitted = false;
function reply(requestId?: number, released = false): void {
  if (mode === "malformed-inspect" && requestId !== undefined && !released && !malformedEmitted) { malformedEmitted = true; process.stdout.write("{invalid-json\n"); return; }
  let watchState = "pending"; if (released) { watchState = "cancelled-no-changes"; } else if (mode === "watch-failed" && requestId !== undefined) { watchState = "completed"; }
  process.stdout.write(`${JSON.stringify({ schema: /\\Codex_(?:circular_smt_pad|schematic_relevance)_/u.test(windowsPath ?? "") && mode !== "wrong-schema" ? "easyeda-pro-control.closed-generated-alternative-file-lease.v1" : "easyeda-pro-control.closed-generated-file-lease.v1", nonce, state: released ? "released" : "held",
    observation: { ...observation, ...(mode === "identity-drift" && requestId !== undefined ? { fileIdentity: `${"1".repeat(8)}:${"4".repeat(16)}` } : {}),
      watchState },
    ...(requestId === undefined ? {} : { requestId }), originalHandlesClosed: released, filesDeleted: false })}\n`);
}
reply(); const lines = createInterface({ input: process.stdin });
lines.on("line", (line: string) => { const request: unknown = JSON.parse(line);
  if (request === null || typeof request !== "object" || !("id" in request) || typeof request.id !== "number" || !("action" in request) || typeof request.action !== "string") { throw new Error("Synthetic request shape"); } if (request.action === "release") {
  if (mode !== "lost-release-reply") { reply(request.id, true); if (mode === "malformed-after-release") { process.stdout.write("{invalid-json\n"); } } lines.close(); process.stdin.destroy();
} else { reply(request.id); } });
