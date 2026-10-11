# Candidate 220050

`0.3.0+codex.20261011220050` adds a configured-font reader and corrects the
native wire adapter's unlocked-state handling. Publication and installation are
pending final release verification. Production designs and their project
records remain untouched. The disposable named-wire seed is saved, reopened,
verified and now closed. Do not repeat its setup or Save.

## Implementation changes

`sys_FontManager.getFontsList` is a narrow native equivalent. It returns only
configured titles from the current UI, preserves order, duplicates, empty
strings and case, and refuses absent or malformed configuration. Retained
UI/project/tab/path owners and complete repeated observations detect drift.
The bounds are 512 titles, 1,024 UTF-16 units per title and 131,072 combined.
There is no public wrapper's false-empty fallback, preference write, account
identity claim, OS-font inventory or rendering proof. The
[source research](api-next-adapters-research-2026-10-11.md) records the official
contract and exact installed implementations. Connected validation is pending.

The wire adapter previously required `locked:false`, but EasyEDA normally
omits that field on a newly drawn WIRE. The corrected source gate admits
omission or literal false and keeps them distinct. Runtime values must match
the retained source exactly. Own undefined, null, true and other values refuse;
group/root, geometry, attribute, history, contact and lifecycle guards remain.
Eight new regression tests cover both representations, exact inverses and
drift before, inside and after the native action. Together with the existing
wire tests, all 23 focused cases pass. Three omitted-lock tests fail on the old
writer with the producer-faithful fixture, confirming the regression.

Actual saved and reopened disposable evidence passes the corrected adapter,
inverse and maintained complete-project materialization checks offline. The
forward proposal changes exactly three existing LINE x-coordinates; the inverse
restores the complete source. No geometry was applied. Full sealed transaction
preparation has not run: the public topology diagnostic intentionally omits raw
observations and live owner binding. Those cannot be reconstructed from hashes
or substituted with caller data. A fresh installed host must exercise the normal
preparation and saved/reopened forward/reverse paths.

The inventory has 774 methods: 193 public subsets, 103 native equivalents, two
lifecycle-only methods, seven implemented-but-blocked methods and 469 omissions.
There are 358 runtime-guarded routes, nine blocked and three partially blocked;
182 fixed readers, including 21 native equivalents; 108 design and 68 library
schemas; 26 tools and seven skills. These counts describe implementation, not
whole-method or connected validation.

## Historical wire source review

The first complete candidate run passed 3,713 tests, with one review-gate failure
and one platform skip. The gate correctly required review of the changed wire
adapter against its historical record. That failure log is retained; it was not
a connected test failure or evidence to refresh historical live validation.

The preceding reviewed adapter was
`dc497d091b084139e7565bdaf0988ec5e896fba99aba7155b73028b221fefc40`.
The current reviewed source is
`a4336c2fae96b142a50cdfbba722e35f3456ef290847c937d23292db8f298ec9`.
Their complete diff is one explanatory comment and two lock guards. For the
historical explicit-false input profile without `flatGuard`, the source gate
still requires false and the runtime comparison still requires exactly false. The added omitted-lock
case does not inherit the September validation. Root and independent review
retain the original historical adapter hash `13db7218`, fixture, external tuple,
three dated stages and exclusions. Only the separate source-revision review
advances; it explicitly excludes omitted-lock and sealed-wire live validation.
An added exclusion and exact registry assertions preserve that distinction.
Both root and independent runs pass all 20 registry/native-wire/lock tests.
The failed full-run log commitment is
`4d527cbc1b84878450de3572d923c1756451591a509dfb3d7f93fd8af4156900`.

## Connected evidence on the preceding generation

Installed204104 passed system-library UUID lookup, the singular/plural Text and
Wire readers, and both caller orders of a mixed two-item selection. Complete
native and saved checkpoint boundaries stayed unchanged across the reads.
Pointer-only hover also passed with separate managed before/after images of
the overflow menu. See the [fixture report](api-coverage-204104-fixture-validation-2026-10-11.md)
and append-only [connected ledger](api-connected-validation-ledger.md).

Native fixture preparation added six wire records while preserving every one
of 165 original records, all 11 peer documents and 66 imported atom-header
occurrences. One Save persisted the name and native caption position. One
reopen retained all 12 documents and the complete SQLite state. Native source
was exact; eight unstored inherited attribute IDs regenerated in unchanged
order, which the maintained lifecycle proof accepts. No stored identity,
body, pin or net changed. This is saved fixture setup, not a reroute test.

Normal close and empty process discovery prove the disposable editor exited.
The closed verifier retained source `93eb9a28`, checkpoint `9ccef95a` and logical
dump `b538b6c7`. All nine previously retained backup-root metadata inventories
still match their baseline. These are point-in-time observations, not an atomic
lock or continuing no-deletion guarantee. No Save/Discard prompt was chosen.

## Skill changes

Guidance now records the actual mixed-reader scope, pointer-event snapping lag
and separate visual checks, the omitted-lock representation, and the font
reader's limits. The checkpoint guide specifies that standalone TypeScript
helpers need a reviewed checkout with locked dependencies. The installed
dependency-free MCP bundle does not make those source utilities standalone.
An attempted installed-source invocation failed before database access; its
retained failure was followed by a successful reviewed-checkout verification.

The published MCP descriptions now name the separate schematic wire-reroute
profile and configured-font observations. The old design description incorrectly
limited all schematic edits to stored display batches. A protocol-level test
checks both exact descriptions and confirms discovery sends no upstream call;
the existing SDK registration assertion remains strict. No operation schema,
handler or authorization rule changed with these text corrections.

## Release verification

Clean Node24.18.0/npm11.16.0 installation and dependency audits pass, including
151 signatures, 40 attestations and zero reported vulnerabilities. TypeScript,
strict type-aware lint with zero diagnostics, package/repository/privacy checks,
offline doctor and workflow lint pass. All 424 bridge tests pass. The final
facade run passes 3,715 tests, with one platform-specific skip and zero failures
or cancellations. All seven official skill validators pass. Its retained log
commitment is
`7b28f8db12d1c6c1cfcad050ca36d74de5b6ec404f2e17259502d72a352e31cb`.
CI, publication and installation remain pending.

Two facade builds reproduce exactly, as does the reviewed descriptor sanitizer.
Two synthetic-key bridge archives also match; no real bridge key, import or
receipt changed. External EasyEDA, upstream, SDK, bridge and sanitizer pins are
unchanged. Frozen source204 fingerprint:
`bea391898a967dc51a49fee7d04b34372fdcd0758c267f914043713db6a0e083`.
Three-file runtime fingerprint:
`a350c6fe19e782d595a173d9208d7e4c394eb49d9b88dba88e8ef2719224acbc`.
Compatibility manifest:
`e1baee7c8aeb9eb30c673c2f27e0e2fde627096e20bb61c1caf69dc4eaef6144`.
