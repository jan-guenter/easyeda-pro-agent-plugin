# Current PCB explicit-ID geometry reads

Research date: 2026-10-14. Baseline: main `bb6dedff`, installed release180500.
The smallest useful addition is an array-only `get` equivalent for Line, Arc,
Via, Component and Pad. Reuse the current bounded `getAll` geometry observer,
then select exact requested IDs in caller order. Do not add native `getByIds`
calls, SDK object construction or new fields.

This was source-only research. Installed declarations and bundles were read as
inert text, not evaluated. No live tool, editor, profile, project or design was
accessed by this research. It does not establish connected execution or saved
membership. "Explicit-ID" means IDs supplied in the request, not a change to
the editor's selection.

## Primary sources

The installed editor package is 3.2.206.715d940d. Paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/`. All four files were
rehashed. Implementation offsets are zero-based JavaScript UTF-16 string
positions, not byte offsets. Declaration references are one-based line numbers.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

All five public methods have two beta overloads. The scalar overload accepts
`primitiveIds: string` and returns one SDK object or `undefined`. The array
overload accepts `primitiveIds: Array<string>` and returns an SDK-object array.
Each array contract allows unmatched IDs to be omitted. None of the inspected
method pages promises array ordering, deduplication or complete requested-ID
coverage.

| Family | Installed scalar / array declaration lines | Official scalar / array contract |
| --- | --- | --- |
| Line | 22235 / 22244 | [scalar](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.get.html), [array](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.get_1.html) |
| Arc | 12620 / 12629 | [scalar](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.get.html), [array](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.get_1.html) |
| Via | 25468 / 25477 | [scalar](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.get.html), [array](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.get_1.html) |
| Component | 19860 / 19869 | [scalar](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.get.html), [array](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.get_1.html) |
| Pad | 23419 / 23428 | [scalar](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.get.html), [array](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.get_1.html) |

The baseline `api-coverage.json` already records these five `get` methods as
legacy public subsets through `easyeda_control_sdk_read`. Their runtime gates
do not admit the current restricted loaded-view reader. Preserve those routes
and add a separately identified native equivalent. Installed declaration lines
above are for the actual current package, not the older separately reviewed
declaration or newer npm declaration indexed by that catalog.

## Installed call path and ordering

| Family | API `async get` offset | UI native-topic reference | Native `getByIds` / `getAll` topic offsets |
| --- | ---: | ---: | --- |
| Line | 1357970 | 17241937 | 10400543 / 10400807 |
| Arc | 1364864 | 17243220 | 10330076 / 10330519 |
| Via | 1351577 | 17241468 | 10405614 / 10405876 |
| Component | 1424285 | 17290273 | 10336180 / 10336493 |
| Pad | 1409359 | 17314690 | 10369930 / 10370750 |

Each API wrapper turns a string into a one-element array or copies the input
array, then sends `{primitiveIds: ids}` to its fixed public `getByIds` topic.
It maps returned rows without sorting or deduplication. The scalar path takes
the first row and returns `undefined` for no rows. These are installed source
observations, not additional public guarantees.

Each native handler iterates request indices from zero upward. It looks up the
ID, skips an unavailable view and appends the serialization for a found view.
Thus surviving rows follow caller order, and repeated requested IDs produce
repeated rows if serialization succeeds. A missing view does not establish
absence from saved source. `iu.getItem` at PCB7946805 returns an existing
model's `stateWatcher`; its neighboring `getAllItem` only returns models with
existing watchers.

The direct ID handlers have weaker family checks than the current full-family
observer:

- Line uses `hr.getItem`, but `hr` contains both Track and Arc views. Its
  `getAll` explicitly filters `xr`; direct `getByIds` does not.
- Arc and Pad use generic `rr.getItem`, not their family managers. `rr` at
  PCB3873886 searches sixteen managers in fixed order and returns the first
  non-null view. These ID handlers do not check `Oi` or Pad type before reading
  family-specific fields. Wrong-family input can therefore throw or produce a
  wrong projection rather than a trustworthy family miss.
- Via and Component use their own existing `Vr` and `gr` managers. Their
  requested-ID loops still skip missing views and repeat duplicate IDs.

All five UI methods use the mutable active-tab router `Ot`. Component also
awaits `rpt` enrichment for each row after its native read. The current retained
receiver avoids that routing and enrichment. Its existing DTOs intentionally
omit the component library, attribute, child and 3D data that the SDK object
contains. Do not label those omissions direct-method parity.

## Recommended narrow implementation

Extend the existing `current-pcb-geometry` request and catalog with exactly the
five `eda.pcb_Primitive{Line,Arc,Via,Component,Pad}.get` literals. Accept only
`arguments: {primitiveIds: string[]}` with 1 to 256 distinct nonempty IDs and
the existing 256-character ID bound. A one-ID array handles a single lookup.
Reject scalar input, empty arrays, duplicates, extra fields and unsupported
families before any bridge call. The existing `getAll` empty-argument contract
stays unchanged.

For `get`, execute the corresponding existing fixed native `getAll` handler
with `{}`. Preserve the complete-family validation, retained frame and receiver,
exact project/branch/tab identity checks, and two matching ordered projected
samples. Keep all current finite-number, signed-zero, field, duplicate-ID,
256-row and 393216-byte guards. Do not filter before those checks. A selected
request must still refuse an oversized family or an invalid unselected row;
it is not a way around the current observer's bounds.

After complete-family validation, create an exact ID map and return requested
DTOs in caller order. Require every requested ID to exist exactly once in the
observed family; otherwise refuse the whole request. Reordering the same
requested IDs changes output order only, never editor selection. Keep response
counts unambiguous: returned-row count and observed-full-family count describe
different quantities. Host validation must reject a result whose target,
method, family or requested IDs differ from the request.

This is an honest narrower native task equivalent if the catalog and result
state those restrictions. It does not execute the public `get`, does not return
SDK objects and does not implement the public scalar or missing-ID behavior.
In particular, refusal means a complete selected observation was unavailable;
it must not be reported as a missing saved component or pad. Retaining full
family observations internally also makes the implementation stricter than
two equal selected rows alone.

## Preserved limitations and smallest verification step

Reuse the existing projections and units without adding fields or rounding.
The [geometry research](2026-10-14-current-pcb-geometry-research.md) records
Arc/Via precision differences and incomplete arc shape data. The
[Component/Pad research](2026-10-14-current-pcb-component-pad-research.md)
records their loaded-cache serializer dependencies and deliberately small
placement projections. Explicit IDs do not turn these DTOs into complete
native records, parent associations, root ownership, connectivity, DRC,
persistence or an edit baseline. Pad membership still does not distinguish
component pads from free pads. Models without views remain unobserved.

Vendor enumeration and serialization still run for the entire family before
facade bounds. This proposal reduces returned data and caller-side matching,
not vendor work or timeout risk. A timeout does not cancel native execution.
No direct `getByIds`, selection, navigation, Save, source export, mutation or
library service is needed for this addition.

Extend the maintained reader test cases for caller-order output, whole-request
missing-ID refusal and malformed array rejection. Retain an unselected-row
drift/bounds case to prove selection follows full-family validation. Run the
existing required build, type, lint, inventory and release checks. After
installation, one supported nonempty disposable family can verify an explicit
ID lookup; that result does not validate other families or new fields. No new
private test harness or broad matrix is warranted for this slice.
