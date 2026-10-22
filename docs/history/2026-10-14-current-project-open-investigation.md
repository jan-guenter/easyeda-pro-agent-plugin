# Current project-opening investigation

Source review of installed `0.3.0+codex.20261014163000`, EasyEDA
`3.2.206.715d940d`, and the pinned upstream on 2026-10-14. This source research
did not evaluate application code, make live calls, read profile/design data,
or change the runtime.
This note records one confirmed request defect, not the missing historical
reply from opening150000. The user's observation that EasyEDA still showed
Start Page is consistent with early rejection but does not prove no effects.

## Confirmed defect: navigation exceeds the upstream input bound

Installed `server/src/current-disposable-open-runtime.ts`, lines 207–209, sends
`timeoutMs: 120_000` for both navigation phases and `20_000` for preflight and
observation. The pinned upstream's `dist/tools/L0_diagnostics_api.js`,
lines 230–234, defines `easyeda_execute.timeoutMs` as an integer between 1000
and 60000. Navigation therefore fails its declared input contract; preflight
does not. The public project UUID and generated navigation code need not be
examined by EasyEDA for this rejection to occur.

The installed native navigation deadline is also 110000 ms in
`server/src/current-disposable-open.ts`, line 163. Changing only the upstream
argument to 60000 would leave the native deadline longer than the bridge's
deadline. Both must change together, retaining this ordering:

```text
native observation deadline < upstream timeout <= 60000 ms < host timeout
```

For example, 50000/60000/70000 preserves a 10-second margin at each boundary.
Expiration stops observation, not the underlying native action. It must keep
the existing ambiguous-outcome quarantine and no-replay rule.

## Why rejection can appear at decode-result without a native code

The normal pinned protocol path is sufficient to explain that diagnostic shape:

| Source | Behavior |
| --- | --- |
| upstream `dist/tools/registry.js`:31,505 | Registers the tool's input schema unchanged for the local backend. |
| upstream SDK 1.29.0 `dist/esm/server/mcp.js`:125,174–178 | Validates inputs before calling the registered handler; out-of-range timeout throws `InvalidParams`. |
| same SDK:136–163 | Converts that exception to `isError:true` plus a text item, without `structuredContent`. |
| facade `server/src/core.ts`:530–543,585–591 | The non-JSON text has no structured fixed code; classification falls back to `unclassified-upstream-failure`, and extraction throws a fixed host error. |
| facade `server/src/current-disposable-open-runtime.ts`:221–227 | Sets host stage `decode-result` immediately before extraction, before decoding or validating any native result. |

Thus `decode-result` does not prove native dispatch, a returned project-open
acknowledgement, or execution of the generated program. Installed163000 now
retains the optional fixed `upstreamCategory`; 150000 did not retain it.
No historical subtype can be recovered from the old collapsed diagnostic.

A second, separate diagnostic mismatch exists if validation reaches the
upstream's own wrapper: `registry.js`:12,416–422 uses
`errorCode: "ERR_INVALID_INPUT"`, while facade `core.ts`:522 only recognizes
`INVALID_INPUT` and `INVALID_PARAMS`. This is not the normal SDK-prevalidation
path above. Correcting the timeout does not require broad error-text parsing or
changing dispatch authority.

## Native routing and lifetime findings retained from the earlier review

Offsets below are zero-based UTF-16 offsets in the pinned installed bundles.

- API `1315841` delegates `openProject` directly to the fixed UI RPC; UI
  `17230843` calls `Fs({uuid})`, and `ZDe.check` at 15070825 rejects a missing
  identity, not a 64-character path hash. The UUID-only route supplies no
  `cPath`, so `ZDe.connect` at 15071855 does not register another path. Desktop
  `app.js` `1284102` and 2332540 explicitly use the SHA-256 of the raw path as
  the local registry key. There is no basis here for replacing UUID64 with
  UUID32. The [official method contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html)
  promises a boolean, not completed document restoration.
- UI `15071965` publishes the project hash change. `setHash` at 16365863 retains
  pathname/query and replaces the fragment. No unconditional main-renderer
  reload or extension reset was found on this ordinary route. This source
  finding is not a guarantee against external navigation or a crash.
- UI `onSuccess` at 15074022 assigns the new `currentProject`, then publishes
  `ON_OPENED` at 15074858 without awaiting its async subscribers at 16667083
  and 16737077. Restoration later changes tabs and may replace container arrays
  through `restoreLayout` at 16422020. PCB initialization runs in a later iframe
  `onload` at 15243172. The opener intentionally freezes its post-return URL and
  double-samples object ownership across the subsequent registry await. A
  restoration race can therefore trigger a native URL/GUARD refusal even with
  an admitted initial fragment. That is a separate readiness issue, not an
  explanation for losing the native diagnostic or grounds to relax guards.
