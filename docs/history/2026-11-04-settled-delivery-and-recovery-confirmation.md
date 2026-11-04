# Settled delivery refusals and recovery confirmation

This follows the [failure-evidence and dependency-count corrections](2026-11-04-forward-failure-evidence-and-dependency-count.md).
The full review of `9ff7df8531a56154d7449860e6923042517cb564`
reported three issues. That unchanged head passed all eleven required GitHub
CI jobs, with 14,113 facade passes, five supported platform skips, zero failures
and 424 bridge passes. Those results do not validate these later corrections.

The foreground result publisher now returns an explicit pre-emission outcome
when a result needs a response file or its parent directory fails the private,
canonical-directory check. Neither outcome creates a response file or emits
output. The manager reports the exact already-retained evidence file, bytes
and SHA-256 without replaying the operation. Ordinary calls remain active;
interrupted calls retain only their original restricted cleanup channel.
Actual response-file, emitter and evidence failures keep the existing blocked
path. An emitter exception with the same message as a deterministic refusal
cannot be reclassified. The separate single-session client keeps its previous
stop-on-refusal behavior.

The focused manager regression uses an actual SDK child with synthetic native
state. It covers both refusal reasons on normal and interrupted cleanup calls,
complete retained result bytes, unchanged original child/generation and genuine
retirement through original stdin EOF and exit. Publisher checks preserve real
emitter exceptions and existing-file refusal without modifying that file.
These are local controller tests, not connected native validation.

Historical opening recovery now clears its private pending observation only
after rereading the exact matching published result. This includes publication
that wrote the result before losing its acknowledgment. Failed publication
still retains its original proof and refuses another operation until settlement.
Four focused tests passed, including one resolver handling two distinct real
managed histories, preserved intent bytes and unchanged unknown native outcomes.
Types and strict targeted lint passed for that source slice. No historical
schema, producer attribution or native authority changed.

Both the forward-prewrite and controller guides now require user authority
before forcibly aborting an original EasyEDA Job. The confirmation field records
that authority; diagnostic approval or the field alone does not grant it.
Existing standing user permission remains usable within its authorized scope.
Abort acknowledgment still proves neither unchanged saved state nor termination
or helper release.

Final combined checks, unchanged-payload CI and full review remain merge gates.
The separate source-sealing/content reader and future execution-owner work are
unpublished. No production design was opened, edited or saved in this follow-up.
