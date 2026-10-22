# System-device lookup backend effects

Source-only review, 2026-10-14. No installed code was imported or evaluated, no
lookup was executed, and no private profile, library or project file was read.
This note supplements the public-contract and UI review. It does not authorize
execution or claim that a successful catalog result validates a component.

## Source and contract

The installed EasyEDA Pro 3.2.206 desktop bundle is
`C:\Program Files\easyeda-pro\resources\app\app.js`, 2,657,192 bytes,
SHA256 `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`.
Offsets below are zero-based UTF-16 positions in that exact file. The source is
the primary evidence for desktop middleware behavior; no vendor code is copied
into this note.

The official [getByLcscIds reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.getbylcscids.html)
describes an LCSC-number lookup, defaults to the system library, marks the API
beta, and says it is unavailable in private deployment. Those descriptions do
not establish the desktop request's complete side effects. The reviewed UI
issues `POST /api/devices/searchByCodes` with JSON containing `codes` and `path`.
The proposed adapter supplies only canonical part numbers and the fixed system
UUID `0819f05c4eef4c71ace90d822a990e87`.

## Direct online path

Desktop proxy `iC`, beginning near 2,575,400, explicitly recognizes this endpoint
at 2,576,183 and 2,576,524. With `ge.NETWORK` true, HALF_OFFLINE and OFFLINE modes
both forward it to `I.onlineService` plus the request URL. The direct branch
does not invoke the local device controller or a project save/upload route.
The remote host is ambient application configuration, not an adapter constant.

`l0` at 1,359,741 makes an HTTP or HTTPS request, optionally through the configured
HTTP/SOCKS proxy. It forwards the request body and content-type, path, user-agent
and cookie headers. Proxy credentials may be used internally. It uses shared
keepalive agents and buffers the complete response. This caller supplies no
timeout, cancellation or response-size bound. Adapter output limits therefore
do not bound vendor network work or buffering. Server-side effects are outside
the installed client's source proof.

The proxy logs request parameters, destination and some response headers or raw
errors according to vendor logging settings. A wrapper can return fixed errors
but cannot promise that vendor logs omit those details.

## Middleware effects before either branch

The request chain `wC` near 2,619,xxx runs the following before `iC`:

- `dE` at 1,428,927 assigns a request ID and logs method/URL.
- `$N` at 2,571,371 buffers and parses the request. For a nonempty JSON body it
  can create the configured temporary upload directory before invoking the
  parser. The fixed JSON request contains no uploaded file. Parameter logging
  remains possible.
- `rC` at 2,573,788 uses an activation result captured during server setup. If
  that license is valid, `eC` opens the local user database and performs a login
  lookup, inserting the local user if absent. This is not restricted to OFFLINE
  mode. The database opener `y` at 1,318,983 calls `xt`/`Sy`, whose initialization
  can apply schema upgrades and a journal-mode pragma. No current license or
  user-database contents were inspected to claim this branch inactive.

These are incidental application effects, but they rule out a description such
as "pure read with no local/profile changes."

## NETWORK=false is a local controller path

The `iC` fallback first awaits the local router. If that router is unmatched it
can still forward online without testing `ge.NETWORK` again. For this endpoint,
however, `fd` at 2,367,651 has generic `POST /:uuid -> kt.update`; there is no
separate local `searchByCodes` handler. Thus the fixed endpoint can enter an
update controller with `uuid = searchByCodes`.

The controller at 2,364,743 resolves the supplied path using `$` at 1,329,828.
That resolver reads and logs the in-memory projects and libraries maps. Project
map entries found in the installed source all use `ke(path)`, SHA256 hex at
1,284,102. Their 64-character keys cannot equal the fixed 32-character system
UUID. This rules out selecting a project through these ordinary insertion
paths; it does not mean project metadata is never inspected or logged.

Under normal initialized HALF_OFFLINE state, `KL` near 2,216,191 installs the
system library entry with its path equal to the reserved UUID itself. The update
method at 2,366,508 rejects that exact path before calling the device service or
FTS updater. Consequently NETWORK=false normally returns a permission failure,
which the UI may reduce to an empty catalog result. Empty is not proof of absence.
OFFLINE mode does not establish that sentinel path and must not be admitted on
the strength of the HALF_OFFLINE analysis.

## Remaining library-state race

The normal sentinel check is not an unconditional no-library-write proof.
`libraryPaths` near 2,326,749, when called with `refresh=yes`, loops over library
files. Each iteration awaits `y(ctx, path)` and may assign a physical `.elib`
path to `Yt[K0(path).name]`. Only after the entire loop does it call `KL` to
restore the HALF_OFFLINE sentinel. A system library found before another awaited
iteration can therefore temporarily replace that sentinel. `wC` permits five
concurrent requests, so it does not serialize lookup against that refresh.

If the lookup enters the fallback during this interval, the controller can
resolve the fixed system UUID to that physical library. `Tt.update` at 2,282,752
loads the actor and then calls `getByUuid` at 2,293,126 for `searchByCodes`.
There is no early UUID grammar check. The library is opened through `y` before
the usual missing-record refusal. Initializing that database can itself change
it. If such a device record existed, even the fixed `{codes,path}` body reaches
updates of bookkeeping, type defaults and FTS. This is a source-derived
possibility, not an observed mutation or a claim about any user's library.

An awaited renderer-side network check cannot make the subsequent backend branch
atomic. API/UI/app file hashes establish implementations, not current backend
network/map state. Two matching catalog results likewise do not exclude these
effects.

## Implementation consequence

The direct public method cannot currently support an unconditional
"no library-file change" contract. A remote-only fixed equivalent could avoid
the local fallback, but would need its own supported transport, authentication,
destination and response mapping review; it must not silently replace the public
method while retaining a direct-call coverage claim. Until that boundary is
resolved, retain the precise omission rather than treating an application-mode
sample as proof of backend exclusivity. No new test matrix or live probe is
needed to establish this source-level limitation.
