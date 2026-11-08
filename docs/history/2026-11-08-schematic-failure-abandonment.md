# Schematic failure cleanup publication

2026-11-08, source batch after `81cc1a81`.

The seven-record schematic writer now has its own immutable failure sidecar and
historical admission check. The released writer journal grammar remains
unchanged. A failed native allocation after allocation intent can report that no
resource was acquired. A saved-reader failure can report its separate cleanup
without adding a second writer release record to the parent journal.

The original workflow's private closure token must bind the exact preparation
and journal. Its publisher checks that binding before and after every file
operation. The sidecar distinguishes allocation never entered, allocation that
acquired no resource, helper released without a root, and original root exit
with an empty Job. It also records the separate reader closure and file-capture
release. Every outcome keeps saved, reopened, completion, restored authority,
owner transfer and replay claims false.

Historical admission checks the exact unchanged journal and all phase bytes,
its seven-record generated target and text projection, and the complete sidecar.
It clears only this historical quarantine blocker. It cannot recreate a native
owner or authorize another edit. The direct workflow preflight and global
admission scanner share that qualification and reject malformed reserved-family
journals even when they claim a completed state.

Five focused tests passed using real managed journal, phase and exclusive
sidecar publication, with explicitly inert plan/closure issuer seams. They cover
all four closure distinctions, failure after the writer's normal release, lost
publication acknowledgment without a second write, changed phase/sidecar data,
and copied tokens or changed original bindings. Both TypeScript projects and
final strict type-aware lint passed with zero warnings. Early test harness
failures from an incorrect import and missing synthetic journal sequence were
corrected while keeping the production checks intact; lint ordering/nesting
issues were also corrected.

The actual native workflow remains a separate integration and live-validation
requirement. These tests allocate no application, open no design and claim no
connected Modify, Save, inverse or persistence acceptance. Native helper and
bundle regeneration belong to the final frozen payload.
