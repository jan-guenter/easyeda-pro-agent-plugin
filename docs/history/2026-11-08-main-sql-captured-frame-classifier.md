# 2026-11-08 Main SQL captured-frame classifier

The pinned app module uses F5 only at its top-level util import and promisify
initialization. An isolated source-preserving CommonJS/V8 probe reproduced
F5's absence in a later B5 frame. Z2 differs: the real yo constructor captures
it; that probe retained the original Z2/sc references. These are local source
and V8 facts, separate from any native application's diagnostics.

The new passive v2 classifier uses the original runner-owned capture tuple for
util/proxy, sqlite and Z2. Twenty-three fixed frame expressions drop only F5;
import and afterImports keep their historical module-frame expressions outside
this new table. Every other raw operand is preserved. The classifier validates
the existing capture/scope, rejects Proxy raw frames before reflection, joins
raw sqlite-module or Database-constructor operands to the original references,
and reconstructs the full legacy tuple by inserting captured util at F5's
original position.

The unchanged helpers, readonly parser and site-specific condition run with
those original aliases and actual fixed frame locals/receiver. Only a valid
condition result false returns boolean true. Ordinary condition true returns
the normalized legacy array for existing source/startup gates. Guard, parse or
capture exceptions return the closed string `guard-refused`; exceptions never
become approval or a policy-true array. The private original capture reference
remains a required Core boundary; this does not claim trap-free validation of
arbitrary caller-supplied Proxy captures.

All old exported program strings remain byte-exact, including the conditions
SHA `b16bb16601fcd44ddd3d762681fd1c6b75c672360649939af1f831c55dce2a33`.
The new classifier is 11,700 UTF-8 bytes and its JSON function field remains
below the existing 16 KiB native row ceiling. This leaf adds no runner,
protocol, native route, resume, SQL, clock or Save authority. Its one fixed
scratch-capable call and original held-pause handling belong to the separate
integration; absolute request/time/native limits are unchanged here.

The complete tested runtime/test tree is
`9f7ed4494b55f92af66890478df813ce8e2dbce2`, based on
`5bc77b9a862cd2cbc1b0e495b62383184368fc05`; this record is added afterward.
Final Node 24.18.0 checks passed twelve focused cases with zero skips (three
new and nine existing predicate cases), both TypeScript configurations, and
strict type-aware two-file lint, all actual exit 0. Tests compare all fixed
sites with their original v1 predicates and cover normalized operands,
readonly/write separation, missing ambient aliases, Proxy/accessor/module/
constructor/capture drift and zero hook/config-map effects. Initial local lint
findings are retained privately and fixed before the sealed checks. No C#,
Windows, original app, native owner, MCP or CAD call ran.

A follow-up tightens only v2's first proxy call: capture[6] must equal the
isProxy function in the freshly revalidated original util/types module before
it is invoked. A substituted private proxy slot now refuses with zero hooks.
Original captureRef provenance is still required; the old joins, captures and
condition bytes remain unchanged. The revised classifier is 11,754 bytes
(JSON function field 12,603 bytes), SHA
`57e318a42d7f41951ebc65fe276a27be6097dfcb9cd2ef51d9ac76b4c6a487dc`.
The follow-up tested runtime/test tree is
`7c15050cf11570812abbde07e19e3af6c4eedd4f`, based on introducing commit
`ad91e743`. Twelve focused cases, both TypeScript configurations and strict
two-file type-aware lint each exited 0. This record addition follows that seal.
