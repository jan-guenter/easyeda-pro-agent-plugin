# Current project URL and opening diagnostics release

Candidate `0.3.0+codex.20261014150000` corrects ordinary project/tab URL
handling and adds bounded opening diagnostics. It adds no methods or writer
authority. Final CI, publication and installation results belong in the
originating PR delivery receipt.

## Implemented changes

The pinned EasyEDA UI changes its URL when opening an ordinary project and
focusing documents. The prior opener required the initial empty-fragment URL
throughout navigation. Current PCB layer, identity and geometry readers also
required an empty fragment. Those checks rejected normal application behavior.
The [source research](current-open-diagnostics-research-2026-10-14.md) records
the installed implementation and official API contracts. This contradiction
does not establish the cause of the earlier retired opening failure.

A shared parser now accepts the exact reviewed editor base and either an empty
fragment or the target project's `id` with its optional ordinary document-tab
list. It rejects foreign projects, duplicate tabs, multiple active markers,
unknown fields, command/history syntax, encodings and overlong values. A marked
active tab must match the independently observed active document when supplied.
The fragment is never an identity authority by itself.

The opener still requires an empty editor before project dispatch. Only its
owned public navigation return may advance the captured URL. The base remains
fixed, the new fragment must match the target and every listed tab must appear
in the independent registry. All later observations require the exact retained
URL. The three PCB readers accept the same grammar while freezing the entire
captured URL across their awaits and retaining their frame, receiver and target
checks. The change does not prove full restoration, absence of transient
away-and-back transitions or persistence.

Opening failures now retain a strict `failureDiagnostic` in the journal,
inspection response and an exclusive evidence artifact. It contains only the
phase, host stage, fixed category and optional native stage/code. Unknown
exceptions stay redacted. Whole-message allowlists prevent private exception
text, paths, arbitrary suffixes and message getters from becoming diagnostics.
Legacy attempts without these fields report no retrospective diagnosis.

Native deadlines still mean execution may be unsettled. The shared timeout
classifier retains quarantine and original-owner recovery requirements. Each
new orphan-risk marker also clears a preceding phase's return timestamp so it
cannot be mistaken for this call's completion. Reservations, no-repeat rules,
retirement qualification and writer restrictions are unchanged.

## Verification and connected state

The implementation has focused native-program, coordinator, diagnostic and
reader regression tests. They cover ordinary URL transitions, wrong targets,
command fragments, drift, redaction and timeout quarantine. Independent source
review found no actionable regression. Full existing build, types, zero-warning
type-aware lint, dependency/privacy checks, skill validation and GitHub CI remain
release gates. Final counts are recorded in AGENTS.md and the PR receipt.

The initial local full suite caught two stale exact source hashes in the
existing disposable concurrency fixture, causing five failures before runtime
initialization. Only those test pins were updated to the independently checked
`core.ts` hash. All five focused cases then passed with their original race
assertions intact. Exact corrected-head CI is required before delivery.

Fresh installed133000 admission and offline geometry discovery/request validation
passed before this source update. The earlier `current-pcb-open-054500-20261014`
attempt is already terminally retired after original process/Job termination and
session closure. Its accepted unknown disposable effects remain unknown. Do not
replay it, the consumed ordinary startup, or any earlier edit or Save.

No live bridge call, application launch, project opening, explicit Save or writer
was dispatched in this continuation. These changes are not connected validation.
The loaded133000 host is not candidate150000. After installation, use a fresh
Codex host before another scoped disposable opening and PCB reader check.
Production designs and their records remain excluded.

## Remaining work

- Perform one focused disposable opening and current PCB reader check on the
  newly loaded release. Preserve any uncertain attempt and its original owner.
- Review shell/context and other metadata readers' empty-fragment URL policies
  separately. This release does not silently broaden those adapters.
- Complete filtered/selected geometry, Arc representation, Component/Pad getters,
  canonical active-layer identity and broader current-version readers.
- Implement the missing operation-owned structure-job completion and full SQL
  effect proof before enabling blocked schematic/symbol/PCB writers.

The [scoped backlog](scoped-release-2026-10-13.md) remains open. Tool/method counts
are unchanged from133000. No external compatibility pin, bridge extension,
dependency or native helper was changed.
