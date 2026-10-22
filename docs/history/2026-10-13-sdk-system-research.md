# Bounded system methods on EasyEDA 3.2.206

Research and implementation date: 2026-10-13, Europe/Berlin. This work follows
PR12 at main `2b280b0bc177a44a03a63be749a78d9921eade17`. Source was inspected
as inert text. No installed module was imported or executed, no project or
account was read, and no bridge or private profile was changed for this research.
Connected evidence, publication and installation are separate release steps.

## Scope choice

The PR12 inventory contains 774 distinct mounted methods: 209 implemented public
subsets, 30 native equivalents, 82 implemented-but-blocked methods and 453
omissions. Those counts span versions and do not describe what the upgraded
application can execute. The six unit conversions and ten environment reads
already have legacy adapters, but those routes are not admitted on 3.2.206.
The two version comparators are omitted from that older runtime's coverage.
This slice makes 18 small methods available for separate new-tuple admission;
it does not enable the legacy project reader or editing tools.
Source: [committed inventory](../../plugins/easyeda-pro-control/api-coverage.json),
[legacy reader definitions](../../plugins/easyeda-pro-control/server/src/public-sdk-read.ts),
[new adapter](../../plugins/easyeda-pro-control/server/src/sdk-system.ts).

The installed SDK declaration and public wrappers cover eight environment
booleans, editor version, compiled date and two version comparisons. The
`onlySemantic` version option is documented as added in application 3.2.176 and
4.1.13. These calls do not require a current document in their public signatures.
[Environment reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.html),
[version getter](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.geteditorcurrentversion.html),
[compiled-date getter](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.geteditorcomplieddate.html).

## Exact implementation reviewed

Installed app package version is `3.2.206.715d940d`; its authenticated
editor-reported version is `3.2.206`. The implementation inspected here is
`assets/pro-api/0.3.50.ab46409c/api.js`, 1,964,920 bytes, SHA-256
`021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76`.
Its declaration is `api-types.d.ts`, SHA-256
`d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def`.
Paths are relative to the installed application's resources, not repository
dependencies. Exact package observations are retained in the
[upgrade inventory](2026-10-13-easyeda-3.2.206-upgrade-inventory.md).

The following offsets are zero-based UTF-16 positions in that exact API file.
The called implementations and dependencies are in this one bundle. No UI,
schematic, PCB or project-manager command is dispatched by these 18 methods.

| Implementation | Offset | Invoked effect |
| --- | ---: | --- |
| `a0` unit wrappers | 1321820 vicinity | Numeric arithmetic and local rounding helper |
| `tt` rounding helper | 469417 | Number checks and bounded `Math` operations |
| `m_` environment wrappers | 1802832 vicinity | Captured flags or the metadata helpers below |
| `nP` mode definitions | 520597 | Initialization derives flags from `PRO_EDITOR_MODE`; calls later read captured booleans |
| Captured `Gn`, `Kb`, `y3`, `$n`, `g3`, `b3`, `T3` | 1315400 vicinity | Plain immutable-per-load flag values |
| `Pl` version helper | 470792 | Reads `meta.editorMainVersion.content`; optional string splitting/padding |
| `lD` supplied-version-at-least helper | 471164 | `Pl(true)`, bounded string work and bundled semver |
| `uD` supplied-version-at-most helper | 471354 | `Pl(true)`, bounded string work and bundled semver |
| `cD` compiled-date helper | 471544 | Reads `meta.editorMainDate.content`, then may assign local `T.editorCompliedDate` cache |
| `IO`, `Ag`, `Lg` semver wrappers | 15090, 17365, 17452 | Validates a version and compares the supplied triple against the current triple |
| `tr` semver constructor/comparison | 10800 vicinity | Bounded parser, numeric component comparison and empty prerelease handling |

`cD` is not strictly pure. Its first call can initialize an API-runtime cache,
not a shared preference, database or project. The adapter reports
`environment-metadata-local-cache` for it. The other environment methods report
`environment-metadata-read`; unit methods report `supplied-value-calculation`.
The mode flags describe the load-time mode, not a fresh network probe.
These conclusions come from the exact implementation above, not from the
getter names.

