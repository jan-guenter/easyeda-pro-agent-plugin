# Reliability review, 2026-10-10

The main reliability problem is a mismatch between an operation's actual lifecycle and the evidence the next operation checks. A successful Open was reported before its editor was ready. A consumed Save could later look like an unsaved transaction after reconciliation or runtime rebinding. The first issue caused repeated recovery work. The second could cause a second Save. Both need explicit lifecycle evidence, not broader retries or weaker comparisons.

This review covers the checkout, fetched GitHub metadata, existing recovery modules and synthetic regression tests. It preserves the unreleased September repairs. It does not connect to EasyEDA, edit a production design, inspect credentials, replace private receipts or change an installed plugin cache. User project handoffs informed the failure patterns but are not published as fixtures or operational instructions.

## GitHub changes since the previous chat release

At the start of this review, fetched `origin/main` and local `HEAD` were both at [`cdb9f248581706a8c51d44b21a0b3a90b0ef7dbb`](https://github.com/jan-guenter/easyeda-pro-agent-plugin/commit/cdb9f248581706a8c51d44b21a0b3a90b0ef7dbb). There were no later merged changes to review. The substantial September implementation and recovery improvements were local work, not changes already published on GitHub. Subsequent revamp publication is recorded in the release validation document.

Four dependency pull requests are open:

| Pull request | Change | Observed CI result |
| --- | --- | --- |
| [#4](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/4) | Root Vitest and mocker 4.1.11 | [Failed](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/34437682463) |
| [#5](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/5) | Vendored bridge Vitest 4.1.11 | [Failed](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/34548730514) |
| [#6](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/6) | fast-uri 3.1.8 | [Failed](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/36515093051) |
| [#7](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/7) | ip-address 10.7.2 | [Failed](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/36565539278) |

The audit failure in the fast-uri CI run still reports other dependency advisories. Updating one dependency cannot make an audit clean while the other affected packages remain locked. The [Vitest maintainer advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9) concerns redirect-mock path traversal. The [fast-uri maintainer advisory](https://github.com/fastify/fast-uri/security/advisories/GHSA-hrr3-gc8f-f4qj) concerns host normalization. These are reasons to update the dependency set together, not evidence that this plugin exposes every vulnerable HTTP route.

The integration work now updates the SDK to 1.32.1, Vitest to 4.1.11 and its affected transitive dependencies. The root agent reports a zero-advisory audit. This review does not substitute that report for the final release's audit, full tests and CI result.

## Prioritized findings

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | A generic design Save did not have a durable, operation-wide no-repeat guard. State changes could make a failed Save look unsaved. | Implemented the Save-attempt protocol and focused regressions below. |
| P1 | Security updates arrived as separate failing dependency PRs. Nested Vitest changes also invalidate the pinned bridge source closure. | Root owns the combined dependency update, audit and closure refresh. Existing private receipts must remain unchanged. |
| P2 | Project opening accepted the correct tab before parent ownership and schematic/PCB auxiliary context became ready. | Implemented observation-only editor readiness in the existing one-shot opener. |
| P2 | Capability descriptions mixed implemented support, old pending claims and actual live validation. | Integration adds a source-hash-bound historical validation registry without claiming current-generation or sibling coverage. |
| P2 | Native-history materialization can synchronously parse and hash a large admitted history on the MCP event loop. | Integration adds a cooperative shared parser. Large single-record operations, sorting and final hashes remain synchronous. No timeout or byte limit was relaxed. |
| P2 | Installed cache generations, loaded MCP generations and private bridge receipts have different lifecycles. Updates can require a new task or host restart. | Preserve current immutable evidence. A supported generation-drain/reload workflow remains future work. |
| P3 | New SDK documentation can suggest methods that the pinned execution implementation does not support safely. | Keep documentation lookup separate from execution authority. The integration adds an offline API catalog. |

## Implemented project-open readiness

The former opener established document UUID, type and tab, then returned. The immediately following engine context probe also needs the owning project and type-specific editor context. Delayed ownership or auxiliary getters could therefore turn one successful navigation into a recovery journal. The relevant code is [recovery-navigation.ts](../plugins/easyeda-pro-control/server/src/recovery-navigation.ts), [project-open-execution.ts](../plugins/easyeda-pro-control/server/src/project-open-execution.ts) and the engine's [context checks](../plugins/easyeda-pro-control/server/src/engine.ts).

Existing-project navigation now requests a bounded readiness observation after its single Open/Activate path. It requires two coherent observations of the selected target, owning project and auxiliary editor identity. Schematic pages must agree with their schematic container. PCB context must identify the same PCB. Missing fields may settle within the deadline. A present conflicting owner, page, container or tab refuses immediately. Hanging getters have the same bounded deadline as absent readiness.

The observer does not dispatch another Open, Activate or Save. Inspect-only reconciliation does not opt into navigation readiness. Existing exclusive-tab, checkpoint membership, native registry and identity checks remain in force. Timeout remains an uncertain lifecycle result, not permission to retry navigation.

The new cases in [recovery-navigation.test.ts](../plugins/easyeda-pro-control/server/tests/recovery-navigation.test.ts) exercise delayed ownership, delayed auxiliary readiness, conflicting ownership, aliased identities, wrong schematic containers, identity changes across an awaited getter and deadline cleanup for hanging getters. [project-open-execution.test.ts](../plugins/easyeda-pro-control/server/tests/project-open-execution.test.ts) checks that only actual navigation requests editor readiness. These are synthetic tests, not a new live validation claim.

## Implemented durable design Save guard

The new [design-save-attempt.ts](../plugins/easyeda-pro-control/server/src/design-save-attempt.ts) records a strict, sequence-bound intent for `save-reopen`, `symbol-save` and `footprint-save`. Each record binds the operation ID, sealed plan hash, intended source hash and project/document scope. Its managed artifact hash is checked again when the guard reads it. Save evidence is a prohibition on another Save, not evidence of successful persistence.

[engine.ts](../plugins/easyeda-pro-control/server/src/engine.ts) adds an optional internal callback after final execution-authority reproof and immediately before `callTool`. [design-execution.ts](../plugins/easyeda-pro-control/server/src/design-execution.ts) uses that callback to publish the durable intent. Earlier read, native-profile, context or authority refusals do not create an attempt. If intent publication fails before dispatch, only a distinct, exact non-dispatch receipt can cancel that intent. That receipt requires the sealed disk journal to prove the orphan marker was cleared. An in-memory flag alone is insufficient after a failed journal update.

An ordinary returned failure, missing return, timeout, changed state, runtime rebind or process restart cannot cancel a Save attempt. The guard runs before commit and reconciliation can dispatch anything. It also prevents the layout-repair and unsaved-inverse routes from treating a consumed Save as an unsaved edit after state changes.

Existing maintained recovery paths remain available when their original evidence fits:

- Standalone schematic wire recovery verifies its retained lifecycle acknowledgment, exact intended native state, complete topology and durable project delta without dispatching Save or navigation.
- Current layout recovery keeps its existing source-bound lifecycle and complete-project proof.
- Copper recovery keeps its operation-specific retained lifecycle verification.
- Symbol and footprint recovery may reuse their independently verified saved state and finish reopening without another Save.

Ordinary PCB geometry, net rules and layer-stack transactions do not yet have a maintained generic retained-Save completion proof. After a consumed Save, the guard stops explicitly. It does not downgrade those journals to `applied-unsaved` or report completion from saved flags. The original sealed plan, native effect comparisons, history checks and unchanged-document proofs are unchanged.

### Deliberate legacy handling

Old journals have no callback-bound protocol. Successful Save artifacts, old wire/library Save intents, saved/reopened flags, explicit attempt markers and retained Save dispatch phases still prohibit another Save. Every legacy `commit-needs-recovery` journal is also conservatively no-repeat. An older failed reconciliation may have overwritten the Save phase with a read/upload phase after its return artifact was lost. That uncertainty must not make another Save repeatable. Loading a legacy journal preserves the marker before rebind or observation overwrites its state or phase.

New protocol journals do not infer a Save merely from `commit-needs-recovery` or a pre-dispatch phase marker. Their immutable intent ledger distinguishes an actual dispatch boundary from an earlier read refusal. Unknown protocol values and malformed attempt markers refuse. Foreign, reversed, duplicated or unbound cancellation receipts refuse.

The conservative legacy rule may stop an old commit that actually refused before Save. Old journals cannot distinguish that case from a consumed Save with missing evidence. New protocol journals retain the precise distinction. This rule cannot reconstruct evidence already erased together with the legacy commit state before this protocol existed. Missing historical evidence is not a new persistence proof; the plugin must not invent successful lifecycle evidence.

### Regression record

The following focused suites ran with Node 24.18.0 and core dumps disabled. All 68 tests passed:

- `server/tests/design-save-attempt.test.ts`
- `server/tests/typed-recovery.test.ts`
- `server/tests/design-layout-saved-recovery.test.ts`
- `server/tests/schematic-wire-persistence.test.ts`
- `server/tests/design-wire-page-recovery.test.ts`
- `server/tests/saved-library-recovery.test.ts`
- `server/tests/upstream-returned-timeout.test.ts`
- `server/tests/recovery-navigation.test.ts`
- `server/tests/project-open-execution.test.ts`

The tests include a real guarded synthetic Save dispatch returning a failure, followed by journal reload, state/rebind changes, reconciliation and commit. The native-call count remains exactly one. Separate integration cases cover ordinary PCB geometry, rules and stack journals and refuse every second-Save route before any upstream call. Callback rejection never dispatches. Final authority refusal never reaches the callback. Failed durable marker cleanup leaves the disk quarantine intact. Existing retained-wire/library/layout proofs still pass their adversarial tests.

The owned TypeScript changes pass the project typecheck and the strict type-aware Oxlint configuration without warnings. The final combined repository tests, build, compatibility refresh, privacy validators, audit and release CI belong to the integration validation record. No production design, installed cache or private bridge was used in these tests.

An additional legacy regression then ran with the Save-attempt and typed-recovery suites, all 29 tests passing. It starts with `commit-needs-recovery`, no Save-return artifact and an overwritten `reconcile-upload-barrier` phase. It exercises the executor's journal loader and read-only authority/tab rebinding, checks that the durable attempt marker survives the state change, and proves that reconciliation and commit still dispatch nothing. Typecheck and strict type-aware lint pass after that follow-up.

## Sustainable capability reporting

The initial review found `live-validation-pending` in [design-capabilities.ts](../plugins/easyeda-pro-control/server/src/design-capabilities.ts) even though later retained operating history had completed that specific wire lifecycle. The converse risk is equally important: a successful test for one operation or encoding profile does not validate every operation in the family. A prose matrix can drift in both directions.

Integration now adds [validation-registry.ts](../plugins/easyeda-pro-control/server/src/validation-registry.ts), which records the established historical standalone-wire fixture and its specific adapter profile. It binds the adapter, wire-order and persistence source hashes, external application/API/schematic implementation identity, fixture category, dates and separately established immediate-effect, saved/reopened and retained-Save recovery stages. The capability response includes that registry and labels it `historical-profile-validation;not-this-facade-generation`. It does not grant runtime admission or mutation authority, distribute private artifacts, validate an unlisted action or claim a newly changed facade generation passed a live test.

[validation-registry.test.ts](../plugins/easyeda-pro-control/server/tests/validation-registry.test.ts) checks unique identities, exact external profile and stage commitments, source hashes, missing sibling status and isolation of returned copies. Even an adapter comment change requires deliberate historical-record review, not automatic rehashing during a build. The record is useful evidence about the maintained profile, not complete per-operation live coverage. Other operation families still need their own independently reviewed records. Old handoff text remains evidence, never an instruction to repeat completed edits or Save.

## Native-history responsiveness

[native-history.ts](../plugins/easyeda-pro-control/server/src/native-history.ts) limits the database and total plaintext to 256 MiB and total records to one million. The original checkpoint reader awaited chunk decryption/decompression, then synchronously materialized the admitted plaintext. This was a responsiveness risk under large valid histories, not evidence of a measured regression. Node's [event-loop guidance](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop) identifies large JSON processing as blocking work and recommends partitioning or offloading expensive computations.

Integration adds a shared generator for both synchronous and cooperative materialization. It keeps the original full-chunk parse-before-apply order, duplicate-JSON rejection, conflict precedence, record ordering and semantic/header-lineage construction. The checkpoint reader now awaits the cooperative path. That path captures the immutable chunk-string array before its first await, yields after 512 records or 256 KiB of parsing, batches application and record collection, and yields between chunk and snapshot phases. [cooperative-proof.ts](../plugins/easyeda-pro-control/server/src/cooperative-proof.ts) supplies actual event-loop turns through two `setImmediate` boundaries. The existing final descriptor/path identity, metadata and SQLite sidecar reproof remains after the awaited materialization.

[native-history-cooperative.test.ts](../plugins/easyeda-pro-control/server/tests/native-history-cooperative.test.ts) checks equivalence with synchronous results and rejection behavior, including malformed and conflicting records across yield batches. It checks timer turns and mutation of the caller's input array after capture. Existing native-history and downstream persistence proofs also pass the extension agent's focused validation. The final combined suite remains part of release integration.

Single-record JSON parsing and scanning, framing, sorting and final canonical hashing still run synchronously. This patch does not guarantee every admitted history meets a fixed heartbeat deadline. Measure worst-case event-loop delay near admitted bounds before claiming such a guarantee or deciding whether a worker is necessary. The current byte and record limits remain unchanged. Yielding does not permit a mixed source generation.

## Bridge closure and private receipt consequences

A read-only capture using [captureVendoredSourceClosure](../plugins/easyeda-pro-control/scripts/reviewed-bridge-source.ts) found 70 files, 853,680 bytes and SHA-256 `c5cb4d9ed0d5a93bca655f4f846f4f2e9337633941b2df3482aa3b91d7e43ee5`. The previous reviewed closure had 853,679 bytes and SHA-256 `db87888db28262bde6371fa2e8131f20288e7cdfa89242908b4f2d5644fbff1f`. The sole vendored source change was the package manifest's Vitest 4.1.9 to 4.1.11 pin.

Root integration refreshes the reviewed closure, byte count, package-delta description and validator expectations together. The upstream commit and attribution stay unchanged. This dependency-only source-closure update is still a changed build identity; it is not permission to replace receipts with new metadata.

[build-authenticated-bridge.ts](../plugins/easyeda-pro-control/scripts/build-authenticated-bridge.ts) records the source closure and derivative metadata in each immutable private generation. [doctor.ts](../plugins/easyeda-pro-control/scripts/doctor.ts) requires those fields to agree exactly with the current reviewed source. An old receipt can therefore become incompatible even if the generated extension code happens to be byte-identical. That is intentional evidence invalidation, not a broken receipt to repair in place.

Preserve old private archives and receipts. A new private build, if separately required and authorized, should use the supported `bridge:build` workflow to publish another immutable generation. Do not run nested vendored build stubs, rewrite old receipts, mutate credentials or infer that a local build was imported and live-validated. Collect fresh connected evidence through the normal admission workflow before enabling exact/private execution.

## Remaining work and release limits

This patch does not add generic post-Save completion proofs for ordinary PCB/rules/stack operations, a native-history worker or universal heartbeat latency guarantee, supported host-generation drain/reload, new private extension installation or live disposable-project validation. Root integration owns the offline API catalog, new task skills, dependency/audit updates, capability reporting, fixture cleanup and final release validation.

The safe next validation is the combined offline suite, build, manifest/closure validation and audit. A later authorized disposable project can then test delayed project readiness and full write/save/close/reopen lifecycles against the actual pinned EasyEDA build. A successful offline run must not be reported as successful live control.
