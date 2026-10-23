# Generation209 disposable project and PCB opening

This implementation continues from main `aa79950c067e026896ed2f061e819ebccbd32056`
on 2026-10-23. It adds an executable, separately qualified opening path for
EasyEDA `3.2.209.8a704eab`. It does not enable the older worker, model, precreate,
writer or Save routes. No live editor calls or project-file reads were made by
this subtask. Connected qualification remains outstanding.

## Implemented scope

The new `easyeda_control_pcb209_opening` contract uses `pcb209-*` operation IDs.
Its fixed lifecycle can launch an original diagnostic owner, inspect the browser
and top-level UI source, open one checkpoint-bound disposable project, open its
one sealed PCB, qualify the PCB frame/source/identity, and perform normal cleanup.
There are 15 actions. The schema does not admit a worker capture, model reader,
arbitrary expression, breakpoint, caller source hash, Save or changed PCB target.

The implementation reuses the existing journal, one-shot navigation, native
process/Job handles, pipe transport and cleanup. The helper still takes the same
five native installation files and permits at most 103 requests and 64 MiB of
transport data. The source changes add no native command or request phase.
The old 206 constructors still select their old installation and script profiles.
They reject the newly reserved `pcb209-*` launch prefix.

The new installation verifier admits the exact 209 executable, package,
bootstrap, both editor selectors, UI, PCB, manager and project-worker files. It also checks
the existing fixed PowerShell and facade helper. The native owner retains the
original five deny-write installation leases. The added asset hashes are fresh
descriptor observations, not Windows leases or continuous source proof.
The original renderer independently supplies its complete UI/PCB source through
the retained pipe before those source observations are accepted.

Source files:

- [209 opening profile](../../plugins/easyeda-pro-control/server/src/current-pcb-209-opening-profile.ts)
- [restricted request contract](../../plugins/easyeda-pro-control/server/src/current-pcb-209-opening-validation.ts)
- [installation verifiers](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-installation.ts)
- [original native owner](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-owner.ts)
- [retained lifecycle](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-lifecycle.ts)

## Qualification of the reused opening programs

