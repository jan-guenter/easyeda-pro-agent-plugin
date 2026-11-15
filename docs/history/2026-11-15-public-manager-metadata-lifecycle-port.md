# Public manager metadata lifecycle port

The public source base is `7ebb744672174c0350b0d002c5bf82ca7dffdcd7`. This change reapplies only the manager
metadata-settlement source from `e8b17119` (also present as `15401a70`) and
the untouched-input EOF source from `26ff9505`. Those private commits are
provenance, not ancestors of this public branch. The two changed TypeScript
files have payload SHA-256
`28d11712a86632599f953189d62bffb696bd8cda56c9d7891ca965c9a799ce2d`,
computed over their sorted repository-relative path, NUL and complete bytes.

The [first-status record](2026-11-15-first-status-timeout-recovery.md) and
[pristine-input record](2026-11-15-pristine-input-closure.md) are retained
byte-for-byte from those respective origin commits. Their operational
observations and earlier counts remain historical. This public port adds no
full-writer manager adapter or native cleanup route.

An untouched ready manager whose input reaches EOF may retire only its original
metadata child through the existing retirement and shutdown commands. It waits
for evidence/output settlement, rechecks the original connection and consumes
the attempt before protocol dispatch. Any caller tool activity, pending work,
fault or ambiguity preserves the existing retained-owner behavior.

A lost first `easyeda_control_status` reply admits the fixed
`observe-metadata-settlement` command only for strict empty arguments and no
earlier caller tool dispatch. The original client, transport, generation and
interrupted request stay bound. Each observation clears the earlier settlement
marker before awaiting its same-facade counter. A fresh zero counter admits
only original retirement preflight; ordinary calls and status replay stay
blocked, and the lost status outcome remains unknown. Facade retirement still
owns its independent native/journal/lease checks.

The synthetic peers use the actual SDK timeout and original child transports.
New refusal coverage checks earlier caller activity and nonempty status
arguments; neither allocates an observation or gains EOF cleanup authority.
Their peers close themselves on a bounded timer, and the manager observes those
same children before closing itself, without claiming retirement or native
cleanup. The successful cases separately observe supported retirement, original
stdin EOF, exit and transport closure.

All43 focused manager cases (31 top-level checks plus nested cases) pass without
skips. Both TypeScript configurations and strict type-aware lint on the two
changed TypeScript files pass with zero warnings. The environment is Linux
x86_64 with Node24.18.0, npm11.16.0 and soft core limit0. An independent read-only
source review found no substantive original-identity, caller-history,
unknown-outcome, publication or once-only EOF regression.

Repository, MCP-contract and all-skill validation, plus the official quick
validator for all seven packaged skills, also pass. Raw test evidence remains
private. No application/native purpose, installed
facade connection, production journal, installed cache, release version, push
or PR was touched. Generated manager bundles and final package/CI verification
belong to the next Windows automation batch after the existing foundations
review is merged. The new source is not an update to an already-running manager.
