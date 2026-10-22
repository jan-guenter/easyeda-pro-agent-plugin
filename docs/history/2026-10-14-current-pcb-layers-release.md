# Current-version PCB layer observations

Candidate `0.3.0+codex.20261014020500` adds a separately admitted reader for
`eda.pcb_Layer.getAllLayers` and `getTheNumberOfCopperLayers` on the current
EasyEDA 3.2.206 installation. It does not activate the old generic reader or
writer profile.

## Implemented scope

`easyeda_control_pcb_layers` requires an exact project/branch/document/tab
target and a fresh authenticated fingerprint. Offline `pcb-layers` and
`pcb-layers-validate` expose and validate its strict request. Only an already
active ordinary type-3 PCB is admitted; it does not open or activate a board.

Both methods use fixed native layer/identity topics on one retained PCB frame
receiver. Native identity checks bracket two complete matching layer samples.
Public wrappers select the active tab after an asynchronous UI hop, so this
adapter declares `native-task-equivalent`. It preserves the exact nine-field
API projection, raw color strings and two-decimal alpha conversion. Copper count
follows the installed UI: enabled native SIGNAL or PLANE rows plus two.
It does not certify the physical stackup, document readiness or saved state.

Malformed, changed and oversized replies refuse without partial results.
Limits are 512 unique layers and 262144 UTF-8 bytes; vendor enumeration happens
before these limits. Incidental RPC bookkeeping and premature environment
default initialization can occur in memory. No layer selection, source export,
navigation, settings operation or Save is requested.

The [source review](2026-10-14-current-pcb-layer-research.md) records exact
API/UI/PCB implementation identities and the full delegated read closure.

## Connected recovery completed in preceding installed generation

After the Codex restart, installed011500 was independently admitted. Its old
successful ordinary launch was explicitly relinquished once with two absent
process samples, preserving history and the consumed ID. A separately confirmed
new launch succeeded. The bridge authenticated without implementation drift;
the shell observer found one tab, the active Start Page, and no other tabs.
This validates that recovery/startup sequence, not original-Job termination,
window visibility, project closure or the new layer reader.

No production project or its project record was accessed. No project open,
design edit or Save was dispatched by the agent.

## Verification and backlog

Focused generated-program and coordinator tests cover cross-realm replies,
the exact projection/count, target/frame/runtime changes, result bounds and
strict offline discovery. Build, strict type-aware zero-warning lint/types,
inventory, package/privacy, skill checks and required GitHub CI remain gates.
Final verification and installed evidence belong to the release PR receipt.

Local verification passes 49 focused/catalog/startup tests, full types and
zero-warning strict type-aware lint, build/compatibility, exhaustive inventory,
77 package checks, 179 repository/privacy checks and all seven custom/official
skill validations. Independent source review found no blocker. Dependency audit
reports zero vulnerabilities; 151 registry signatures and 40 attestations verify.
Only facade projections and review time changed in the compatibility manifest;
external runtime pins, Windows helper, bridge and dependencies are unchanged.
Required CI, publication and official installation are pending at this checkpoint.

Coverage remains 774 distinct methods: 211 public subsets, 30 native equivalents,
82 implemented-but-blocked and 451 omitted. The two additional current routes
bring available guarded routes to 311, with 94 blocked and two partially blocked.
There are eleven restricted current tools, 36 legacy tools and seven skills.
These counts are implementation classifications, not connected validation totals.

Remaining work:

- Validate the two new reads on one explicitly identified disposable board
  after installation in a fresh host; no writer test matrix is needed.
- Implement current-profile disposable project/PCB opening. The reviewed
  `openDocument` path can clean up partitions, update partition titles and invoke
  native Save. It needs an explicit ordinary-opening-effects contract and
  one-shot intent, not the old no-Save promise. The project-manager worker and
  local UUID/path correlation still need review.
- Carry forward the LCSC database-fallback omission and lost-handle continuity
  limits; this release does not implement remote-only lookup or recover handles.
- Other CAD readers, schematic/symbol/PCB writers, safe exports and the existing
  exhaustive omissions remain scoped backlog. Native structure-job completion
  and full SQL-effect proof still block the affected older transactions.
