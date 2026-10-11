# PCB navigation and shared preferences

Reviewed 2026-10-11 against the installed EasyEDA Pro tuple. This is source
evidence, not a claim that a past navigation deleted backups or uploaded data.

## Finding

The PCB/footprint tab-click handler reads `pcbCommandTab` after native awaits.
If it is absent or false, the handler removes the command tab, writes the false
value to the preference cache and calls `saveToServer(false)`. That argument
suppresses notification messages; it does not suppress persistence.

In this desktop distribution, the request reaches a local preference service.
That service updates the user's shared preference record and can delete excess
project backups according to `saveConfig.autoBackupNum`. A byte-identical
project checkpoint does not prove those other resources unchanged. No actual
preference database, backup inventory or user design was inspected for this
research. Remote account upload and actual past pruning remain unestablished.

## Pinned evidence

Offsets are zero-based UTF-16 string offsets in these exact installation assets.

| Asset | SHA-256 |
| --- | --- |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| Desktop `app.js` | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |

UI subscription11121307 handles PCB/footprint tab clicks; preference access
starts11121848. `saveToServer` near15794007 still collects and posts preferences.
Desktop routing2622123 reaches controller2471506 and service2215919. The service
writes preferences, enumerates project backups and applies the retention count.

## Affected paths

| Entry | Source chain |
| --- | --- |
| Public activation | API471696, UI17088846, `setTabActive`16301966, `simulateClick`16302327 |
| Already-active activation | `setTabActive` resolves the already-active condition but continues into simulated click |
| Tree doubleclick and context Open | UI15045525 and15670606 call ordinary opener `Hd`15126686 |
| Closed PCB open | `Hd` calls factory `Xb`15117339; frame initialization calls activation15121643 |
| Active-tab close | `removeTab` reaches deletion15550310, which chooses a replacement and publishes click15550843 |
| Project open | `ON_OPENED`16538900 restores stored PCB tabs; `ON_TEMP_OPENED` can open the first PCB |

Opening a schematic target does not exclude restored PCB peers. Closing a
symbol or schematic can activate a remaining PCB. `isActive:false` still reaches
activation, and lazy opening does not initialize a usable ordinary editor.
The maintained inactive, clean, exact-target close has a narrower invariant:
another tab remains active. Do not equate it with active-tab replacement.

## Why no quiet replacement is exposed

The generic container-active RPC10400891 bypasses the click handler, but leaves
PCB-specific state incomplete. It does not update the private active-frame
registry, container bookkeeping, layer-bar state or PCB tool state. Resize and
cross-probe handlers use that registry, so this is not merely a cosmetic gap.
The required private classes and ordinary frame factory are not exported by UI.

A fabricated container-transfer event would update only part of that state.
Opening a thumbnail, preview or decoder frame would not establish an ordinary
editable project tab. Neither is an accepted navigation adapter. The complete
ordinary frame factory has no inspected option that both finishes initialization
and avoids activation.

Focusing an already-active tab in a different existing split container is a
narrower research possibility, not current support. Its public implementation
has an observed `docType`/`doctype` mismatch and returns before focus readiness.
Creating a split to obtain that state can itself activate tabs and does not
solve ordinary single-container opening.

## Required boundary

Use a passive exact-Boolean `pcbCommandTab:true` predicate before any affected
navigation. Missing, malformed, coerced or oversized data must refuse. For a
Save/close/reopen workflow, reject a known unsafe condition before Save, then
recheck immediately before later dispatches and after awaited work. A proven
complete native tab registry can distinguish a schematic/symbol-only close from
a possible PCB replacement; an ambiguous registry cannot grant that exemption.
Project opening still needs the preference predicate because it can restore
tabs not present in the current registry.

Do not toggle settings, monkeypatch persistence, block requests or fake internal
tab state to make the operation pass. Native awaits leave a concurrency limit:
a pre-dispatch check cannot make later preference state atomic against user or
native changes. Keep the editor and settings quiescent and report that limit.

Whole-application normal-close uses a separate path. The reviewed beforeunload
handler saves session layout and handles prompts without individually activating
PCB replacements. Normal-close still needs exact window/process binding, prompt
inspection and observed process exit. It does not prove rollback or cancel an
earlier queued preference request.

The initial disposable activation refused before dispatch and reconciled with
unchanged complete project state. Subsequent whole-app close and offline
checkpoint verification preserved the fixture. No quiet replacement was run.
