# Public device and ordinary-symbol search

Date: 2026-10-23. Base main
`8e87429fc945d6fe8261fa1f2405f2adec2da75e`, installed plugin
`0.3.0+codex.20261023175500`. Implementation work is on
`feature/generation209-layers-catalog-batch`.

This adds two bounded vendor HTTP actions to `catalog-components`. It does not
call the desktop SDK, open EasyEDA, access a local library or inspect a project.
The existing footprint lookup, footprint search, symbol detail and device detail
remain separate operations. No production project was touched.

## Implemented contract

| Action | Fixed request | Fixed asset scope |
| --- | --- | --- |
| `search-symbols` | POST `https://pro.easyeda.com/api/v2/components/search` | Ordinary symbol `docType[]=2` |
| `search-devices` | POST `https://pro.easyeda.com/api/devices/search` | System-owned devices with ordinary symbol and footprint references |

Both actions require a public query of 1 to 128 characters, explicit page1–1000,
pageSize1–20 and `confirmNetwork:true`. The fixed system-library identifier is
`0819f05c4eef4c71ace90d822a990e87`. It supplies both `path` and `uid`.
Neither action accepts a caller library, URL, method, header, tag, special
symbol type or asset-download switch. Query terms are disclosed to the vendor.

The existing form transport remains unchanged. Empty tag arrays produce no
form fields. Device search sends no `docType` field. Each invocation makes one
credential-free request, without cookies, redirects, retries or authentication
fallback. The request/body deadline is 30seconds, the decoded body limit is
1MiB and the independently checked projected-result limit is 128KiB.

Responses must have the exact system UID, matching requested page/pageSize,
duplicate-free candidate IDs and empty `mine` and `user` groups. Unknown groups
refuse instead of being silently filtered. If the vendor echoes `wd`, it must
match the query. Search order is retained, but ranking, exact matching and
completeness are not verified. Vendor counts and page totals are reported
unchanged, without an arithmetic consistency or next-page claim.

Ordinary symbols require system owner and ownerUuid, plus numeric docType2.
Devices require exact system owner, empty `project_uuid`, symbol_type2,
footprint_type4 and both association UUIDs. Device ownerUuid/path/public fields
may be absent; absence is not rewritten as a positive assertion. Supplied
contradictory values refuse. `symbol`, `footprint`, `symbol_info` and
`footprint_info`, when present, must agree with their attribute IDs. Supplied
linked ownership, path, visibility and document-type fields must also agree.
These checks also apply to the existing device-detail action.

The projection keeps bounded names, descriptions, classification IDs, selected
manufacturer/supplier strings and symbol/footprint references. It does not
verify linked assets, pin mappings, electrical suitability, stock or pricing.
An inline vendor `dataStr` can be received within the body bound. It is discarded,
never projected, parsed as CAD or executed. No separate linked-asset download
occurs. Discovery wording now makes that distinction explicitly.

## Primary-source review

The official [device search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.search.html)
and [symbol search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.search.html)
pages describe beta methods with a keyword, optional library/classification/type
and pagination arguments. Device search is approximate, not an exact supplier-ID
lookup. The symbol page's example warns that nonempty SDK keyword searches can
throw. A successful HTTP sample does not contradict that warning or qualify the
desktop method. The new actions are narrower vendor HTTP task equivalents.

The existing offline coverage inventory was checked for both exact mounted
methods. Before integration they were omitted with
`account-or-library-scope-needed`. This bounded anonymous system-catalog path
addresses that subset only. Private/project libraries, arbitrary classifications,
special symbols and the complete declared SDK contract remain unsupported.

Installed primary implementation source is
`assets/pro-ui/3.2.198.2800f583/js/ui.js`, 17,468,192bytes, SHA-256
`3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6`.
Offsets below are zero-based UTF-16 positions in that complete file.

| Offset | Source finding |
| ---: | --- |
| 6061207 | `Man` defaults ordinary POST object requests to JSON content type. |
| 6061646 | `Ian` handles JSON or form encoding. Empty form arrays emit no fields; populated arrays use bracketed names. |
| 6072582 | Device route table fixes `/api/devices/search` and the separate v2 detail route. |
| 6073155 | Component route table fixes `/api/v2/components/search`. |
| 6177499 | `Wsn` sends device search with path, UID, page, pageSize, empty-default tags and keyword, without a docType field. |
| 6179220 | `Jsn` sends symbol search with the same fields plus supplied docType array. |
| 17209108 | Public device-search wrapper includes broader local/project and system-library routes not admitted here. |
| 17379853 | Public symbol-search wrapper allows ordinary and special docTypes; this adapter fixes only2. |

