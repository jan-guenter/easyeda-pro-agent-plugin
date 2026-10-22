# PCB startup CBB contract correction

Candidate: `0.3.0+codex.20261018173500`.

The previous disposable PCB rename attempt stopped at `startup:pcb-ast`,
before the writer. Normal cleanup proved the original process terminated;
the final disposable file was byte-identical to its prelaunch state. That
attempt is retired, not retryable. The coarse error did not reveal the raw
CBB value, so this correction is not a definitive diagnosis of that invocation.

## Pinned native contract

Reviewed SCH `3.2.192.b79ad524`, SHA-256
`d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd`,
contains this raw-value path (UTF-16 offsets):

- `wb` at 5471507 overwrites its default `cbb_project` with the project response.
- `On` at 5770152 passes `i.cbb_project` to `new UG(i.uuid, i.cbb_project)`.
- `UG` at 5540867 assigns that argument directly to `this.CBB`.

The existing project preflight and writer already admit only `undefined`,
`false`, `null` or numeric zero for inactive project flags. The startup guard
instead required literal `false`, creating a deterministic inconsistency.
Its synthetic fixture also hardcoded `false`, hiding the mismatch.

The corrected guard requires an own data property and admits that same explicit
set, including negative zero because the existing contract uses numeric equality.
It does not apply Boolean coercion. `Object.is` preserves the original value
across checks, including the distinction between positive and negative zero.
Missing, inherited, accessor, string, boxed, active or changed values refuse.
The composed fixture now passes the raw project flag through its constructor.

## Diagnostics and unchanged boundaries

Eight fixed stages distinguish context, holder, manager, CBB, AST state,
AST version, pending sets and captured-state stability. No raw value or native
exception text is exposed. The decoder accepts the old coarse `pcb-ast` label
only for retained historical failures; new programs do not emit it.

AST build/pass flags, matching positive transaction IDs, modification counters,
exact owners, batch depth and pending-set checks are unchanged. The guard does
not initialize or flush native state, call convenience getters, Save, repair
designs or grant writer authority. Non-diagnostic writer/clock consumers retain
their existing lexical contracts. External compatibility pins are unchanged.

## Verification and next work

Root and independent source review agree on the raw-value contract and unchanged
native AST assumptions. Focused synthetic coverage exercises all five supported
representations, every distinct supported-value transition, getter/inheritance
refusals, fixed-stage parity and changes during the awaited composed preflight.
These are not connected execution or persistence evidence.

The release also adds a maintained read-only installed-payload verifier. It
compares the installed tree with a full checked-out Git commit, including file
bytes, executable modes and directory membership, and rejects extra entries,
symlinks and hardlinks. This replaces one-off inventory scripts; it never starts
the plugin, changes installed files or supplies runtime authority.

Release verification and installation are pending in this candidate record.
After installation, a fresh Codex session must admit the actual loaded payload
before a new disposable rename case. The remaining lifecycle requires the
writer, complete closed SQL effect, saved metadata and final closure. Safe
complete-source observation, nonempty String readers/writer, ordinary schematic
container titles and broader CAD/library/export/platform work remain backlog.
Production projects are excluded.