Bundled semver's `Gh` helper near offset 6622 captures a console logger if a
`process.env.NODE_DEBUG` value enabled `semver` at API initialization. The
comparators can then emit diagnostic lines containing the bounded supplied
version and current public editor version. This condition is disclosed, not
suppressed by patching console or environment state. The normal parsing path
allocates local objects; it does not issue network or project commands.

## Units and rounding

The six official conversions accept a numeric input and optional decimal
precision, defaulting to four. They return a synchronous number. Source and
destination units are explicit in both discovery and returned results.
[mil to mm](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.miltomm.html),
[mil to inch](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.miltoinch.html),
[mm to mil](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.mmtomil.html),
[mm to inch](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.mmtoinch.html),
[inch to mil](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.inchtomil.html),
[inch to mm](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.inchtomm.html).

The reviewed wrapper operations are respectively multiplication by 0.0254,
division by 1000, division by 0.0254, division by 25.4, multiplication by 1000
and multiplication by 25.4. They then call `tt` with its formatting flag false.
For positive precision `d` and nonzero input, rounding is
`Math.round(converted * 10**d + 1e-10) / 10**d`. Zero and precision zero take
`Math.round(converted)`. This is the SDK's floating-point result, not exact
decimal arithmetic, a unit change in the editor, or an origin transformation.
The adapter calls the actual public method; it does not replace it with a local
conversion implementation.

The supported input magnitude is at most 1e9, with integer precision 0 through
12. Results must be finite and no larger than 1e12 in magnitude. Negative zero
can occur. Input negative zero is retained in generated JavaScript; two results
are compared with `Object.is`. Numeric JSON results include a mandatory
`negativeZero` boolean so `value: 0, negativeZero: true` retains the SDK's -0.
The host rejects missing or contradictory flags rather than claiming JSON zero
was the exact native scalar. Non-numeric results cannot carry this flag.

## Comparator direction

The names are easy to misread. The installed `lD` calls semver
`gte(supplied, current)`, and `uD` calls `lte(supplied, current)`. Thus, against
current 3.2.206, supplied 3.2.207 satisfies the GreaterThanOrEqual method.
The official class reference's descriptions and installed declarations agree
that the supplied version is the left operand.
[Official environment method table](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.html).

The individual comparison pages did not load through the documentation browser
during this review. Their unavailable pages are not treated as evidence.
Installed declaration lines 39484 through 39515 and the exact helpers above
provide the parameter and direction evidence.

The adapter requires exactly three canonical decimal components, each from 0
through 999999. It rejects `dev`, prefixes, leading zeros, short versions,
prerelease/build suffixes and invalid strings before invocation. This avoids the
wrapper's truncation/padding and surprising invalid-string boolean branches.
The optional boolean for the separate version getter is preserved literally;
omitted, false and true remain distinct calls. Version getter output is editor
metadata, not proof of package identity or permission to change runtime pins.

## Adapter and verification

Each operation has a closed Zod argument schema and a fixed generated public
method call. The program retains its receiver and function, checks both before
and after each sample, and accepts only two identical synchronous scalars.
Promises, wrong types, nonfinite values, changed owners/methods and private SDK
exceptions fail with a fixed error. String results admit 1 through 128 printable
ASCII characters without date parsing or truncation. The result envelope and
public reply have an 8192-byte bound. The runtime must independently enforce
the authenticated capability-specific tuple and shared quarantine before and
after dispatch. No discovery query grants this authority.

Five focused tests cover all 18 receiver/argument bindings, discovery and input
boundaries, negative-zero transport, owner/result drift and malformed result
envelopes. They run through the maintained isolated test preload. They do not
execute the installed API, prove connected behavior, or validate any editing
lifecycle. The broader existing CI remains the release check; no new private
fixture or test matrix is required for this slice.

## Concrete exclusions and next work

- `sys_Unit.getFrontendDataUnit` is an asynchronous RPC. The installed UI handler
  near offset 17423348 reads `Ai.selectUnitStore.value`, unlike the six input-only
  conversions. It needs a reviewed UI hash and current-editor ownership policy.
- `sys_Environment.getUserInfo` returns private account fields. A chosen-field
  privacy contract and explicit reason to expose them remain missing.
- `setKeepProjectHasOnlyOneBoard` dispatches a global setting change. It is not
  admitted by a metadata reader or unit-calculation profile.
