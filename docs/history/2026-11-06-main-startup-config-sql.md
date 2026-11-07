# Current-profile main startup configuration SQL

`current-main-startup-config-sql.ts` pins the installed main app and its `h6`,
`KB`, `JB`, `DC`, table constructors and query builder. The fixed data contains
all 41 `h6` statements and the one `KB` statement after the original
`yo.runScripts` splitting rule. Local qualification against the complete pinned
installed app passed.

The pure comparator recognizes those exact chunks, JB transaction literals,
source-shaped expiration deletes, and the fixed cookie UPSERT with all nine
binding slots. The query builder inlines both expiration operands in SQL.
Those operands remain observed numbers; the comparator never reads a new clock.
Cookie values are checked privately and never enter a match packet, hash or log.

A match grants no native call. The actual main cursor must separately prove the
original `web.db` connection, latest version `25.10.31.1`, `yo`/statement lineage,
source-qualified JB or DC invocation, native clock identity and one-use
continuation. Selected-project writes remain held. Other database versions and
migration SQL have no matching branch.

Five focused tests, strict type-aware lint and full TypeScript checks passed.
No app, SQL mutation or native call was executed for this source increment.
