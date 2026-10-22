# Current-version shortcut reader

Implement one read-only route for `eda.sys_ShortcutKey.getShortcutKeys` on the
installed EasyEDA Pro tuple. This method already has a legacy public-read
descriptor in `server/src/public-sdk-read.ts:155`; the missing piece is current
version admission and a precise result validator. Do not enable the other
legacy readers or shortcut registration/execution.

This review used the research and extension-development skills. Vendor files
were read as inert text, never imported or evaluated. No live call, project,
private profile, account configuration or journal was accessed.

## Exact sources

The installed application package reports `3.2.206.715d940d`; its separately
reported editor version is `3.2.206`. Under installed `resources/app`:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `package.json` | 248 | `e349f8d80f809f82a057f1b81799430ba25bfa0f7c7cb96f6155327b49391455` |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |

These hashes were recomputed for this review. Source offsets below are
zero-based UTF-16 positions in the pinned JavaScript files. Declaration lines
43321-43452 contain the key type, two scope enums and three shortcut methods.

## Contract and installed behavior

The public method accepts optional boolean `includeSystem` and returns a
promise of records containing `shortcutKey`, `title`, `documentType` and
`scene`. The current official documentation marks it beta and obsolete since
EDA 4.2. That is a later-version change, not evidence that this installed 3.2
implementation is absent.
[Official method](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_shortcutkey.getshortcutkeys.html).

The installed wrapper defaults the argument to `false`. The UI handler then
includes only records with truthy `isCustomize`; `true` includes all entries
in its `hotkeys` registry. It does not join the separate `menuHotkeys` registry
or establish every shortcut available to a focused editor. The API's returned
array is a registry observation, not a proof that a key will execute now.
Sources: API offset `1870690`, UI offsets `17237259` and `8221571`.

The installed key declaration lists uppercase tokens, but system definitions
in UI offsets `8165680` through `8350000` include `Ctrl`, `Shift`, `Delete`,
`Page Down`, `Num*` and other raw spellings. The mapper only splits the cached
string on `+`. Do not force returned system keys through the declared uppercase
union, uppercase them, or replace them with inferred native input tokens.
An absent/null hotkey produces `[]`; an empty string produces `[""]`. Both are
valid observations of the installed mapper. Preserve array order, duplicates,
empty tokens and literal `false` input. Sources: installed declarations and
UI mapper at `17237259`.

The installed `documentType` field uses
`ESYS_ShortcutKeyEffectiveEditorDocumentType`, not `EDMT_EditorDocumentType`:

| Value | Shortcut scope |
| --- | --- |
| 0 | Blank |
| 1 | Home |
| 2 | Schematic page |
| 3 | Symbol |
| 4 | PCB |
| 5 | Footprint |
| 6 | Panel |
| 7 | PCB 3D preview |
| 8 | PCB 2D preview |
| 9 | Panel 3D preview |
| 10 | Panel library |

Scenes are `EDITOR=1`, `SELECT_CANVAS=2`, `NOT_SELECT_CANVAS=3`, `DRAW=4`,
`PLACE=5`, `LOCAL=6`. In particular, a PCB shortcut scope is 4 while a PCB
document type is 3. These are installed declaration values. The latest method
page names the scope type `ESYS_ShortcutKeyEffectiveEditorRange` instead; do
not substitute that newer declaration for the installed enum.

## Read closure and effects

