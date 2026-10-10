# Disposable validation after the 182554 restart

This records tests of the installed `0.3.0+codex.20261010182554` candidate,
not connected validation of later source changes. No user project was opened or
edited. All CAD actions below used designated disposable validation projects.

## Completed observations

The fresh facade authenticated a newly contained EasyEDA process against the
reviewed external tuple. The installed bundle SHA-256 was
`cf27a4185963b497b41ddcf5c012f3eba606d90a503cfa312c54a2bbc320d31e`;
the compatibility manifest SHA-256 was
`e06496a7d714c26ba85c25ec0322c323b6630118c6f4d8c5e2f8c761c63952bd`.

| Operation | Observed result | Limits |
|---|---|---|
| Existing-project open | Completed once; active PCB, all 16 saved documents and the logical database unchanged. | No Save; not project creation. |
| Tab-to-split lookup | Two matching observations, exact owned tab tree, unchanged complete checkpoint. | Existing active PCB in one unsplit editor only. |
| Split-to-tabs lookup | Two matching observations, exact owned tab tree, unchanged complete checkpoint. | Same owned editor; no arbitrary project/tab enumeration. |
| Closed-symbol description change | Completed; all 16 documents checked, exact metadata/header effect, active PCB source unchanged. | Native persistence, no Save invocation or reopen. |
| Restore original symbol description | Separate checked transaction completed; all 16 documents checked. | Restored the description, not byte-identical native history. |
| Closed empty-page creation | Completed once; original native ID retained, exactly one empty page added and all 17 documents verified. | No drawing frame, editor open, Save, reopen or inverse. |
| Footprint editor open | Completed once through the asset-specific library route; saved state unchanged. | The generic document route refused this asset before dispatch. |
| Inactive PCB close | One call, one terminal notification, two coherent readbacks, target/frame absent, complete logical database and project records unchanged. | A separate clean footprint remained active; no Save, reopen, activation or undo-cache restoration. |

The first lookup request copied the entire context response into
`expectedContext`, including the optional `runtimeIdentity` diagnostic. Admission
refused before method dispatch. Supplying the observed project/document selector
then succeeded; no guard was relaxed. The connection reference now distinguishes
the selector from diagnostics and from the separate stable fingerprint.

Symbol metadata updates regenerate native header fields. The first update also
removed the old header's user field, as the operation-specific proof explicitly
reports. Restoring the description does not undo those native history changes.

Private journals retain the complete evidence. Public terminal commitments:

- Project open: `0a061acfbc056b24faecc0ee3370620124ebcddf3bd835b5c22e4be2ff645d0c`.
- Forward symbol metadata: `18e31e7b158e9ccb336e7be194182e834173c0dca7b4a2397d8fb8c72d434b89`.
- Description restoration: `c0a935a7c157b2564dd9104ae0e6d404faeaf1b3ab19baeedcc24a73464671d1`.
- Empty-page creation: `9cd7e7858c90b5d3477d5da8c8b80055e832a651e9e54beb8e3c0cddb609993a`.
- Footprint open: `39785e77cafbbf21339aee444810d9c317a2533d09db0dac0fdcc02239027821`.
- Inactive PCB close: `1ffeb66c70b0236c7907a2a8c4fa093ee0cda11d5ba2fad149ce66015aaf75dc`.

## Closed fixture

Native window inspection proved the owned foreground in an active unlocked RDP
session. A desktop capture showed only Start Page and the expected footprint.
Normal close made no Save/Discard choice; subsequent discovery returned no
EasyEDA process. Every transaction above was already terminal.

The post-close MCP checkpoint request refused because its authenticated bridge
scope requires a live proxying session. The unchanged maintained offline
`scripts/checkpoint.ts verify` then verified the final receipt with pinned Node
24: source and checkpoint matched their receipts, logical database equality
passed, and `sourceChanged` was false. No editor was restarted for that check.
Closed-file SHA-256:
`aa389b692eddf0e64d231637c80243553d75d8e819e1fa9546ea48102c6328a7`.
The fixture now retains the new empty page and native metadata history; it was
not restored to its earlier bytes.

## Source work under review

Parallel source work adds ordinary empty-symbol creation, a single-page
display-only schematic transaction profile, earlier retention of native creation
IDs, and bounded concurrent artifact verification. These changes have not yet
been installed or connected-tested. General type-1 electrical edits remain
blocked; the hidden annotation/SaveAll compiler is not being re-enabled.

The general computer-use helper failed during initialization in this WSL
workspace, before performing any UI action. Process-bound native controls remain
the available GUI path. That initialization failure is not evidence about the
current Windows foreground or RDP state.

## Test isolation incident and correction

A new coordinator test statically imported an artifact module before binding
its temporary directory. It wrote eleven synthetic journals and one synthetic
Save-intent file into the live operations directory. No CAD call occurred. The
native edit gate correctly refused the next fixture-setup click before dispatch.

The exact test provenance, fake identities and absence of dispatch evidence were
independently reviewed. A one-shot, descriptor-checked archive moved those twelve
files to retained private evidence, without deletion or journal-flag changes.
All 2,793 unrelated files retained identical bytes, modes and inode identities.
The complete unchanged inventory commitment is
`a85ba2d353f5c2bddb5384ffec2157932b0653e10152656663a8d74af9e92fa0`.

The test now imports after isolation and checks every artifact root. The test
entrypoint also preloads builtin-only per-worker isolation before any static
application import, including independent credential/upstream path overrides.
Adversarial subprocess tests cover inherited live-like paths, static imports,
failed-test evidence retention and separate worker roots. Production journal
admission and quarantine remain unchanged.

## New flat-display fixture and checkpoint correction

A separate disposable local project was created through observed native controls.
Its single ordinary schematic page contains the default drawing frame and one
plain text object. The current-document File Save action was clicked once, then
the application closed normally without a prompt choice. Discovery proved exit.
The maintained offline checkpoint verifier passed: both files match their own
receipts, the logical databases are equal and the source is unchanged. Decoded
history contains nine documents and exactly the intended text. The old disposable
fixture remains closed and verified; no user project was opened or changed.

This real checkpoint exposed a new profile defect before installation. SQLite
online backup preserved the complete logical database but changed physical file
bytes. The profile incorrectly required source and backup SHA-256 to be equal.
The correction removes only that unsupported cross-file comparison. Each file
still requires its own exact receipt hash and identity; cross-file logical dump
equality, history-to-backup binding and the immutable plan remain mandatory.
Regressions cover differing legitimate byte hashes and wrong receipt, history
and logical-dump evidence. A real synthetic SQLite database supplies an actual
maintained backup receipt; normal SQLite commits produce differing file hashes
with equal logical dumps. Preparation succeeds with all retained receipt fields.
A later VACUUM leaves the logical dump unchanged but is rejected as source drift.
The schematic observations in that test remain synthetic; it is not a connected
writer test. Candidate193600 is not installed. Corrected candidate194400 passes
1,827 facade tests, one platform-specific skip and 424 bridge tests, with strict
types and type-aware lint clean. Reproducible bundles, compatibility, repository
and privacy checks, all seven skills, actionlint and the sequential offline
doctor also pass. An earlier doctor invocation lost its MCP connection during a
concurrent rebuild; that failure is retained separately from the passing
post-build check. Publication and installation evidence follows separately.
