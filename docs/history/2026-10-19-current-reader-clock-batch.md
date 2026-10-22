# Current readers and schematic clock batch

Payload freeze: `0.3.0+codex.20261019125900`. Reader implementation, baseline
corrections, focused checks and independent review are complete. The final
release and installation evidence belongs to the protected PR and `AGENTS.md`.
At this freeze, the active host still runs `0.3.0+codex.20261019111307`.

The user requested more useful changes per restart. This batch combines
current-runtime reader coverage, a fix for the next concrete schematic-lifecycle
failure, and the corresponding discovery and skill guidance. It does not enable
general schematic or PCB editing.

## Reader additions

- [Image geometry](2026-10-19-current-pcb-image-geometry.md): vector Image and
  Picture placement/dimensions through the existing PCB geometry tool. Both
  selected and collection reads validate the complete observed family first.
  Assets, paths and rendered bounds remain omitted.
- [Schematic metadata](2026-10-19-current-project-schematic-metadata.md): one or
  all containers with complete observed native child rosters, without opening
  a sheet. This does not read a circuit or prove saved membership.
- [PCB metadata inventory](2026-10-19-current-project-pcb-inventory.md): all
  observed PCB metadata through the existing no-editor reader. Its selected
  `getPcbInfo` contract and rename-preflight result remain unchanged.

Discovery, generated per-method coverage, tool policies, package inventories
and task-specific skill references are updated together. New readers are
source-reviewed and offline-tested, not yet connected-validation claims.
The packaged catalog is 47 tools, with 22 registered in restricted mode. The
five new routes bring the cross-runtime guarded route count to 352. The
774-method status inventory is unchanged; route totals are not a count of
currently executable or live-validated SDK methods.

## Installed schematic attempt

The restarted111307 facade was independently matched to all497 source files,
three runtime files and its compatibility manifest. Maintained installed-payload
comparison passed1515files,30,972,703bytes and42directories with exact bytes and
modes. Final main CI from the previous release passed; it was not rerun.

One ordinary launch authenticated. The context reader observed Start Page with
no current project. One disposable opening completed, confirming the exact
native PCB identity. The schematic case then captured its original owner,
requested one normal close, proved root and Job termination, and collected its
closed copy, checkpoint and complete SQL inventory.

Baseline projection refused because the schematic container's native metadata
clock was derived from a child sheet newer than its direct SCH header. That
supported native behavior was outside the previous implementation's admitted
subset. No rename, scratch-clock launch or explicit Save was dispatched. The
failed case was retired through its original owner; the ordinary launcher also
recorded original termination. The disposable file remained598016bytes with
the same digest before opening and after final retirement. Production designs
were not accessed.

Evidence is retained privately under the paths in `AGENTS.md`. The original
attempt and all its consumed actions must not be replayed. Child-derived clock
support now distinguishes direct-header and effective-native
metadata clocks, without changing children or relaxing saved-effect checks.
It will require a new installed-generation case, not reuse of this failed one.

A private offline check of that retained copy passed the new metadata projection,
then exposed an unrelated restriction that confused imported ordinary symbols
with block symbols. Further source review also found that stored sheet structures
can omit the `docType` field supplied by the native metadata getter. Both
corrections are included in this batch. They preserve the distinction between stored
records and getter output; neither grants startup, writing or saved-state authority.

A second diagnostic passed metadata, then found that unchanged ASCII child
names containing capital `I` were subject
to the new rename title's restriction. The child-only correction requires the
actual native getter and both ASTs to match the ASCII-lowercase projection
before writing. Other native normalizations remain unsupported. The original
desired/container title policy stays unchanged.

The third, separately reviewed retained-copy diagnostic passed metadata, the
complete child roster, static startup premises and a pure structure projection.
All four before/final artifact hashes matched. This establishes offline
preparation, not native normalization, clock provenance or connected execution.

## Remaining implementation and validation work

The release sequence uses one frozen payload, required release checks and
protected CI, followed by Git-marketplace installation and exact installed-file
verification. Connected execution then requires a fresh session.

The wider backlog remains explicit:

- Complete the disposable schematic rename lifecycle on a compatible baseline.
- Current PCB text writing needs a complete pre-create model/queue/worker
  observer plus exact saved-effect and reopened proof. The
  [observer audit](2026-10-19-current-pcb-text-lifecycle-observers.md) explains why
  closing the original generation only solves the later completion problem.
  No inert prerequisite-only PCB release is planned.
- Populated Image/Dimension and new project-metadata live cases remain separate
  validation work. Historical empty or earlier-generation results do not cover
  these additions.
- Current polygon-family observation remains blocked by serializer side effects;
  standalone page/canvas readers and broader current geometry writers need their
  own bounded adapters and persistence models.
- Broader library/3D, placement/routing/copper, rules/stackup, ECO/ERC/DRC and
  manufacturing/export families retain their per-method omissions and gates.
  Hidden annotation/Save All is not a read-only export workaround.
- Bundled upstream bootstrap and additional independently admitted platform
  tuples remain packaging/compatibility work.

The generated coverage inventory is the exhaustive method-level record. These
groups summarize it; neither a declared method nor an implemented adapter means
that an entire SDK family has been validated live.
