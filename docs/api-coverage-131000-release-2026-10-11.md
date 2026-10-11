# Candidate 131000

Candidate `0.3.0+codex.20261011131000` continues draft PR9. The broader API task
remains unfinished. Only named disposable projects were used; production and
its project record were not accessed.

## Changes

- Standalone PCB text creation and deletion join the existing x/y/text modifier.
  The profile is default-font top-silkscreen text with bounded characters and
  exact four-decimal native-mil fields. Creation fixes style and reserves one
  identity before dispatch. Its inverse deletes that exact identity; deletion
  has no automatic inverse. No caller-native-ID, arbitrary style or raw source
  interface is exposed.
- Creation recovery uses the original sealed preparation, profile, identity
  and program commitment. A missing acknowledgment stays missing; complete
  effect proof may use the original reserved ID without inventing a return.
  A present mismatched acknowledgment refuses. Recovery never rebuilds a
  creation program, allocates a replacement ID or redispatches creation.
- Native fixture text uses `#000000`, which the previous null-only profile
  rejected. The new profile admits exactly null or that black scalar and
  preserves it. Native null means following the default color; it is not
  semantically equivalent to explicit black. New source-created text uses null.
- Canvas-origin discovery now explains its concrete missing precondition.
  The native command flushes private pending geometry queues that FileSource
  cannot prove empty. A private prototype was removed before registration or
  publication. No executable origin route or caller override is provided.
- Skill references now distinguish the tested container operations, new text
  identity/recovery limits and the independent saved/exported color representations.

The inventory still has 774 method paths: 192 public subsets, 95 native
equivalents, two lifecycle-only methods, eight blocked methods and 477 omissions.
Two added type-3 routes raise available guarded routes to 348; nine routes
remain blocked and three partially blocked. The same public String methods
already had footprint routes, so this does not reduce the omitted-method count.
There are 108 design schemas, 68 library schemas, 175 fixed readers, 26 tools
and seven skills. These counts are not live coverage.

## Connected evidence from installed120000

Closed PCB rename and closed schematic-container rename each passed a forward
transaction and a separate explicit inverse. One closed free-PCB creation then
passed. Complete target DOCHEAD/META effects, every peer raw-history chain,
original acknowledgments and unchanged active source were verified.
The project went from 10 documents and 69 materialized records to 11 documents
and 70 records, with 96 final raw occurrences. An independent review rehashed
all 858 retained inputs, totaling 12,762,663 bytes. Report:
`50d7024d005b0f00a33b995625dd0f90e554b505292570b1eb87a4e149ded0ee`.

No Save, target open/reopen, automatic inverse or deletion ran in that suite.
The explicit inverse restored each title/body, not its timestamps or history
bytes. This is native task-equivalent evidence, not public-wrapper counterpart
renaming, initialized PCB creation or admission of a later facade generation.

Native text fixture preparation placed one default black STRING, used one
current-document Save and reopened once. Before any typed text dispatch,
preflight refused two saved/exported LAYER-color differences and the old black
restriction. All ten peer documents remained exact. The two color changes
trace to a native color-cache hash collision and fractional-hex formatting;
see [the source investigation](pcb-text-fixture-color-findings-2026-10-11.md).
No normalization, Layer Manager workaround, second Save or typed text write
followed. Normal application close, empty process discovery and maintained
closed-file checkpoint verification passed. All journals are terminal.

## Offline evidence and release status

Independent review accepted the lifecycle, acknowledgment and recovery changes.
The author passed 59 focused tests; an independent pass covered 32 focused
cases. A private read-only experiment executed hash-pinned native decoder,
encoder and numeric/group/alignment methods across 36 null/black coordinate
and size cases. It preserved the supplied fields, reserved identity and zIndex.
Its model, geometry/cache and color objects were synthetic. It is not a full
native decoder, renderer, history, Save/reopen or connected execution test.

Ten additional storage regressions use the maintained preparation, source,
baseline and persistence code for all three text actions. They admit independent
unchanged saved/exported colors and reject layer body, type, identity, membership
or peer changes. This proves materialized record semantics, not raw history clocks.

Final local verification passes 3,166 facade tests with one platform skip and
zero failures, plus 424 bridge tests. Both TypeScript configurations and strict
type-aware linters pass without diagnostics. Dependency checks verify 151
registry signatures and 40 attestations with zero reported vulnerabilities.
Repository/privacy, package, seven skills, all eight official validators, workflow
lint and the offline doctor pass. Separate rebuilds reproduce the facade bundles,
sanitizer and synthetic authenticated bridge archive exactly. No real key was
rotated and no extension was imported.

Frozen source: 185 files, `cf942fd274e44207661ce83a90ecda2b4de59f54c7338a6dcee1e0f430bd85ac`.
Runtime: three files, `518ffece2c37c48e4e7d43053600bca8a5d6b2f4907b158e8249157dd4a9ed57`.
Manifest: `20278cb651b7f7447602b0cf604c10de6b4828e77170192212496205d796ae78`.
Full facade log: `5ba65638d2cbfea351ed27850bc1fcd8cc88f46a14fb5420901903077dc16159`.
External application, API, native implementation and bridge pins are unchanged.

The first full suite ran before generated bundle/fingerprint refresh and failed
the source-identity/catalog admission checks. That diagnostic log is retained;
the entire final suite was rerun after all tests were added. Publication, CI and
installation are not yet claimed here.

## Remaining work

Text modification/creation/deletion still need connected complete lifecycle
validation, including an explicit creation inverse and documented deletion
semantics. The retained fixture needs fresh maintained target-scoped baseline
admission. The private all-source-equals-storage condition was overbroad: the
decoder compares current live records and skips unchanged layers. Preserve both
raw representations and prove untouched durable layer bodies remain unchanged.
Narrow STRING history is being investigated as an alternative to full-source
decode, but has its own queued-work and created-ID constraints. No replacement
is enabled by this research.

Canvas origin, other feasible unimplemented adapters, nonempty standalone
Pad/Arc cases and broader electrical writers remain unfinished. The exhaustive
inventory retains concrete reasons and required next proofs. After installation,
use a fresh Codex chat for new-generation connected admission; never hot-patch
the loaded host or replay completed fixture operations.
