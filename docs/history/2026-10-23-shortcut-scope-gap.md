# 2026-10-23 shortcut scope-gap handling

## Scope and retained failure

This source-only change follows the installed
`0.3.0+codex.20261023175500` shortcut observation. The parent agent reported
`ok:false`, `stage:"result-document-types"`, `sample:1`,
`publicCallsAttempted:1` and `cleanupFailed:false`. Original normal closure and
termination completed. The call was not repeated.

The failure identifies the result guard, not the offending command or value.
The source finding below makes one malformed registry shape plausible. It does
not establish that shape as the cause of the retained live refusal.

## Installed source evidence

The read-only review used the installed UI asset
`pro-ui/3.2.198.2800f583/js/ui.js`, 17,468,192 bytes and 17,467,651 UTF-16 code
units. Its SHA-256 is
`3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6`.
Offsets below are zero-based JavaScript UTF-16 positions.

- The unique `"log-tool"` entry starts at 8,307,631. Its range at 8,307,643 is
  `[4,2,5,3,,0]`, with a hole at index 4. Its English label is `Log`.
- `static getShortcutKeys(e=!1)` starts at 17,248,764. Both filter branches
  return `documentType:r.range` directly, at 17,248,936 and 17,249,071.
  The false branch first requires `r.isCustomize`; the true branch includes
  the system entries.

The public result has no stable command identity. The adapter therefore admits
only the source-known shape, not an asserted `Log` command. Transport treatment
of the hole was not observed in this review. No official documentation or new
network request was used to infer such treatment.

## Implemented boundary

Only the 209 program with `includeSystem:true` accepts one six-slot document
scope array shaped `[4,2,5,3,<gap>,0]`. It returns a tagged fifth slot preserving
the observed representation as `{unmappedScope:"hole"}`, `"undefined"`, or
`"null"`. It does not invent a numeric scope, delete the slot, change the
registry or invoke the command.

Other array lengths, changed fixed slots, negative zero, additional properties,
accessors, inherited gap values and a second exceptional row refuse. Native
input already containing a tag also refuses. Scene arrays, default or explicit
false filters, and the older 206 program retain their former strict rules.
The output decoder accepts the same tagged tuple only for a bound true filter.
Its final zero explicitly rejects `-0`, which Zod's plain literal check accepts.
Two observations must still match, including the gap representation. All
keyboard, CAD and persistence authority remains false.

## Verification and limits

Independent review covered the generated program, strict result decoder,
filter binding, existing owner checks and source evidence. Focused tests cover
all three native representations and tagged output, all other missing-slot
positions, raw tagged-input refusal, scenes, duplicate exceptional rows,
accessors without getter execution, prototype drift and representation changes
between samples.

Under Node 24.18.0, npm 11.16.0 and soft core limit zero, all 14 shortcut tests
passed with no failures or skips. Targeted type-aware Oxlint completed with zero
warnings. Full TypeScript and bridge-stub typechecks passed. Earlier lint runs
reported comment capitalization, consecutive `push` calls and immediate array
mutation; these were corrected before the clean run. A read-only source/Zod diagnostic used
ambient Node 26.12.0 and npm 12.2.1, not the verification runtime.

This is implementation and synthetic validation, not connected acceptance of
the new representation. The previous live refusal remains recorded. There was
no live retry, project access, Save, settings change, installation or publication
as part of this subtask. The parent release workflow owns final package checks
and any later installed validation.

Reviewed payload SHA-256 values:

- `server/src/shortcut-keys.ts`:
  `bdea1face8d753e7ff8cd0cdab55b6394b6df0b9fad9a6d913a3c4426e66d777`
- `server/tests/shortcut-keys.test.ts`:
  `def60473d3fade42997be7ed769db2b7aaeb76f37f0e7fa9807a14aaca2649af`
