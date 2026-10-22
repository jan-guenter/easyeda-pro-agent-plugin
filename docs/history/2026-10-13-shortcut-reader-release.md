# Current-version shortcut reader

Candidate `0.3.0+codex.20261013214500` adds `easyeda_control_shortcuts` for
`eda.sys_ShortcutKey.getShortcutKeys` on the separately reviewed EasyEDA
3.2.206 / API 0.3.50 / UI 3.2.196 tuple. No design needs to be open.

The request is
`{"method":"eda.sys_ShortcutKey.getShortcutKeys","arguments":{"includeSystem":false}}`.
Omitting `includeSystem` defaults it to false. Offline `shortcuts` and
`shortcuts-validate` expose the exact schema and validate arguments without
connecting to EasyEDA. Live execution still requires an authenticated runtime
fingerprint and independently checked API/UI implementation files.

The result preserves raw key strings, their order, duplicates and empty tokens.
Actual strings such as `Ctrl` and `Page Down` differ from the declaration union;
rejecting them would break a legitimate response. Shortcut document scopes use
their own 0–10 enum (PCB is 4), not the ordinary editor-document enum. Scenes are
1–6. No key press, callback, registration, navigation, settings or Save is sent.
The public getter excludes a separate menu-shortcut registry; its result is not
a complete inventory of keys that can execute. See the
[source research](2026-10-13-shortcut-reader-research.md).

Two bounded copies must match while the frame, public method/receiver, RPC and
locale owners stay unchanged. Results have record, field and 262144-byte limits.
Vendor traversal happens before projection, and timeout does not cancel it.
Private registry ownership and atomic locale-cache contents are not proved.
Failures return no partial inventory and are not automatically retried.

The shared fixed UI-file verifier now gives all current-version observers
nonblocking, descriptor-bound reads. This closes the extension-index observer's
FIFO substitution gap without adding a caller-selected file or checksum.

The restricted catalog has ten tools; the legacy catalog has 35, with seven
skills. Coverage remains 774 distinct methods: 211 public subsets, 30 native
equivalents, 82 blocked implementations and 451 omissions. The new current
route supplements an existing legacy route, increasing guarded routes to 309;
94 blocked and two partially blocked routes remain. These are not live-validation
counts. Skill references now route shortcut requests to the typed reader and
explicitly distinguish shortcut tokens from keyboard-execution authority.

## Connected predecessor check

Installed `201500` was independently matched to merged main
`4f255cb68b02c76a5d032c7e03f11721826a0489`: 1144 files / 22253134 bytes,
exact modes, seven skills. Required PR CI38464706255 and main CI38466186411
passed all ten jobs, with 9810 facade passes, five platform skips and 424 bridge
passes. [PR16 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/16#issuecomment-6155015420).

The fresh owner successfully launched EasyEDA through the ordinary launcher,
then authenticated the bridge. One editor-shell check found one container/tab
with Start Page present and active. One context check returned `start-page`,
project `undefined`, branch `empty`, under the same authenticated fingerprint
`d8696beb242430f8fb0c35d66f55cb35521dcae43b703959d120535d5840da97`.
Shell reply SHA-256:
`c00242a36d07dd88424fbf51f2dcda85e94ffbede029d15a2c81bc4c48aab44e`;
context reply SHA-256:
`bad904f7c3700c48674c1ac6f8b8356ce939171e6bbfe5507b7cc54e022b69dd`.

These are Start Page observations from the predecessor, not acceptance of the
new shortcut reader or shared verifier. They do not prove focus, visibility,
completed restoration, project closure or persistence. No project was selected
or opened by the agent; no design edit, settings change or Save was dispatched.
Ordinary existing-profile startup itself may run extensions or alter caches.
The consumed launch must not be replayed after installation/restart.

## Verification and delivery

Local verification passed 63 focused/integration tests and all 424 bridge tests.
Full types and strict type-aware lint have zero diagnostics. Build/compatibility,
77 package checks, 179 repository/privacy checks and all seven custom/official
skill validators passed. Dependency verification accepted 151 registry signatures
and 40 attestations; the audit found zero vulnerabilities. Independent review
accepted the adapter and shared verifier.

The source projection covers 325 files with SHA-256
`50ba35ce4dd041ae353f650a77e70cb05344dbd2ec5d64ef242654d375969426`;
the three-file runtime projection is
`a59fab6b05da4a6ab73f6971cd1a9daf365b1fd2c777212acf847ca596f25aff`.
External application, bridge and upstream pins are unchanged. Required CI,
publication and official Git marketplace installation are pending at this
source checkpoint. Consult this
release's PR delivery receipt for final checks, tested/merged commits and exact
installed-file verification before repeating delivery. No connected shortcut
execution is claimed in this release.

## Remaining implementation backlog

1. Observe shortcuts once on the installed generation after fresh-host pickup;
   defer broader live cases unless a real defect needs them.
2. Reconcile ordinary-launch journals after a facade restart loses the original
   process/Job handles. Never infer termination or relaunch from missing handles.
3. Current-version navigation and useful project-content readers, with actual
   preference/backup/manager/document-owner effects reviewed.
4. Native structure-job completion and full SQL-effect verification needed by
   the blocked schematic, symbol and PCB editing lifecycles.
5. Remaining SDK families: library/device/3D operations, schematic and PCB
   primitives, routing/rules/stackup, ECO/ERC/DRC and scoped manufacturing export.
   Per-method omissions and prerequisites remain in the coverage inventory.
6. Bridge Auto-Connect persistence-error reporting, requiring a separately
   built/imported bridge generation while preserving private credentials.

Latest `get`/`getAll` shortcut methods do not exist in the installed API;
callback-based registration/unregistration are outside this read-only adapter.
They remain concrete omissions, not claims of implementation impossibility.
