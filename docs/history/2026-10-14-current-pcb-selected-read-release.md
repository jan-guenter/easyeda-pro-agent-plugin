# Explicit-ID PCB read release

Released: `0.3.0+codex.20261014190000`. [PR27 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/27#issuecomment-6176487958)
records the protected merge, passing CI and verified marketplace installation.

## Scope

The current geometry tool adds five native `get` equivalents: Line, Arc, Via,
Component and Pad. Each accepts `arguments:{"primitiveIds":["id"]}` with 1 to
256 distinct nonempty IDs, at most256characters each. Output uses the existing
plain geometry/placement DTOs in caller order. Any unavailable ID refuses the
whole request. This is narrower than the public scalar/array overloads and
their missing-ID skipping; it does not return SDK objects.

The same retained receiver, exact target/runtime checks and full-family native
`getAll` handlers remain. Both complete projected samples must match before
selection, including unrequested rows. Existing row, field, byte and deadline
bounds remain; a small requested subset cannot bypass them. `get` reports
`returnedRowCount` separately from full-family `observedRowCount`. Existing
`getAll` arguments and response shape are unchanged. No direct native `getByIds`, navigation,
selection change, Save or writer is added.

PR review also identified a conservative Point-shape restriction: native
Points may retain an own `_hashed` cache. The projector now tolerates that
named optional field without reading it, while retaining own-data and finite
checks for `x`/`y` and rejecting other extra keys. Both existing collection and
explicit-ID tests failed with populated caches before the correction. This is
not a claim that the live callbacks failed: the reviewed handlers currently
allocate fresh Points without hashing them.

[Primary-source research](2026-10-14-current-pcb-selected-read-research.md)
documents why direct ID handlers are not reused: some have weaker family
checks. The packaged skill, tool descriptions, argument discovery and generated
coverage inventory expose these restrictions. Five additional guarded routes
bring the inventory to330available-with-runtime-guards routes across the
same774distinct methods;94blocked and2partially blocked routes remain.
All writer blocks and external runtime pins are unchanged.

## Live evidence completed before this release

Installed180500 launched EasyEDA and authenticated without user setup. The
disposable PCB opening completed both navigation stages and exact native
identity checks. Component and Pad `getAllPrimitiveId` and `getAll` returned
two components and four pads, respectively, with identical ordered identities
within each family. All four reads had matching double samples and before/after
runtime admission. The user closed normally without a prompt; the original
retained root and Job termination were then verified.

This verifies one scoped opening and four loaded-view reads, not persistence,
complete source, parent ownership, connectivity or editing. No explicit Save or
design change was requested. Production designs and their records were not
accessed. See the [connected ledger](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md).

The new explicit-ID methods still need one focused installed disposable check.
Do not transfer180500 live evidence to190000 or to other method families.

## Remaining implementation work

- Current writer lifecycles: native structure-job completion and complete
  SQL-effect proof remain prerequisites, not missing test labels.
- Component library/attribute enrichment and child/pin associations need
  dedicated readers that establish reciprocal ownership.
- Pad shapes, holes, mask and thermal rules need explicit tagged projections
  for the native units, missing values and known public mapping defects.
- Scalar `get`, optional public filters, broader type classification and other
  primitive families remain separate contracts. Array-of-one is supported.
- Current layer and Line/Arc/Via read families still need scoped connected
  evidence; discovery or this Component/Pad case does not validate them.
- Library/3D association, ECO, operation-specific exports and broader recovery
  remain in the existing backlog. No whole-SDK execution claim is made.

## Verification

All44focused reader, registration and coverage tests pass. Independent review,
strict types, zero-warning type-aware lint, reproducible build, compatibility
and all seven official skill validators pass. Final immutable PR CI passed
9,883 facade tests with five skips and zero failures, plus424bridge tests.
Postmerge CI also passed. Installed inventory and configured offline startup
were independently verified; the delivery receipt holds their exact hashes.
The initial local aggregate was invalidated by a concurrent manifest rebuild
and is not counted as acceptance. No new private harness
or broad test matrix was introduced.
