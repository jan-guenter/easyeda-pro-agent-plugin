# Footprint execution and saved-generation integration

This continues [the native integration record](2026-10-28-footprint-native-integration.md)
from main `5d5bd18a19279e62b2cc98d213294815ba93e1fc` (PR140). Implementation is
being collected on `feature/footprint-execution-integration-20261028`; it has not
been published. The previous main Linux CI40685983189 and Windows CI40685983067
both completed successfully.

## Installed disposable observation

The actual host loaded `0.3.0+codex.20261028111845`. Its complete 828-source and
three-runtime-file inventories matched the reviewed manifest and repository
baseline. Admission did not replace or restart the host-owned facade.

One new disposable route preparation reached browser, frame and UI-source
qualification. Capture then refused with `PARENT_PEER` at `source-owner-after`,
before the initial worker resume or constructor capture. The underlying parent
failure is not known from the installed diagnostic summary. The retained channel
later exhausted its 8,192 waiting polls while the original opener remained pending.
Neither copy nor the combined footprint observation was dispatched.

The same retained owner observed its window, requested normal close once,
observed original root exit and an empty Job, and released its resources. The
terminal channel had no pending replies. The disposable file remained 598,016 bytes
with identical SHA256
`e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`.
No edit, Save, delete, restoration or production-design access occurred.

## Implementation batch

- Preserve the first bounded parent-construction failure without exposing source,
  remote handles or arbitrary exception text. Surface capture refusal while
  retaining the original pending opener; prevent late dispatch after refusal and
  allow termination cleanup to finish after a late original reply.
- Correct dependency inspection for EasyEDA's `bb` cache wrappers. Separate
  wrapper/source qualification from actual native-cache namespace provenance.
  Capture the four original cache-opening pauses without invoking a new cache
  opening from the agent.
- Join both original opening classes to the existing preparation and binding
  issuers. Add the fixed native create encoder without enabling a public writer.
- Connect an independent saved-generation owner to closed-file snapshots,
  upload-queue exclusion, one guarded reopen and the V2 saved-cache reader.
  Keep its native command vocabulary and budgets separate from execution.
- Pack existing fixed native programs with exact byte/hash verification to keep
  the combined helper within its existing 1 MiB ceiling.

Focused synthetic regressions are implementation evidence. They do not establish
connected copy, Save, callback completion, saved reopen or inverse support.

## Remaining work

Finish and review this integration batch, then run required local non-suite
checks and exact-commit CI before publishing and installing it. The next installed
disposable observation must diagnose the original parent refusal and exercise the
new cache capture. No failed opening or completed probe may be replayed.

Copy dispatch still requires actual backend actor and notification ownership,
the complete request budget, durable once-only dispatch, original clock results,
full closed SQL comparison, independent saved readback and a supported inverse.
These requirements remain separate from the fixed create encoder and the
saved-generation adapter implemented here.

The missing backend capture must retain the original `app.js` protocol handler,
router, request context and project service. The renderer clock capture must
retain the actual registered `ws-service.js` server-time task, its callback and
mutable clock offset across the document-clock continuations. A separate scratch
main process or a source signature cannot supply those owners.

The future writer coordinator also needs an explicit outcome for saved-helper
admission failing before any resource was allocated. This currently consumes the
attempt and fails closed; it does not invent a native termination token. Failures
after allocation retain the actual helper for cleanup.

The broader backlog remains other library writers, PCB opening and copper
lifecycles, schematic connectivity editing and manufacturing exports. Existing
scoped readers and writers do not establish coverage of these families.

## Validation candidate

Candidate `0.3.0+codex.20261028134521` collects 87 changed files. Its 846-file source
projection is `1b44d1bcacc34db0682eeb65861e2f487aaa0c5bd7d1e7edb7ef70aaf0200822`;
its three-file runtime projection is
`b4eb5813af09b89d2f3cb8e1ebf64a4644676ea3947688f5fb78d67e0f1ee75b`.
External runtime, upstream, sanitizer and private bridge pins are unchanged.

The native helper is 1,046,826 bytes, SHA256
`f5cc7b3f265785a1ed2dec4697576cfe1765117a85e261bb4ac2ffde52817193`.
Windows CompileOnly passed with an empty Job and no application launch, including
the generated cache/saved encoder parity and saved-purpose refusal checks. Both
helper consumers carry the same exact size/hash. Its limits are 565/599 requests
for preparation, 743/787 for execution preparation and 319/353 for the independent
saved reader; these do not reserve the unfinished complete writer.

Required local checks passed with Node 24.18.0, npm 11.16.0 and zero soft core limit:
dependency installation/inventory/signatures/security, sanitizer, types, bridge
types/lint, strict type-aware lint, coverage, repository/contract/skill validation
and all seven skill-creator validations. Both runtime bundles reproduced exactly.
The external plugin-creator validator was unavailable.

Focused regressions exercise actual opening refusal/late settlement, historical
schema separation, original cache event capture, native encoders and saved-file
guards. The final cache cleanup regression passes 8 cases; the integration/native
group passes 29. These synthetic checks do not prove connected writer behavior.
Earlier development type/lint failures, obsolete synthetic cache shapes, and two
stale validator build-command expectations were corrected with their failure logs
retained. Final review also corrected duplicate saved-helper allocation and a
failed unsubscribe incorrectly reporting release on subsequent cleanup.

Complete facade/bridge suites are delegated to exact-commit GitHub CI. Publication
and installation remain pending those results; no new live writer claim is made.
