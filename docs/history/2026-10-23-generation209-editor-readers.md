# 2026-10-23: generation 209 editor observations and shortcut listing

This source review admits three bounded observations on the separately pinned
3.2.209 tuple: registered editor-shell counts, registered UI identity, and the
configured shortcut registry. It does not admit project opening, native input,
CAD reads/writes, Save, restoration completion or startup readiness. No editor
or project was opened during this review; installed implementation files were
read as inert text. The generated programs were exercised only in synthetic
fixtures. Connected validation is not recorded.

## Fixed implementation and selector evidence

The root is the admitted installation's `resources/app/assets`. Relative paths
below are fixed by the new `editor-observation209-profile.ts`; no caller chooses
a version, path, digest or verifier. All three files are freshly hashed around
each observation with descriptor/path identity checks, nonblocking no-follow
opens, bounded streams and final named-file checks.

| Relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `../editor.ini` | 8031 | `ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9` |
| `pro-versions/3.2.209.8a704eab/editor.ini` | 8031 | `ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9` |

Both selectors' default section names API `0.3.59.1ca9efb5`, UI
`3.2.198.2800f583` and PCB `3.2.195.6b67774e`. The common 209 runtime gate
retains the authenticated bridge, dispatcher, upstream, manifest, facade and
exact API/PCB hashes before and after. API implementation SHA-256 is
`e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1`;
declarations SHA-256 is
`0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72`.
Returned provenance identifies the selected generation. Existing 206 profile
constants, UI verifier and shortcut scope domain remain unchanged.

These are on-disk selector/implementation observations, not independent
attestation of every loaded function or the desktop. Programs separately
retain the reviewed root editor URL, frame, mode, bridge extension instance
and relevant runtime owners. An observation cannot authorize a later action.

## Shell and current UI identity

Offsets are UTF-16 positions in the exact UI file, not source-map lines.

- `tt.getActiveTab` at 16437437 returns only `tt.currentTabId || ""`.
  `tt.getContainerInfo` at 16410112 returns only `vt.containerInfo[id]`.
  Neither accessor performs navigation, RPC, project opening or a document read.
- `createTabBar` at 16407454 defines `id`, `belong`, `tabs` and `activeTabId`.
  The underlying `addTabBar` at 15684139 retains that same container object
  (`containerInfo[n]=e`, near 15685740); `addTab` at 15685905 retains tab objects.
- The initial Start Page at 16406194 is `tab_page1`, type -1, not deletable,
  draggable and in `start_blank`. Its hidden flag depends on viewer mode.
  `createBlankTab` near 164359xx uses the type-0 sentinel, not deletable,
  not draggable and hidden, in the same group. Document enum near 5431467
  confirms blank 0, schematic 1 and PCB 3.
- Static `currentTabId`, `belongContainer`, container ID array and tree are
  initialized at 16456215. `me=tt` is at 16460921; exports `O2.gVars=w`,
  `O2.tabBar=me`, `self.UI=O2` are at 17180914, 17181138 and 17181311.
  `self.gVars=w` is at 16968158.
- Initial `currentProject` at 8104860 owns undefined `projectId` and empty
  `branchUuid`. Ordinary successful open near 15084660 supplies project/branch
  identity; failed/closed project paths assign `{}` at 15085558 and 15086523.
  Temporary open at 16681884 omits branch metadata. Missing fields therefore
  remain tagged absent/undefined/empty, never interpreted as closure.
- Document-tab builder at 15278786 sets `pid` from the project UUID/ID.
  `createTab` at 164512xx inserts a tab, awaits `getModelSheetUuid`, then sets
  tab data: partially initialized state must refuse. Separator `@` is at
  15985216; canonical tab assembly `co` is at 15989248. The existing observer
  retains its strict type/ID/tab/project consistency checks.

The existing two-sample, owner-retaining fixed program therefore remains
unchanged. Its 128-container/256-tab/255-node/depth-16 bounds, strict sentinel
shapes and 8192-byte envelope remain. Shell output has no titles, paths or IDs;
context output contains only supported active/project/branch identities.

The public alternatives are still deliberately not used: the UI implementation
of `getSplitScreenTree` at 17232393 deep-clones full tab data, while
`getCurrentDocumentInfo` at 17241987 dereferences active-tab data and includes
project/library fields. The public documentation describes a split tree and a
beta current-document result, not a reliable Start Page readiness contract.
See [split-screen API](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.getsplitscreentree.html)
and [current-document API](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_selectcontrol.getcurrentdocumentinfo.html),
accessed 2026-10-23. No documentation example was executed.

## Configured shortcut registry

API `getShortcutKeys` at 1885316 calls the fixed
`extensionApi.SYS_ShortcutKey.getShortcutKeys` RPC with a boolean defaulting to
false. UI handler `X3e.getShortcutKeys` at 17248771 obtains `Zs.getAllHotkeys`,
iterates own records, and projects raw split key tokens, localized title, range
and scene. False selects `isCustomize`; true includes system records. The
registry mapping at 17445245 registers this exact handler. The method at
8227284 merely returns `this.hotkeys`; this path does not invoke registered
keyboard callbacks or perform a keyboard action.

Title formatting is `Ldn`/`Vn` near 8136180; the locale getter at 8089574 reads
`_curr`, and `_getValue`, `i18n`, `_context_i18n` at 8090608, 8091073 and
8091469 read the existing locale caches. Locale loading/updating is a separate
path. The bounded program retains public receiver/method, RPC, frame, mode,
locale/cache owners and translator functions around both awaits. It copies
each complete result before the next call and refuses changed results. It
does not claim independently frozen vendor registry or cache contents.

The actual UI scope enum `zn` near 8265660 is 0-14. Additional values are 11
assembly variant, 12 `NGSCPIE` (vendor spelling for NGSPICE), 13 SimulIDE and
14 waveform. There are 74 source `range` arrays containing 11-14. Installed
declarations still end the shortcut document-type enum at 10 (offset 1412199).
Only the fixed 209 builder/result validator accepts 0-14; 206 still accepts
0-10. Raw tokens and duplicate scopes remain unchanged, and both declaration
token/scope conformance flags are false. Scene range remains 1-6.

The [official shortcut documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_shortcutkey.getshortcutkeys.html),
accessed 2026-10-23, labels the old method beta and obsolete since EDA 4.2.
That newer status does not supply absent `get`/`getAll` implementations here.
The existing 1024-record/8-key/32-scope/262144-byte bounds and ten-second
deadline remain. Vendor enumeration precedes result bounds; the deadline
does not cancel vendor work. RPC bookkeeping and timers are disclosed local
effects, not proof of key-execution safety.

## Verification scope

Focused synthetic tests cover all three 209 coordinator selections, actual
selected provenance, mixed 206/209 rejection, UI and both selector drift before
dispatch and after the sole dispatch, final fingerprint drift, retained 206
behavior, and the 209 raw scope domain with await-time mode/owner drift. They
do not establish connected support or validate a user design.
