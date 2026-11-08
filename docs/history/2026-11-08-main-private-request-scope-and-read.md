# Original Inspector scope wrappers and fixed private request read

Actual local Inspector scopes expose two different views. `getProperties`
lists the virtual lexical bindings, while `callFunctionOn` receives an object
with exactly the own data fields `description` and `object`. The new fixed
private-bind adapter requires those original wrapper shapes and all three
exact descriptions, rejects Proxy/accessor/extra-field substitutions, and
passes their own `object` data to the unchanged original bind consumer.
There is no direct-holder fallback or additional RPC. The genuine request and
SQL captures remain private owner provenance; arbitrary Proxy capture safety
is not inferred from this adapter.

The original true-flag request read also refuses on the native
`Function.prototype[Symbol.hasInstance]` dependency under local Node 24
Inspector execution. The fresh Set, destructuring, array spread, and captured
native Proxy checks each pass independently. A real local Node Request's
method getter and both bound/unbound has-instance calls exhibit the same
true-flag refusal. The separately reviewed fixed private-read phase uses the
unchanged read function with false. The historical read program and its true
grammar remain byte-exact. Getter, brand, constructor, wrapper, descriptor,
and module checks still run before and after the selected getter.

Actual local Request execution through the fixed wrapper adapter and unchanged
read returned POST and the exact primitive-data packet. A wrapper accessor,
request Proxy, changed method getter, and changed brand each refused without
calling the forbidden fixture hook. Restoring them permitted POST again.
The local builtin is a different full-source variant: 757,505 bytes, SHA256
`05f87600c129195c685f43f6a90e5fb37316f1804ef1a881cfdb3ead7a672273`.
Its target-profile qualification refusal is retained; no production source
profile or location is broadened. The exact method and brand bodies match.
This proves local execution behavior, not target ownership, heap invariance,
SQL persistence, or a connected writer lifecycle.

The adapter measures 8,283 UTF-8 bytes / 8,599 JSON bytes. The complete checked
tracked tree is `4eb50607aa8f7199a658a17934c502376a796771`, including Root's
three-file private integration patch
`ec57ffc0936f7e53d56765b7554e80db2d72e9fc8c8072c1b926b6fb3d3a291e`.
This record was added afterward. Final Node 24.18.0 / npm 11.16.0 checks
observed exit zero for 34 focused tests / zero skips, both TypeScript
configurations, and strict type-aware lint on five changed files. The first
lint run's import-order error and the initial source/scope refusals remain in
private evidence. Root's three production integration files are excluded from
this companion commit. No application, C#, Windows, native owner, MCP, SQL,
or resume action occurred.
