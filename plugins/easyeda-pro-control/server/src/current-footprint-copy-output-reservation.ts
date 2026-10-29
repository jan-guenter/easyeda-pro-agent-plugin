/** Partial retained-output reservation for the private copy lifecycle. It joins
 * original copy/SQL plans and charges slots before receipt or publication.
 * Native request, helper stdout, events and all four generations remain separate
 * prerequisites. No data budget is a native owner or writer permit. */
import { types } from "node:util";
import { sha256Text } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS } from "./current-footprint-copy-execution.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS } from "./current-footprint-copy-native-create-wire.ts";
import { reserveCurrentFootprintCopyV2Capacity } from "./current-footprint-copy-v2-capacity.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2SqlPlan } from "./current-footprint-copy-v2-sql.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const CONTROL_OVERHEAD_BYTES = 65_536;
// Existing managed JSON readers reject artifacts above64MiB. This partial
// Profile never enlarges that independent file-reader bound.
const MANAGED_ARTIFACT_BYTES = 64 * 1024 * 1024;
export type CurrentFootprintCopyOutputKind = "create-frame" | "create-result" | "rejected-frame" | "saved-frame" | "saved-observation" |
  "saved-packet" | "closed-sql" | "journal-control" | "journal-create" | "journal-saved";
interface Slot { readonly count: number; readonly bytes: number }
type Slots = Readonly<Record<CurrentFootprintCopyOutputKind, Slot>>;
export interface CurrentFootprintCopyOutputReservation {
  readonly profile: "private.current-footprint-copy-output-reservation.v1";
  readonly slots: Slots;
  readonly artifactBytes: number;
  readonly journalBytes: number;
  readonly retainedBytes: number;
  readonly journalRecords: number;
  readonly wholeWriterOutputReserved: false;
  readonly helperStdoutReserved: false;
  readonly nativeRequestsReserved: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly copy: CurrentFootprintCopyV2Plan;
  readonly sql: CurrentFootprintCopyV2SqlPlan;
}
const originals = new WeakMap<CurrentFootprintCopyOutputReservation, Original>();
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`FOOTPRINT_COPY_OUTPUT_${detail}`); }
}
function original(reservation: CurrentFootprintCopyOutputReservation): Original {
  const value = originals.get(reservation); need(value !== undefined, "ORIGINAL_RESERVATION");
  reserveCurrentFootprintCopyV2Capacity(value.copy, value.sql); return value;
}
function total(slots: readonly Slot[]): number {
  const bytes = slots.reduce((sum, slot) => sum + slot.count * slot.bytes, 0);
  need(Number.isSafeInteger(bytes) && bytes > 0, "AGGREGATE_BOUND"); return bytes;
}

/** The32 journal records include two heavy records, each consumed once.
 * The create-result record retains two serialized strings and one parsed
 * envelope, costing at most5x the native JSON bytes plus bounded metadata.
 * Saved packet strings use the modeled escaped packet bound. Other records
 * contain metadata or digests, never raw SQL, clocks or arbitrary exceptions.
 * A future issuer must use these exact classes or reserve a separate record.
 */
export function reserveCurrentFootprintCopyOutput(copy: CurrentFootprintCopyV2Plan,
  sql: CurrentFootprintCopyV2SqlPlan): CurrentFootprintCopyOutputReservation {
  const modeled = reserveCurrentFootprintCopyV2Capacity(copy, sql);
  const create = CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS;
  const controlBytes = CONTROL_OVERHEAD_BYTES + 2 * modeled.nativeArgumentsJsonBytes + 2 * Buffer.byteLength(JSON.stringify(copy));
  const slots: Slots = freezeDeep({
    "create-frame": { count: 1, bytes: create.responseFrameBytes },
    "create-result": { count: 1, bytes: create.serializedResultBytes },
    // The sole unattributed complete failure frame is retained independently
    // As base64 with byte/digest metadata. It is never a create acknowledgment.
    "rejected-frame": { count: 1, bytes: 4 * Math.ceil(create.responseFrameBytes / 3) + CONTROL_OVERHEAD_BYTES },
    "saved-frame": { count: 2, bytes: modeled.maximumSavedFrameBytes },
    "saved-observation": { count: 2, bytes: modeled.maximumSavedObservationBytes },
    "saved-packet": { count: 1, bytes: modeled.maximumSavedPacketArtifactBytes },
    "closed-sql": { count: 2, bytes: sql.maximumEncodedSqlBytes },
    "journal-control": { count: CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS.journalRecords - 2, bytes: controlBytes },
    "journal-create": { count: 1, bytes: 5 * create.serializedResultBytes + CONTROL_OVERHEAD_BYTES },
    "journal-saved": { count: 1, bytes: modeled.maximumSavedPacketArtifactBytes + CONTROL_OVERHEAD_BYTES },
  });
  need(Object.values(slots).every(slot => Number.isSafeInteger(slot.bytes) && slot.bytes > 0 && slot.bytes <= MANAGED_ARTIFACT_BYTES), "ARTIFACT_BOUND");
  const artifactBytes = total(Object.entries(slots).filter(([kind]) => !kind.startsWith("journal-")).map(([, slot]) => slot));
  const journalBytes = total(Object.entries(slots).filter(([kind]) => kind.startsWith("journal-")).map(([, slot]) => slot));
  const retainedBytes = artifactBytes + journalBytes;
  need(Number.isSafeInteger(retainedBytes), "AGGREGATE_BOUND");
  const reservation: CurrentFootprintCopyOutputReservation = freezeDeep({ profile: "private.current-footprint-copy-output-reservation.v1",
    slots, artifactBytes, journalBytes, retainedBytes, journalRecords: CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS.journalRecords,
    wholeWriterOutputReserved: false, helperStdoutReserved: false, nativeRequestsReserved: false, executionAuthorized: false });
  originals.set(reservation, { copy, sql }); return reservation;
}

