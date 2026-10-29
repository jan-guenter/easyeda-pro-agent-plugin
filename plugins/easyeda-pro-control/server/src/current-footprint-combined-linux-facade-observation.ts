/** Conservative metadata-only exclusion. Conflict stubs also block; never signal them. */
import { constants } from "node:fs";
import { open, readFile, readdir } from "node:fs/promises";
import { posix } from "node:path";

function gone(error: unknown): boolean { return error instanceof Error && "code" in error && (error.code === "ENOENT" || error.code === "ESRCH"); }
function refused(): Error { return new Error("COMBINED_RECOVERY_LINUX_PROCESS_OBSERVATION_REFUSED"); }
async function start(pid: string): Promise<string> {
  const text = await readFile(`/proc/${pid}/stat`, "utf8"); const end = text.lastIndexOf(")");
  const fields = text.slice(end + 2).split(" "); const value = fields[19];
  if (end === -1 || value === undefined || !/^[0-9]+$/u.test(value)) { throw refused(); } return value;
}
export async function observeOtherCurrentFootprintCombinedLinuxFacade(): Promise<boolean> {
  if (process.platform !== "linux") { throw refused(); }
  const entries = await readdir("/proc", { withFileTypes: true }); if (entries.length > 8192) { throw refused(); }
  for (const entry of entries) {
    // oxlint-disable-next-line no-continue -- Kernel metadata and the current observer cannot be another delayed facade owner.
    if (!entry.isDirectory() || !/^[1-9][0-9]*$/u.test(entry.name) || entry.name === String(process.pid)) { continue; }
    try {
      const before = await start(entry.name);
      // Do not prefilter executable names: an unlinked Node image has a
      // Kernel deletion suffix, and a pinned runtime may use a custom basename.
      // Read only a bounded argv prefix. Configured facade entrypoints precede
      // Any arguments; truncated process argv cannot establish safe absence.
      const file = await open(`/proc/${entry.name}/cmdline`, constants.O_RDONLY);
      let bytes: Buffer;
      try { bytes = Buffer.alloc(16_385); const result = await file.read(bytes, 0, bytes.length, 0); bytes = bytes.subarray(0, result.bytesRead); }
      finally { await file.close(); }
      if (bytes.length > 16_384) { throw refused(); }
      const argumentsList = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\0");
      // A checkout may end exactly at its plugin root, and an installed entry
      // Can live under another directory name. Conservatively recognize the
      // Fixed trailing entry path without a root-name or executable filter.
      const facadeEntry = argumentsList.some(argument => {
        const normalized = posix.normalize(argument);
        return normalized === "server/dist/server.mjs" || normalized.endsWith("/server/dist/server.mjs");
      });
      if (before !== await start(entry.name)) { throw refused(); }
      if (facadeEntry) { return true; }
    } catch (error) { if (!gone(error)) { throw error; } }
  }
  return false;
}
