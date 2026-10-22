# Pad copper, mask and thermal parameters

Candidate `0.3.0+codex.20261015020000`. Target remains EasyEDA3.2.206.715d940d,
API0.3.50.ab46409c, UI3.2.196.26ed3d6c and PCB3.2.193.682ed44e. External
compatibility pins and writer restrictions are unchanged.

## Implemented

Existing current PCB Pad `get`/`getAll` and component child-pad results gain
three required fields, without another RPC or tool:

- `defaultCopperShape`: ELLIPSE/OVAL width and height, RECT width/height and
  `cornerRatioPercent`, or an explicit POLYGON `not-projected` marker.
- `maskExpansion`: native mode1/2, top/bottom solder and one shared paste value.
- `thermal`: null, mode1/2, or mode0 with clearance, spokeWidth and angle.

Distances use mil; thermal angle uses degrees. Default copper dimensions already
have native0.1mil rounding. Rectangle corner percentage is not the radius named
in the public documentation. Mask scalars are already scaled by the callback;
thermal distances and angles need conversion from native units/radians.
The native thermal class has dimensions only in mode0, so null and the other
modes branch before reading them. The public thermal mapper reads the wrong
nesting and omits conversions; this projection does not reuse that result.

The [source research](2026-10-15-current-pad-geometry-research.md) records exact
pinned source offsets and official documentation. The existing control skill's
API reference now explains these fields and their limits. No new skill or test
framework is added. Catalog counts remain15tools, seven skills,11geometry
methods and774distinct SDK methods.

The exact target/frame/receiver checks, fixed own-data reads, complete ordered
two-sample comparison and scalar/row/byte bounds are unchanged. Child results
reuse global Pad DTOs; the differently scaled child callback supplies only
membership and common-field correlation. No rule refresh, selection change,
navigation, design edit or Save is requested by these readers.

## What these observations do not establish

Loaded parameters are not saved membership, root ownership, resolved rules,
rendered copper or fabrication acceptance. Native mask null-to-zero coercion
means zero cannot prove an explicit override. Thermal null does not mean no
connection, and nonnull values may come from a footprint template. ELLIPSE
parameters alone do not reconstruct the native outline.

Concrete remaining backlog:

- Polygon paths: the native encoder mixes CIRCLE/L/ARC/CARC/C segments and
  filters/rounds them. A complete bounded interpretation is not implemented;
  omitted path contents are neither returned nor compared.
- NGON: public declarations exist, but the reviewed native ordinary-shape enum
  does not establish its diameter/sides representation. Unknown shapes refuse.
- Physical-layer pad stacks: native special output uses fixed top/inner/bottom
  ranges, not complete physical-layer membership. Default shape is not proof
  of a uniform stack.
- Rule/pour truth: refreshing mask rules mutates the model, and loaded thermal
  values are not evidence of actual poured spokes. A separate scoped operation
  and output model are needed.
- Reverse pad ownership and symbol-pin mapping: forward child membership cannot
  independently prove the parent or symbol/device/footprint pin binding.
- Component library/device/3D enrichment, BOM/manufacturing exports, other
  primitive families and optional public filters remain separate adapters.
- Current schematic/symbol/PCB writers and eight metadata writers still lack
  native structure-job completion and complete SQL-effect proof. Lost-handle
  supervision and quarantined-opening closure keep their existing limits.

## Verification and delivery

Main and independent source review accept the implementation. Twenty-eight
focused geometry/identity/registration tests pass, covering the new fields,
null/mode branching, malformed own data, bounds/conversion overflow, complete
sample drift and child reuse. Both TypeScript configurations and strict
zero-warning type-aware lint pass. Thirty-four coverage tests, build/sanitizer,
generated inventory, compatibility, package/repository/privacy and all seven
official skill validators also pass. CI, publication and installed verification
are recorded at delivery; no connected validation
of these new fields is claimed by source or synthetic tests.

Final source340 SHA-256:
`92946f2b38d87666fb031731efb8b900f60d2575ecc4543eb40eda8de3fb2aca`.
Runtime3 SHA-256:
`d7f99363d58ee66181f74c7841edcfd6b00d6e7da02a7dc1b5b686b77cf828a7`.

Only the existing disposable project is in scope for connected checks.
Production designs and their records are excluded.
