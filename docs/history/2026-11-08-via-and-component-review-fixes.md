# Via and Component review fixes

The completed full reviews in [PR174](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/174)
and [PR175](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/175)
identified the following still-valid defects. These source fixes do not claim
connected writer acceptance or review coverage for the changed versions.

- Comments4504119970 and4504119974: both Component reply decoders now use the
  existing bounded own-data and duplicate-key decoder before their distinct
  immutable result schemas. Accessors refuse without getter execution, and
  successful results are deeply frozen. Historical V1 and current V2 shapes
  remain unchanged.
- Comment4504119982: large spatial summaries validate the admitted Via,
  Line/Via, Arc/Line/Via, Pad, Component and historical/current cloned-Pad
  observation schemas. Large Line and Arc results remain inspectable after
  the original durable publication and do not repeat the consumed observation.
- Comment4504119989: the clock result's RPC correlation number now occupies
  the separate `rpcRequestId` template field. It can no longer overwrite the
  native pipe request number. Fixed field creation also rejects every reserved
  transport key. All37 cases retain transport ID1 even when the RPC ID is41.
- Comment4504119994: a missing VIA header/body separator refuses before header
  parsing, including when all supplied complete-body hashes agree.
- Comment4504120010: the BEGIN cursor validates the actual driver script,
  function site and intercept caller frames before reading or resuming a GET
  or HEAD request. The extracted original cursor regression proves zero read
  and resume effects for foreign script, site, caller and caller-function data.
- Comment4504122460: the native saved-reader consumed slot includes the
  namespace ordinal even without a cache round. Both namespace deletes have
  independent once-only slots. The pure native smoke checks both distinct
  slots and refusal of duplicate consumption.
- Comment4504122473: the native Via operation identifier accepts exactly the
  TypeScript schema's20 through96 characters. Its pure native smoke exercises
  both endpoints and rejects the adjacent invalid lengths.

Fifteen focused Component, clock and raw-history cases passed. The driver
cursor regression passed. The first large-summary test retained its synthetic
launch-exclusion failure: its first fixture needed closure before the second
fixture could launch. With explicit original synthetic termination/release
between them, the focused large Line/Arc test passed. No production guard or
budget changed for that correction. Both TypeScript configurations and final
changed strict lint are checked separately. Pure native smoke execution and
regenerated helper/pin/bundle checks remain part of the next frozen build.

A previous private Via freeze at3a08fa0f completed all mandatory non-suite
checks. It will not be selected for a live writer because these later reviews
identified concrete execution blockers. That frozen result remains retained;
the updated source must be regenerated and checked before native selection.
The SQLite dependency lease finding, reader journal publication recovery and
prebirth coordinator cancellation are tracked in their separate fixes.
