# Current project-opening diagnostics

Reviewed on 2026-10-14 against EasyEDA package `3.2.206.715d940d` and the
installed `133000` plugin. This was an inert source review. No application code
was evaluated, live API called, project opened, journal changed or production
data accessed. The earlier unknown opening outcome does not identify its cause.

## Confirmed adapter defect

The installed133000 opener pins `location.href` and `document.URL` to their initial
values and admits only the empty fragment. Ordinary project opening changes
that fragment. The post-call guard therefore rejects a normal successful path.
The same empty-fragment restriction prevents the current PCB layer, identity
and geometry readers from starting after that navigation. Their exact URL
immutability during a read is sound; their initial URL grammar is too narrow.
Sources: [opener](../plugins/easyeda-pro-control/server/src/current-disposable-open.ts),
[layers](../plugins/easyeda-pro-control/server/src/current-pcb-layers.ts),
[identities](../plugins/easyeda-pro-control/server/src/current-pcb-identities-program.ts),
[geometry](../plugins/easyeda-pro-control/server/src/current-pcb-geometry-program.ts).

The pinned UI establishes the complete causal path, using zero-based UTF-16
offsets into `ui.js`:

| Offset | Installed behavior |
| ---: | --- |
| 15071965 | `ZDe.preAdjust` publishes `C0.ADD_HASH` with the selected project. |
| 16704740 | `/pro-ui/hash/add/id` subscriber calls `fr.addProjectId`. |
| 16368606 | `addProjectId` calls `setHash("id", project, true, true)` unless already present. |
| 16365863 | `setHash` forms the fragment and calls `location.replace(pathname + search + fragment)`. |
| 16368896 | `changeActivePage` handles ordinary PCB focus and changes the `tab` fragment. |
| 16687914 | Ordinary tab activation publishes `onDocFocus`. |
| 16370545 | `listenTabChange` passes that focus to `changeActivePage`. |

This source contradiction warrants a fix. It does not prove the missing return
from the historical attempt was this guard rather than another failure. Keep
that attempt consumed and its accepted unknown effects unchanged.

## Reviewed fragment subset

The smallest useful ordinary-project subset is:

```text
#id=<exact project>
#id=<exact project>,tab=<entry>|<entry>|...
entry = [*]<document>@<same project>
```

For this adapter, documents remain 16/32 lowercase hex and local project IDs
64 lowercase hex. PCB readers already admit separately checked 32/64 project
IDs. `Zp`, offset 15239492, constructs the full `document@project` ID. The
ordinary PCB branch of `changeActivePage` uses that full focused ID, preserves
the other `|`-separated entries, removes the earlier `*`, and marks the focused
entry. `addDoNext`, offset 16364644, uses the same list and marker convention.
`parseURLTabId`, offset 16363322, separates `@` and the leading marker. Split
containers do not add another fragment key in these paths. Sources: pinned UI
at those offsets and separator `lS="@"` at 15974248.

Implement bounded parsing with unique entries and no more than one active
marker. Bind every admitted entry to the selected project and compare against
the independently sampled tab registry where that complete registry is already
available. For an exact active-PCB reader, an active marker must identify that
target. Preserve the existing object, frame, branch and native identity checks;
the fragment is not an authority source.

The opener must retain an empty initial fragment for project dispatch, then
permit only the selected project's reviewed transition. Later document-open
and observation stages must admit that target fragment on entry. Readers should
retain exact captured-URL equality throughout their awaits. Existing empty/#
read support can remain, without claiming it establishes project identity.

Do not admit arbitrary fragment keys or silently normalize unknown syntax.
`mode` and `cmd`/`cmd_for_project` can trigger commands through
`creatEditorByHash`, offset 16363799. `version` changes history selection at
15125618. Symbols, device suffixes, archive prefixes and instance IDs use other
branches at 16363322, 16364202 and 16368896. They need separate contracts.
The shell observer also shares the empty-fragment restriction, but its broader
identity contract should be reviewed separately rather than copying the PCB
target policy into unrelated observers.

## Assumptions that do not justify a relaxation

- Public return types match the adapter. `openProject` returns a boolean;
  `openDocument` returns a tab ID or `undefined`, and addresses the current
  project. Installed API offsets 1315841 and 424200 delegate to those fixed UI
  methods. UI `SK.openProject`, offset 17230843, returns the open flow's
  `success`. UI `R2.openDocument`, offset 17218992, converts lookup/open errors
  to `undefined`. Keep the absent-result refusal.
  [Official project method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html),
  [document method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html),
  [current-project scope](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html).
- Branch and format guards agree with source. The worker initializes
  `_isV2Format=false` at 2011737, mirrors format/branch setters into
  `projectDetails` at 2012700, and selects `options.branchUuid` or the project's
  `branch_uuid` at 2108598. UI `onSuccess`, offset 15074408, copies
  `currentBranch` and `isV2Format`. No evidence supports treating a wrong branch,
  missing format or read-only V2 conversion as the requested target.
- Local UUID64 and registry structure agree with source. `app.js` hashes the
  exact UTF-8 path in `ke`, offset 1284102; `K0`, offset 1326872, retains that
  path. Registration at 2332540 uses the hash key. The no-refresh
  `projectPaths` route at 2327644 returns the UUID-keyed registry. Do not switch
  to a UUID32 rule, case-fold paths or register a missing path automatically.
  The full routing and envelope review is retained in
  [the original opening research](current-disposable-open-research-2026-10-14.md).
- Public acknowledgement is not restoration completion. UI `onSuccess`
  publishes `C0.ON_OPENED`; its asynchronous subscriber at 16667082 restores
  tabs and later runs `Promise.all(...).finally(...)`. The PCB creation path at
  15241113 initializes the child through a later iframe `onload` callback.
  Native `getTabIdAndDocType`, PCB offset 10807394, reads the current native
  identity, not an initialization barrier. Retain readiness as a separate
  observation. Observation-only settling can be added if needed, but repeating
  navigation is not a readiness remedy.

## Source identities

These installed files were rehashed during this review. Paths are relative to
the EasyEDA application directory. No pin was changed. Offset references above
refer to these exact bytes.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

Keep fixed, bounded phase diagnostics for future attempts. Do not expose raw
vendor exception text, which can contain paths or project contents. New
diagnostics cannot recover the missing historical cause. The immediate work is
the confirmed URL guard fix and focused integration, not a new test matrix.
