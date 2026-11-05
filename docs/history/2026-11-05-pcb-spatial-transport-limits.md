# Private PCB spatial transport and helper source limits

This source batch adds a separate `pcb-spatial209` birth on
`feature/pcb-spatial-readers`, based on main
`f06279f1c13f25812e4a68e5ccfd10c133233dd0`. It does not upgrade an existing owner.
The private transport reconstructs only fixed spatial commands and the existing
closed discovery/opening vocabulary. It accepts no caller code, purpose or cap.
Source qualification and connected acceptance remain separate requirements.

The new purpose has 384 requests, with 383 normal requests and one original group
release slot, at most 16 reads, the existing request deadlines and 64 MiB session
limit. Legacy diagnostic owners retain 103 requests. The request derivation uses
the actual fixed function catalog. With 226 entries, the spatial stage needs 252
requests, including capture 7, functions 1, tuple 1, function properties 226, reads 16
and release 1. Reserving 103 requests for the original opening/source/reproof path
gives 355 and 29 requests of headroom. The complete-workflow preflight refuses
before discovery when the fixed reservation does not fit.

Generated spatial programs made the shared first-party helper exceed its former
1 MiB source-file ceiling. Its new fixed source-file ceiling is 2 MiB. This permits
generated source growth only. The runtime owner and independent Windows launch
smoke still require the exact committed helper byte length and SHA-256. The
static identity checker, native startup/spatial generators and source-parity
regressions use the same helper-source profile. The checker retains the old 1 MiB
bound for its other source inputs. The Windows synthetic executable retains its
separate 1 MiB bound. No input, response, clock, frame or session limit is raised.

The final helper has 1,097,306 ASCII bytes with SHA-256
`6ec843c4d7b40dde941b2b01691536ce8a944a4a8c33fc121bc3b418d508743a`.
Its packed spatial generator and independent helper identity check pass. The
bounded region read command uses 63,638 bytes within the existing 65,536-byte CDP
command ceiling.

The existing 1 MiB ordinary reply-frame ceiling is retained. A synthetic Node 24
inspector probe using the actual 226 pinned function descriptions produced a
357,110-byte tuple reply. Replacing every object handle with 256 ASCII characters
gave409,426 bytes. The larger1,095,366-byte extraction artifact duplicated source
and metadata and was not a reply-size measurement. Native polling retains its
65,536-byte chunks and 64 MiB cumulative bound. These offline measurements do not
establish the embedded application's V8 descriptor roster or a connected read.

A whole-program synthetic inspector probe found that
`throwOnSideEffect:true` refuses the bindings program's local
`Object.defineProperty`/`Object.freeze` construction. The exact bindings phase
therefore fixes that flag to false. It constructs and seals private containers
through descriptor reads, calls no vendor callback/getter/hit method and writes
no application object. Other capture/qualification phases retain true; the read
kernel retains false for its separately declared existing-state scratch effect.
The original renderer and standard intrinsic trust contract remains explicit.
No caller-selectable flag or new sealing phase is exposed.

The retained `source-probe/flag-proof.json` and `flag-result.json` observations
cover a separate Node 24 VM with actual installed class/function bodies at their
original source positions and synthetic Via views, index, layers and registry.
The unchanged complete bindings program refuses under true and succeeds under false;
the functions program under true, all 226 production metadata decoders and the read
kernel under false then pass. This is synthetic application state, not connected
EasyEDA evidence. The prior generated 1,096,721-byte helper with SHA-256
`e92e95df54088dd551c49c1305853efce6b937a20a025ff154a9804a533afe53`
passed identity/parity checks before this effect-flag correction and is superseded.

Focused Node tests cover the old 103 boundary, normal 383/release 384/385 refusal,
original source/context binding, 16 reads and 17th refusal, passive final frame
checks, strict code/flag rejection and inert input capture. Isolated synthetic
packages prove acceptance above 1 MiB, refusal above 2 MiB despite matching synthetic
pins, and refusal of same-size code substitution and truncation. These tests do
not launch EasyEDA or create a native owner.

Final local checks used Node 24.18.0, npm 11.16.0 and soft core limit 0. The focused
plumbing and affected source-parity campaign passed 60 tests with no failures or
skips. Strict type-aware targeted lint and the full TypeScript no-emit check
passed. The native startup/spatial generator checks and independent helper
identity checker passed for the final helper above. No full suite or bundle build
was run by this subtask.

The common Windows `-CompileOnly` branch now invokes `VerifySpatial209Smoke`.
Its C# smoke exercises the new reconstruction, fixed purpose, original-session
sequence, 16-read boundary, request boundaries, code/flag-field rejection and
legacy cap preservation without launching an application. Actual Windows CI
execution of this changed helper remains a release check. No live runtime,
native Source lifecycle, project opening, design edit or Save was performed for
this plumbing work.

The first integration build retained a strict forward-generator refusal because
that separate graph accepted only its released58f shared-helper input. A later
source-only adapter admits the exact6ec helper through its own byte/hash pin,
reverses only13 exact spatial additions and the independently pinned50,933-byte
native block, then proves the complete original1,042,994-byte58f source before
running the unchanged released73-line migration to438. Unknown input and altered
spatial additions refuse. The released transform table and all three forward
graph files remain byte-identical to mainf062; their v2 pins and1MiB source and
compiled ceilings remain unchanged. Seven focused migration/generator/descriptor
regressions and targeted strict lint pass. Generator and graph identity checks
pass without rewriting generated forward outputs or running a native helper.

