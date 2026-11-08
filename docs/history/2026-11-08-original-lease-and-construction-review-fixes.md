# Original lease and construction review fixes

Two supplied review findings were verified against the maintained source and
fixed without changing public schemas, native helper bytes or resource limits.

A malformed JSON reply previously rejected only its pending request. It left the
closed generated-file helper usable, so a subsequent valid release could falsely
report `fileLeaseHeldUntilRelease: true`. Malformed JSON now poisons the original
session before rejecting the saved request, stops that parser turn and prevents
later inspections from writing to the failed helper. EOF still closes only that
original helper and its read-only handles. The internal close result also retains
whether any earlier protocol failure occurred, so a valid release ACK followed by
unsolicited output cannot grant clean lease release. The public release result
and observation schemas remain unchanged; no process is adopted or signalled.

The project-structure constructor binding also allowed a second genuine startup
dependency to replace the transport's first one. It now refuses both repeated
binding to the same original dependency and replacement by another genuine
structure dependency. The first private identity remains intact. The existing
footprint purpose branches and marker rules are unchanged.

Seven focused tests pass. Real synthetic child streams exercise malformed
inspection, later request refusal, original EOF/exit and malformed output after a
valid release ACK, alongside the existing successful and refused lease paths.
Actual original structure channels verify copied inputs refuse, two distinct
genuine dependencies cannot overwrite the first binding, and copied transports
cannot inherit it. These are source-only regressions; no application or native
helper was allocated. Both TypeScript configurations, changed-file strict lint
and whitespace checks pass.
