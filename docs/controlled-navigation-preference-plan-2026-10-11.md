# Controlled navigation-preference change plan

Date: 2026-10-11. Status: source research and planning only, not execution-ready.

The pinned application sets `pcbCommandTab` to Boolean `true` when the user opens
the PCB Command panel. This is a panel-state preference, not a checkbox found in
the Settings dialog. Opening that panel also saves the whole preferences object.
The save can migrate BOM-template storage and start backup-retention cleanup.
Changing one intended preference therefore needs a broader, explicitly bounded
side-effect plan.

This note records no actual user preferences, backup counts, private paths or
project names. No application launch, setting change, backup copy, deletion or
design open was performed for this research. Planning permission does not
authorize those actions. The plugin's existing navigation refusal remains in
force.

## Pinned sources and public documentation

The installed application is `3.2.149.88089769`. Source paths below are relative
to its `resources/app` directory. Offsets are zero-based UTF-16 string offsets,
not byte offsets. Source inspection did not execute these files.

| Source | SHA-256 |
| --- | --- |
| `assets/pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `app.js` | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |

The [official Command documentation](https://prodocs.easyeda.com/en/pcb/tools-command/)
describes a PCB/footprint command input at the lower left, opened through
Tools > Commands or the default `C` shortcut. It does not document preference
persistence. The pinned native menu instead says **Advanced > Run Command...**.
The observed menu must match the pinned source before acting; the documentation
alone is not an execution selector.

## Exact native UI action and its limits

In `ui.js`, the Advanced menu at `10360258` binds `Run Command...` to
`command-tool`. The default `Command` shortcut at `8156039` is `C`. The menu's
mode configuration omits this action on Home, a blank workspace, schematics and
symbols. Use only an explicitly approved disposable PCB for the proposed action.
There is no reviewed Start Page checkbox that avoids opening an editor.

The `command-tool` handler at `16215482` creates the bottom `pcbCommand` tab if
needed, focuses it, sets `pcbCommandTab` to `true` at `16215731`, then calls
`saveToServer(false)` without awaiting it. Opening the panel is the entire
intended UI action. Do not type a command or press Enter. The Command component
at `12061821` submits design commands through its input handler; displaying the
input is not permission to submit one.

Closing the bottom Command tab is not a harmless cleanup step. The close handler
at `12202516` sets the preference back to `false` and saves again. Do not close
that panel or repeat the menu action as an improvised rollback.

There is also a prerequisite hazard. The ordinary PCB/footprint tab-click handler
at `11121307` reads this preference at `11121849`. When it is absent or false,
the handler removes the Command tab, writes `false` and calls the same preference
save. Merely opening the disposable PCB to reach the menu can therefore trigger
the shared side effects first. Any later execution approval must cover that
launch and navigation sequence, not only the final menu click.

## What a preference save actually does

`setCacheObj` at `15791892` updates one field in the parsed local preferences,
then serializes the whole object through `setPreferences` at `15792388`.
`saveToServer` at `15794007` takes a whole-object snapshot, obtains BOM templates,
fetches the current user, synchronizes a language field, stamps the application
version, then posts the serialized object to `/api/user/preference`. Its `false`
argument suppresses a notification, not persistence. The caller's unawaited
promise and the return-value behavior are not a reliable completion receipt.

The BOM path matters even though this task is unrelated to BOM editing:

- `V2` at `10685407` can migrate a nonempty legacy `bomTemplates` preference to
  CacheStorage. `Dwn` at `10684996` removes the legacy preference and calls
  `saveToServer(false)` again.
- `aEi` at `10685066` opens the `bomTemplates` cache. This may create storage,
  so invoking this routine is not a passive inspection method.
- `rEi` at `10685713` checks the selected `prerformTemplate`. An invalid selection
  can become `None` and trigger another unawaited preference save.

One menu action is therefore not a guarantee of one POST or one changed field.
Any preflight must inspect only approved migration indicators through a genuinely
read-only method, without calling these helpers or exposing template contents.

The desktop controller at `app.js:2471506` passes the entire preference string
to the setter for `ctx.user.uuid`. The service at `2215919` writes
`users.preference` first, then starts retention work for the current in-memory
project registry. Its asynchronous `forEach` callbacks and individual deletions
are not awaited to completion. A successful UI response does not establish that
cleanup has settled. A retry or rollback through the same setter repeats the
retention path.

## Why the previous metadata inventory is not a complete preflight

The persisted `db_paths` history and the runtime project registry are different
sets. `projectPaths` at `app.js:2321115` normally returns the latter and also adds
fields to its descriptors. It is not a passive read-only endpoint. Startup
`cC` at `2622196` calls `Ap` at `1428879`; that routine scans configured project
directories through `W0` at `1322297` before a project is opened. A blank Start
Page does not prove an empty retention candidate set. History rows are not an
upper bound on that set.

Backup listing at `2214705` derives a sibling backup root from the project file's
basename. Deletion derives its root from `G.show(project).name`. These can differ.
The recursive listing at `2215160` considers regular files without an extension
filter and records modification times reduced to seconds; the setter at
`2215919` sorts on those values. A filename-only audit
cannot claim it identified every possible deletion target. Reading project
contents to resolve the stored name is outside this plan.

There is a narrower sufficient condition that avoids needing deletion-target
identity. Let `L(P)` be the complete native-equivalent listed backup set for each
possible registered project `P`, and let `N` be the exact numeric retention value
in every preferences object that the proposed sequence could submit. If `N` is
a finite nonnegative integer and `|L(P)| <= N` for every such project, the pinned
setter does not call its deletion routine. At equality it enters the outer
comparison, but no zero-based list index reaches `N`. This is a source-derived
no-deletion condition, not evidence that it currently holds.

Using that condition requires complete configured-root/startup discovery coverage,
the relevant current browser-preference projection and all possible submissions
from BOM migration. Unknown roots, symlinks, scan limits, changing files or
ambiguous coercible retention values must refuse the condition. The proof is
point-in-time, not an atomic lock against concurrent application or user changes.

Persisted preference rows also do not identify the active user. Startup's
`zN` at `2567445` selects a user through the license username; the database has
no equivalent current-user flag. Do not infer the active row from row order or
nonempty preferences, and do not read credentials or license contents to fill
that gap under this plan.

## Candidate controlled procedure

### Phase A: finish the read-only preflight

The user has authorized a relevant shared-preference and backup-retention audit,
then requested planning only. Stop at this plan handoff. Before further access,
confirm which proposed reads remain inside that established audit scope. Browser
storage or other opaque contents beyond the original audit need an explicit
boundary before access.

A narrowly scoped continuation would project configured `APP_PROJECT_DIR` roots,
enumerate startup-discoverable project and backup metadata without opening design
contents, and obtain only the browser preference and BOM-migration indicators
needed to evaluate the sequence above. It must not reveal credentials, unrelated
preferences or BOM-template contents. Do not call application history, preference,
cache or registry helpers merely because their names sound read-only.

The result should either establish the no-deletion condition for the complete
candidate set or state exactly which scope remains unknown. If matching a runtime
user/browser preference to a persisted row cannot be proved within the approved
scope, retain that uncertainty. Do not substitute an arbitrary row. Complete this
preflight before the first launch, restore or navigation that could save
preferences, not after the disposable PCB is already open.

### Phase B: agree on preservation only if needed and explicitly authorized

No backup copying is authorized by this note. If the next proposal relies on
preservation, first enumerate the exact approved preference database, relevant
BOM storage and backup sets, with their privacy and recovery requirements.
Opaque backup copying and hashing read file bytes; metadata-only audit permission
does not authorize that. A whole preferences database or browser-profile copy can
contain unrelated preferences or credentials and must not be silently included.

Prefer a proven no-deletion precondition over deliberately allowing retention
cleanup. If complete preservation is still required, seek explicit authority for
the concrete files, private destination and verification method before copying.
Do not open a production design to discover preservation targets. Those targets
are not yet complete, so this plan does not claim recovery readiness.

### Phase C: obtain the final change approval, then use the normal UI once

Only after the concrete preflight and any authorized preservation are reviewed,
request approval for the exact existing-profile change sequence. Disclose the
necessary application launch and disposable-project navigation, possible initial
false-preference save, whole-object persistence, BOM effects and retention
behavior. Do not describe it as an isolated single-field write.

The proposed action is the observed native **Advanced > Run Command...** menu on
the approved disposable PCB, with no command entered. Use neither arbitrary
JavaScript nor direct SQL, a preference-file patch, hidden UI call or disabled
plugin guard. If the normal UI differs from the reviewed source or the required
disposable context cannot be established, stop before the action.

### Phase D: verify without replay

Verification must distinguish the Command panel's presence, Boolean `true` in the
relevant browser preference, correct-user durable persistence and completion of
all disclosed side effects. None alone proves the others. Review the actual
changed-key set privately; unexpected changes are a stop, not an invitation to
normalize the whole preference object. Check backup invariance against the
approved preflight or preservation evidence and retain its point-in-time limit.
Do not expose raw preferences or template data in the report.

Keep design-source and checkpoint checks separate from preference verification.
A successful settings action grants no new CAD writer authority. Existing
disposable validation, journal, no-repeat Save and lifecycle rules still apply.
Do not repeat the menu action, close the Command tab to reset it, or replay a
preference save after an ambiguous result. Stop and review the original evidence.
Any rollback needs its own plan because the ordinary setter can prune again.

## Handoff

The source establishes a normal UI route and explains its side effects. It does
not establish a complete current preflight, preservation set or execution grant.
The next possible action is a bounded read-only continuation with any newly
needed storage access made explicit. No setting change, backup copy, deletion,
application launch or production-design access follows automatically from this
plan.
