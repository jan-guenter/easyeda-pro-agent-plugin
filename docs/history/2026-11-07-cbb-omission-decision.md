# CBB reader omission decision

Backlog group7 is closed for this batch as a concrete omission, rather than an
unfinished implementation promised without usable data. `eda.lib_Cbb.get` and
`eda.lib_Cbb.search` remain omitted. Their exact coverage entries now link the
retained evidence and state the condition for reopening this decision.

The [pinned getter investigation](2026-11-04-cbb-and-pcb-hit-reader-feasibility.md)
established that CBB retrieval reads a project and its branch structure, then
joins schematic/PCB board references. Desktop search refreshes local project
paths. Neither operation can use the existing generic component metadata GET.
The three fixed anonymous requests recorded there returned HTTP403. Their
permission failures establish no board membership or online absence.

The [official documentation research](2026-11-06-cbb-public-witness-research.md)
and [source follow-up](2026-11-06-public-cbb-source-follow-up.md) found no fixed
positive anonymous system-owned project/branch witness. The latter also records
the exact shipped system-library inspection: 205 tables, zero project rows and
zero board rows. This is a bounded result about that file, not the online
catalog or authenticated account access. Those observations are preserved.

No additional HTTP/SDK request, private-library enumeration, project opening,
credential use or CBB mutation was needed for this decision. A replacement may
be implemented once a positively retrieved anonymous system-owned project and
branch support exact owner, search/detail and reciprocal board joins. Missing,
malformed and permission-denied responses must remain distinguishable from an
empty search result.

Other backlog groups remain active. This decision does not complete the writer,
library lifecycle, final coverage reconciliation or release work.
