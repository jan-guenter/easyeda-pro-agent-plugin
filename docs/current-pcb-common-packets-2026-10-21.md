# Bounded common-state packet reader

## Scope and diagnosis

This batch replaces the current private common reader's three large graph calls
with fixed, bounded packet sequences. It does not change the historical graph
programs, admit a writer, or establish a successful EasyEDA lifecycle.

The previous disposable run timed out on common-presentation request 76. Its
cause is still unproven. Offline inspection found a relevant test gap: the old
large-layer test used ordinary `node:vm`, while the actual native route uses
`Runtime.callFunctionOn` with `throwOnSideEffect: true`. In that exact inspector
call form, a synthetic 270-layer graph exhausted the existing one-second
cooperative traversal budget. This is a reproducible source-level problem, not
proof that it caused the historical transport timeout.

## Implementation

- Three fixed seed programs select the same presentation, rules and preference
  roots from the original source-qualified Save-handler scope and constructors.
- Each advance creates a new private packet. It copies the bounded identity
  reference vector, not the accumulated graph. Prior packets, retained iterators
  and model data are never mutated.
- Capture advances process at most 256 field-work units, 64 newly encountered
  nodes and a bounded string increment. Collection snapshots use a fresh native
  `forEach` callback within one effect-checked call; no iterator is resumed across
  calls.
- Subsequent advances recheck every captured own-data descriptor, key roster,
  prototype, ordered collection membership and recorded `toJSON` absence.
  Original root values/descriptors, constructor tuple roster/prototype and
  callback association are also checked on each advance and final result.
- The fixed final result program assembles only packet-owned JSON data. It
  restores historical depth-first node numbering, aliases, cycles and ordering,
  and returns the same native full graph string as the original reader.
- UTF-8 size counting skips ASCII through native matching, then counts exact
  byte deltas for the remaining code points. This avoids interpreting every
  ASCII character of a large JSON reply under the inspector.

The original one-second cooperative budget and existing graph/depth/string/byte
limits remain. It cannot interrupt a blocked intrinsic or transport operation.
No native deadline is raised and no caller may supply program text, roots,
selectors or chunk sizes.

The runner retains the original scope, callback, constructor and sequential
packet handles in one v3 object group. Every await rechecks its original owner;
raw text is captured before the post-arrival owner hook. Failure consumes the
attempt and permits only the original group's cleanup, without a retry.

The fixed ceiling is 512 packets per leaf, each requiring one seed/advance and
one read, followed by one final result. Including scope qualification, assets,
metadata and release gives at most 3,090 common-runner requests. The surrounding
native stage adds four target/context checks. Default no-common execution is
unchanged.

## Evidence and limits

Focused Node 24.18.0 tests exercised the exact inspector `Runtime.callFunctionOn`
form with side-effect checking, original synthetic remote handles and the fixed
programs. All three leaf results matched the old native graph text byte for byte.
The large presentation case contained 270 layers with Greek, Chinese and emoji
labels. Separate focused tests covered signed zero, aliases, cycles, ordered
Map/Set data, immutable preceding packets, constructor/descriptor/roster drift,
nested-member reproof, unsupported shapes and getter avoidance. The owned runner
tests also covered malformed replies, owner changes, arrival-alias mutation and
single cleanup after refusal. Typechecking and targeted strict type-aware lint
passed. These are synthetic checks, not connected EasyEDA execution validation.

Packets are **not an atomic snapshot**. A nested value can change after its
individual reproof and before a later packet. The observation therefore retains
`atomicSnapshotVerified: false`, `continuousObservation: false`,
`completeLiveBaselineVerified: false`, `saveAuthorized: false` and
`executionAuthorized: false`. Graph parity alone grants no writer eligibility,
queue completion, Save or stored-result authority.

Exact intermediate read transcripts are retained only as original in-process
weak-map evidence, capped at 2 MiB per leaf and 6 MiB overall. Their metadata
accessor reports counts, byte totals and ordered transcript hashes. They are not
duplicated in the durable journal. The journal continues retaining the original
full native result strings under its existing evidence semantics. No reconstructed
host JSON is represented as a native raw reply.

Files: `current-pcb-common-packet-program.ts`, `current-pcb-common-packet.ts`,
`current-pcb-common-baseline-runner.ts` and their focused packet/runner tests.
No PianoPi or other production design was read, hashed or changed for this work.
