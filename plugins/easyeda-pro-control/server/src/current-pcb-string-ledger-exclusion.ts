/** Every dormant String journal remains unresolved until a separately issued
 * native lifecycle completion exists. There is deliberately no JSON-based
 * terminal exception, caller-selected operation exclusion or recovery bypass. */
import { opendir } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";

export const CURRENT_PCB_STRING_LEDGER_DIRECTORY = "pcb-string-dormant-lifecycle-v1";
const MAX_OPERATIONS = 1024;
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`PCB_STRING_LEDGER_EXCLUSION: ${detail}`); }
}
function missing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
/** Descriptor-bound roster only. Even an empty or corrupt child is unresolved;
 * record content cannot cause this scanner to grant permission. */
export async function readCurrentPcbStringLedgerReservations(): Promise<readonly string[]> {
  const root = await controlRootCapability(false);
  const parent = await root.openDirectory(join(controlDataDirectory(), CURRENT_PCB_STRING_LEDGER_DIRECTORY), false)
    .catch((error: unknown) => { if (missing(error)) { return null; } throw error; });
  if (parent === null) { await root.assertCurrent(); return Object.freeze([]); }
  try {
    const before = await parent.handle.stat({ bigint: true }), result: string[] = [];
    const directory = await opendir(`/proc/self/fd/${String(parent.handle.fd)}`);
    for await (const entry of directory) {
      need(result.length < MAX_OPERATIONS, "operation bound exceeded");
      need(entry.isDirectory() && /^string-ledger-[a-z0-9][a-z0-9_-]{0,63}$/u.test(entry.name), "unknown reservation");
      result.push(entry.name);
    }
    const after = await parent.handle.stat({ bigint: true });
    need(before.dev === after.dev && before.ino === after.ino && before.mtimeNs === after.mtimeNs &&
      before.ctimeNs === after.ctimeNs, "reservation roster changed");
    const current = await root.openDirectory(parent.absolute, false);
    try { need(current.info.dev === before.dev && current.info.ino === before.ino, "reservation parent changed"); }
    finally { await current.handle.close(); }
    await root.assertCurrent(); return Object.freeze(result.toSorted());
  } finally { await parent.handle.close(); }
}
export async function assertNoUnresolvedCurrentPcbStringLedgers(): Promise<void> {
  const operations = await readCurrentPcbStringLedgerReservations();
  need(operations.length === 0, "unresolved String lifecycle");
}