The installed sources are under the configured application's `assets` directory.
Their complete identities are separate from the legacy diagnostic profile.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10,991,441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-mgr/3.2.185.bf63a159/js/pro-mgr.js` | 2,196,424 | `b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d` |
| `pro-mgr/3.2.185.bf63a159/js/project-worker.js` | 2,181,308 | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1,980,754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |

The public project method still returns a boolean promise. The document method
returns the tab ID or undefined. Neither promise claims completion of every
startup producer. The project reference warns that switching can lose unsaved
changes. The diagnostic adapter is a native task equivalent through the same
public-service bus, not a direct SDK invocation. [Project open](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html),
[document open](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html).

Independent source review found no incompatible guard in the two fixed programs.
Project opening remains `MK.openProject → Fs({uuid}) → tEe.open → tEe.onSuccess`.
The service assigns the selected plain `currentProject`, branch and
`isV2Format`, clears history mode, then publishes `ON_OPENED`. `Fs({uuid})`
leaves `cPath` undefined. The title subscriber therefore leaves the initially
empty client project name unchanged. The existing corrected
`expectedOpenedTitle = initialTitle` is retained.

`loadProjectCompleted` still occurs before restored-document iteration and the
layout-finalization promise. The empty start-tab helper also invokes a simulated
click without awaiting it. The retained prefix observation is not renamed to a
startup-completion observation. The message bus still delivers the three
callback arguments expected by the fixed subscription, and cancellation clears
the same callback/running fields.

Document opening remains `R2.openDocument → lWt → Jd → by → IO.create`.
The renamed aliases do not change the fixed program's API-service selection.
`Jd` selects the current project's PCB and supplies its identity and metadata.
The new-frame path waits for tab creation, initializes the PCB iframe and waits
for activation. The separate observation still proves the exact iframe owner,
complete source and matching `tabId/docType` identity. Existing-frame delayed
activation is excluded by the original preflight.

The frame still uses `frame_<tabId>`, `c_dbid=<tabId>`, `c_doctype=3`,
`editframe`, `editor?entry=pcb` and `pcb-canvas=true`. `UI.tabBar` still returns
the original tab/container objects. The opening program's bounded tab/tree and
URL checks therefore remain applicable.

The following retained source slices are zero-based, end-exclusive UTF-16
offsets. Hashes cover each slice encoded as UTF-8. They are research locations,
not debugger breakpoint authority.

| Source / owner | Range | SHA-256 |
| --- | --- | --- |
| UI `MK.openProject` | `[17242341,17242404)` | `fcf3f590fa2ff8ed9dff5a46a58e7ddc8fbd0249d543fec4967e3971ec454cc5` |
| UI `Fs` | `[15087630,15088321)` | `9a868196121c72b78961203210d3f7bd05c142ebf991c5c37948c01d4bbbba74` |
| UI `tEe.onSuccess` | `[15084480,15085399)` | `3b5464d55778b3229c67eca80e975a2ac76d504530b668262593d0da71f26e8c` |
| UI `iPo` | `[15990188,15990455)` | `39bd83a71b47670aad510b602b76da0e7c706f1f52794dff1a1a920a28f3f02f` |
| UI title subscriber | `[16748226,16749193)` | `8541485b5a4b1a0d0a20ac0191e1960137ba767978e048db3f6b2c12e52d4635` |
| UI startup/restoration subscriber | `[16678233,16681686)` | `1cab424e3af8ab10898684453eeedca16b230b7d79b7075730e976cd0d68d208` |
| UI `R2.openDocument` | `[17230497,17231052)` | `24c7194db6c7ba1b6e2beecced2a86cc7afcf964dc373c63bc65618fef7146ea` |
| UI `lWt` | `[15273005,15274925)` | `3427b0ad0848c23093b6f21b3b435d81b4ba7f57c9636eea2772aa95d3fce83f` |
| UI `Jd` | `[15261688,15262567)` | `bb075866ad649b19442534f15bd915037fa215ba23b9ba7c86446f1eed982144` |
| UI `by` | `[15252328,15257335)` | `5f3295b778c4a18e5d76ce1debd96a2a4f1402a038efc5d7ef683b200bf54fac` |
| UI `IO` class | `[15257441,15261249)` | `9ada3629a40a7a258c7393bc54606e0e069dbab963a1b6d7689707e2e3b00d80` |
| UI partition cleanup `Tlt` | `[15250130,15250687)` | `3d2d4f4f6ebbcaaf9ec2e0e04329380e62caf52cf8cad0b1b44a6e3b4ab353af` |
| UI partition title sync `mye` | `[14744987,14745613)` | `fe4b3c08ab73ff2f59eeb034b381f8577fe548161a9791acc34847ccd975b796` |
| PCB identity callback | `[10821825,10821892)` | `08c4c90c93407f1ed2b6721e677f0d27c75f66b515f906b5184684ae741ae858` |
| Worker project `open` | `[2108622,2111587)` | `5d8b63a8d1c5bbb92f288ea04b25bcb23934bfc82012e7224ae32f51ad543299` |
| Worker `getProjectPaths` wrapper | `[1720723,1720977)` | `50858f8358be9b9823ef68b6fb4bb2146935ab186e200d3be4430b835d1ccea6` |
| Manager OPEN registration `AG` | `[2084246,2084847)` | `e9ff50b860fba6823b75e84c202288e9048ef86dc8ffc228f2ba5ca39a7d8671` |
| Manager project selection `cO` | `[1788077,1788212)` | `460b2190c59442f69ec8a225d7a5f8abd955f899e21d2dd2b93cb15091ca9005` |
| Manager `tl.open` | `[1782503,1783700)` | `81932eb6e7ccf48f642f4222a6b20c8fb68e4bab5a84954ff62542b3568100e9` |
| Manager `tl.onSuccess` | `[1783715,1784120)` | `4e3a180687fdf1b9751f768d20472dde799c34bbc277b4b6dcd51fd3bd13eb5c` |
| Manager registry method | `[1800044,1800298)` | `53917e668d8e92f58fa9a829cc3dbd314e7bcd589bfd881b122e32df17514e95` |

The registry review covers the fixed client wrapper, which adds refresh/tag
parameters only when supplied. It does not claim a complete audit of the client
HTTP backend or live registry stability.

The manager's OPEN service selects the exact project UUID, constructs the named
project worker and reciprocal bridge, then awaits its fixed public open RPC.
Its success handler registers the database before publishing project/branch
information. The manager's registry wrapper forwards the fixed client GET and
adds no refresh parameter for the empty request. Its complete file is included
in the 209 installation profile; a source-review correction added that pin
before release. The checkpoint helper itself uses host SQLite/native-history
parsing and does not call the older installed-runtime verifier. No checkpoint
guard or compatibility bypass was added.

## Opening effects and concrete exclusions

`Jd` still performs partition cleanup through `removeFileUuids`. Its title
synchronizer can call `messageBus.rpcCall("save", "")`. The PCB opening path
reads shared preferences and publishes preference updates. Project opening
writes session/log/settings data and starts restoration subscribers. These
effects are disclosed and accepted by the explicit existing-profile and
normal-open confirmations. This route makes no unchanged-storage claim.

The changed worker's `open` can convert a project, initialize caches, subscribe,
start `syncCloud(...).catch(...)` without waiting, check the project and apply
snapshots. Matching source or `isReady=true` does not prove these producers ended.
The 209 project-worker hash therefore does not admit the old constructor capture,
raw state reader or serialization model.

The ratline capture remains separate. Its startup/subordinate roles and removed
rebuilding flag are documented in the
[209 ratline source record](2026-10-23-generation209-ratline-capture.md).
Opening a PCB without that capture is useful navigation, but cannot retroactively
establish startup worker construction. A future combined capture purpose must
arm its exact observers before PCB opening and retain publication/delivery and
dynamic-copper completion. It needs its own command vocabulary and derived
budget; it cannot adopt this opening owner's historical records or increase
the existing 103-request limit.

Still excluded are full PCB/common/source/SQL baseline capture, contained write
destinations, String creation/modification, explicit Save, complete closed SQL
effect verification and saved/reopened verification. None is inferred from the
new navigation result. Normal process exit does not prove discard.

## Focused verification

The four new contract/profile tests and the existing installation/lifecycle
suite pass together: 104 tests, zero failures or skips on Node24.18.0, with the
private test-isolation preload. Two new composed lifecycle cases exercise the
209 UI and PCB profiles, original checkpoint binding, consumed navigation,
refusal of old model/worker operations, retained ambiguous-open evidence and
normal original-owner cleanup. These are injected-owner tests, not connected
Windows execution.

Strict type-aware lint on the changed implementation/test files reports zero
warnings. Server and bridge-stub typechecking passes. Final root verification, bundle regeneration, public
tool registration, installation and actual connected admission belong to the
parent batch and are not claimed here.
