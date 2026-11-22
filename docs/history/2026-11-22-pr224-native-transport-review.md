# PR224 native transport and installation review

This follow-up starts at reviewed prerequisite commit
`9b9065c055006b631980035f4d57c28d9f417bc0`. It addresses the ten distinct
native/helper and installation findings in the two CodeRabbit reviews
6013177916 and 6013179263. The inverse/Wire TypeScript findings have separate
owners. Nothing here establishes a connected Delete, Save or cold-reopen result.

## Corrections

- Installation now distinguishes saved host `features.plugins=true` from a
  per-invocation CLI override (`5b401290068188b42f99c583`).
- Both canonical transport clones retain a first failure when a socket write
  fails after any partial send, preserving the original thrown exception and
  blocking subsequent commands (`59422eb7b56b9f96c6ed2fc3`).
- TCP-table reads allow at most three bounded fetch attempts when Windows
  reports a larger required buffer. Each allocation is freed; the existing
  65,536-row/size/tuple checks remain (`c10daaa7640b1f1a80e57d32`).
- The fixed no-application anonymous-pipe smoke closes its own read endpoint
  on failed cancellation, then joins the original foreground writer before
  closing the write endpoint. Production cancellation custody is unchanged
  (`2902b533366b788d0850a4d2`).
- A successful original Main release is retained privately. If a later
  terminal-handle/installation close fails, only that same owner's remaining
  closes can continue, without replaying Main release. The original internal
  RetainUntilClosed loop uses the same retained terminal fact after root handles
  have closed; it does not require an invalid handle to re-prove exit. The first release still
  requires the original root/empty-Job proof. A live owner, unobserved release,
  JSON receipt or alternate owner grants no retry
  (`e8ce30af6d117913c23c9010`).
- Spatial phases consume only after shared physical-ID, live-purpose and
  encoding checks. Once a write may have happened, the ID/phase stay consumed
  and the channel failure remains sticky (`546c28a9383f36ede35695f2`).
- Both drivers reject remaining unbound arguments before compilation. Cold-UI
  retains its strict bound-parameter purpose allowlist
  (`881900eed87a82f9e1bd42bc`).
- The cold-UI error filter preserves only its four exact fixed refusal labels
  in addition to the existing bounded PCB labels; OS text remains suppressed
  (`1b434a3d77b47129d57e37c0`).
- Both request loops drain an oversized line with a bounded 32,768-character
  buffer, refuse the entire frame inside the request catch and keep original
  identity/cleanup commands serviceable. They never parse a truncated prefix
  (`46b2e6182d0e602bad4732cb`).
- Cold-UI pre-expands its fixed program markers once during static table
  initialization. Its 125-row wire digest is unchanged
  (`d55551483fc29a53e768dc91`).

## Source and generated identities

The canonical fork retains ancestor
`9db9d91e2116b5c6cbc9475d7dd79b680ea8af88` and its original helper/review
identities. Current input revision `reviewed-native-transport-custody.v3`
explicitly identifies these reviewed amendments. Maintained generators, not
generated payloads, consume the independently pinned canonical inputs.

| Output | Bytes | SHA-256 |
| --- | ---: | --- |
| V4 helper | 1,859,307 | `470881b1b8921a6cd654e48a8e293b0597c3681d16a16e0fb83924bf7d7f4358` |
| V4 compiler | 2,437,605 | `f51c3498a7fbe56f9011eccaf20bb1a49bfdac489da429cb83e15fb5d4e3c37e` |
| V4 review | 2,544,814 | `5e4c73862115208e2163431ed73c3a439e9c4b4fc3b5b671ccc62e6dadebfd17` |
| Cold-UI helper | 691,685 | `1a061bfe3c64ffeafbd64a0f52bb6d382c3978a08fdd34b3c3191bfda36768d5` |
| Cold-UI compiler | 1,010,039 | `29fde472f265627539ab97fd5cb5266dc16e0070ffc41a65d0cfa0ae833a3f6f` |
| Cold-UI review | 1,048,790 | `4934bf7fc4128d3db28996fc63be7bcde0c04acaa3b5ef5199489c085144ae87` |

