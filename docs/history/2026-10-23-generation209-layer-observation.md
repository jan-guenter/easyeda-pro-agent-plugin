# Generation 209 original-owner layer observation

Date: 2026-10-23. Scope: plugin source and isolated fixtures only. This work
neither opens a design nor calls the installed agent bridge. The separately
running parent's disposable opening qualification is a different case.

## Contract and source evidence

The official [`getAllLayers` contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.getalllayers.html)
is beta, takes no arguments and returns a promised array. It includes disabled
inner layers. [`IPCB_LayerItem`](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_layeritem.html)
defines the nine public fields, including percentage transparency.
[`EPCB_LayerStatus`](https://prodocs.easyeda.com/en/api/reference/pro-api.epcb_layerstatus.html)
defines 0 unused, 1 shown and 2 hidden. The method page's illustrative copper
counter omits the status filter; the installed implementation below is the
authority for this adapter's copper count.

The official [PCB layer class page](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.html)
does not currently list `getTheNumberOfCopperLayers`, and the guessed dedicated
page could not be retrieved. Its installed declaration at line 9062, UTF-16
offset 275864, marks it alpha and returns `Promise<number>`. The adapter does
not describe it as a documented stable method. The `getAllLayers` declaration
at line 9251, offset 281810, is beta.

Independent source review used these installed first-party artifacts under
`resources/app/assets`, not a newer npm package. Offsets below are JavaScript
UTF-16 indexes after decoding UTF-8.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| Installed `api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

PCB offset 10323176 registers `pcblayer-getAllLayers`. It maps the existing
`ye.getAllLayer()` collection to twelve native fields. Enumeration at 7941678
uses the retained `layerMap`; it does not sort, construct layers or call setters.
`M2` getters at 7936668, 7937818 and 7938609 read existing model and state.
Status is configured and visible → 1, configured and hidden → 2, otherwise 0.
The color formatter at 1453762 multiplies channels by 255 and converts them
to hexadecimal without integer rounding. Malformed fractional color strings
are therefore retained as raw strings, not repaired or labeled valid CSS.

UI `getAllLayers` at 17359479 dispatches that topic. The general `Ot` helper
at 15792864 awaits frame selection, so using the public wrapper would leave
an active-tab routing gap. The fixed adapter captures the original exact
iframe and its `MSG_BUS_PCB.messageBus.rpcCall` receiver first. The copper
expression at 17356586 uses `ypt` at 17354662: enabled native `SIGNAL` or
`PLANE` rows plus two. API offsets 1380948, 1381985 and 1382388 define the
nine-field projection, type mapper and two-decimal transparency arithmetic.
TOP and BOTTOM map to public SIGNAL but must not be double-counted. The API's
`getCurrentLayer` at 1378351 is empty. This work does not replace it with the
first `active:true` row.

Native identity is not wholly effect-free. `getTabIdAndDocType` at 10821805
calls the environment singleton and reads its tab/type getters. A prematurely
missing singleton can initialize date/random values, compiler-channel and
grid-related local state. PCB preview and footprint map to type 23 and refuse.
`rpcCall` at 16344 and its reply-ticket machinery allocate bookkeeping. The
service at 16045 can turn native failure into undefined; missing replies refuse
instead of becoming an empty layer list. Passing timeout 0 avoids the vendor
timer. The outer deadline does not cancel already-dispatched native work.
No reviewed layer getter path invokes Save, geometry export, compiler mutation,
layer setters or ratline completion. This is source feasibility, not continuous
observation or complete startup evidence.

## Implemented original-owner path

`easyeda_control_pcb209_opening` gains `observe-layers`, with only the original
operation ID and binding digest. It requires the accepted original project
opening and complete PCB frame, DOM, source and identity observation. The
target is derived from that owner's checkpoint-bound preparation. It cannot
adopt another process or accept a replacement target, method, command or code.

A separate launch-sealed `diagnostic209` owner and native `Layers209` purpose
retain the existing process, Job, pipe and normal cleanup. The fixed native
command reconstructs its own program and only accepts the exact observation
phase. Legacy206 public schemas, default owner and model/worker vocabulary
stay unchanged. Generation209 cannot select those model/worker routes. No
bridge-dispatch or quarantine exception was added.

The program checks original UI, project, branch, tab, child document, iframe
attributes and native receiver around every await. Two complete twelve-field
layer samples must match; native tab/type observations bracket each sample.
It returns raw native fields, the nine-field public projection and copper count.
At most 512 unique layers, 1024 name characters and 128 type/color characters
are accepted. Native JSON is bounded to 65536 UTF-8 bytes and the complete
returned projection to 131072 bytes. Signed zero, non-finite numbers, unknown
fields, accessors, duplicate identities and incomplete output refuse whole.

The lifecycle journals `layers209-intent.json` before dispatch and retains the
result for `inspect` with observation `layers209`. Failure consumes the stage;
normal close, original termination and release remain available. The phase
does not request another opening or Save. All complete-baseline, startup,
physical-stackup, persistence, writer and Save claims remain false.

The existing 103-request and 64 MiB transport limits do not change. Source-based
protocol fixtures count 39 opening requests without an ancillary child, or 49
with it. The layer phase adds five or nine respectively: two target/frame
checks before and after, one fixed layer command, and optional paired DOM
checks at both boundaries. Full counts are 44 and 58. Six fixed local RPCs
inside the layer program are distinct from these native transport requests.

## Verification and remaining work

Program tests exercise cross-realm receivers, all returned native fields,
hidden/disabled copper semantics, raw colors, owner drift, malformed values,
oversized samples and fixed error output. Native-wire tests compare the exact
generated helper program and reject caller code or another phase. Real retained
helper-pipe fixtures cover positive and refused layer replies and original
normal cleanup. Lifecycle tests cover source prerequisites, durable intent,
captured receiver forwarding, one attempt and original release.

These are source and isolated tests. Current-generation live layer samples
remain pending after installation and fresh actual-process admission. Layer
metadata does not depend on completed ratline delivery and does not supply that
missing proof. `getCurrentLayer`, physical stackup editing, complete native
baseline and create/Save/closed-reopen writer qualification remain separate work.

### Final focused verification

Pinned Node 24.18.0, npm 11.16.0 and zero core limit were used. The final unchanged
eight-file affected run passed 224 tests, zero failures or skips, in 62.47 seconds.
Full TypeScript and targeted strict type-aware Oxlint passed without warnings.
The fixed-program generation check and whitespace check passed. Independent
review followed the public callback through the real default allocator, native
purpose selection, fixed command and retained cleanup; it found no actionable
issue. Its separate four program tests also passed.

Earlier focused runs retained failures in synthetic expectations: the new owner
purpose was missing from a fixture's regex map, the request count was initially
overestimated, and a source-text assertion still expected the old two-purpose
PowerShell guard. Those fixture expectations were corrected. They were not
connected failures or permission to replay a native operation.

Final fixed program SHA-256:
`5963cdbb50fd5221aa1a88e7ff35154bddf18bf9eb3aa5a9e588467fb0fdbb7e`.
Native helper: 895943 bytes, SHA-256
`3b0c243a5937456357a22425f105bbddbd9f2e64f76d7a70c2dc30aa799bdf5d`.
Owner and synthetic-launch helper constants match those bytes. Windows
`Add-Type` compilation and the combined release verification remain the parent
release workflow's responsibility; no live getter validation is claimed here.
