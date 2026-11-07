import { dirname, join } from "node:path";
import { loadOperation, operationPath, readArtifact, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Text } from "./core.ts";
import type { TrackedDispatchOperationJournal } from "./engine.ts";

interface PendingPublication {
  readonly operation: TrackedDispatchOperationJournal;
  readonly baseText: string;
  readonly candidate: TrackedDispatchOperationJournal;
  readonly candidateText: string;
  readonly record?: { readonly phase: string; readonly value: unknown; readonly text: string };
}
function journalContent(value: Readonly<Record<string, unknown>>): string {
  const { journalSha256: _selfHash, ...body } = value; return canonicalJson(body);
}

/** Exact local publication for one original retained journal. It owns no
 * dispatcher, process, HMAC session, navigation or reconstructed history. */
export class GeneratedFixtureJournalPublication {
  private pendingPublication: PendingPublication | undefined;
  private readonly operation: TrackedDispatchOperationJournal;
  private readonly current: () => void;
  private readonly dependencies: GeneratedFixtureJournalPublicationDependencies;
  public constructor(operation: TrackedDispatchOperationJournal, current: () => void, dependencies: GeneratedFixtureJournalPublicationDependencies = {}) {
    this.operation = operation; this.current = current; this.dependencies = Object.freeze({ ...dependencies });
  }
  public pending(): boolean { return this.pendingPublication !== undefined; }
  private async checked<T>(call: () => Promise<T>): Promise<T> { this.current(); try { return await call(); } finally { this.current(); } }
  public async settle(): Promise<void> {
    const pending = this.pendingPublication; if (pending === undefined) { return; }
    const { operation, candidate } = pending;
    this.current();
    if (operation !== this.operation || journalContent(operation) !== pending.baseText || journalContent(candidate) !== pending.candidateText) { throw new Error("Retained fixture publication lost its original unchanged journal/candidate."); }
    const before = await this.checked(() => loadOperation(operation.operationId));
    if (![pending.baseText, pending.candidateText].includes(journalContent(before))) { throw new Error("Fixture publication differs from both original retained states."); }
    if (pending.record !== undefined) {
      const { phase, value, text } = pending.record;
      const path = join(dirname(operationPath(operation.operationId)), operation.operationId, `${String(candidate.sequence).padStart(2, "0")}-${phase}.json`);
      let descriptor;
      try {
        const existing = await this.checked(() => readArtifact(path, 0, Buffer.byteLength(text)));
        if (!existing.eof || existing.offset !== 0 || existing.size !== Buffer.byteLength(text) || existing.text !== text) { throw new Error("Original fixture phase artifact differs from its retained exact bytes."); }
        descriptor = { path, bytes: existing.size, sha256: sha256Text(text) };
      } catch (error) {
        if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") { throw error; }
        descriptor = await this.checked(() => (this.dependencies.writeArtifact ?? writePhaseArtifact)(operation.operationId, candidate.sequence, phase, value));
      }
      if (descriptor.path !== path || descriptor.bytes !== Buffer.byteLength(text) || descriptor.sha256 !== sha256Text(text)) { throw new Error("Published fixture phase artifact differs from retained bytes."); }
      const last = candidate.artifacts.at(-1);
      if (last === undefined || canonicalJson(last) !== canonicalJson(descriptor)) { throw new Error("Fixture phase artifact differs from the original candidate journal."); }
    }
    const current = await this.checked(() => loadOperation(operation.operationId));
    if (![pending.baseText, pending.candidateText].includes(journalContent(current)) || journalContent(candidate) !== pending.candidateText || journalContent(operation) !== pending.baseText) { throw new Error("Fixture retained publication changed before its original update."); }
    if (journalContent(current) === pending.baseText) { await this.checked(() => (this.dependencies.updateJournal ?? updateOperation)(candidate)); }
    const published = await this.checked(() => loadOperation(operation.operationId));
    if (journalContent(published) !== pending.candidateText || journalContent(operation) !== pending.baseText) { throw new Error("Fixture original publication did not settle to its exact retained candidate."); }
    for (const key of Object.keys(operation)) { Reflect.deleteProperty(operation, key); } Object.assign(operation, published); this.pendingPublication = undefined;
  }
  public async change(changes: Readonly<Record<string, unknown>>, record?: { phase: string; value: unknown }): Promise<void> {
    const operation = this.operation;
    if (this.pendingPublication !== undefined) { throw new Error("Settle the original retained fixture publication before recording another state."); }
    const candidate = structuredClone(operation); Object.assign(candidate, changes); candidate.updatedAt = new Date().toISOString();
    let event;
    if (record !== undefined) {
      const value: unknown = structuredClone(record.value); const text = `${JSON.stringify(value)}\n`;
      if (!/^[a-z0-9-]+$/u.test(record.phase) || Buffer.byteLength(text) > 256 * 1024) { throw new Error("Fixture retained phase exceeds its fixed name/byte bound."); }
      candidate.sequence += 1;
      const directory = dirname(operationPath(operation.operationId));
      const path = join(directory, operation.operationId, `${String(candidate.sequence).padStart(2, "0")}-${record.phase}.json`);
      candidate.artifacts.push({ path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) });
      event = { phase: record.phase, value, text };
    }
    this.pendingPublication = { operation, baseText: journalContent(operation), candidate, candidateText: journalContent(candidate), ...(event === undefined ? {} : { record: event }) };
    await this.settle();
  }
  public artifact(phase: string, value: unknown): Promise<void> {
    return this.change({}, { phase, value });
  }
}
export interface GeneratedFixtureJournalPublicationDependencies {
  readonly writeArtifact?: typeof writePhaseArtifact; readonly updateJournal?: typeof updateOperation;
}