| Source position | Operation and effect |
| --- | --- |
| API `1891438` | EDA construction installs its own `sys_ShortcutKey` instance. Retain this receiver and its prototype method. |
| API `1870690` | `getShortcutKeys` forwards the boolean through the fixed `extensionApi.SYS_ShortcutKey.getShortcutKeys` RPC topic. It has no project or document argument. |
| UI `17433723` | RPC dispatch maps that topic to `Z3e.getShortcutKeys`. |
| UI `17237259` | The synchronous handler reads the existing hotkey registry and projects four fields. It never invokes a registered shortcut callback. |
| UI `8221571`, `8222866` | `E4t` initializes its registry objects during construction. `getAllHotkeys()` returns `this.hotkeys`; it does not initialize or reload configuration. The separate `updateHotkeyConfigStatus()` reads user configuration and notifies subscribers, but this getter does not call it. |
| UI `15985011` | `it` iterates array elements or own enumerable object entries. It does not mutate the registry. Its traversal has no caller-selected bound. |
| UI `8131777`, `8131892` | `ddn`/`Vn` format string or contextual titles through the locale object. |
| UI `8085110`, `8086655`, `8087060` | Locale `_getValue`, `i18n` and `_context_i18n` read loaded translations and format strings. They do not call the separate `load` or `update` functions. `load` can fetch translations and `update` can change DOM, so neither belongs in this adapter. |
| UI `6381011` | The locale helpers use an own-property check and whitespace replacement, not storage access. |
| UI `16956638`, `17169806` | The application exports the locale as `self.Locale` and the UI as `self.UI`. These owners can be retained without loading a language. |

The normal typed read path has no design, navigation, settings, filesystem or
network mutation. RPC tickets/subscriptions, temporary arrays and adapter
deadline timers are incidental local effects. The vendor reader traverses and
formats the complete registry before the adapter can bound its response.
An adapter timeout does not cancel that vendor work.

The closure still trusts the pinned vendor implementation and its initialized
in-memory registry. Its direct property reads and title coercion are not a
general no-side-effects guarantee for malicious getters or malformed objects
injected by another extension. Result validation must refuse malformed records
and errors, never convert them to an empty list. The private registry owner is
not independently exposed by this public API; do not claim descriptor-level
prevalidation of every vendor input or complete registry ownership proof.

## Ready-to-implement adapter

Use a separate fixed current-version reader alongside the existing local SDK
readers. Reuse the authenticated `SDK_LOCAL_RUNTIME_PROFILE`, the common
current-UI hash verifier and the ordinary global dispatch/quarantine gate.
Never forge a legacy fingerprint or accept caller-selected method paths,
programs, files, hashes, callbacks or context overrides.

The strict request is `{ method: "eda.sys_ShortcutKey.getShortcutKeys",
arguments: { includeSystem?: boolean } }`. Normalize omission to `false` and
return that selected value. Fixed output
records contain exactly the four public fields. Proposed adapter bounds:

- At most 1024 records, each a plain own-data record with no extra fields.
- `shortcutKey`: dense array of at most eight raw strings, each 0-32 characters.
- `title`: raw string of at most 1024 characters; empty is allowed.
- `documentType`: dense array of at most 32 integers in 0-10.
- `scene`: dense array of at most 32 integers in 1-6.
- Reject control bytes, accessors, sparse arrays, unsupported values and a
  complete envelope above 262144 UTF-8 bytes. Do not truncate, sort or dedupe.

Retain the ordinary top-level client frame, document/location, EasyEDA mode,
bridge EDA instance, shortcut receiver/prototype method and RPC receiver/method.
Retain `Locale`, its `_curr`, `_cache`, selected-language and English cache
owners, and relevant formatting functions. Recheck these around both awaited
calls. Do not claim an atomic snapshot of all internal locale data. Copy each
complete bounded result before awaiting the second call, because the UI mapper
reuses the cached range/scene arrays. Require the two copied results to match.
Return a fixed sanitized failure on any call, ownership or validation error.

The result must distinguish this source-reviewed public call from connected
validation. It grants no keyboard execution, focus, navigation, startup,
design or persistence authority. Report `liveValidation: "not-recorded"`
until the actual installed route is observed through the admitted bridge.

## Concrete omissions

`registerShortcutKey` and `unregisterShortcutKey` change the global registry;
registration also stores an executable callback. They are outside this read
slice. Do not synthesize a press/execute action from a returned token array.
[Official registration method](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_shortcutkey.registershortcutkey.html).

The newer `get` and `getAll` are documented since EDA 4.2 and are absent from
the installed class. They have different extension-scoped contracts and cannot
replace this system-list query. `getAll` does not include system shortcuts;
`get` can target another extension's qualified shortcut ID. They require a
separate installed-version review.
[Official get](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_shortcutkey.get.html),
[official getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_shortcutkey.getall.html).

This note authorizes no live action. It records one implementable reader;
broader menu enumeration, shortcut editing and actual input stay separate.
