# Generation 209 system-footprint metadata investigation

Date: 2026-10-23. Scope: EasyEDA Pro 3.2.209, public API 0.3.59, installed
UI/application implementations, and narrowly scoped public HTTP metadata.
This record contains research, synthetic evidence and public-network observations,
not instructions to run the rejected SDK getter. No EasyEDA method, project,
library database, profile or cache was opened or modified. No user design was
inspected or changed.

## Finding and activation boundary

The public footprint getter has a useful metadata subset, but its apparently
read-only call can initialize or migrate a local SQLite file. Fixing the library
UUID prevents ordinary registered-project selection; it does **not** identify
the filesystem object reached by the disconnected HALF_OFFLINE branch. That
branch supplies SQLite with a bare filename relative to the application's
working directory. An existing file at that name has not been identified.
Permission for system-library effects does not establish that it is safe to
migrate that file. The HALF_OFFLINE public getter must not be activated on this
evidence alone.

ONLINE mode is not a drop-in solution for the installed-byte profile. The
application loads the configured online editor URL, whose UI/API bytes are not
established by hashing the installed files. A separately scoped, fixed remote
metadata request was implemented instead. It is a **vendor HTTP task-equivalent**,
not execution of `eda.lib_Footprint.get` or connected validation of that public
method. The rejected SDK runtime modules and their draft tests were removed;
their source findings remain below so a future adapter does not repeat the
same unsafe assumption.

## Primary-source contracts

The official beta method accepts a footprint ID and optional library ID and
returns a footprint item or `undefined`. Omitting the library selects the
system library. The proposed subset always supplies the fixed system ID and
never accepts a caller-selected library. [Official footprint getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_footprint.get.html).

