# Original schematic rename closure and SQL baseline

The private SCH lifecycle now has a callable baseline coordinator and cleanup
path. It consumes only the original schematic opening owner, never a PCB or
symbol owner. It is not registered as an MCP operation and does not enable
schematic renaming. No live application action was performed for this change.

## Implemented

`current-schematic-rename-baseline-runtime.ts` journals capture intent before
acquiring the original closed-session capture in the opening's authenticated
session. It retains the process and Job bindings before fallible publication
or scope-exit checks. A failed opening transfer can enter cleanup but cannot
be promoted to a completed transfer or SQL baseline.

The coordinator consumes one normal-close attempt before window observation.
It retains the original close acknowledgment even when later publication fails.
Only a pending termination observation can be polled again. Once original
root and Job termination are proved, the successful path captures its baseline.
The cleanup path releases the original capture without accepting a baseline,
repeating a close, copying SQL or claiming unchanged effects. Failed evidence
publication preserves the existing journal and in-memory handles.

`current-schematic-rename-owner-baseline.ts` creates a closed checkpoint and
separate raw copy, then runs the maintained complete SQL reader. It checks
source/checkpoint identity, original termination authority, exact reader
completion and complete history. The retained opening's PCB UUID is not used
as the schematic UUID. Project and branch must match the opening; the distinct
schematic and owner must match the complete closed SQL history.

Before issuing a baseline, it obtains both original SCH metadata and child-roster
projections from that exact completed reader. This includes complete schematic
peer metadata, name availability, ordinary child membership and ordering,
structure equality and the existing exclusions for linked/reuse content,
child-derived clocks and reparenting. Copies of a valid projection, capture,
termination proof, SQL inventory or baseline do not reproduce their issuers.

The baseline retains complete SQL and unknown opening effects rather than
asserting that ordinary opening left the project unchanged. Historical access
keeps the original identities after capture retirement. Live revalidation still
requires the original held closure, source bytes, checkpoint, raw copy and
reader. A separate closed-clock evidence function also rejects SQLite sidecars;
it is not itself a Windows clock observer or qualification.

Only a successful retained coordinator can issue its private one-use closed
continuation. Claiming it atomically consumes that token before any await.
Selecting cleanup invalidates all continuations. A failed release or externally
changed journal cannot become a successful retirement or grant another attempt.

All writer, startup, producer and execution-authority flags remain false. This
initial closure is not the post-rename subscriber/completion or durability proof.
No Save, rename, inverse, new application launch or project navigation is called
by either new module.

## Verification

Focused tests use the maintained Node 24.18.0 isolation preload with core dumps
disabled and `TMPDIR=/root/.cache`. Coordinator tests inject only synthetic
boundary I/O. Baseline tests use actual checkpoint, closed-copy, full SQL and
history readers with synthetic original-opening/capture seams. All 29 focused
tests passed, with zero failures or skips. TypeScript and targeted strict
type-aware Oxlint passed with zero warnings. These are offline tests, not
connected application validation. Release checks are separate.

## Remaining

1. The later [fresh SCH generation and startup collector](2026-10-19-current-schematic-rename-generation.md)
   now consumes this private continuation and binds cache observations,
   no-editor startup holders and child metadata to the original baseline.
   Startup qualification, backend ownership and connected validation remain
   separate requirements.
2. Bind original Windows clock observations and the backend actor/producer
   model to SCH preparation. No existing PCB/symbol token is a substitute.
3. Journal one rename attempt before the dormant compiler dispatches it.
   Preserve acknowledgment through failed readback and do not grant retries.
4. Close the original writer generation, compare its complete SQL effect,
   reopen in a fresh qualified generation and close/compare again. Generation
   closure and actual delayed-subscriber completion remain separate claims.
5. Register the scoped route only after review and disposable live validation.
   Active sheets, linked/reuse propagation, child-derived clocks, reparenting,
   broader titles and general inverse remain excluded.

The earlier [owner and compiler report](2026-10-19-current-schematic-rename-owner.md)
describes the existing retained opening issuer and fixed native program. Its
first missing implementation item is supplied by this change; the later writer
and saved/reopened lifecycle items remain open.
