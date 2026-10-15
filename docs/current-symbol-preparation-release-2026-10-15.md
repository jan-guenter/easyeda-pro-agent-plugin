# Symbol checkpoint preparation and startup recovery fix

Candidate `0.3.0+codex.20261015090000` integrates symbol metadata preparation into
`easyeda_control_api`. Tool counts stay 16 restricted/41 legacy, with seven
skills. No SDK coverage count or external compatibility pin changes; no writer
is enabled.

## Implemented

`project-symbol-preparation` discovers the contract,
`project-symbol-prepare-validate` checks arguments, and `project-symbol-prepare`
reads an existing hash-bound checkpoint under the managed checkpoints directory.
It verifies the complete selected linked-history branch, exact project/branch/
owner/symbol identity, supported ordinary SYMBOL metadata and peer-name
collisions. Output retains before/after name and description, unchanged tags
and template source, header/history evidence and a complete selected-branch
record hash. The actual asynchronous offline tool handler invokes it without
allocating a bridge, runtime or live admission gate.

Reads use retained managed directories and file descriptors, exact size/hash,
owner-only single-link files, sidecar refusal and post-read stability checks.
The maintained history decoder also uses nonblocking open so a substituted FIFO
cannot stall before its regular-file check. Wrapped output is limited to512KiB
without truncation. No checkpoint, artifact or journal is created, and arbitrary
original design paths are refused.

An optional explicit core projection from the current symbol reader correlates
identities and metadata. It does not authenticate supplied data or prove
freshness, hidden-editor absence, worker identity or saved/live equality. Ticket
and version are deliberately not compared: their equivalence to stored DOCHEAD
fields is not proved. Preparation remains distinct from a writer-ready or
inverse-ready plan, complete SQL comparison and persistence proof.

The control skill documents the exact workflow and limits in
[the API reference](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/api-reference.md#checkpoint-bound-symbol-preparation).

## Startup recovery defect

The installed060000 maintained recovery refused on nonempty stderr, preserving
the original intent. A bounded read-only diagnostic reproduced successful
PowerShell exit with CLIXML first-use module progress on stderr. The fixed helper
now sets `ProgressPreference` to `SilentlyContinue`; real stderr still refuses.
The new pin is2320bytes/SHA256
`8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa`.
Completed old-helper receipts remain readable, but that old hash is not accepted
for new observations.

Windows CI now redirects raw stdout/stderr and drains them concurrently under a
shared ten-second deadline. This avoids PowerShell parent deserialization hiding
the progress bytes. The check asserts zero stderr, successful child exit and
the exact observation schema. It closes handles but never kills the child.

One direct source-adapter diagnostic subsequently passed local WSL transport
and schema checks. It observed another PowerShell process and no same-name
EasyEDA process; this was not maintained recovery or launch authority. No
process was killed or adopted. The historical startup intent remains unchanged
and unresolved. Do not replay startup, alter the journal or hotpatch the loaded
060000 owner. Install normally and use a fresh Codex chat before live work.

## Verification and remaining work

Use the engineering checkpoint for final test, CI, merge and installation
evidence. The final103 focused tests pass, covering preparation, actual routing,
historical receipt readability, FIFO refusal and the bounded native adapter.
Types, zero-warning type-aware lint, dependency audits, build and repository/
package/skill checks pass. Full existing CI remains the release
gate; there is no new broad private test matrix or connected writer claim.

Remaining implementation work, in order:

1. Resolve the original interrupted startup through the maintained route when
   its process-absence prerequisites hold. Do not kill unrelated PowerShell
   processes to make recovery pass.
2. Integrate checkpoint preparation with current actor/worker/client/ticket and
   closed-target proof; add a current-version writer compiler and complete
   inverse. Metadata observations cannot supply those guarantees.
3. Adapt owned save/exit/reopen, separate post-opening baseline, complete SQL
   delta and upload-cache proof. Native opening may migrate or auto-save; Save
   still schedules a delayed structure-table job not drained by the public wait.
4. Complete one disposable rename/inverse/reopen validation before enabling the
   writer. Then extend the other seven metadata writers and schematic/symbol/PCB
   geometry transactions, including non-mutating schematic connectivity.
5. Implement the remaining library/device/3D, PCB primitive/filter/stack/rule/
   copper and manufacturing adapters recorded in the exhaustive API inventory.
   Full Pad polygons and physical stacks remain outside the current DTO.

Production designs and their records were not accessed. No project was opened,
edited, saved, restored or closed by this continuation.
