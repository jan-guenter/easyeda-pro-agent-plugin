# Current-version launcher implementation inputs

Date: 2026-10-13. Scope: installed EasyEDA Pro `3.2.206.715d940d`, editor
version `3.2.206`, API `0.3.50.ab46409c`. This pass read installed static source
and official documentation. It did not execute installed code, contact the
editor, read a private profile or project, or change settings.

## Implementable next step

Add a fixed authenticated extension-index observation to bootstrap preparation.
The concrete receiver is `globalThis.window.top._MSG_BUS2_EXTAPI_`; the only
allowed topic is `extensionApi.getExtensionsIndex`, with no caller-selected
topic or arguments. API `g7` publishes this receiver at offset `1958421`.
The handler at `1946641` calls `io()` at `1805062`, then
`T.extensionIndexedDBUtils.list("extensionsIndex")`. `list` uses an existing
database's `readonly` transaction and cursor. It does not initialize a database,
import an extension, change enablement, or run the entry. [S1]

The whole handler's closure is `_l` at `467109`, `io` at `1805062`, and `list`
at `1911677`. `_l` only checks the API's stored user UUID against a regular
expression. Neither `Z9`, `Q9`, database `open`, nor the config-creating `Iu`
is called. Missing initialized database state fails. The RPC transport retains
request tickets/subscriptions, so this is a read with local bookkeeping rather
than a claim of no runtime effects. [S1]

The import path `Kc` at `1954016` constructs `uuid`, `config`, `fileIndex`,
`fileSize`, `installationTime` and six status booleans. New imports default
`isEnable` to true and auto-update/cloud-sync to false; replacements preserve
their existing flags. The reader must not apply those import defaults.
`Xc` at `1904133` stores a string `config.entry` after trimming; successful
imports require it to be nonempty. Startup normalization is separate, and the
observer returns the stored spelling. `config.uuid` must match the row UUID
before projecting the requested fields. The EDA instance's own `extensionUuid`
must identify the known authenticated bridge. [S1]

The maintained authenticated executor constructs a native
`AsyncFunction("eda", code)`. Its facade-generated program can use this fixed
receiver, as existing native readers already do. This does not require a public
arbitrary-RPC or caller-code tool. [Executor](../../plugins/easyeda-pro-control/easyeda-bridge-extension/src/system-api-operations.ts)

Capture the top-level frame, origin, receiver and method, and recheck them around
both awaited reads. Require two identical bounded projections and the known
authenticated bridge UUID in both. The vendor handler returns `[]` when logged
out, so an empty result must not qualify a clean profile. Project only bounded
extension identifiers, name/version/entry, activation events, enablement,
auto-update and cloud-sync metadata. Return fixed diagnostic codes,
not native exception text. Keep this separate from old project-context admission.
[S1]

An output limit does not bound the vendor cursor's work: it accumulates every
index entry before returning. Retain an outer deadline and reject oversized
results without truncation. The call allocates normal RPC/promise bookkeeping
and reads IndexedDB; it is not a pure synchronous calculation. A successful
observation is an initialized user-extension database index, not a guaranteed
current-account inventory or future-launch authorization. UI account UUIDs can
remain stable while the API's asynchronous login hook has not yet switched its
database. Both `databaseActorBound` and `startupQualified` must remain false.
The handler never invokes that login hook. UI `setUserInfo` at `16478900` stores
`gVars.globalVariableCookieData.userInfo`, then publishes it. `uGo` at `17445389`
forwards the actor to the API. The observer checks only UUIDs and retained object
identities on that path and `gVars.loginedUserInfo`; it emits neither. [S1, S5]

For a first supported baseline, accept only reviewed enabled extensions. If the
authenticated bridge is the sole enabled extension, its own public
`eda.sys_FileSystem.getExtensionFile` can obtain its fixed manifest/entry files
for comparison with the retained private build receipt. It cannot read another
extension's files. Refuse unknown enabled entries and automatic-update policies
that can replace reviewed code. The source schedules `o7().then(l7)` after login;
`l7` installs available updates whose index has `isAutoUpdate`. [S1]

## Builtin manifest trace

The apparent `/pro-sw/extensions/private/list` path is **not an HTTP endpoint**.
`H3()` at `1519061` creates a `BroadcastChannelMessageBus("pro-sw")`; API startup
at `1959914` awaits that RPC topic, then passes its returned manifest to `r7`.
Dynamic mode is enabled by default. Manifest fields supply the builtin UUID,
configuration, file index, prefix and package URL. `hh` at `1804256` fetches
individual builtin files through the supplied prefix. No public manifest getter
is registered on `_MSG_BUS2_EXTAPI_`. [S1]

