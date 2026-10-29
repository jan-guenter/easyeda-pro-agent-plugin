# Preload registry source qualification

Source-only investigation on 29 October 2026, based on repository
`bc56dfd6834adedba386dc4f8caa7868d9d46d64` plus the uncommitted combined native
allocation/window-capture batch. No EasyEDA MCP, native application control,
project opening or CAD change occurred in this investigation.

## Original failure and source finding

The retained 161500 UI observation stopped at the compound check of the registry
prototype, its constructor and the Map prototype. That historical reply does
not identify which relation failed. The added guard diagnostics cannot supply
that missing historical observation. Local Node inspector experiments did not
prove a Map-realm defect.

The installed default editor bootstrap gives a concrete reason that the old
registry-class assumption is invalid. Its first script is the manager preload.
That preload eagerly constructs a service which calls `St.getInstance()`.
`St` aliases its named registry class `sl`, so this call creates the shared
`extendLibManager` singleton. The later UI bundle declares a different named
class `kgt`, aliased as `h4`. Its `getInstance()` returns the existing singleton,
including one created by the earlier preload. The two class prototypes differ.

Both context producers return `self.EDITOR_TOP || self`. The UI route must keep
its separately qualified UI router, `h4` static methods and `Po` producer, then
qualify the existing receiver's actual preload class. A matching class name or
JSON instance description does not supply that qualification. The native owner
must join the original class/functions to the complete pinned preload source,
original script and context, retained objects and fresh relation checks.

## Installed source proof

Paths below are relative to EasyEDA's `resources/app` directory. These pins
already belong to the reviewed worker bootstrap or UI source profiles.

| Source | Bytes | SHA256 |
| --- | ---: | --- |
| `editor.ini` | 8,031 | `ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9` |
| `app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `assets/pro-mgr/3.2.185.bf63a159/js/preload.js` | 875,163 | `4f802b0d345b7c54817627fc854e61541f70585e8fcb0ecb98789365a88f9935` |
| `assets/pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |

All spans below use zero-based UTF16 indices with an exclusive end.
`editor.ini[77,725)` is its complete 648-byte default section, SHA256
`864d2f76541c42bf451cf37d2fc4920e5e01743c881871f0ad0ed6c84832b4f1`.
Its order begins preload, service-worker loader, API and UI, followed by the
schematic, rendering, PCB, panel, manager and ws-service scripts.

The page branch of backend `sC` emits ordinary ordered script tags through
`app.js[2579060,2579106)`, SHA256
`cd975670926297ef9764c7341d725dc0f1bf317f7e8cfe8c14fff5dfe2b7439b`.
`app.js[2579457,2579481)` spreads those tags into the HTML head, SHA256
`a9b853abd44251aa8cd98f580c040724e95c37943dd362cab4cbfe7208190377`.
This proof concerns the ordinary default page, not a Worker or another editor
entry.

The preload's 20-byte alias `var St=Yd,Pl=class{}` occupies `[683363,683383)`,
SHA256 `3931a022fa0608cf3a48f613e62cdccb66920c9d4bc699e36796f7e369466e6b`.
Its service constructor prefix at `[793041,793173)` includes the existing
`St.getInstance()` call, SHA256
`e233a1a9be293dad8fb097af547716dd9235619b4242f5ae7bb7d64d9cfaf16a`.
The eager `ai=new Y_` at `[801306,801315)` has SHA256
`e40f5b7505f86f59ddc8c2fcc876faeafe4b7fcface6b5402d95d6b06c108550`.
The new immutable registry-source profile checks these spans as well as the
complete preload digest and five function sources.

| Function | Source span | Bytes | V8 line:column | Name / arity |
| --- | --- | ---: | --- | --- |
| Registry class | `[682378,683330)` | 952 | `27:4980` | `sl` / 0 |
| Membership method | `[683045,683079)` | 34 | `27:5633` | `hasLib` / 1 |
| Singleton method | `[682541,682646)` | 105 | `27:5134` | `getInstance` / 0 |
| Context getter | `[682508,682534)` | 26 | `27:5101` | `get context` / 0 |
| Context producer | `[48208,48251)` | 43 | `0:48219` | `ws` / 0 |

