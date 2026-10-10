# Lifecycle adapters and disposable refusal recovery

Candidate: `0.3.0+codex.20261010182554` on `feature/api-execution-coverage`.

Local release verification is complete. Publication and installation evidence
will be recorded separately. This candidate does not establish complete API
coverage or connected acceptance of new writers.

## Connected observations on installed 172121

A fresh Codex host loaded the exact installed `172121` package and authenticated
the retained EasyEDA runtime. The existing disposable validation project opened
with its complete 16-document history and logical database unchanged. Opening
its footprint also completed with the correct library-owner context, no Save
and unchanged saved state.

One closed-symbol description attempt refused at `native-symbol-metadata:host`.
The original journal reconciled as no mutation against the complete original
checkpoint. No symbol mutation or Save was repeated. The coarse diagnostic does
not identify the particular failing host guard. Source review subsequently found
that native project opening inserts a hidden tab `0`, which the symbol guard
incorrectly rejected. This is a proven source defect consistent with the refusal,
not proof that it was the only live cause.

One already-open PCB activation refused at
`native-document-activation:preferences`. The footprint remained active; original
journal reconciliation proved the complete source, project and logical database
unchanged. There was no repeated activation, open, close or Save during recovery.
Pinned UI source confirms that an absent or false `pcbCommandTab` preference can
trigger an account-wide preference write during activation. The adapter continues
to refuse this case. No preference or account setting was changed to pass it.

After the user restored the RDP client, native discovery reported the owned
foreground and input desktop. A managed screenshot showed the disposable
footprint editor. EasyEDA then closed normally without a Save/Discard choice;
native discovery returned no instance. The maintained checkpoint verifier proved
the closed file and complete logical database unchanged:

- Source SHA-256:
  `825753c44abeb881a7b2322550ed8b9fdb0f311bba2d6019de8c5dff67a8d484`.
- Logical database SHA-256:
  `5127c44d3eaa3bbc8158d31b463fa50727c8be547f0ee063ddbd48a00004f6d7`.
- Symbol terminal recovery artifact SHA-256:
  `1d641b8d638f6e0bca1566c3bf7184d130133c3c58ab934c29b69528e13bc1ea`.
- Activation terminal recovery artifact SHA-256:
  `cf7cc3e10a4605a2c75faf8a1d908037ce5f6cd15b5440fc5c7ace16714786c8`.

No production project was opened, read, edited, saved or restored. Private
identities, paths, raw project data and journals remain outside the repository.

## Implemented changes

Clean inactive-tab close now has an exact public-method adapter for ordinary
symbols, PCBs and footprints, with a separate PCB/footprint remaining active.
It requires exactly two clean owned tabs in one unsplit container. It observes
the terminal native removal event, removed frame and two coherent contexts,
then proves unchanged active source and complete saved database. It does not
save, reopen or promise an inverse: close destroys editor caches. Schematic-page
close remains excluded because the pinned cleanup can persist instance
attributes even when the ordinary dirty flag is clear.

The public close starts asynchronous teardown without awaiting it. Independent
review caught a late-completion recovery hazard. Every failure after dispatch
now keeps the original execution authority and orphan quarantine. A real-engine
regression verifies that a late removal notification does not clear that risk or
permit read-only reconciliation before supported runtime-termination recovery.

Empty schematic-page creation uses a fixed project-qualified native worker
operation. It creates one closed ordinary page with reviewed native name/order
defaults and no drawing-frame initialization, editor opening or Save. Full
checkpoint proof admits exactly the returned new identity and its META/header;
all previous documents and active source must remain unchanged. Missing native
identity cannot be replaced by inference from a unique observed addition. Such
an outcome remains unresolved and never permits another create.

Pure page-create preparation now runs before journal creation. Invalid parents
and unsupported hierarchy therefore leave no blocking operation. A separate
recovery path handles exact initial publication failures for page creation,
close and activation. It admits no dispatch/restart/Save markers, rederives the
original plan, proves unchanged source, full database/history and exact context,
then seals `plan-invalidated` without a lifecycle call or retry. Failed
inspection preserves the original journal. Rebind/navigation/authority recovery
refuse this incomplete preparation before altering it; invalidation on a newer
runtime remains outside the implemented subset.

Metadata guards admit only the pinned singleton hidden project-placeholder tab,
not arbitrary type-zero tabs. Known stage/subguard diagnostics distinguish
permission, context, dirty-state, version and tab failures while redacting
unknown errors. Activation preference diagnostics likewise expose fixed reasons,
never stored preference contents.

Native inspection, focus and normal close no longer perform a journal scan whose
result they never used. Native edits retain their fresh complete admission scan.
That admission now rejects terminal journals with retained orphan risk as well
as unfinished or unreadable journals. A terminal state alone does not establish
that earlier native work stopped. Regression tests exercise actual journals and
prove that inspection remains available while further native edits are refused.
Bridge admission, recovery isolation and incomplete-operation reporting share
one bounded pure journal projection, avoiding repeated JSON parsing. Every scan
still hashes all current journal/artifact bytes and rechecks paths; this is not a
cached authorization decision. Regressions cover same-size byte changes,
restored timestamps, path substitution, new orphans and independent result copies.

Two fixed public SDK reads now resolve an owned tab's split-screen ID and the
tabs in an existing split-screen leaf. They bind all returned documents to the
complete saved project, check the complete bounded tree before and after the
direct lookup, and require two matching observations with unchanged checkpoint
and context. Structural getters, unknown owners, host replacement, cyclic or
oversized trees and contradictory results refuse. Results contain identities
and types, not tab titles or raw data. The catalog now has 160 fixed read routes;
neither these tests nor their registration establish connected acceptance.

## Local verification

Complete `npm run verify` passed on pinned Node24.18.0/npm11.16.0 with inherited
descriptors142/145 and core dumps disabled:1575 facade tests passed, one
platform-specific skip, zero failures or cancellations, plus424 bridge tests.
Strict types and type-aware lint have zero diagnostics. The independent final
recovery/transaction review passed87 focused tests with no outstanding findings.

The build is reproducible and the manifest matches150 source files and the
three-file bundle. Only the facade projections and review timestamp changed;
external EasyEDA, native implementation, bridge and sanitizer pins are exact:

- Source SHA-256:
  `d960496c5b89362906b40da312447a33bf5c0fa07893dd00a508eed8ab7c90a3`.
- Bundle SHA-256:
  `cf27a4185963b497b41ddcf5c012f3eba606d90a503cfa312c54a2bbc320d31e`.

Package, repository/privacy, all seven skills, workflow lint and offline doctor
pass. Clean dependency installation and audit passed with zero vulnerabilities,
151 verified registry signatures and40 attestations. No dependency or external
runtime upgrade was made by this candidate.

The inventory contains774 mounted methods:190 public subsets,73 native task
equivalents, two internal lifecycle methods, eight implemented-but-blocked and
501 omitted. It exposes160 fixed SDK reads. These are source coverage counts,
not connected-validation counts. The feasibility audit explicitly accounts for
all42 unavailable named library/lifecycle actions.

## Outstanding acceptance

GitHub CI, marketplace installation and fresh-runtime disposable validation
remain pending. Offline tests do not satisfy connected acceptance. The draft PR remains
unfinished; the feasibility report tracks further implementable work, including
integrating the existing restricted flat schematic-topology diagnostic into
type-1 transactions with the same profile retained through every lifecycle and
recovery phase. Its current diagnostic-only result cannot substitute silently
for the former compiled topology proof.