- Internal API MessageBus2 `rpcService` at 138262 serializes rejected errors
  with `String(error)`; `rpcCall` at 138612 reconstructs `new Error(err)`.
  This can add an `Error:` prefix to an inner public-RPC rejection. However,
  the generated opener's outer catch, line 164, replaces it with its own fixed
  stage/code. The normal bridge then preserves that message. Inner RPC
  stringification alone does not explain an unclassified outer opener error.
- Separate API reset mechanisms exist at 1945661 onward: clearing user info or
  entering exam mode invokes unload-all `T2`, 1923019, then extension unload
  `K_`, 1920114. These are conditional mechanisms, not evidence that opening an
  ordinary disposable project resets its extension context.

Bridge response loss remains another source-supported possibility. The repo's
`easyeda-bridge-extension/src/index.ts`:790–806 drops replies belonging to an
old connection generation. Upstream `dist/bridge/manager.js`:333,373 rejects
pending calls when disconnected/replaced; `L0_diagnostics_api.js`:325 converts
those exceptions to ordinary error-string replies. Such a reply can reach
`decode-result` as unclassified. None of these possibilities establishes what
happened during150000, and the confirmed timeout mismatch takes priority.

## Smallest useful next change

Fix the two navigation deadlines against the already pinned 60000 ms contract
before another disposable attempt. Add one focused assertion to the existing
coordinator tests that generated navigation arguments satisfy that bound and
that native/bridge/host deadlines remain ordered. The installed163000 fixture
dispatch checks did not enforce the upstream input bound. No new test matrix or vendor
patch is needed.

The root agent implemented this minimal fix for candidate180500 during the
review: native/wire/host navigation deadlines are now 50000/60000/70000 ms;
observation remains 10000/20000/30000 ms. The existing fixture now checks the
pinned wire bound and deadline ordering. Root reports the regression failed
against the prior code and all 17 focused tests pass after the fix. These are
source/offline results. Publication, installation and a fresh disposable live
opening remain separate release work; this research performed none of them.

Keep the consumed historical operation and its accepted unknown effects
unchanged. Retain fixed diagnostics on the next separately authorized attempt.
If it reaches native execution but fails during restoration, use the existing
observation-only action only while its non-orphan eligibility checks pass.
Otherwise retain the failure and use the supported owner-termination retirement
path; observation does not bypass quarantine. Do not replay
navigation, broaden the URL grammar, adopt another window, suppress native
restoration, or change compatibility pins to get past a refusal.

## Source identities

Hashes were read from the installed163000 package and the external pinned
files, not inferred from a version label. Facade paths below are relative to
that package. Upstream paths are relative to `/root/work/easyeda-mcp-pro`.
API/UI/app paths are relative to the EasyEDA application directory.

| File | SHA-256 |
| --- | --- |
| facade `server/src/current-disposable-open-runtime.ts` | `f820a6b67a1718c8079552e3bfb1e7bc54ab58708e178cbb9638ced074d041fe` |
| facade `server/src/current-disposable-open.ts` | `1b6499b5d4d24025259a7d3c9a4783c98e2b13200ca32d4b5659bb32f8981180` |
| facade `server/src/core.ts` | `f536d9adae3fd0177718e9d6d1e10d68627ad8a9ee29266487d55305e05fb9fb` |
| upstream `dist/index.js` | `3df04439d08d15459ddc57c2947e8fec43e71c87f411db670b656318cf98a2b4` |
| upstream `dist/tools/L0_diagnostics_api.js` | `3e38c56f61b760f1edd98db30c9c62c92b82e7329c3eb3aff86604ce14ccd2de` |
| upstream `dist/tools/registry.js` | `d0c36efa3a2ae72f06cc3651599fde92dc7d3cbc72f653b867eaadd10221396b` |
| upstream `dist/bridge/manager.js` | `4ec4b18dbbc3903442fb9b691275ce8f5e864f2929f5ee313053e42a8298f88d` |
| upstream `node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js`, 1.29.0 | `a5caaddfa0f6aadea64604aa57136bab6540298b846bbe861a80bf7392ae5aad` |
| repo bridge `easyeda-bridge-extension/src/index.ts` | `1830f1c52619f089fe809b8f1da63ae1344996b858c34b42078dc9f306c49ed8` |
| `assets/pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `app.js` | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

The repo bridge hash describes reviewed source, not a new proof of the
historically loaded private extension. Earlier routing details remain in
[the opening research](2026-10-14-current-disposable-open-research.md) and
[the URL/diagnostics review](2026-10-14-current-open-diagnostics-research.md).
