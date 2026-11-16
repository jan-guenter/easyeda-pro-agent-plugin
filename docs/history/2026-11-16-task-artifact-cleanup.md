# Task artifact cleanup after the storage boundary correction

The user declined the proposed WSL disk recovery and requested cleanup of task
artifacts. No WSL disk, mount, distribution or storage configuration action was
performed. The user's own approximately 30 GB cleanup is credited to the user
and is separate from the following recorded removals.

Ten obsolete source worktrees were removed through normal Git worktree removal
after ownership, process references, clean or archived source, and retained HEAD
references were checked. The first eight removals recorded 2,362,425,344 allocated
bytes. Two further removals recorded 577,253,376 allocated bytes including their
Git registrations, giving 2,939,678,720 bytes gross across the ten recorded
removals. These are Linux filesystem allocation figures; Windows physical disk
space and virtual disk compaction were not measured or changed.

For the final three candidates, all 188 dirty source paths were archived with
HEAD/index patches, exact untracked contents, modes and hashes. Full source
reconstruction verified the archives before removal. Twenty frozen archive files
retain 6,941,158 logical bytes, including 31 dirty variants absent from reachable
Git blobs or current source and the distinct historical dependency packages.
The final removal's archives and receipts occupy 18,354,176 allocated bytes;
its net reclaimed allocation is 558,899,200 bytes. Scratch reconstruction trees
and the owned Python cache were also removed after verification. Initial
reconstruction/index/mode setup failures remain in private evidence.

Two unreferenced candidates were removed. The third, `native-lookup-delete`,
remains because fifteen registered worktrees still use its `node_modules` through
external symlinks. A bounded census found those references and prevented its
removal. Its archived source does not authorize deleting the still-used dependency
target. Active source, modes, status and HEAD were compared immediately before
and after the two removals and remained unchanged. Source integration that
changed the earlier baseline first stopped the removal guard; a fresh baseline
was taken only after that integration settled.

Private hash manifests, source archives, process/reference inventories, preserved
refs and terminal receipts retain the detailed provenance. Unique runtime
evidence, active checkouts and the referenced dependency target remain. This
cleanup sends no process signal, uses no forced worktree removal, changes no
installed cache and grants no new native or CAD authority.

## Completed review checkout removal

A subsequent eleventh cleanup removed only the finished Windows/bootstrap review
worktree through normal Git removal. Its clean source matched 6,114 original
Git blobs; all 17,702 reachable objects remained readable. Its exact branch/ref
at `b3fb982c744586d49801d261c7e13829f4a24f6a` is preserved. No process,
external dependency link or task-root consumer used it. Active private/public
trees, modes, symlinks, HEAD/index/control files and clean states matched exactly
immediately before and after removal. The removal accounts for at least
248,878,217 logical bytes; 3.69 MB of receipts are retained. These logical bytes
are not added to the earlier allocation figures as a single net-space claim.
Future installation comparisons use the current public checkout, not this
removed historical verification location. Its own idle metadata facade was
retired/closed with original pidfd-observed exit; no signal or forced removal
was used for this checkout cleanup.