- `dmt_Project.getProjectInfo` delegates to UI code near offset 17235941, which
  calls `AH` near 8790392, then a project-manager `PROJECT.GET` RPC and possibly
  error notification. It also traverses `teamFolders`. Manager/network effects,
  error UI and project ownership need review before this new-tuple reader.
- `dmt_EditorControl.getSplitScreenTree` deep-clones native tree/tab data near
  UI offset 17220888. A useful next reader must project owned identities without
  exposing arbitrary titles or raw tab data. Promoting the old context tool
  wholesale would admit substantially more code than these 18 methods.

The UI offsets above refer to
`pro-ui/3.2.196.26ed3d6c/js/ui.js`, SHA-256
`3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a`,
as recorded in the upgrade inventory. They identify unfinished implementation
work, not claims that the APIs are inherently impossible to support.

## Next slice: agent-owned Start Page launch

The user wants the agent to start EasyEDA when needed. Keep this separate from
the 18-method system release. A narrow `bootstrap` tool should offer only status
and one-shot launch, not expose the existing runtime tool's project-opening,
recovery and normal-close actions on an unreviewed editor tuple.

Most native process machinery already exists in
[WindowsControlRuntime](../../plugins/easyeda-pro-control/server/src/windows-runtime.ts)
and [the maintained helper](../../plugins/easyeda-pro-control/scripts/windows-authority.ps1).
It derives the installed executable from the configured assets root, hashes it
without following links, rejects another same-path EasyEDA process, retains
the original root process and Job, and assigns the Job atomically during
`CreateProcess`. It passes only the quoted executable, with no project path or
caller arguments. The helper has no forced termination or kill-on-close policy.
Launch failure leaves `launch-unknown`; an ambiguous result must not trigger a
second launch. Existing ownership is not permission to attach to another app.

Read-only file observation found `easyeda-pro.exe` at 222,989,936 bytes, SHA-256
`e59d159f0f7bb5ac4832ce6583622251750ede7b839050f3aabe774cadfd1f55`.
Installed `app.js` remains SHA-256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`.
These observations do not admit a launch. A new bootstrap profile must pin the
executable, app startup implementation, UI startup implementation and helpers
separately from the math/system API profile.

The reviewed portion of `app.js` at UTF-16 offset 2652196 contains `$4`, `rz`
and `sz`. It selects a project only from command-line arguments ending in
`.eprj`, `.eprj2` or `.elib`. With none, local modes select
`https://client/editor?cll=...#`; online mode selects its configured service's
editor URL. The UI `SEo` startup branch near offset 15079300 opens a project
from URL project IDs or `prjPath`, and otherwise sets its no-project-ready
state. This supports a no-argument local-mode implementation, but does not yet
prove the complete absence of restore hooks or startup-extension navigation.
Checking an empty page after opening an unrelated project would be too late.

Required implementation work is bounded:

1. Add a bootstrap-specific installation validator and fixed local-mode startup
   contract. Finish tracing URL parsing, saved-session restoration and startup
   extension hooks. Require a supported no-project branch before launching;
   refuse unknown configuration without silently clearing preferences or recent
   projects. Do not introduce caller-supplied URLs, flags or executable paths.
2. Add a small coordinator using the index-owned `WindowsControlRuntime`, the
   existing serialized gate and shared quarantine. Persist launch intent before
   native dispatch, retain its result before readiness checks, and share the
   runtime-allocation reservation with existing lifecycle coordinators.
3. Observe only bounded process/window and empty-editor identity to prove Start
   Page readiness. Retain the exact root, start identity and Job across awaits.
   Authentication of the existing bridge is a later condition, not a reason to
   launch a competing gateway, force-close an existing app or import another
   extension automatically.
4. Register only this new tool in the restricted facade mode, update discovery
   and skills, and reuse maintained launch/ownership tests plus one focused
   no-project end-to-end check. Do not broaden the legacy runtime registration
   or resume the consumed C10 journal.

The current official command-line client documents bare-editor opening, but
requires EasyEDA 4.1.60 or newer. It is not a supported shortcut for this 3.2.206
installation, and this backlog does not authorize an application upgrade.
[Official CLI requirements](https://prodocs.easyeda.com/en/api/guide/cli.html).