/** Compare actual enclosing-issuer headroom before any write. These supplied
 * byte counts do not establish that an owner reserved or owns that storage. */
export function assertCurrentFootprintCopyOutputHeadroom(reservation: CurrentFootprintCopyOutputReservation,
  availableArtifactBytes: unknown, availableJournalBytes: unknown): void {
  original(reservation);
  for (const value of [availableArtifactBytes, availableJournalBytes]) {
    need(typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0) && value >= 0, "HEADROOM_SCALAR");
  }
  need(typeof availableArtifactBytes === "number" && availableArtifactBytes >= reservation.artifactBytes &&
    typeof availableJournalBytes === "number" && availableJournalBytes >= reservation.journalBytes, "HEADROOM");
}

export interface CurrentFootprintCopyOutputSlot { readonly profile: "private.current-footprint-copy-output-slot.v1" }
interface Ticket {
  readonly kind: CurrentFootprintCopyOutputKind;
  readonly ordinal: number;
  settled: boolean;
  text: string | null;
  bytes: number | null;
  sha256: string | null;
}
/** A slot is consumed before calling the native transport or publisher.
 * Failed receipt/publication cannot refund it. Late original replies can still
 * settle their allocated slots after another slot failed. Copies cannot do so.
 */
export class CurrentFootprintCopyOutputLedger {
  readonly #reservation: CurrentFootprintCopyOutputReservation;
  readonly #tickets = new Map<CurrentFootprintCopyOutputSlot, Ticket>();
  readonly #counts = new Map<CurrentFootprintCopyOutputKind, number>();
  #failed = false;
  public constructor(reservation: CurrentFootprintCopyOutputReservation) {
    original(reservation); this.#reservation = reservation;
  }
  public begin(kind: CurrentFootprintCopyOutputKind): CurrentFootprintCopyOutputSlot {
    original(this.#reservation);
    need(!this.#failed && typeof kind === "string" && Object.hasOwn(this.#reservation.slots, kind), "SLOT_CLASS");
    const count = this.#counts.get(kind) ?? 0, limit = this.#reservation.slots[kind];
    if (count >= limit.count) { this.#failed = true; throw new Error("FOOTPRINT_COPY_OUTPUT_SLOT_EXHAUSTED"); }
    const slot = Object.freeze({ profile: "private.current-footprint-copy-output-slot.v1" as const });
    this.#counts.set(kind, count + 1);
    this.#tickets.set(slot, { kind, ordinal: count, settled: false, text: null, bytes: null, sha256: null }); return slot;
  }
  public retain(slot: CurrentFootprintCopyOutputSlot, serialized: unknown): string {
    original(this.#reservation);
    need(!types.isProxy(slot), "ORIGINAL_SLOT");
    const ticket = this.#tickets.get(slot); need(ticket !== undefined && !ticket.settled, "ORIGINAL_SLOT");
    ticket.settled = true;
    if (typeof serialized !== "string" || !serialized.isWellFormed()) {
      this.#failed = true; throw new Error("FOOTPRINT_COPY_OUTPUT_PRIMITIVE_UTF8");
    }
    const bytes = Buffer.byteLength(serialized); ticket.bytes = bytes; ticket.sha256 = sha256Text(serialized);
    if (bytes > this.#reservation.slots[ticket.kind].bytes) {
      this.#failed = true; throw new Error("FOOTPRINT_COPY_OUTPUT_SLOT_BYTES");
    }
    // Retain the complete raw text before any caller can semantically decode it.
    ticket.text = serialized; return serialized;
  }
  public retained(slot: CurrentFootprintCopyOutputSlot): string {
    need(!types.isProxy(slot), "ORIGINAL_SLOT");
    const ticket = this.#tickets.get(slot); need(ticket?.text !== null && ticket?.text !== undefined, "ORIGINAL_RETAINED_TEXT"); return ticket.text;
  }
  public status(): Readonly<{ slotsConsumed: number; pending: number; retained: number; failed: boolean; bytes: number;
    wholeWriterOutputReserved: false; executionAuthorized: false }> {
    const tickets = [...this.#tickets.values()];
    return Object.freeze({ slotsConsumed: tickets.length, pending: tickets.filter(ticket => !ticket.settled).length,
      retained: tickets.filter(ticket => ticket.text !== null).length, failed: this.#failed,
      bytes: tickets.reduce((sum, ticket) => sum + (ticket.text === null ? 0 : ticket.bytes ?? 0), 0),
      wholeWriterOutputReserved: false, executionAuthorized: false });
  }
}
