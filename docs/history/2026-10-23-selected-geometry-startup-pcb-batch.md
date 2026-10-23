# Selected geometry and startup-to-PCB batch, 2026-10-23

Base main is `6e19daeedb347d3142ac96c3c5064d690ee1b40b`. Work is on
`feature/combined-startup-pcb-lifecycle-20261023`; candidate version is
`0.3.0+codex.20261023084000`. This combines a useful PCB
reader, a startup compatibility correction and private lifecycle integration.
Production projects are excluded, including reads and hashes.

## Generation 074000: terminal disposable case

The [preceding record](2026-10-23-startup-containment-batch.md) records actual
installed-host admission and final main CI. One new original-owner launch,
browser/frame inventory and complete UI-source qualification succeeded.
Capture refused before navigation with `PCB_WORKER_STARTUP_EVENT` at
`worker-auto-attach` / `worker-arming`. The retained first event was
`Target.attachedToTarget`, reason `EXISTING_WORKER_CHANGED`. Three existing
workers were observed and none accepted. The exact changed field/value was not
retained; no particular live metadata transition is proved.

The opening attempt was consumed and settled with `openingAttempted:false`.
No construction, assignments, actor or channel success is claimed. Normal close
was requested once; original root exit and empty whole Job were observed before
release. Final local inspection was released and not busy, without publication
settlement available. The disposable file remained byte-identical. No navigation,
explicit Save, force termination, replay or production access. Raw process,
operation, target and journal evidence remains private.

## Background metadata initialization

