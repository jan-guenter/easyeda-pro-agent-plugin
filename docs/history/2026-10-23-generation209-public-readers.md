# EasyEDA 3.2.209 public language and viewport readers

Source review and implementation on 2026-10-23. These observations do not claim
connected execution or design access. The new route is restricted to the exact
3.2.209 public-utility profile; it does not expose the legacy SDK executor.

## Reviewed sources

The installed API is `0.3.59.1ca9efb5`. Its `api.js` is 1,980,754 bytes with
SHA-256 `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1`.
Its `api-types.d.ts` is 1,814,791 bytes with SHA-256
`0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72`.
Both hashes match the separately admitted 209 utility profile. Offsets below
are JavaScript UTF-16 string indexes into the complete reviewed `api.js`.

- `getAllSupportedLanguages` at 1,847,860 copies the ordered 52-entry `d2` array
  at 1,845,521. No current-language lookup, settings write, UI RPC or translation
  enumeration occurs. The public declaration returns a string array, as does
  the [official method reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.getallsupportedlanguages.html).
- `isLanguageSupported` at 1,847,901 calls `Ou` at 1,846,324, then `Os` at
  468,267. The latter uses exact array membership. Case folding and alias
  normalization are absent. `en` and `zh-Hans` match; `EN`, `zh-hans` and `zh-CN`
  do not. This implementation detail narrows the declaration's string-to-Boolean
  contract. The [official reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_i18n.islanguagesupported.html)
  also distinguishes the supported `zh-Hans` spelling from `zh-CN`.
- `getViewportSize` at 1,893,138 synchronously returns the API window's
  `innerWidth` and `innerHeight`. It does not read an OS window or a schematic/PCB
  canvas. The [official reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.getviewportsize.html)
  describes page-viewport width and height in pixels and marks availability
  since EDA 3.2.162. The facade labels these CSS pixels; it supplies no scale,
  screen-coordinate conversion or editor-readiness claim.

A read-only installed-source check independently compared all 52 ordered
language identifiers with the new facade constant and checked the five exact
method/helper bodies after verifying the complete implementation hash. All
comparisons passed. No installed API code ran during that check.

## Implemented contract

`sdk-public-readers.ts` supplies three strict request variants, offline method
descriptors and argument validation, fixed generated programs and independent
result validation. Language queries accept 1-64 ASCII letters, digits, hyphens
or underscores without changing their spelling. The catalog reader requires
the complete ordered 52-entry result, and membership results must agree with
that same reviewed list. Neither function changes the application language.

The viewport reader accepts only exact width/height data objects with integer
dimensions from zero through 1,000,000. Negative zero, fractional/non-finite
values, missing or additional fields and accessors refuse. Zero is preserved
and is not interpreted as visibility or readiness.

Each program calls its one public method twice synchronously, copies each
complete result before the next call and retains the same namespace/method
identities. The viewport program also retains its execution-window identity.
These are sampled runtime checks, not native renderer ownership or atomic layout
proofs. The complete transport and final response must fit within 8,192 UTF-8
bytes. Refusals do not truncate results or retry the method.

`sdk-public-readers-runtime.ts` reuses the common authenticated utility identity
checks and explicitly rejects the selector's older 206 branch. It dispatches
once through the retained bridge owner, with quarantine checks and complete
before/after fingerprint comparison. It creates no client, launch owner or
project context. Registration, offline discovery and successful synthetic
execution remain separate from connected validation.

## Focused verification

The 13 focused tests passed with the isolated Node 24.18.0 test preload. They
cover all three generated programs, case-sensitive membership, complete catalog
and viewport shapes, copied observations, owner replacement, asynchronous and
malformed replies, 206 rejection, quarantine, post-dispatch identity changes
and no-retry behavior. An extracted production registration test checks strict
nested schemas, serialized forwarding and refusal propagation. The offline API
test checks the catalog and argument-validation actions end to end.

Targeted strict type-aware lint and full TypeScript checks passed before final
batch integration. Full frozen-payload validation, release/install evidence
and connected execution belong to the containing batch's separate record.
