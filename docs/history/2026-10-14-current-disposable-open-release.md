# Disposable project opening release

Candidate `0.3.0+codex.20261014033000` adds
`easyeda_control_project_open` on the separately reviewed current EasyEDA
installation. Publication and installation are recorded in the originating PR's
delivery receipt after CI; this file records the tested source scope.

## What changed

The tool opens one already registered local disposable project and an existing
PCB from an initially empty registered editor. The caller supplies the exact
raw Windows path, its SHA-256 project ID, selected PCB ID and original source
digest. A private managed SQLite checkpoint establishes default-branch PCB
membership before navigation. The host rechecks the source before opening.

The fixed programs use public `dmt_Project.openProject` and
`dmt_EditorControl.openDocument`. Each has a separate durable consumed intent.
If project restoration already activates the requested PCB, the second open is
skipped. Public acknowledgements and sampled native identity are reported
separately. A null document return is not described as successful opening.

`inspect` is journal-only. `observe` never navigates. Timeouts retain the existing
execution-unsettled marker and global quarantine. A separate terminal retirement
path proves this same coordinator's original retained Windows root/Job ended,
the exact authenticated session closed and no dispatch lease remains. It
publishes proof before invalidating the consumed attempt. No replay, continuation,
replacement authority or saved-state outcome is inferred. Restarted facades
cannot adopt lost handles from historical receipts.

The shared design recovery implementation is unchanged. Its replacement-session
requirements remain in force. The gateway addition only observes exact closed
session/lease state; it never releases a lease or clears quarantine itself.

## Effects and limits

Ordinary opening can migrate the selected database, replay cached uploads,
restore selected-project tabs, update shared bookkeeping and automatically
Save. Its registry query also has ordinary backend bookkeeping effects. The
request explicitly accepts those effects. The adapter makes no unchanged-storage
claim and issues no explicit Save, close, discard, restore or CAD edit.

The public methods route through global state. Before/after checks detect drift
but cannot atomically exclude an intervening switch away and back. Final native
identity is not full initialization, rendering, restoration completion or
persistence proof. Only the existing default-branch PCB subset is implemented.
Cloud projects, path registration, project creation, other document types and
generic navigation remain outside this route.

No connected opener or writer validation is claimed. During this work the
previous installed build was independently admitted, EasyEDA was launched once,
the bridge authenticated, and shell observation reported one active Start Page
with no other tabs. No project open, Save or design action was dispatched.
Production designs and their project record were not accessed.

See [the implementation research](2026-10-14-current-disposable-open-research.md)
and [the packaged opening guide](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md).
The skill update separates this ordinary-opening contract from legacy
unchanged-storage navigation and design reconciliation.

## Verification and inventory

Main and independent review addressed strict checkpoint target projection,
redundant document opening after tab restoration, null acknowledgement semantics,
and pre-navigation failure terminalization. Fourteen focused new tests exercise
the generated programs, real checkpoint/history machinery and coordinator.
The existing gateway test now checks closed-dispatch retirement prerequisites.
The combined focused/catalog/gateway suite passed 85 tests. Full types, strict
type-aware zero-warning lint, build, compatibility, plugin/repository/privacy
validation and all seven skill validators passed locally. Full existing CI runs
before merge; its exact counts and tested/merged commit identities belong in the
delivery receipt.

Source fingerprint: `2eb81d42fb9e68259723c962e9a8c8be339b37f5e453f5ee8d9e5fd7a4706ffa`,
331 files. Runtime projection:
`34bef995e6d308e80a47eb7006796179c4b84f40439f82459ce3502849c2c54e`,
three files. Existing external compatibility pins, Windows helper and companion
extension are unchanged. The new opener adds separate app/manager/worker pins.

The legacy catalog has 37 tools; restricted current-version mode has 12.
Seven skills remain. The inventory covers 774 method paths: 212 public subsets,
29 native equivalents, 82 implemented-but-blocked and 451 omitted. Routes include
313 available with their runtime guards, 94 blocked and two partially blocked.
These are implementation counts, not connected-validation counts.

## Next backlog work

1. In a fresh installed host, open one explicitly selected disposable PCB once
   and read its exact layer metadata. Keep the facade alive until the attempt is
   terminal. Do not replay historical launches or CAD actions.
2. Extend current-version design readers and document types with their own
   schemas and admission. The existing identity-only reader's UUID32 restriction
   is not silently broadened by this local UUID64 opener.
3. Continue the remaining API families recorded in the exhaustive inventory.
   Native structure-write completion and full SQL effects still block affected
   writers; hidden Save All exports, library/account state and native stubs keep
   their concrete omission reasons. Additional test matrices remain deferred.
