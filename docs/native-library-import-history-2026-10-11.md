# Imported library history: preserved atom headers

The parser and consumer work below passed source review and offline checks,
not connected lifecycle acceptance. Installed `0.3.0+codex.20261011071500`
does not contain this extension. Publication and installation progress is
recorded separately in the [release report](imported-library-peers-release-2026-10-11.md).

An observed native Paste imported library assets before placing any component.
The page remained unchanged, but the imported symbol and footprint histories
contained `firstTicket` fields that the maintained decoder did not support.
This is a saved-history format issue, not proof that Paste placed a component
or that a schematic writer completed.

## Source basis

The reviewed project worker is `pro-mgr/3.2.148.154949d9/js/project-worker.js`,
SHA-256 `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949`.
Its parser forwards `firstTicket` separately from physical ticket and client;
the serializer preserves explicit zero as distinct from an absent field.
Physical ticket/client ordering still chooses the latest whole record body.

The ordinary-atom first-clock helper, the META-specific helper and the cold
serializer's ordering key are not interchangeable. In particular, a nullish
fallback preserves explicit zero while a truthy fallback does not. The new
reader does not infer an original client, replace physical ordering with the
smallest serialized value, or reuse this field as schematic display order.
Synthetic tests replay the pinned parser, serializer and clock helper bodies.

## Narrow admission

`readNativeHistoryCheckpoint` and its materializer have an internal
`libraryAtomHeaders: "preserve"` option. The default remains strict, as does
`parseNativeRecords`, which is also used by live-source consumers that do not
retain atom headers. There is no MCP argument that enables the option globally.

The extension admits nonnegative safe-integer `firstTicket` values no greater
than the physical ticket, only on ordinary atoms in SYMBOL and FOOTPRINT
documents. Negative zero, extra keys, duplicate JSON keys and unsupported
documents refuse. EDIT_HEAD, DOCHEAD, META and DELETE_DOC markers remain
excluded. Tombstoned ordinary atoms retain their header evidence.

When any atom in a document has the field, a checkpoint-bound supplemental
proof commits every atom occurrence in that document: chunk/record positions,
identity, type, physical clock, effective client and its source, exact raw
header and body-encoding hashes, semantic body hash, explicit field presence
and tombstone state. Contradictory repeated physical clocks refuse even when
later revisions would otherwise hide them. Existing semantic records and
legacy no-field hashes retain their previous meaning.

Duplicate physical clocks compare canonical body semantics, preserving the
legacy body's comparison rules. Exact header/body encodings are committed
separately. Thus accepting an identical repeated record during materialization
does not make an added history occurrence invisible to an unchanged-peer check.

These SHA-256 commitments detect mismatches; they are not signatures or
independent evidence against someone who can rewrite the checkpoint and proof.
The cooperative producer freezes its proof and brands that exact in-process
object. Consumers can verify its binding without synchronously rehashing a
large occurrence list. A deserialized or cloned proof never gains that brand;
the original independently verified checkpoint must be read again. This
optimization is not an authenticity or write-authorization mechanism.

## Consumer boundary

### Existing-project navigation

Existing-project navigation from Start Page may open
an ordinary schematic page or PCB only after checkpoint/registry membership
checks. It retains compact per-document header commitments alongside the
immutable checkpoint, recomputes them for reconciliation, and still requires
complete logical SQLite and materialized-record invariance after navigation.
No source record or table is exempted from that comparison.

### Flat diagnostic and sealed display-only transactions

The flat-topology observer reads the complete checkpoint with preserved library
headers, retains a compact header summary and proves complete SQLite invariance
throughout its two observations. Its public result still reports
`transactionTopology:false`. Diagnostic output is not caller-supplied authority
for a transaction.

The existing single-page display-only workflow has two sealed profiles:

- `easyeda-pro-control.flat-display-transaction.v1` retains its legacy shape
  and rejects imported-header proofs.
- `easyeda-pro-control.flat-display-transaction.v2` is selected internally only
  when a fresh maintained checkpoint contains the supported imported library
  peers. It permits exactly the same stored `sch.attribute.display` and
  `sch.text.display` changes, not library writes or electrical changes.

The v2 plan binds the original operation and inverse, context, checkpoint,
complete document membership, source/native state and flat endpoint topology.
Its `libraryHeaders` seal commits each imported SYMBOL/FOOTPRINT document's
identity, type, occurrence count and ordered occurrence hash. Every occurrence
in those documents is covered, including absent-field atoms and tombstones.
All peer bodies still have to match the ordinary complete-record proof.

Before apply, inverse, Save and recovery acceptance, maintained readers compare
fresh evidence with that original seal. Durable checks reread the original
immutable checkpoint as well as the current checkpoint. A compact summary's
profile, complete fields, per-document proof digests and whole-summary digest
must agree with the freshly generated proofs. A summary alone cannot admit an
imported peer or replace a missing checkpoint.
Each imported-peer verification artifact retains that fresh compact summary
alongside its checkpoint and original binding hash; legacy artifacts gain no
new field.

Different SQLite backup bytes are not themselves a peer change: each proof
binds its own checkpoint hash, while the peer seal compares the exact ordered
occurrences independently of that outer file hash. Compaction, reordering,
removed tombstones, appended duplicate occurrences and raw encoding changes
still fail the unchanged-peer check, even with identical final semantic bodies.
These cases require investigation, not a new baseline or proof normalization.

The shared recovery helper remains strict unless existing-project navigation
or an already validated v2 journal explicitly supplies the internal option.
Generic design transactions, library geometry recovery, DEVICE writes and live
source parsing do not inherit it. There is no public parser switch, caller
profile override or arbitrary-code route. The extension does not authorize
another Paste, placement, wire, Save or library edit. Normal task authority,
one-shot intent and no-repeat Save rules remain in force.

## Validation status

Source and integration tests cover strict-default refusal, imported-header
preservation, stale conflicts, exact-byte commitments, tombstones, cross-document
scope, checkpoint binding, complete unchanged-project proof and corrupt evidence.
Adversarial flat tests cover v1 compatibility, sealed operation/context and
summary substitution, missing/cloned/transplanted proofs, multiple imported
peers, explicit zero, compaction/replay and header-only drift with equal semantic
hashes. Synthetic encrypted-SQLite coordinator tests exercise the lifecycle
without dispatching to EasyEDA. Final combined counts belong in the release
report after the implementation is frozen.

One independently reviewed, source-pinned helper has decoded only retained
immutable checkpoints with the maintained opt-in reader. It proves that all
nine prior documents and 70 records are unchanged; exactly three library assets
add 19 symbol, 46 footprint and one DEVICE record, with two DEVICE reference
remaps. The result has 12 documents and 136 records, plus 66 preserved symbol/
footprint atom occurrences containing all 12 `firstTicket` fields and the old
LINE tombstone. The default reader still refuses that history. The earlier raw
diagnostic is retained for comparison, not used as parser input or authority.

That original disposable fixture remains import-only: no electrical component
was placed, its page stayed unchanged, Escape ended the placement tool and no
Save followed the one Paste. Native persistence of imported assets is not a
completed electrical fixture. It proves neither nonempty flat topology nor an
imported-peer writer lifecycle. New connected project-open, diagnostic and v2
acceptance require a separately installed generation and disposable validation;
offline decoding cannot supply those claims.
