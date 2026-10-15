# Current project-symbol metadata

Candidate `0.3.0+codex.20261015040000` targets the existing separately reviewed
EasyEDA 3.2.206.715d940d, API 0.3.50, UI 3.2.196 and project-manager 3.2.184 code.
External pins are unchanged. The new read reuses the current opener's exact
APP/MGR/WORKER/UI file verifier without invoking or authorizing navigation.

## Implemented scope

`easyeda_control_project_symbol` adds one project-local metadata subset of
`eda.lib_Symbol.get`. Supply an exact symbol ID and current PCB
project/branch/document/tab target. Only 64-hex local path-hash projects are
admitted. Offline `project-symbol` and `project-symbol-validate` expose and check
the strict arguments. The restricted catalog grows from 15 to 16 tools; seven
skills remain included. This adds one runtime-guarded route, not a newly covered
SDK method, because the older library executor already had a get route.

The fixed native program reads loaded project and symbol metadata twice. It
correlates owner identity, retains current registry/frame/RPC references around
awaited calls and compares the full projected values. It returns UUIDs, display
name, description, raw JSON tags, template source reference, version and ticket.
It requests no canvas/source loading, cloud-library lookup, navigation, mutation
or Save. Missing data refuses without another-library fallback.

The result explicitly leaves worker identity, hidden editors, saved membership,
complete source and persistence unverified. A symbol absent from the tab registry
is not proved absent from every possible hidden editor. Native source/version
empty-string defaults and tag JSON are metadata projections, not lossless META.
The existing control skill now documents these limits and the exact invocation.

## Editing remains unfinished

The [current source review](current-writer-completion-research-2026-10-15.md)
confirms that native Save and metadata changes still schedule a delayed
structure-table job. The existing upload wait does not drain it, and the newer
history-sync method is not a passive completion barrier. The older closed-symbol
coordinator also depends on incompatible URL, worker, actor and navigation
assumptions. No writer guard or runtime pin was relaxed.

Remaining work, in priority order:

1. Current-version closed-symbol name/description compiler and complete
   actor/worker/closed-target before-state. This metadata read is a reusable
   dependency, not that complete before-state.
2. Current owned-session lifecycle, complete SQL comparison, upload-cache
   handling and one disposable rename/inverse/reopen proof. Ordinary opening
   can migrate or auto-save; its effects need a distinct baseline phase.
3. Restart recovery for an intent-only ordinary launch. Existing supervision
   abandonment requires an acknowledged launch and cannot qualify this case.
4. The other seven metadata writers and schematic/symbol/PCB geometry writers;
   pure schematic connectivity without annotation or Save All.
5. Remaining library/device/3D, PCB primitive/filter/stack/rule/copper and
   manufacturing adapters listed in the exhaustive API inventory. Full Pad
   polygons and physical stacks remain outside the current DTO.

## Validation and delivery boundary

Focused tests, types, zero-warning lint, build, package/skill checks and CI are
recorded with the delivery checkpoint. No current connected validation is
claimed for this reader.

The installed 020000 Pad-field live check stopped during ordinary startup when
the facade exited. Maintained inspection reports `launch-unknown` with a consumed
intent and no successful launch receipt. The attempt was not replayed, and no
project open, Pad read, Save or close was dispatched through it. Its private
record remains intact. This is a separate recovery blocker, not evidence that
the new symbol reader or a writer ran.

Production designs and their records remain outside this work.
