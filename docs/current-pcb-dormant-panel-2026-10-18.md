# Dormant standardization panel and offline writer groundwork

Candidate: `0.3.0+codex.20261018184000`.

## Live outcome

The installed 173500 disposable PCB rename case passed its closed baseline,
original process termination, replacement admission, inactive-cache observation
and project-only opening. Startup qualification stopped at `auxiliary-panel`.
No rename, inverse or explicit Save was dispatched.

Original-owner cleanup closed and retired the replacement process and Job.
The disposable file remained exactly 598,016 bytes with SHA-256
`41ac606247582f9c4be17eda1492d76c0f33f70efa4d36a2ac8bf6ef780e5c12`;
the post-closure descriptor-stable read found no SQLite sidecars. The failed
case is terminal and must not be resumed. Production projects were excluded.

## Source-confirmed incompatibility

Pinned UI bundle `3823ed6e` creates a normal hidden DIV in its static template:

```html
<div id="device-standardization" class="log-container" style="display: none;">
```

The previous guard required zero ID matches, so it could reject normal startup.
The synthetic fixture omitted this placeholder and therefore missed the mismatch.
This proves a source-contract defect; the coarse live failure does not establish
which predicate failed or what the actual unseen DOM contained.

Relevant UTF-16 offsets in the pinned UI source:

- 16315: hidden template; 53564: inclusion in the bottom layout.
- 12493071: React root creation, without rendering child elements.
- 12493187: explicit render entrypoint; 12494441: its active initialization caller.
- 8448590: active-tab marker; 12500597: selected panel sets its owner attribute.
- About 12502600: selected panel shown and sibling panels hidden.

Pinned SCH bundle `d9d6a955`, offset 6187767, returns from its standardization subscriber
when the active-DIV selector is empty, before reading the placeholder's owner.
The normal Document prototype chain also fits the existing bounded method binder.

The correction preserves active-panel absence and requires one retained dormant
placeholder: connected to the same document, hidden, without an owner attribute
or rendered element children. Normal React root/listener expandos are allowed.
Replacement, duplicate, activation, initialization and method/state drift refuse.
Startup-only fixed diagnostic substages retain historical coarse decoding;
writer calls gain neither diagnostics-dependent authority nor broader scope.

## Other implementation progress

The supplied-data PCB String patch planner now models native required flags,
omits unchanged optional values that would lose precision, and distinguishes
native movement thresholds from stored-source rounding. Its scope is narrow
unlocked parentless ASCII text. It does not establish live ownership or writing.
See [the source-model record](current-pcb-string-source-model-2026-10-18.md).

Separate schematic-container models cover historical SCH headers, exact title
history append and complete structure preservation. They are not SCH_PAGE or
PCB writer reuse. Backend actor/clock qualification, the deferred schematic
subscriber, full SQL effects and the original-owner lifecycle still need work.

## Remaining work

1. Load the corrected installed version in a fresh Codex session; admit the
   actual facade and use a new disposable PCB rename case. Complete writer,
   closed SQL, reopened metadata and final closure verification.
2. Establish safe current PCB source ownership, a representative nonempty String
   fixture and independently verified readers/writer. FileSource stays disabled
   because it repairs shared rules and does not export complete source.
3. Integrate the separate schematic title models with current metadata/preflight,
   actual deferred-subscriber completion, SQL verification and lifecycle owners.
4. Continue broader schematic/PCB geometry, libraries, routing/rules, ECO,
   dialogs/exports, additional platforms and self-contained bootstrap adapters.

No current source model is a connected execution or saved-result claim. Avoid
another broad test campaign: use focused regressions plus mandatory release gates.
