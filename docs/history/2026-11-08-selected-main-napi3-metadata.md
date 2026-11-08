# Selected Main N-API3 constructor metadata

The selected Main decoder keeps its historical constructor-three-field and
proxy-two-field paths unchanged. A separate complete N-API3 metadata profile
matches only the fixed Database or Statement role and one of two exact cores.
The profile is descriptive. Original module/import/constructor identities and
the retained v2 descriptor capture remain the binding proof. No constructor,
SQL, resume or native authority comes from metadata alone.

The installed sqlite3@5.0.2 package declares N-API3 and node-addon-api `^3.0.0`.
Its complete Database source has eight instance methods; Statement has seven.
The retained official node-addon-api3.0.2 header's `ObjectWrap::DefineClass`
calls `AttachPropData`, which attaches one datum per nonstatic instance method.
For NAPI_VERSION<5, `AttachData` creates an anonymous symbol and External with
`napi_default` descriptor flags. The accessor branch sits inside the
`method != nullptr` condition, so Database's `open` accessor adds no symbol.
These are source-defined counts, not a tolerated count range. Sources:
[sqlite3 Database](https://github.com/TryGhost/node-sqlite3/blob/v5.0.2/src/database.cc),
[Statement](https://github.com/TryGhost/node-sqlite3/blob/v5.0.2/src/statement.cc),
[node-addon-api3.0.2](https://github.com/nodejs/node-addon-api/blob/v3.0.2/napi-inl.h).

Complete retained source identities are:

| Source | Bytes | SHA256 |
| --- | ---: | --- |
| sqlite3 `database.cc` | 21833 | `3778713244ecacaef7f6b75537d5c00e1cab28a79a7298d34729a9f5e115f979` |
| sqlite3 `statement.cc` | 29337 | `7a12e9fd6efc9873025429cd9d86842ee01b4f0e730bda0402053900d30a94d0` |
| node-addon-api `napi.h` | 102364 | `0210886aa663479fb287fdbcbefaafaed34a1712c8524dbe7e3be6c720e36468` |
| node-addon-api `napi-inl.h` | 166679 | `63dce38fcf342c60333769baa7f301f9c59b91e9d9060e139a11bda6dfc9e676` |

The same locally built addon, without constructing either class, produces two
complete Inspector shapes. Node24.18/V8 13.6 has the ordered core
`length,name,arguments,caller,prototype`; Node26.12.1/V8 14.6 has
`length,name,prototype`. Official Node26's V8 factory wraps both legacy
arguments/caller fields in `V8_FUNCTION_ARGUMENTS_CALLER_ARE_OWN_PROPS`, while
the Node24 source adds them unconditionally. Each core is checked as a complete
tuple. No independently optional arguments/caller fields or count ranges are
accepted. See the version-pinned [Node24 factory](https://github.com/nodejs/node/blob/v24.18.0/deps/v8/src/heap/factory.cc)
and [Node26 factory](https://github.com/nodejs/node/blob/v26.12.1/deps/v8/src/heap/factory.cc).

Both variants require zero arity, the exact role name, exact flags and ordered
core fields, then exactly eight or seven anonymous-symbol rows. Each symbol row
must be own, nonwritable, nonenumerable and nonconfigurable, with an actual
symbol CDP record. Symbol handles and opaque-value handles cannot repeat within
the packet. The parent is native Function and the complete scope list is
`Scopes[0]`; extra properties, accessors, mixed cores, flags, scopes or rows
refuse. CDP describes each External as an opaque Object. This validates only
that metadata shape, not its native payload identity. JavaScript identity is
retained separately by the actual source capture, rather than inferred from
handle strings or repeated `Symbol()` display names.

The two checked-in fixtures preserve complete actual packet order, values and
flags. Only objectId strings are replaced by stable fixture labels, preserving
alias relationships. The raw Node24 packet SHA256 is
`e302f5edf90755fad7acceaced8b79129c5f1fc1b3df886b6d0b18085e306483`;
its normalized fixture is
`3aa749632e9119daade8939ffa0b5ff54232dbad41be6d01d3cefadd21459081`.
The raw Node26 development result, including its original held frame and worker
exit, is `0c69cd912f395e2ad598e57f2001aaae51469529e76601e0cc0098bf1053ded6`;
its normalized metadata fixture is
`2a3739dbfac4fb1d4c4dd6fb9fe21f833825c6e96a20f147d908d96b25ec0dd7`.
The initial core5-only development profile correctly refused the Node26 packets;
that refusal is retained before the source-backed second profile was added.

Unknown metadata shapes now throw source-issued errors with a private original
failure getter. The finite code contains only role, bounded own-field count and
a normalized shape SHA prefix. The normalized vocabulary includes descriptor
flags and known metadata categories. It excludes handles, unknown field names,
unknown descriptions, arbitrary values, source paths and native payloads.
Copied Errors, matching messages and accessors cannot issue the code. Root owns
the original runner catch integration; this leaf changes no runner, Core, pipe,
native commands, counts, flags, helper, pin or bundle.

The exact test worktree is
`/root/work/easyeda-pro-agent-plugin-fixture-import`, based on `6ba3c85f`.
The final runtime/test payload is sealed before final checks under the private
`selected-main-napi3-profile-20261108` manifest, with patch, new files and logs.
The source/addon/worker inputs and official runtime-source provenance remain in
`main-sql-capture-real-napi-20261108`. Focused decoder and legacy-runner checks,
both TypeScript configurations and strict changed-file lint are recorded for
this sealed payload. Exact final source-derived N-API probes run at the original
after-import point; their original workers exit normally. No Database/Statement
constructor, SQL or application method runs. Node26 remains an unsupported
diagnostic analogue. The actual Windows header/build identity and metadata
remain unobserved; matching the fixed complete profile is required at runtime,
and every unsupported shape still refuses. This is not Windows/app validation.
# Original runner failure integration

The coordinating runner now accepts the decoder's private failure getter before
its generic transport fallback. A matching Error message or supplied data cannot
issue that code, and the hook reads no Error properties. Its existing result
schema, request budgets, pause/resume gates and cleanup remain unchanged.

All nineteen runner integration cases passed with no skips. The new malformed
Database case retains its bounded role/count/shape code while refusing before
capture reproof or startup SQL. Only the two prior source continuations occur;
no diagnostic value from the synthetic private field is exposed. The check used
canonical `a15d976a` plus the two coordinating runner/test edits. Complete frozen
batch types, lint, native generation and live admission remain separate.
