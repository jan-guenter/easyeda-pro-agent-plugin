# Held-cache loader waiting interval

4 November 2026. The installed `0.3.0+codex.20261031193000` diagnostic
`footprint-held-cache-193000-20261104-native-01` exhausted its sixteen startup
samples before selecting a frame. The first three inventories were empty; the
remaining thirteen contained the editor and its recognized loading window.
The last inventory had five total targets and two pages. This was a
`PCB_DIAGNOSTIC_HELD_CACHE_READINESS_TARGET_LIMIT` refusal, with no selected
frame or cache observation. The original owner retained cleanup. This note
does not authorize repeating that consumed diagnostic.

The private retained inspection packet has SHA-256
`53bcf7f25e86bf68f4523b039c32139b74a725829eb02faf2dd1a4090a779c1e`.
The failure extends the [PR165 startup work](2026-10-31-193000-archives-and-native-startup-context.md)
and its [publication record](2026-10-31-203348-pr165-publication-and-backlog.md).

## Source diagnosis

The actual installed backend `app.js` is 2,657,192 bytes with SHA-256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`.
Its `mh` function occupies UTF-16 offsets `[2653410,2653978)`, using zero-based,
end-exclusive indices. The loader's `ready-to-show` callback at offsets
`[2656435,2656695)` creates the main editor and invokes `mh` with that editor
and the original loader. `mh` schedules a 4700 ms timer, then a 300 ms timer
that clears `startBrowserWindow`, closes the loader and shows the editor.

Five seconds is the intended timer chain, not a strict observed closure
deadline. Event-loop scheduling can delay either timer. The outer asynchronous
callback also awaits its first-run dialog branch before scheduling the inner
timer. A rejection or another exception can prevent that scheduling. The
retained target classifications do not show callback completion or distinguish
those cases.

The old sixteen-sample budget allowed fifteen deliberate waits of 250 ms,
3.75 seconds total. Request and transport time were additional and were not
timestamped in that diagnostic. The wait budget therefore could not cover the
backend's intended five-second transition on its own. This explains the need
for more waiting without weakening the requirement that the loader disappear.
It does not prove that timing alone caused this particular refusal.

## Source change and evidence limits

New observations use diagnostic V3 with sixteen samples and 1000 ms between
valid samples, at most fifteen seconds of deliberate waiting. The fixed
interval passes from the readiness leaf to its original private timer callback.
The native discovery request count remains 34, with 45 normal requests and one
cleanup request overall. Existing request deadlines, byte reserves and
termination custody remain unchanged.

Selection still requires loader disappearance and two consecutive exactly
matching complete inventories with one unattached editor. Candidate changes
reset confirmation. Invalid or unrelated inventories refuse immediately.
The later exact frame comparison remains intact. An exhausted launch cannot
be retried through this change.

The original 10,627-byte diagnostic-profile prefix, including the complete
V1/V2 parsers, helpers and 250 ms constant, remains byte-exact with SHA-256
`1e2a8ab00a0d766f4183a2174f319c4e6de6c64b4b378b28ad98557ca010ff85`.
V3 has its own schema and interval. Historical V1/V2 records keep their original
meaning and remain accepted by the record reader.

Twenty-six focused tests passed with zero failures or skips under Node
24.18.0, npm 11.16.0 and a zero soft core limit, using the maintained isolation
preload. Simulated-clock checks cover the intended five-second loader chain,
exact confirmation at six seconds, and refusal after the last sample at
fifteen seconds when the loader persists. Other checks cover malformed and
changing inventories, consumed attempts, V1/V2 compatibility, V3 journal byte
reserves and the current offline catalog interval. These are offline tests.
Targeted type-aware lint finished without warnings or errors. Its earlier
type-import style refusals remain in private verification logs; the corrected
top-level type import changes no runtime behavior.
No V3 native launch, build, release or installed validation was performed by
this change's author. Batch typecheck and publication verification remain with
the integrating owner.