The installed `editor.ini` selects pro-sw `0.1.10.19da4d8e`. Its loader returns
before registering a service worker when `IS_CLIENT && !IS_ONLINE`, at offset
`94757`. The selected `sw.js` implements download streams, locks and private-mode
proxying; it does not register that manifest RPC. A static search of installed
JavaScript, JSON and HTML found the exact manifest topic only in `api.js`, with
no producer in the selected bundles. The trace therefore finds **no local
serving file or registered producer for this request on the reviewed local
startup path**. Do not invent one, fetch it as HTTP, or interpret its timeout as
an empty manifest. [S1, S2, S3]

Local module URLs are not proof of remote retrieval. App `xC` at `2630578`
rewrites module-host requests to local `/editor/<module>/<version>/...` when
`editor.ini` is present. `fC` at `2582341` serves matching files from
`resources/app/assets`. Bind the selected `editor.ini`, loader and service-worker
bytes as well as API/app bytes when qualifying this behavior. An already
registered service worker or another same-origin broadcaster is separate state;
this source pass did not inspect either. [S4]

## Before-launch baseline and isolation limits

The normal launcher takes no project argument. App `sz` at `2652584` selects
`https://client/editor?cll=<logLevel>#` in non-ONLINE mode. It recognizes only
`.eprj`, `.eprj2` and `.elib` arguments as project paths; supplying a recovery URL
as an argument does not select that URL. Validate the persisted mode and a
canonical log-level value before using this route. [S4]

The profile configuration is Electron's Documents path plus
`EasyEDA-Pro/config.json`. The browser root is the home path plus
`AppData/Local/EasyEDA-Pro/cache.<arch>.3`. App initialization explicitly calls
`app.setPath("userData", derivedRoot)`. No application profile override was
found in the reviewed launcher. Do not assume `--user-data-dir`, a different
working directory, or a copied executable isolates this app. [S4]

The official recovery mechanism adds `safetyMode=true` to the editor URL and
disables extensions/scripts. It is not a separate profile and would also disable
the authenticated companion. No supported no-argument desktop mechanism for
selecting that URL was found in this build. Never substitute the documented
destructive extension-storage reset. [Official recovery documentation](https://prodocs.easyeda.com/en/api/guide/error-handling.html)

The current official CLI documents bare-editor startup but requires desktop
`4.1.60` or later. It does not establish support on this installed `3.2.206`.
The inspected official CLI and desktop documentation did not identify a
supported clean-profile switch for this version. This is a bounded research
result, not a claim that no vendor mechanism can exist.
[Official CLI documentation](https://prodocs.easyeda.com/en/api/guide/cli.html)

Use the existing running, authenticated Start Page to collect the fixed index
observation before the next launch. A reusable prelaunch receipt still needs a
closed-profile binding that proves the relevant index and entry bytes did not
change after observation. Logical storage names are `User_<user-uuid>_v6`, stores
`extensionsIndex`, `extensionsObjectStorage`, and `extensionsUserConfig`.
The source's `System_v1` database is not a substitute for the dynamic builtin
manifest. The repository has no maintained Chromium LevelDB/IndexedDB decoder;
opening the live store with a normal database engine is not a read-only parser.
No exact physical database filename or closed-profile binding was established
in this pass. This is the remaining mechanism needed for admission **before**
starting an otherwise unqualified existing profile. [S1, S4]

Ordinary Start Page startup also populates the project list from configured
project directories. It must not be described as having no project-file access
at all. Opening a design for editing is a different claim. The official desktop
guide describes the automatic project-list loading and identifies `config.json`
as client configuration. This research did not read those project files.
[Official desktop guide](https://prodocs.easyeda.com/en/faq/client/index.html)

## Source identity

Offsets above are zero-based UTF-16 string offsets in the minified installed
files. Paths are relative to `resources/app`; all files were read as inert bytes.

| Source | File | SHA-256 |
| --- | --- | --- |
| S1 | `assets/pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| S2 | `assets/pro-sw/0.1.10.19da4d8e/loader.js` | `7985467f88178035448f508f1e06ba1f8508b0b125f17d0449a62afc4f424773` |
| S3 | `assets/pro-sw/0.1.10.19da4d8e/sw.js` | `1871fa93a1c1b18aec1bf25a830fd96388c2ac40053e3d01f6b98209670e0f78` |
| S4 | `app.js` | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| S5 | `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| Startup selector | `editor.ini` | `cb18dd85262f44dedd65487deed4e1b1fac68eb90ad6a99ca86ba163efe655b6` |

This note qualifies a concrete metadata-reader implementation. It does not
claim a completed launcher, live validation, empty builtin inventory, or a
supported isolated-profile launch.