All five are synchronous. Their individual SHA256 values are retained in
[`current-footprint-copy-ui-registry-source.ts`](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-ui-registry-source.ts).
The UI `Po` source remains separately pinned in its original UI profile.

## Scope and descriptor consequences

The preload's outer anonymous arrow spans `[1,873102)`. Neither that classic
script nor `ws` has a strict directive. The named `sl` class introduces a lexical
Block before the shared preload Closure. A local Node inspector reproduction
using those exact declarations reports `Block`, `Closure`, `Global` for the
class methods, and `Closure`, `Global` for `ws`.

The dedicated class-scope decoder requires all three entries and distinct
handles. The native selector must prove the Block's `sl` binding equals the
retained constructor before following `ws` through the separate Closure. The
existing first-Closure UI scope rule cannot do this.

After the original static prefix assignment, `sl` has exactly six own fields:
`name`, `length`, `prototype`, `context`, `getInstance` and `LIB_ID_PREFFIX`.
Its prototype is non-writable, non-enumerable and non-configurable. The prefix
is `extend_lib_` and writable, enumerable and configurable. `context` is a
getter with an undefined setter. The two method sources remain exact.

The ordinary `ws` function has five own fields in the local exact-wrapper
reproduction, including non-writable, non-enumerable, non-configurable null
`arguments` and `caller`. The new decoder requires that precise roster. It does
not accept either three or five. These local descriptors and coordinates are
synthetic engine evidence; the embedded EasyEDA engine still needs fresh
connected admission and must refuse any different shape.

## Implementation and verification

The new registry source qualifier issues an original-object token after full
source verification. Serialized reports cannot recreate it. Its result keeps
runtime binding and execution authority false. The separate metadata decoder
checks the original class/method metadata and a fixed eight-element native
capture. Only four qualified function handles escape that decoder; the owner
retains and rechecks the actual registry, prototype, Map and notification bundle.

With Node 24.18.0, npm 11.16.0 and soft core limit zero, seven focused tests pass.
They cover source substitutions, exact class descriptors, malformed arrays,
scope order, proxies/accessors and actual inspector locations. The inspector
test preserves the original anonymous-arrow form and source coordinates,
executes only the small declarations, and proves the Block's `sl` identity
through the actual `internal#scope` receiver envelope. It calls no constructor,
vendor getter or producer. A separate local check qualifies the actual full
pinned preload and refuses changed bytes or a copied qualification token.

An earlier full typecheck attempt during concurrent window-capture integration
failed at two missing `CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION` references
in `current-pcb-diagnostic-owner.ts`. That failure was outside these source and
metadata files. The integrating agent subsequently reported full typecheck
passing. Final aggregate checks belong to the unchanged combined payload.
No connected UI route, live copy, writer or durable lifecycle acceptance is
claimed by this source investigation.

## 29 October full-source transport correction

The subsequent frozen-payload review caught a concrete transport defect before
publication. The new `registrySource` command returns the875,163-byte preload,
but the UI runner still passed every reply through the small clock capture.
That capture limits a string to16,384 characters and the whole reply to131,072
bytes. The runner's generic exception diagnostic repeated the same small
capture. The earlier synthetic runner fixture used a tiny source literal,
so its successful tests did not cover either failure.

The registry-specific reply wrapper now reuses the maintained data-only manager
script capture and imposes the narrower fixed preload byte ceiling. Full hash
qualification remains separate. The runner selects this capture only for the
fixed `registrySource` phase and retains the reply before awaited owner reproof.
Its one-key source envelope already rejects exception or metadata fields, so it
does not pass through the small exception diagnostic afterward. No global clock
limit changes and no native-helper changes were made for this correction.

The runner's default synthetic source is now the full875,163-byte transport
size, with only the separately tested source-hash issuer replaced. New checks
exercise observation and repeated source reproof, retention before owner loss,
oversized UTF8, invalid text, extra fields and accessor/proxy rejection.
All18 focused UI-runner, registry-source and registry-metadata tests pass.
These are synthetic transport checks, not connected EasyEDA acceptance.
