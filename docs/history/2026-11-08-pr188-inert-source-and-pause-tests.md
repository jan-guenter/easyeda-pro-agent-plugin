# PR188 installed-source and paused-fixture corrections

The GET result and sender tests now use the shared version-pinned installed
asset helper for all six source reads. An unconfigured installation may skip;
a configured missing or unreadable asset fails. Their original complete source
qualifiers and test selection remain unchanged.

The sender and reference-entry paused-thread handlers now use the maintained
resume-before-reject helper. Their Inspector sessions also disable in finally.
The result fixture had the same adjacent paused rejection pattern and now uses
the same cleanup. This prevents an assertion from keeping the main test thread
paused while waiting for its rejection. Original function source, pointer,
Promise and descriptor assertions are unchanged.

The saved-load bootstrap success case independently asserts that the actual
production runner's command list contains no project resume. The separate
fixture-only later-resume detector remains. The runtime assertion uses string
membership because the current strict command union already excludes project;
it will still catch a future accidental project command without widening that
production union.

Fourteen configured focused cases passed with zero skips, plus four maintained
installed-source and Inspector-failure helper cases. Both TypeScript checks and
strict changed-file lint passed. No production code, protocol guard, budget,
helper artifact or live application was changed.

The canonical introducing commit is `0602bd1b`. A configured integration run
on the canonical import closure passed the same 14 cases with zero skips.
Concurrent unrelated source work was present, so these checks are scoped
observations rather than an exact complete release-payload suite. Final
unchanged-payload CI remains required.
