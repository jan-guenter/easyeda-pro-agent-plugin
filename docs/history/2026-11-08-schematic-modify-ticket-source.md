# 2026-11-08 schematic Modify ticket timer source

This source-only leaf pins the selected worker's `Lg.localPublishTicket`,
`canWsPublish`, timer arrow and actual callsites. The full worker SHA is
`0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046`.
The source binds `jr` to `L1.IS_PRIVATE`; `ln` is the separate `IS_CLIENT` alias.
A runtime `jr` value must come from the original held `canWsPublish` frame.

The selected no-argument call schedules a 20 ms timer from an own null
`publishTimer`, returns undefined, and retains no Promise. `onChange` calls it
after the Nd wrapper returns without awaiting that wrapper's Promise. Thus the
timer-entry guard must be armed before releasing the Nd return; waiting for its
finalizer first misses this synchronous prefix. A false `jr` short-circuits the
WebSocket branch but does not suppress the timer.

New passive recipes retain source methods and browser-native timer descriptors,
reprove the actual no-argument receiver, and describe only the exact
`publishTimer` null-to-positive-ID or positive-ID-to-null delta. Every peer
string/Symbol descriptor, key order and prototype remains exact. The shared
SAME program is unchanged and refuses either delta. The null delta alone does
not prove `clearTimeout` ran. Browser-native function metadata still requires
independent original-realm qualification; Node's JavaScript timer functions are
explicitly rejected. No cancellation, callback receiver, worker completion,
Modify or Save authority is issued.

Actual source-preserving local V8 metadata verifies all three original
functions without executing the timer arrow. Possible return points are
110:94333 for the no-argument local branch and 110:94411 for `canWsPublish`;
110:94138 belongs to the refused forced-argument branch. Function-call guards,
original timer ownership, cancellation/ACKs and later completion remain the
runtime owner's responsibility. The source alone does not prove an SDK or
worker Promise has joined timer settlement elsewhere.

The complete tested runtime/test tree is
`874962828fe6e693148d02b6a6d6ef731d4fa4e6`, based on
`2351e2bba144f830ef81d0a4b641dc392090baaa`; this record is added afterward.
Final Node 24.18.0 focused checks passed 3/3 with zero skips using the configured
installed source root. Both TypeScript configurations and strict type-aware
four-file lint exited 0. The initial delta-loop test failure and initial lint
failures are retained privately; the loop braces were corrected before the
sealed checks. No C#, Windows, native owner, application, MCP, timer-cancel or
CAD call was made. No helper artifact or payload size is claimed.