Windows run42087529291 for PR170 head5a2a1e23bb043433050260919c21626156f7eb84
failed in the common CompileOnly step. C# rejected the new spatial string
constructor because the existing ratline constructor already had that signature.
The corrected spatial factory uses a private `Spatial209Birth` enum constructor;
all native purpose and budget checks remain unchanged. A focused regression checks
the private typed factory and uniqueness of the actual owner constructor
signatures. The current helper has1,097,388 ASCII bytes with SHA-256
`c5124f154b7c111e71cb2ff956a5371cc1d4aef8bdf14ac74d6a062bf5ec134f`.
The former6ec input remains pinned separately. A new exact c512-to6ec projection
then uses the unchanged6ec-to58f-to438 chain, preserving every forward graph byte.
Ten affected tests and targeted strict lint pass; helper identity, spatial
generator and forward graph checks pass. Exact-head Windows compilation remains
to be rerun. No commit, bundle build, compatibility refresh, controller allocation
or change to the frozen5a2a checkout was performed by this correction.

CodeRabbit review5790345306 also identified PowerShell5.1 fractional-number
decoding and .NET Framework round-trip formatting. The fixed numeric grammar now
accepts decimal alongside int/long/double, preserves invariant conversion and all
existing finite/range checks, and uses invariantG17 for all six coordinates.
Common CompileOnly smoke decodes fractional point/region JSON through the actual
PowerShell parser, reconstructs the fixed C# command, decodes its output, and
compares every coordinate's double bits. Direct C# decimal cases remain included.
The current helper has1,099,788 ASCII bytes with SHA-256
`a45801f6f5053d966ac738f824c83e49759f45a165bc3b2fe963f0d9039346f8`.
Its separately pinned exact projection proves a458-to-c512-to6ec-to58f-to438;
previous shapes and all forward output bytes remain unchanged. Eleven affected
tests, targeted strict lint and generator/identity checks pass. Actual changed
PowerShell smoke execution remains an exact-head Windows CI requirement.

## First frozen candidate and Windows compile failure

Commit `5a2a1e23bb043433050260919c21626156f7eb84` passed local non-suite
checks, a byte-identical rebuild of all 3,066 repository files, and a frozen
2,655-file package comparison. The dependency-free probe completed 79 queries
and 81 requests, then EOF/close with exit zero. The package inventory was
`255a71fbd558634076e0ee7578b5a651a24bebe6ab4ffe8a856258fb230a85f2`.
These results did not compile the complete diagnostic C# helper.

PR170 Windows run `42087529291` caught a real duplicate constructor signature:
the spatial string constructor collided with the retained ratline constructor.
The frozen candidate was admitted only for metadata. Its original facade then
retired, released its lease and exited zero under the retained manager and
pidfd. No native allocation or EasyEDA launch occurred. The mutable source now
uses a separate private enum constructor. The corrected helper is 1,097,388
bytes, SHA-256
`c5124f154b7c111e71cb2ff956a5371cc1d4aef8bdf14ac74d6a062bf5ec134f`.
The original helper and failed CI remain historical evidence.

The forward build adapter retains the exact preceding `6ec843c4` shape and
proves corrected `c5124f15` to preceding `6ec843c4` to released `58f681` bytes
before applying the unchanged forward migration. This does not change the
released forward-only files or admit caller-supplied transforms. The corrected
candidate still requires its own frozen proof and successful Windows CI.

The corrected source also passed the actual Windows PowerShell 5.1
`-CompileOnly -Spatial209` check locally. Its result reported compiled true,
pipes checked, empty Job and no launched process, exit zero. This addresses the
observed compiler defect without opening a CAD project. It remains separate
from exact-new-head CI and from connected query validation.

The first Linux CI shard8 also found two stale regression fixtures. The
registration VM did not provide the newly referenced spatial schema, and the
installed offline-probe regression still expected 76 queries/78 requests. The
VM now supplies the real spatial schema/controller and the counter assertions
require 79/81. The initial failures and focused correction outcomes are retained;
no test selection or assertion guard was removed.

## CodeRabbit review corrections

The actual PR170 review `5790345306` examined head `5a2a1e23` and reported
three issues. The constructor collision above is fixed. The numeric reader now
accepts PowerShell's decimal values before invariant double conversion, and all
six point/region coordinates use `G17` formatting. Common compile-only smoke
checks exercise the actual PowerShell JSON decoder and bit-exact fractional
point/region round trips. Strings and booleans still refuse. The helper is now
1,099,788 bytes, SHA-256
`a45801f6f5053d966ac738f824c83e49759f45a165bc3b2fe963f0d9039346f8`.
A separately pinned forward adapter proves `a45801f6` to `c5124f15` before the
retained older projection chain; all released forward output bytes stay exact.

The review's generic documentation request also received a bounded audit of
66 touched named functions across 12 modules. Useful JSDoc was added to 37;
four remaining undocumented functions are single unconditional refusal throws.
AST comparison confirms comment-only edits. The provider's 41.30% documentation
metric was inconclusive and supplied no per-function missing list; no passing
80% metric is claimed. It reported no separate nit, outside-diff or legacy issue
sections. All three concrete findings were accepted.

The provider reported incomplete review coverage: 60 selected PR files, two
generated bundles filtered and the large source-profile file unavailable. Its
full-review command reviewed the PR changes, not every unchanged repository
file. The complete review and skipped-file evidence remain private. Final-head
CI and review remain separate release gates.
