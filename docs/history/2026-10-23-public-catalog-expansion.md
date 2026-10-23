# Public catalog search and component metadata

Date: 2026-10-23. Base commit:
`aa79950c067e026896ed2f061e819ebccbd32056`.
Scope: fixed anonymous EasyEDA vendor HTTP reads, without EasyEDA application,
bridge, profile, local library or project access. This adds source and transport
implementation evidence, not installed MCP execution or SDK validation.

## Result and contract

`public-system-catalog.ts` and `public-system-catalog-runtime.ts` add three
strict actions under the separate catalog-components contract. The existing
catalog-footprint contract and transport are unchanged.

| Action | Request fields beyond action and confirmNetwork:true | Fixed request |
| --- | --- | --- |
| search-footprints | query, page, pageSize | POST `/api/v2/components/search` |
| get-symbol | symbolUuid | GET `/api/v2/components/{symbolUuid}` |
| get-device | deviceUuid | GET `/api/v2/devices/{deviceUuid}` |

The only origin is `https://pro.easyeda.com`. System-library path is fixed to
`0819f05c4eef4c71ace90d822a990e87`. Search sends this as both path and UID,
with `docType[]=4`, bounded query and explicit page and page size. The source's
POST is a form-encoded read. It does not select a write endpoint. Query length
is 1 to 128 characters with no controls or surrounding whitespace, page is
1 to 1000, and page size is 1 to 20. UUIDs are exactly 32 lowercase hex digits.

Every action makes one request with omitted credentials, no redirect, no retry,
no authentication fallback, a 30-second request/body deadline, a 1 MiB decoded
body bound and a separate 128 KiB projected-result bound. No caller host,
library, headers, HTTP method, code or credential parameter exists. A search
query is explicitly disclosed to the vendor and must not contain private design
information. Vendor text is untrusted data, never an instruction to the agent.

Official extension methods remain separate. The public device and symbol
getters accept an asset ID and optional library ID. Those declarations do not
establish the behavior of this HTTP adapter or make the installed desktop
getter safe. The earlier investigation documents the desktop SQLite/drawing
manager paths that are still excluded.
[Device getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.get.html),
[symbol getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.get.html),
[footprint search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_footprint.search.html),
[prior local-backend investigation](2026-10-23-generation209-system-footprint-metadata.md).

## Source qualification

The complete installed primary source is
`assets/pro-ui/3.2.198.2800f583/js/ui.js`, 17,468,192 bytes, SHA-256
`3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6`.
Offsets below are zero-based UTF-16 offsets, not byte offsets.

| Offset | Source observation |
| ---: | --- |
| 6180786 | eln performs footprint search through POST and flattens grouped lists. |
| 6061646 | Ian form-encodes arrays using bracketed names. Only GET moves encoded fields into the URL. |
| 6073155 | Component route table contains search and UUID detail paths. |
| 6072582 | Device route table contains the v2 UUID detail path. |
| 6167610 | Osn reads symbol metadata through the component detail path. |
| 6165784 | Asn reads device metadata through the device detail path. |
| 6144748 | eai projects device attributes, owner, metadata and symbol type. |
| 6145081 | nZ adds device tags and product code projection. |
| 6145560 | L_ adds symbol metadata and source fields. The adapter deliberately omits source fields. |
| 17206000 to 17207500 | Public device projection uses libraryType string 3 and symbol/footprint associations. |
| 17378000 to 17380100 | Public symbol projection uses libraryType string 2, then enumerates subparts through a drawing manager. |
| 17391000 to 17393100 | Public footprint projection uses libraryType string 4. |

