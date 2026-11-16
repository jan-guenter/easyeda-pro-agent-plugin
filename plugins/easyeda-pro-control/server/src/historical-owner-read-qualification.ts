/** A private read comparison for the reviewed root-to-one capsule only.
 * It changes no recorded identity, file authority, publisher or native owner. */
import { constants } from "node:fs";
import { open, readlink, stat } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";

const PROFILE = "private.historical-owner-namespace-read-qualification.v1";
function need(value: boolean): asserts value { if (!value) { throw new Error("Historical owner namespace read qualification refused."); } }
function reviewedMap(text: string): boolean { return /^[ \t]*1[ \t]+0[ \t]+1[ \t]*\n$/u.test(text); }
function reviewedCredentials(text: string): boolean {
  const lines = text.split("\n");
  return ["Uid", "Gid"].every(key => {
    const rows = lines.filter(line => line.startsWith(`${key}:`));
    return rows.length === 1 && new RegExp(`^${key}:[ \\t]+1[ \\t]+1[ \\t]+1[ \\t]+1[ \\t]*$`, "u").test(rows[0] ?? "");
  }) && ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"].every(key => {
    const rows = lines.filter(line => line.startsWith(`${key}:`));
    return rows.length === 1 && new RegExp(`^${key}:[ \\t]+0{16}[ \\t]*$`, "u").test(rows[0] ?? "");
  });
}
async function procText(path: string, maximum: number): Promise<string> {
  // oxlint-disable-next-line no-bitwise -- Only fixed regular proc leaves are opened, without following a substituted final symlink or blocking special file.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const bytes = Buffer.alloc(maximum + 1); let ended = false, offset = 0;
    while (offset < bytes.length && !ended) { const part = await file.read(bytes, offset, bytes.length - offset, offset); offset += part.bytesRead; ended = part.bytesRead === 0; }
    need(ended && offset > 0 && offset <= maximum);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, offset));
  } finally { await file.close(); }
}
function namespaceIdentity(value: Readonly<{ dev: bigint; ino: bigint }>): string { return `${String(value.dev)}:${String(value.ino)}`; }

/** Minted from this process's retained original namespace; JSON cannot create
 * its private state. The lifetime bounds a comparison, never admission reuse. */
export class HistoricalOwnerReadQualification {
  readonly #namespace: FileHandle;
  readonly #identity: string;
  readonly #name: string;
  #closed = false;

  private constructor(namespace: FileHandle, identity: string, name: string) { this.#namespace = namespace; this.#identity = identity; this.#name = name; }

  /** Read the original descriptor before inspecting maps or credentials. */
  public static async open(): Promise<HistoricalOwnerReadQualification> {
    const namespace = await open("/proc/self/ns/user", constants.O_RDONLY);
    try {
      const identity = namespaceIdentity(await namespace.stat({ bigint: true })), name = await readlink("/proc/self/ns/user");
      need(/^user:\[[1-9][0-9]*\]$/u.test(name));
      const qualification = new HistoricalOwnerReadQualification(namespace, identity, name);
      await qualification.assertCurrent(); return qualification;
    } catch (error) { await namespace.close(); throw error; }
  }

  /** A private cache discriminator, with no authority or executable selector. */
  public binding(): string { need(!this.#closed); return `${PROFILE}:${this.#identity}:${this.#name}:uid=1:0:1;gid=1:0:1`; }

  /** Translate only a freshly authority-checked local owner, never overflow or
   * another file owner. Every other identity field remains unchanged. */
  public originalUid(value: bigint): bigint { need(!this.#closed && value === 1n); return 0n; }
  public originalGid(value: bigint): bigint { need(!this.#closed && value === 1n); return 0n; }

  /** Project only the fixed eight-field historical fstat tuple after its
   * original reader has proved current local ownership and complete identity. */
  public originalUidTuple(value: string): string {
    need(!this.#closed && value.length <= 1024);
    const fields = value.split(":"); need(fields.length === 8 && fields.every(field => /^(?:0|[1-9][0-9]{0,63})$/u.test(field)));
    const uid = fields[3]; need(uid !== undefined); fields[3] = String(this.originalUid(BigInt(uid))); return fields.join(":");
  }

  /** Prove the retained namespace and exact credentials/maps on both sides of
   * asynchronous reads. All capabilities remain absent, including the bound. */
  public async assertCurrent(): Promise<void> {
    need(!this.#closed && process.platform === "linux" && process.getuid?.() === 1 && process.geteuid?.() === 1 && process.getgid?.() === 1 && process.getegid?.() === 1);
    need(namespaceIdentity(await this.#namespace.stat({ bigint: true })) === this.#identity && namespaceIdentity(await stat("/proc/self/ns/user", { bigint: true })) === this.#identity && await readlink("/proc/self/ns/user") === this.#name);
    need(reviewedMap(await procText("/proc/self/uid_map", 4096)) && reviewedMap(await procText("/proc/self/gid_map", 4096)) && reviewedCredentials(await procText("/proc/self/status", 65_536)));
    need(!this.#closed && namespaceIdentity(await this.#namespace.stat({ bigint: true })) === this.#identity && namespaceIdentity(await stat("/proc/self/ns/user", { bigint: true })) === this.#identity && await readlink("/proc/self/ns/user") === this.#name &&
      process.getuid?.() === 1 && process.geteuid?.() === 1 && process.getgid?.() === 1 && process.getegid?.() === 1);
  }

  /** Consume and close only this original proc descriptor. */
  public async close(): Promise<void> { need(!this.#closed); this.#closed = true; await this.#namespace.close(); }
}
