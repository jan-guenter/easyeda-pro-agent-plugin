# Original schematic writer and saved-reader journal join

The complete saved-reader workflow now accepts an optional third argument: an
opaque `CurrentSchematicRelevanceSavedReadbackParent`. Existing two-argument
standalone calls retain their behavior and distinct reader journal.

The fixed parent factory accepts only the genuine writer journal and saved plan.
The writer journal now keeps its original arguments/checkpoint in a private
registry; its assertion checks the exact bound owner, arguments, initial
checkpoint and unchanged method descriptors before reading any public method.
The saved-plan getter independently joins the same original owner/arguments to
its actual new closed checkpoint, drained Save, complete SQL and released helper.
Parent preparation requires that actual journal to have reached its original
`release-result`. Copies, another journal, replaced methods and a second reader
consumer refuse. The parent token grants no native or saved authority.

A fixed ten-record mapping publishes the existing writer reopen intents before
the reader's allocation, scene, close, exit and closed-file effects. Their matching
results follow genuine cold, scene, close, termination/helper-release and SQL
receipts. The outer workflow retains completion after the final saved acceptance.
There is no caller callback table or new historical schema, and no intents are
manufactured after their effects. Reader cleanup remains in its own distinct
journal; the enclosing operation must publish its own original failure outcome.

Both publications retain their original Promises and candidates. A lost parent
ACK blocks native cleanup until that same publication is rechecked/settled;
settlement cannot replay the mapped phase or the reader effects. Parent identity
is rechecked around reader awaits. A failed reader still cannot grant acceptance.

Ten focused tests pass: the five existing native-intent journal cases, two real
parent/journal publication cases, two full reader sequencing cases and one
blocked-parent cleanup case. Tests use real managed artifacts and explicit inert
historical/native issuers; copied tokens refuse before getters, exact class/owner
lineage is retained, original lost-ACK candidates settle once and each intent
precedes its actual reader effect. Both TypeScript configurations, changed-file
strict lint and whitespace checks pass. No Core/native command, helper, pin,
bundle or application process changed. Complete outer writer/group orchestration
and connected validation remain separate work.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`2077a8792eed02e2b8705a5d809992b339ee47be`; its committed tree is
`54e5b499120447a768920504ae658f827505f48e`. Its Git author timestamp is
`2026-11-08T00:47:49+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
