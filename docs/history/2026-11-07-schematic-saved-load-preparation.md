# Schematic saved-load preparation

The source batch after `994f297c` adds a separate original-reference plan for
cold loading the seven-record schematic writer's saved history. It requires
the complete original closed SQL proof, unchanged managed checkpoint and
observed original helper release. It preserves both schematic document IDs,
the full native history rows and exact ciphertext/plaintext. It creates no
replacement native generation and grants no cache deletion or project opening.

The Via plan and the schematic plan share one inert completed-SQL projection.
Their private checkpoint registries remain separate. Existing result contracts
and native control limits are unchanged.

The existing Via projection required every plaintext chunk to end with a
delimiter. The fixed native Save body ends at its final record. The shared
projection now parses the full bounded plaintext and preserves both actual
forms. Four focused checks passed, including both append/mutable SQL shapes,
encrypted two-document schematic data, exact untouched peer records and copied
checkpoint refusal. The exact pinned vendor `flowParseFull` processed the
initial and saved bytes without adding a delimiter. Strict changed-file lint
and TypeScript checks passed.

An initial test using the generic durable-history materializer refused the
generated archive's ticketless initial document headers. That is a different
parser contract. The retained positive check uses the actual pinned cold-load
parser, which accepts that input. No production parser guard was relaxed.

These checks use synthetic SQL and inert parser objects. Original writer
completion, fresh cache exclusion, native cold loading and saved/reopened
validation remain pending. No user design was opened or edited.

The next source slice adds an opaque closed-lifecycle composition. It requires
the original completed Save-drain token, observed original termination and
closed snapshot before comparing the full SQL delta, preparing the managed
checkpoint and deriving cold-load inputs. Repeated calls retain the same
preparation promise, including failure. Its original-reference lookup joins
every constituent again for a later separately admitted reader. Matching JSON
cannot issue the packet or bypass the drain token. The focused entry-guard
check, strict changed-file lint and TypeScript checks passed. Positive original
writer completion and native reopening remain pending.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `5200b7f7519f77b113bb47704a9d5eec732accaa`; its
committed tree is `de5edfc86bb1fdf477837723eb85635f11ca9715`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
