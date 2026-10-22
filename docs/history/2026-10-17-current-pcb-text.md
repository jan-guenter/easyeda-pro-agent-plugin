# Current PCB text readers

## Release scope

Version `0.3.0+codex.20261017170000` adds three read-only native equivalents on
the pinned current EasyEDA tuple: `eda.pcb_PrimitiveString.get`, `getAll` and
`getAllPrimitiveId`. They use the existing exact active-PCB target and runtime
fingerprint gates. Geometry discovery now lists 13 methods; identity discovery
lists 8. The inventory has 336 available runtime-guarded routes, 94 blocked
routes and two partial routes. Distinct SDK-method classifications do not
change because the older runtime already had String reader routes.

The geometry DTO contains primitive ID, lock, layer, x/y, raw text, font family,
font size, line width, alignment, rotation, reverse, expansion and mirror.
Native distances multiply by 10 to become mil; radians become degrees through
`*180/Math.PI`. Empty strings, zero and false remain literal values. No SDK
constructor defaults or value coercion are applied.

Only parentless loaded String views are included. This excludes component
attributes and inherited text; it does not prove saved-source ownership.
Rendered text, substituted values, glyph outlines, colors, font-cache data,
font availability and hidden/unloaded content are not returned. Generic
primitive-type classification remains limited to Line, Arc and Via.

The entire returned family is checked before selecting caller IDs, with the
existing exact receiver/target checks around awaits and two ordered samples.
Limits remain 256 geometry rows, 65,536 UTF-16 units per text value, 1,024 per
font name and a 384 KiB escaped response envelope. Identity-only reads retain
their independent 20,000-ID/envelope bounds. Unsupported filters refuse.

## Source evidence

Installed PCB bundle
`pro-pcb/3.2.193.682ed44e/js/pcb.js` has SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Installed API bundle `pro-api/0.3.50.ab46409c/api.js` has SHA-256
`021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76`.
Offsets below are zero-based JavaScript string offsets, not line numbers.

- API String class at 1502811 defines the public unit conversions.
- PCB `string-getAll` at 10397039 enumerates existing views, filters
  `!getParent()` and uses `yr.toJSON` at 7384285 for raw fields.
- `Jr=t7` is initialized at 10792778; its constructor at 7959342 retains the
  existing model manager. `iu.getAllItem` at 7946805 enumerates existing
  `stateWatcher` values; `Ni.iterator` at 3172840 is `Map.forEach`.
- The serializer's font-cache lookup uses existing data: `getFontTemplate`
  at 3978262 is a map lookup, `getFontCache` at 3977492 scans existing entries,
  and `hasOutline` at 3975925 checks a stored array length. These paths do not
  load fonts, refresh geometry or invoke setters.

Official beta contracts reviewed on 2026-10-17:
[scalar get](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.get.html),
[array get](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.get_1.html),
[getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getall.html),
[getAllPrimitiveId](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getallprimitiveid.html)
and [alignment enum](https://prodocs.easyeda.com/en/api/reference/pro-api.epcb_primitivestringalignmode.html).
The new routes are narrower native equivalents, not execution of those public
wrappers or support for every optional public argument.

## Verification and skills

Focused checks passed 69 tests, strict type-aware lint, full TypeScript checks
and generated inventory equality. An additional escaped-envelope regression
passed its named rerun: two quote-heavy maximum-length strings exceed the
whole-family envelope even when the caller selects only one. Tests also cover
all nine alignments, unit conversion, empty values, malformed/accessor fields,
drift in unrequested rows, ordering, missing IDs and collection bounds.
Independent source review found no implementation blocker.

The control skill's long API reference is split into current PCB, current
symbol, current utility and legacy SDK contracts. The task index and original
anchor links route to those files. All 22 original heading anchors remain;
moved contracts are retained in the task references. Independent review checked
all 77 local links across the eight affected skill/reference files and the
PCB-text task path.

Full release, CI and installed-package results are recorded in AGENTS.md when
they occur. No connected String test, application launch, CAD edit, Save,
fixture read or production-project access occurred in this implementation turn.

## Remaining work

Connected validation of these new readers is separate from their offline
support. No writer was enabled. The next drawn-symbol fixture route is the
[closed native clone contract](2026-10-17-current-symbol-copy-contract.md),
which still requires a copy planner, equal-time header model, complete SQL
comparator and retained-owner lifecycle. Ordinary drawn-symbol metadata,
referenced-symbol propagation, schematic/PCB structure writers, broader
library editing and operation-specific manufacturing exports remain backlog.