All existing helper/compiler/review limits, native request budgets, owner
issuance gates and persisted result schemas remain unchanged.

## Verification and limits

Seven focused canonical-input regressions passed, with zero skips. Both
TypeScript projects and scoped type-aware strict lint passed. Maintained
generation reproduced both exact outputs.

Windows PowerShell 5.1 fixtures compiled both exact compiler payloads using
C#5, warning level4 and warnings as errors, with zero diagnostics. Only the
cold-UI data encoder was invoked from a production assembly; all 125 packets
retained digest
`9a20e52c51efc35dcbf8a0755a2690a31277a211673a655c05f18798fad43c61`.

The same fixture exercised actual extracted socket/TCP/Spatial/release methods
with inert managed dependencies (including recovery through the actual
RetainUntilClosed entry), plus the original anonymous-pipe smoke and a
failed-cancellation variant. It proved partial-send first-cause retention,
bounded TCP growth, no phase advance on invalid ID, permanent consumption
after an attempted failed write, one Main release across later-close failure,
and original writer exit before pipe disposal. These doubles issue no
production ownership.

PS5 fixtures exercised the exact entry guards, full request loops and error
filter with inert owners: unsupported unbound arguments refuse; a 32,769-unit
frame receives a fixed null-ID refusal followed by a valid original identity
reply; the four fixed cold-UI labels survive and arbitrary OS text does not.
The initial test mistakenly supplied a string that bound an optional argument;
its failed log was preserved, the fixture was corrected to use genuinely
unbound arguments, and the PowerShell-only checks passed. A later wrapper
inherited StrictMode Latest into a driver that does not enable it; that wrapper
failure was also preserved. The corrected framing fixture uses the actual
driver scope semantics and passed without changing production source.

No application, production owner, SDK mutation or Windows setting was touched.
Compiler temporary artifacts were removed after the original fixture process
returned; compact source/hash/log evidence remains private. These are offline
regressions, not connected lifecycle qualification.

An earlier build overlapped the final terminal-loop correction and refused the
changed canonical pins. Its log is preserved as superseded; final verification
uses the frozen regenerated sources below.

Final frozen-source checks passed: complete maintained build and both exact
generator checks, facade/bridge types, scoped strict lint, bridge lint, coverage,
repository/MCP/skill validators, package dependency closure, 151 registry
signatures, 42 attestations and audit with zero vulnerabilities. All three
runtime bundles reproduced the prerequisite bytes exactly; only the two
changed native identity modules and allowed source projection/review time
changed in compatibility metadata. No version, runtime route or external pin
changed. Exact-commit CI remains responsible for the full suites.

## Malformed-envelope classification follow-up

The review of the retained StrictMode fixture led to an additional hardening:
window-failure classification now captures only a present string action from
the current request property collection. Null, oversized or parsed missing-action
envelopes cannot throw another property error from that catch. Normal dispatch
and its exact field/purpose guards are unchanged.

Both full driver loops passed a PS5 StrictMode Latest fixture with an oversized
frame, a parsed request missing action, and a following valid identity request.
The inert owner and all real purpose flags were initialized explicitly; earlier
fixture setup failures remain in private logs. The fixed errors remain bounded,
with no caller payload or OS text included. The canonical-input regression also
checks the null/type/own-property classification and absence of direct action
dereferences in that error block.

Only driver/helper identities changed in this follow-up; the two C# compiler
and review hashes above are unchanged. Current helper pins are:

- inverse-native-continuation.v4: 1,859,703 bytes, SHA-256 `9bdc4cd17a1e8f80c3e1269c2049d42a8f0c898a4fa670263ed35a13f32f24f5`.
- inverse-native-delete-cold-ui.v1: 692,081 bytes, SHA-256 `968c4101ca2066f4c295a8ecee3dacca851fcefb593ef2ae71619cf0587b783c`.