The documented item is metadata, not footprint geometry or verification of
pin/pad correctness. The installed getter emits six fields; later documentation
also lists optional properties that this implementation does not return. The
adapter must describe its supported fields instead of claiming a complete
asset read. [Official footprint item](https://prodocs.easyeda.com/en/api/reference/pro-api.ilib_footprintitem.html).

The symbol getter has a similar public signature, but installed code also
constructs a drawing manager to enumerate subparts. That extra lifecycle is a
concrete reason not to admit symbol lookup alongside the footprint subset.
[Official symbol getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.get.html),
[official symbol item](https://prodocs.easyeda.com/en/api/reference/pro-api.ilib_symbolitem.html).

## Installed sources

All offsets below are zero-based UTF-16 code-unit offsets in the full minified
files, not line numbers or UTF-8 byte offsets. The file hashes identify the
complete inspected source; runtime paths are derived from the admitted assets
root, not a hard-coded workstation path.

| Source relative to assets root | Size, bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.59.1ca9efb5/api.js` | Profile-pinned | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api.d.ts` | 1,814,791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `../app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

### Public wrapper, routing and cache

| Source and offset | Observed behavior |
| --- | --- |
| API `1341604` | Public footprint getter sends positional IDs through `extensionApi.LIB_Footprint.get`. No mutation sibling is required. |
| UI `8799592`, `17195897` | System ID is `0819f05c4eef4c71ace90d822a990e87`; project and favorite selectors are separate values. |
| UI `17391190–17391793` | `getInfo` handles the special project selector, then shared lookup; getter projects library type, ID, owner, display name, classification and description. It does not check returned component document type or geometry. |
| UI `10248139`, `6242076` | Shared lookup selects extension override first, current-project resolver second, library backend otherwise. |
| UI `6234315`, `6230498` | Extension selection invokes a registered callback; project selection uses the project's message bus. Neither is an acceptable substitute for the system route. |
| UI `6193740`, `6155715–6157000` | Metadata cache keys include type, project flag, path and UUID. TTL is 30 seconds, capacity two per type, with a history-ID validity condition. Matching samples may be cache hits. |
| UI `6166194`, `6145841–6146400` | Footprint backend issues component GET, requires successful envelope, checks a supplied returned path, and projects metadata. |
| UI `6059103–6064000` | Request liveness check precedes XHR. Rate-limit handling can retry up to three times with a default 60-second delay. A facade observation timeout does not cancel that work. |
| UI `6122600–6123200`, `8095623`, `8106452` | Extension libraries use a manager with an own Map; the store retains that manager. Checking only the caller's fixed UUID is insufficient if an extension shadows it. |

### RPC queue boundary

UI `1650930–1653350` implements task execution and the local MessageBus2
queue. An RPC call with no waiting service is queued. Checking extension maps
before dispatch and after `await` would detect drift only after the queued
request had possibly reached a different handler.

The draft checks one live task for the exact topic, no queued request for that
topic, the same bus records, and the same callback, task prototype and
`running`/`execute` functions. `rpcService` invokes the service synchronously and
re-pulls the same callback; task identity legitimately changes. The installed
service starts the library selection before the first await. These checks
close the ordinary delayed-dispatch gap; they are not an atomic lock or proof
against malicious replacement of hidden callback closures. UI `17456200`
registers the public service.

API `1907530` constructs the extension sandbox using a root-realm async
function. The maintained bridge creates its generated function in that realm.
API `518842` resolves `self.EDITOR_TOP || self`, and `1974282` binds the public
bus. The draft accepts the root editor realm only; it does not try a parent
frame or alternative execution context when those checks fail.

### Backend destination and effects

| Application offset | Observed behavior and consequence |
| --- | --- |
| `1264968`, `1284102` | System ID is fixed; registered project path keys use SHA-256 hex strings. |
| `1433860`, `1436820`, `2328155`, `2332776`, `2374780` | Inspected project-map insertion paths use those 64-hex path hashes. The fixed 32-hex system selector does not match these ordinary registered-project keys. |
| `1329828` | Generic path resolver checks projects, libraries, then example projects. Arbitrary caller-selected libraries cannot be treated as harmless metadata. |
| `2215700–2217500` | HALF_OFFLINE overwrites the system-library entry with `path` equal to the bare 32-hex system identifier. OFFLINE instead selects bundled/profile `.elib` files and may initialize them. |
| `2575377–2577300` | HALF_OFFLINE forwards a system GET only while its mutable network flag is true. Otherwise it enters the matching local route. A renderer network precheck cannot remove this race. |
| `2340226`, `2235391` | Component controller and service resolve the DB, query component/classification metadata and return it. The absence of an explicit update here does not remove initialization effects. |
| `1318983–1323000` | DB acquisition calls initialization and keeps an additional connection. Initialization may create a file, execute schema/migration scripts, set journal mode and probe writability. The bare HALF_OFFLINE filename is not the special bundled-library readonly case. |
| `1359329`, `2641348` | Client-mode changes mutate main-process configuration and relaunch/exit. The renderer's startup mode string is not continuous proof of backend mode during that interval. |
| `2652642` | ONLINE without a local project argument loads the configured remote editor; a local project argument switches it to HALF_OFFLINE. Installed source hashes alone do not identify remote code. |

The remote proxy uses the configured service, not a source-constant guaranteed
destination. No user configuration or credentials were read to infer that
destination. Local request logging, application caches and SQLite lifecycle
effects remain distinct from design mutation APIs.

## Rejected SDK draft and synthetic investigation

The now-removed draft files were `sdk-library209.ts`, `sdk-library209-runtime.ts`
and `sdk-library209-profile.ts`. The request permitted one lowercase 32-hex footprint
ID, a literal method and explicit system-library-effects acknowledgment. It
has no arbitrary path, library ID, caller code, symbol method or write option.

The generated program keeps original public owners, root/UI/current-project
objects, mode, extension map and direct RPC service checks across awaits. It
copies every supported metadata field, rejects accessors and unknown output
fields, preserves undefined as an observation rather than claiming absence,
and bounds output without truncation. Two matching samples are labelled
`backendFreshnessVerified:false`, `completeAssetVerified:false`,
`persistenceVerified:false` and `cadAuthority:false`.

A retained renderer reservation blocks a second lookup after a timeout until
the original asynchronous operation actually settles. It prevents the
adapter from automatically repeating an ambiguous vendor request; it does not
cancel vendor retries. Timer-setup failure removes only the known-undispatched
reservation. These controls do not repair the unidentified local destination.

Focused synthetic checks execute the actual generated program. They cover
fixed arguments, preserved metadata, unknown/oversized/accessor results,
project/extension/mode drift, unavailable/queued/replaced services, timeout
reservation and host result binding. Runtime tests execute the actual
coordinator source with only the installation verifier replaced, retaining
real schemas, tuple admission, generated program and transport decoder.
They cover early and late quarantine/implementation drift and no retry.
These tests establish neither backend freshness nor connected behavior.

## Implemented public HTTP task-equivalent

`server/src/public-system-footprint.ts` defines the strict request
`{footprintUuid, confirmNetwork:true}` and supported metadata projection.
`server/src/public-system-footprint-runtime.ts` makes one anonymous GET to
`https://pro.easyeda.com/api/v2/components/{footprintUuid}`, with the fixed
system-library `path` header. No caller-controlled host, library, credentials,
SDK method, fingerprint or code is accepted. The EasyEDA origin is source-derived
from application offset `1333182`; the component URL and metadata semantics
come from the UI call chain above.

The network adapter does not access the app, authenticated bridge, account,
profile, filesystem library, renderer cache or editor. It omits credentials,
rejects redirects and requires HTTP 200 JSON. It requires the returned asset
UUID, system path/owner, `docType:4` and `public:true`. Other result fields are
deliberately omitted rather than described as a complete asset. This is a
stricter identity/type projection than the public getter's blind `libraryType`
label; it still does not validate geometry or component correctness.

The adapter bounds the decoded body to 1 MiB and returned metadata to 128 KiB.
An abort timer covers request and stream reads; monotonic time is also checked
after synchronous decoding/validation. No automatic retry, search, pagination,
authentication fallback or retained result cache exists. Cache-control requests
do not prove the vendor's data is fresh. Error text is fixed, without raw vendor
messages or an inferred not-found claim.

### Public-network observations

1. The official file-format example identifies R0603's system source as
   `50b4943912284dab97752312e589e9e2`. One anonymous detail request returned
   HTTP 200 with service `success:false`, code 404 and no result. This is a
   stale/unavailable example observation, not proof of asset absence.
   [Official format example](https://github.com/easyeda/easyeda-file-format-v2/blob/main/docs/en/examples/index.md).
2. A firsthand system-search example in the official SDK issue tracker names
   footprint `c6ba23d9041045508b5ab02b28994be6`. Its one detail request returned
   the same unsuccessful envelope. No regional-host or credential fallback
   was attempted. [Published SDK issue example](https://github.com/easyeda/pro-api-sdk/issues/5).
3. One source-derived public search requested `R0603`, system path/UID,
   `docType:[4]`, page 1 and page size 1. It returned one R0603 footprint,
   `b44c1b381d26462586b8a8d9fac22ec8`. A detail GET succeeded with the exact
   UUID, system path/owner and numeric type 4. The JSON body was 1,365 bytes.
   A focused field check confirmed the visibility flag was boolean `true`.
4. The actual new runtime function then returned the expected bounded metadata
   for that same public ID, with `publicSdkMethodExecuted:false`,
   `installedRuntimeAdmission:false`, freshness/full-asset/persistence/CAD
   flags all false. This validates that public HTTP observation, not the
   installed MCP tool, SDK getter, live editor or a saved design lifecycle.

The research search is not exposed by the new adapter. The user-requested scope
remains a single explicit public footprint lookup. No private project or user
library supplied the IDs. The remote service can log these public requests.

### Focused verification

The new contract and transport tests cover fixed destination/headers, omitted
credentials, required consent, result identity and public/type checks, bounded
projection, redirect/HTTP/media/UTF-8/JSON errors, oversized declared and actual
bodies, raw error suppression, stream abort, post-validation deadline and
absence of retry. They use the actual runtime function with a synthetic fetch,
not a rewritten coordinator or a real user profile. The actual public-network
observation above is separate from these synthetic tests.

Final focused verification on Node 24.18.0 with core dumps disabled and the
maintained test-isolation preload: 11 tests passed across the contract,
transport and actual registration/offline-coverage tests. Full TypeScript
checks passed; strict type-aware Oxlint for the two implementation modules and
three focused test files reported zero warnings. No build, installation,
publication or connected EasyEDA validation was performed by this workstream.

## Concrete remaining work

- Do not activate HALF_OFFLINE public lookup without identifying and admitting
  its actual local SQLite destination, or replacing the backend path with a
  separately reviewed remote-only route.
- Do not activate an ONLINE public route by reusing hashes of installed code.
  Its actual remote implementation and client/native relationship need proof.
- Keep arbitrary library IDs omitted: they can select extension callbacks,
  current projects or unrelated local library initialization.
- Keep symbol lookup omitted: UI `17378332–17378842` invokes subpart enumeration;
  `17378842` creates a document manager without a visible matching disposal in
  that getter. A bounded manager lifecycle must be designed and tested.
- Keep rendering omitted: UI `17381438–17382041` reaches image generation around
  `15572268` and an unawaited cache write through `15554624`/`15554159`; error and
  requested-subpart handling also need review. A picture is not validated
  component geometry.
- Validate the new public catalog MCP registration after normal installation,
  if required. Its successful remote metadata read cannot promote the SDK
  getter, symbol route or any design writer to connected validation.
