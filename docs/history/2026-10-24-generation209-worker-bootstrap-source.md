# Generation209 project-worker bootstrap source

The installed 3.2.209 manager creates its project Worker from
`https://client/editor?entry=mgr-project-worker.js&cll=…&debugOpen=…`.
`project-worker.js` is an imported script, not that Worker's initial target URL.
Treating those two URLs as identical prevents the original startup capture from
reaching project-worker construction.

The new `current-pcb-209-worker-bootstrap-source.ts` fixes the source model. It
classifies the generated bootstrap, imported preload and imported project
script separately. The bootstrap URL has one exact origin, path and query
order; the bounded log values are `trace`, `debug`, `info`, `warn`, `error`,
`off` and the empty fallback, and `debugOpen` is exactly `0` or `1`.
Unknown values, escaping, normalized aliases, suffixes and reordered queries
refuse. This classifier alone establishes no native target identity.

## Installed source derivation

The backend reads its own root `editor.ini`, not the identical copy under
`assets/pro-versions`. Its `sC` function emits three assignments followed by the
ordered `importScripts` calls from the `mgr-project-worker` section. The fixed
version text yields `3.2.209` and `10/21/2026`. The reviewed mode setter accepts
`ONLINE`, `HALF_OFFLINE` and `OFFLINE`; the EasyEDA package uses the `EASYEDA`
brand. The module contains exactly those three complete generated sources.
An unknown mode or different brand refuses.

Complete source pins cover backend `app.js`, root `editor.ini`, `version.txt`,
manager `pro-mgr.js`, `preload.js` and `project-worker.js`. They are compiled
into the new module. No caller supplies a source profile, hash or import URL.
The installation qualifier returns an issuer-bound token for supplied bytes
only. It does not claim continuous file leases or runtime ownership. The
runtime checker accepts only a strict raw `Debugger.getScriptSource` result
containing its single `scriptSource` field. It rejects proxies and accessors
without invoking them.

## Preload log observation

Preload invokes `Zf()` from its root IIFE at UTF-16 offset838851. `Zf` emits
`common init----------------` before the console filtering setup. The call
expression occupies offsets43500–43542; its source hash is
`baff5418dee78d2a4f2eeb28dd46b971cc2ef2f306ffbb341ce328d736f1232c`.
Therefore a blanket refusal of every console event before project-script
qualification would reject ordinary preload startup.

The exported fixed log profile distinguishes that call expression from the
V8 console stack location. A separate synthetic Node24 inspector case reports
zero-based line0, column43508 for this member call. The transport must still
bind the original context and fully qualified preload script, admit this exact
one-shot message only after the preload resume attempt, and reject every other
early log or runtime exception. The profile itself makes no claim that the
event occurred.

## Verification and remaining limits

Four focused tests pass with Node24.18.0 and core dumps disabled. Targeted
strict type-aware lint is clean. Tests cover the complete bounded URL set,
cross-role source refusal, exact generated sources, hostile raw-result objects
and copied qualification refusal. A separate read-only installed-source check
qualifies all six complete source strings, both imported runtime sources and
the three generated bootstrap variants. The maintained descriptor installation
wrapper also passes against the configured assets root without native
allocation. The six-source closure digest is
`0325d25901e7b18f74b53eefdcd389ead44f5ea122ee65644b51caf62f1a9ed2`.

An independent reconstruction extracts the exact1137-byte `sC` generator from
the complete pinned backend source, parses the actual root configuration and
version text, and runs only that pure generator against an inert response
collector. All three outputs match the compiled variants exactly. Its source
span2578439–2579576 hashes to
`db497fff6669dbce9162999b1dda08b09a3c294ea6269c3df5f00214d3e2edc2`.
The installed application, preload, imported project code and generated imports
were not executed.

This leaf does not independently establish the Worker object-to-CDP-target
association, original pause/resume sequence, actor/channel identity, PCB startup
or writer eligibility. Those remain duties of the composed original owner.
The maintained legacy206 source profile is unchanged. No live design, Save,
production-project operation or installation change was performed by this source task.