The two wrapper offsets are contextual anchors, not standalone executable pins.
The complete file hash and fixed HTTP route/response contract are the evidence
used here. Form encoding is supported by successful anonymous endpoint samples;
it is not the desktop helper's default. No change to JSON was made merely to
erase that difference. Earlier broader wording remains preserved in the
[prior catalog record](2026-10-23-public-catalog-expansion.md), with its correction
in the [175500 handoff](2026-10-23-175500-catalog-opening-release.md).

## Anonymous observation and offline reprojection

Exactly one new vendor request was made for ordinary-symbol search with public
term `resistor`, page1 and pageSize1. It returned HTTP200 and 995bytes, including
system-owned ordinary symbol `aabb9cde7b804c74837243916f926595`. Raw SHA-256 is
`03aa04acffed6b7773dcb12e274b888dcaf84ded946f45e94176356ff9fae9f0`.
The result reported count108200 and totalPage1082 despite pageSize1, supporting
the retained pagination-uncertainty policy. No extra request was made to alter
or improve that result.

Device search reused the prior public `10k` response, without another request.
Its raw SHA-256 remains
`ff9b420cf0c92da809f759194094a7d3ab68b41b4397f20dac3a3c7390a6d05f`.
That response contains ordinary device `86aa4f3d61a7474782d89ec425f1704f`
with matching direct and inline symbol/footprint identities. Inline source is
present in the raw response and absent from the new projection.

The maintained result validator accepted both retained bodies offline.
Device reprojection SHA-256 is
`1e32da4cfbba21e3ee05f4cbe9189dbe28d50fb430689ad1d94852dd90b8574e`;
symbol reprojection is
`0e0b451ddf54b718c88e74b4b3c147e62c6505c2d5dd7b5c42ee2edf0ac492aa`.
Private evidence is retained outside the repository under
`/root/.cache/easyeda-catalog-search-20261023-NNQVyk1d` with mode0600 files.
These are source-level HTTP and offline-projection observations, not installed
MCP or connected SDK execution.

## Verification and integration boundary

Focused tests cover strict inputs, fixed transport paths and exact encoded
bodies, absent optional flags, hostile ownership/types/associations, inline
source exclusion, duplicate IDs, unexpected groups, page/query mismatch,
independent result bounds and the actual registered callback. Existing
footprint transport tests retain redirect, media, UTF-8, byte-bound, deadline,
no-retry and raw-error-suppression coverage. Node24.18.0/npm11.16.0, zero core
limit and the maintained isolation preload were used.

The initial focused run passed25 tests. Pre-freeze lint and types then found
nested expressions, one variable-order issue and an incomplete metadata type
union. Those were corrected without exceptions or weaker runtime checks.
The expanded focused run passed28 tests with zero failures or skips; full
TypeScript checking and final scoped type-aware lint passed with zero warnings.
Integration checks are reported to the enclosing batch separately. No bundle, compatibility pin,
version, install or release was changed by this workstream.

Coverage integration should add two vendor HTTP task-equivalent routes under
`eda.lib_Device.search` and `eda.lib_Symbol.search`, with exact typed argument
discovery and `available-with-network-guards`. Keep
`completeDeclaredContractSupported:false` and current live validation
`not-recorded`. Geometry, pin/pad projections, fixed-CDN/version identity,
encryption/decompression bounds and independent linked-asset ownership remain
backlog, not claims implied by these search results.

## Independent ownership review and correction

The independent review reproduced one scope-validation gap before release.
A symbol candidate with the exact system owner but a nonempty `project_uuid`
passed validation, as did a device's linked symbol with that field. The installed
UI's `Eue` path resolver at UTF-16 offset6000339 prefers `path`, then
`project_uuid`, then `owner.uuid`. The project field is known ownership metadata,
not an unrelated field that the projection can safely ignore.

The response schemas now accept an absent `project_uuid` or an explicit empty
string on symbol/footprint candidates, symbol detail and all four direct/inline
device association objects. A nonempty or malformed supplied value refuses.
Device metadata still requires its existing explicit empty project field.
The independent footprint-detail validator had the same gap and received the
same optional empty-only check. No absent field is synthesized or returned.

Changes are confined to the two catalog/footprint schema modules, their focused
search/footprint tests and this record. Transport endpoints, credentials,
request bounds, public schemas, registration and effect claims are unchanged.
The review independently rehashed and reprojected the retained device and symbol
bodies above, reproducing their exact previous projected results without any new
vendor request. No inline `dataStr` property appears in either projection; the
word occurs only in the output's explanatory limitations.

After correction,32 focused catalog/footprint tests passed with no failures,
skips or cancellations. Full TypeScript checking and scoped strict type-aware
Oxlint passed with zero warnings, and `git diff --check` was clean. Verification
used Node24.18.0/npm11.16.0, zero soft core limit and the maintained isolation
preload. These are pre-freeze source checks, not installed or connected
validation. No network, full-suite, build, pin, installation or release action
was performed for this correction.
