# Original startup cursor progress

The maintained producer observer now exposes startupProgress() through its
original owner/origin/operation registry. It reads the already-created
initial-cache, initial-sync and periodic-sync cursors without creating or
resuming a native job. Null means that cursor has not been created. Existing
cursors report exact acknowledged-resume/completed-call counts, settlement
passes and whether their one remaining metadata pass is available.

These immutable snapshots carry executionAuthorized: false. They cannot
create an owner, resume, action, SQL, Save or completed-frontier capability.
Native prefix enrollment still checks the actual original private cursors and
native completion acknowledgments after reproof. Serialized progress cannot
replace those references.

An original later producer pause may arrive while a previous cursor awaits
its final Promise metadata. The three existing settlement methods now allow
only that observer's own exact held marker to remain in place. They check the
same marker around every await and issue only getProperties for the original
retained Promise handles. They do not consume, resume, replace or clear the
held pause. Generic producer resumes remain unavailable. This lets an outer
coordinator settle the previous initial sync before routing the same held
periodic entry, without inventing completion from a delay.

The initial-cache cursor may own overlapping document/index puts. A suitable
extra metadata check occurs after actual initial-sync completion, not after a
sleep. canSettle prevents an outer coordinator from attempting settlement
before all original calls resumed or after completion. The cursor itself
still enforces its original stage, count and ownership requirements.

Twenty-three focused cursor/collector cases pass. They cover overlapping jobs,
pending and fulfilled metadata, exact progress counters and preservation of
the same held marker across metadata-only settlement. A production-Core and
synthetic-child case reaches the actual new lookup, observes only its own
empty initial state, refuses periodic dispatch before original initial-sync
completion and completes original cleanup. Both TypeScript projects, strict
lint and repository/MCP/all-skill checks pass.

No native grammar, request bound, helper byte or ownership grant changes.
The unchanged native compilation was not repeated for these Node-only status
methods. No tracked bundle/helper/pin, Windows, MCP or live native call runs.
Whole producer, writer, Save and persistence completion remain pending.
