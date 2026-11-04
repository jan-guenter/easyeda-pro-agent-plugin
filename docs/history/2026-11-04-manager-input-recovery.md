# Recoverable manager input framing

This follows the [conflict closure and full-review repairs](2026-11-04-conflict-closure-and-review-repairs.md).
CodeRabbit's complete review of `d4c09cf5b12bf2f6581b54ec3e31b08f8dcc2aba`
marked the preceding cleanup and failure-budget findings addressed, then found
one further Major: oversized input could throw out of the manager's async stdin
iterator, retaining its child without a command channel for cleanup.

The manager now has its own bounded reader. A fixed 64 KiB buffer retains only
one admissible frame. Oversized input drains through its newline, produces one
structured nondispatch rejection and permits subsequent commands. Complete
frames use fatal UTF-8 decoding without replacement or BOM stripping. Ordinary
JSON/schema rejection stays under the existing manager handler. Actual EOF
remains actual channel closure and grants no implicit retirement or replacement.
The shared legacy client reader is unchanged.

The bounded input/client regression slice passed 26 tests. The maintained CLI
loop uses the real manager and isolated original child to prove that oversized,
invalid UTF-8 and malformed JSON input leave the same PID/generation available
for inspection, offline calls, retirement, EOF, code-zero exit and stdio closure.
Types and strict targeted lint passed. These are isolated controller checks;
they establish no connected design mutation or native qualification.

An existing startup-conflict test initially expected the old single-tool
catalog. The new conflict server correctly exposes both status and session.
The assertion failed before its cleanup and retained two inert private test
children. Their identities, private roots and lack of native resources were
verified; each received one pidfd-bound normal SIGTERM and its exit/reaping was
observed. The failed run and its conservative pre-signal verification refusal
remain retained. The test now expects the current catalog and establishes
supported cleanup before fallible assertions. No real controller or user
journal was signaled or edited by this test cleanup.

The d4 build and Windows checks passed, with matching source/runtime pins and
424 passing bridge tests. Its full CI later ended with nine required jobs
successful, one facade shard cancelled and the aggregator failed; this is
retained as incomplete facade evidence, not a passing suite. The corrected
payload still requires exact-head CI and review before merge.

The root-owned d4 controller continues its separately recorded, read-only
historical resolver on the unchanged frozen payload. The new input code is
not patched into that live process. Its original owner must reach a terminal
result and normal retirement before frontend replacement or installation.