The numeric strings 2, 3 and 4 are asset library categories, not a marker for
system ownership. System ownership comes from the exact owner UUID.
[Official library categories](https://prodocs.easyeda.com/en/api/reference/pro-api.elib_librarytype.html).

## Identity and completeness limits

Search requires the exact response UID, system owner and ownerUuid for every
candidate, numeric docType 4, matching requested page/pageSize and duplicate-free
candidate IDs. Other vendor list groups must be empty. It refuses an unexpected
group rather than silently filtering it. Optional public/path flags must match
when supplied. Neither flag is invented when missing.

Vendor pagination is not reliable arithmetic. The observed page-size-1 result
reported count 100 and totalPage 1. The adapter preserves these fields as
vendorReportedPagination, including string-valued page/pageSize, and sets
paginationConsistencyVerified, exhaustiveResultsVerified and exactMatchVerified
false. It does not derive a next-page promise or infer absence from an empty page.

Symbol detail requires exact requested UUID, system path/owner, docType 2 and
public true. It returns metadata only, without subparts or pin definitions.

Device detail requires exact requested UUID/system owner, empty project_uuid,
symbol_type 2 and footprint_type 4. The observed response omitted both public
and path. It therefore reports publicVisibilityFlagVerified and
responseLibraryPathVerified false, while recording anonymous availability and
system owner separately. It refuses contradictory supplied flags and paths.

Device attributes provide the symbol and footprint reference IDs. If nested
reference objects are present, their IDs must agree. Supplied nested path,
owner, visibility and document type must also be consistent. Missing ownership
fields are not synthesized. associationsOwnershipVerified, linkedAssetsFetched
and pinToPadMappingVerified remain false. The projection returns selected
manufacturer/supplier fields, never arbitrary attributes, source, geometry,
images, stock, prices, 3D content or a fetched datasheet.

## Anonymous observations and retained correction

Private raw responses and generated receipts are outside the repository in
`/root/.cache/easyeda-public-catalog-20261023-yozS86l1`, with mode-0600 files
inside a private directory. Public catalog IDs came from these vendor responses,
not a user project. The source attribution is JLCEDA/EasyEDA Official Library:
[EasyEDA](https://easyeda.com), [JLCEDA](https://lceda.cn/).

1. One source-derived footprint search for R0603, page 1, page size 1 returned
   `b44c1b381d26462586b8a8d9fac22ec8`. Raw response SHA-256
   `d13e1b0ec7b13f94245c63eb3875c614ecf4e220bf22cddba0b868a338bc409e`.
2. One research-only device search for 10k supplied device
   `86aa4f3d61a7474782d89ec425f1704f` and symbol
   `7759468607af48089d81d184237888b1`. This search is not exposed by the
   new contract. Its raw SHA-256 is
   `ff9b420cf0c92da809f759194094a7d3ab68b41b4397f20dac3a3c7390a6d05f`.
3. One detail request for each ID returned the expected system ownership.
   Device raw SHA-256 is
   `0dc7458a39f06f6adcd1327955f4943ca29a17bc213366477973c751cf72ac7c`;
   symbol raw SHA-256 is
   `4c956d9c81fac22053a94986f2e2d3ad950b3ee407d573ac5ef3c8dfaf5ac2b0`.
4. The new runtime function then performed one request per action. All three
   passed HTTP, bounded decoding and identity checks. The initial metadata
   projection incorrectly copied footprint libraryType 4 onto symbol/device.
   Review caught this before publication. The three original receipts remain
   retained and must not be claimed to prove the corrected complete projection.
5. Source review fixed the types to symbol 2, device 3, footprint 4. Corrected
   offline reprojections use the retained raw responses without further network
   calls. Search receipt SHA-256 is
   `81e7a131d8565b368dfdba072e5d210806fe5126e286194095a4aa705b760663`,
   symbol `85e2c22fec3bf60f864c2e5c9c01451b10f8331327e2aa0fd80792505d181ab7`,
   device `13c169821cade39e389d28ac3ff91aa60c85c57a68e8006271440130022b1dda`.

## Focused verification and remaining work

Ten new focused tests cover strict arguments, hostile ownership/type/group
changes, mismatched nested associations, omitted flags, projected library
categories, inconsistent pagination, bounded output, fixed request encoding,
HTTP/redirect/media/UTF-8/JSON errors, raw error suppression and deadlines.
Eight unchanged footprint contract/transport tests also passed. Tests use the
maintained isolation preload, Node 24.18.0 and disabled core dumps. Full types
and the four new files' strict type-aware lint passed with zero warnings.

This workstream did not build, install, publish or invoke the MCP registration.
Those checks belong to the enclosing release. Final source review hashes at
this stage are catalog module
`74e4f98f47feb80da2e616f3b9c91c08a20937e83d22b4eff3c7e0221b24e486`
and transport module
`9face602141de53571a80c13042c3204416b3744229418dc0a7ebfbba40e635b`.

Remaining catalog work includes a separately bounded device/symbol search,
geometry and pin/pad projections with version identity, fixed CDN/encryption
and decompression limits, and linked-asset ownership verification. None is
silently enabled by metadata discovery. Desktop SDK symbol/device calls still
need their own reviewed local backend and drawing-manager lifecycle.