Chromium146 creates browser-side worker hosts with empty URL/name before renderer
metadata arrives for the same token. Its renderer-channel implementation updates
that existing host and reports it to the attachment callback. These pinned
[worker-manager](https://raw.githubusercontent.com/chromium/chromium/146.0.7680.188/content/browser/devtools/worker_devtools_manager.cc)
and [renderer-channel](https://raw.githubusercontent.com/chromium/chromium/146.0.7680.188/content/browser/devtools/devtools_renderer_channel.cc)
sources justify handling this transition, not asserting it caused the live refusal.

Only an originally observed worker whose title and URL were both empty may
initialize metadata at attachment. Original target and parent must match and the
worker must already be running. Populated metadata still must match exactly.
Selected project names and all pinned project-worker source paths refuse at both
inventory and attachment. Accepted background workers receive no debugger,
inspection or resume commands. Unknown, paused, duplicate, replacement and
cross-session events remain refused; no budget or deadline was widened.

## Selected PCB geometry

`eda.pcb_SelectControl.getSelectedPrimitives` now has a narrowed DTO route through
`easyeda_control_pcb_geometry`. It requires the same explicit PCB target and
fingerprint as the existing readers. Selection IDs bracket all nine supported
family projections twice. Full ordered rosters, rows, attribute associations and
selection order must agree. Missing, duplicate, ambiguous or unsupported objects
refuse the whole result. The route never changes selection.

Line, Arc, Via, Component, Pad, String, Attribute, Dimension and Image use their
existing DTOs. Nonempty selection uses26fixed getter calls; empty selection uses8.
The256-per-family,256-selection and384KiB limits remain. Full observed roster
count is separate from returned selection count. The raw-object native serializer
is not used: it filters objects without `toJSON` and substitutes display-net data.
This is sampled stability, not atomicity, public-object parity, ownership or saved
state. Independent pinned-source review and43geometry/registration tests passed;
connected validation remains pending. The control skill documents these limits.

## Private same-owner PCB continuation

A new unregistered coordinator retains the actual completed startup opening,
original dependency, diagnostic context and sealed target. Its owner factory
consumes preparation once. Fixed preflight, one PCB open, source and identity
phases preserve the original transport and native boundary. Copies, changed
owners, changed method identities and replay refuse. The native helper reconstructs
fixed programs rather than accepting caller code.

The session adds at most64requests. The preceding174-request route and one
factory identity proof total at most239against the unchanged256ceiling. Later
consumer reproofs also consume that budget; a common reader does not fit this
contract. No tool currently invokes this coordinator. The existing transport
still rejects a new ratline worker, so a complete combined route needs its own
source-qualified ratline ownership and launch-selected budget. Full positive
combined execution, baseline, startup completion, create and Save are not claimed.

## Verification and remaining work

Focused source, contract, generated-native, geometry and ownership tests pass.
Full frozen verification, exact-payload CI and official installation remain
pending at this entry; results will be appended. An independent review found
that a late PCB-open reply could be lost after a timeout in the private
coordinator. Its correction retains the original reply without reviving the
failed attempt or permitting replay; focused verification is pending.

The late-reply correction subsequently passed all five session tests and strict
type-aware lint. Independent review found no further actionable defect in the
private continuation or the selected-geometry route. The documented missing
ratline ownership and combined-reader budget remain, rather than being relaxed.

The first complete verification attempt stopped before tests on two integration
lint errors: an unnecessary `async` wrapper and unsorted declarations. Both were
corrected without changing the operation contract; bundles and allowed facade
projections were rebuilt before the final frozen run. The failed log is retained
privately. Clean install, dependency tree,151registry signatures,40attestations,
zero-vulnerability audit and descriptor sanitizer check have passed.

A concurrent package scan encountered the build's temporary publication lock
and refused its transient old bundle. After publication completed, the unchanged
package passed repository/privacy, MCP-contract, official plugin and all seven
skill-creator validators. No scanner limit or exclusion was changed.

1. Admit the next installed host and validate capture, assignments, actor and
   channel observations together on a new disposable case.
2. Finish producer/channel/subscriber ownership and contained write destinations.
3. Join ratline startup completion, PCB/common observations and a stable full
   baseline under one original owner; integrate native/server clocks.
4. Implement fixed create/Save senders, terminal completion and full closed-SQL,
   reopen and visual persistence proof before enabling writers.
5. Continue the wider inventory:774methods comprise212public subsets,
   34native-equivalent routes,79implemented-but-blocked methods and449documented
   omissions. These are implementation gaps, not merely missing tests.

## 2026-10-23 verification and protected merge

Candidate `6064be0d9673e5d7dcb91e44c5e6488db8791f6f` passed the complete frozen
verification under Node24.18.0/npm11.16.0 and soft core limit zero. Facade results:
12,366 tests,12,362 passed,four skipped,zero failures; bridge results:424 passed.
Types, strict type-aware lint, generated coverage/protocol checks, compatibility,
build, MCP-contract and all skill checks passed. The complete suite took626seconds.
Both bundles reproduced byte-for-byte after the suite, and the worktree was clean.
Independent review of the exact37staged paths found no remaining actionable
security/privacy issue. Only facade source/bundle projections and review time
changed in compatibility metadata; all external pins remain unchanged.

Frozen projections:

- Source617files: `22eaecb930bbfffd128fbf4c2876704042f218d93757f2a2c00e704be9c843fe`.
- Server10235143bytes: `f3c7d6c983ea01ca9d8d5241955ffb9cae918cb91eae0e74941df40e164da924`.
- Supervisor786410bytes: `1325f762d1bc96910c6b42b6ba1650ded4a0610509ecfa0b75c99c34081a62e1`.
- Native helper880724bytes: `ef944ecff37bb0bcc7b2e2399eb54713af479cc5770e973d7fddd0e783dd3b49`.

[PR102](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/102) passed
exact-payload [Linux CI39927240697](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39927240697)
and [Windows CI39927240691](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39927240691).
All eight Linux test shards, build, aggregate gate and Windows native checks were
green before protected merge. Main is `ee31fa105bfb1f3ab4e8bb9ced0b65230e9a7f28`,
merged09:00:54Z; its tree is exactly the tested candidate tree.
Main [Linux CI39928774811](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39928774811)
and [Windows CI39928774657](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39928774657)
are running at this entry. Official marketplace upgrade is in progress; no new
live call or connected-validation claim follows from the merge.

## Proposed next coherent batch

Finish startup-to-PCB preparation as one owner-bound route, not another independent
observer. Preserve the existing worker-startup contract. A separate launch-selected
combined purpose should retain the actual opening, construction, PCB session and
native channel; capture the original PCB initializer and source-defined ratline
factory before the single PCB opening. Qualify finite project/ratline/subworker
roles, their creation relationships, complete sources and original result receivers.
Existing ratline research in the [finite-effects record](2026-10-21-current-pcb-string-finite-effects.md)
is not an admitted source pin or proof of terminal completion.

Then join existing precreate/common, move, producer and actor collectors and take
the full stable baseline after attributed startup completion. Normal worker
destruction needs attributed completion; late replies and one-shot paused/waiting
cleanup must remain retained through original root/Job termination. Callback
inspection must never invoke work to manufacture evidence.

The current239-of256 budget cannot hold this route: existing precreate/common
alone adds3309requests. A proposed separate3868ceiling reserves256ratline and
64cleanup requests above the3548subtotal, but generated phase counts and cumulative
source/common byte bounds must justify it before implementation. This is planning,
not authority to raise the ordinary contract. Add focused original-class positive,
wrong-parent/duplicate-result and late-cleanup cases plus native parity; avoid a
new broad research or test campaign. Writer and Save lifecycle work remains later.

## 2026-10-23 official installation and handoff

The official CLI upgraded only Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` under umask022,
with no errors. Its snapshot HEAD equals merged main. Version
`0.3.0+codex.20261023084000` is installed and enabled. The maintained comparator
verified all1766committed files,42directories and36,653,457bytes with exact modes.
Inventory SHA256 is `36b7c557a86a404c926ca0aed8cec28f6cf407911fb0082ef22aff28ae91d79b`;
plugin tree is `d3fa47823c4cf476a60901be00b317bd5a2d9013`.

The installed synthetic-profile offline probe passed26tools and10queries under
the pinned Node24.18.0 executable. Its geometry catalog now has20methods. It
selected no live control root, sampled no descendants/non-stdio sockets, retained
clean EOF shutdown and zero stderr, and verified the upstream marker stayed absent.
These checks are not actual-host admission, continuous isolation or connected
validation. Main Windows CI39928774657 passed; main Linux CI39928774811 remains
running at this append. Required exact-payload PR CI already passed, and the main
tree is identical.

No live call, owner termination, cache patch, Save or production access followed
the upgrade. The control skill requires a fresh Codex session before live use of
084000. Admit that actual host, check final main CI, and run one new disposable
startup case. Never replay terminal074000. If capture passes, validate assignments,
actor and channel together before original-owner closure. The new selected reader
also needs connected validation on a disposable target; do not borrow the private,
unregistered PCB coordinator as a public opener.

This verification/install handoff remains local for the next substantive batch;
the PR records the same completion evidence. This avoids another release and CI
cycle solely for bookkeeping. Only this history file is intentionally dirty.
