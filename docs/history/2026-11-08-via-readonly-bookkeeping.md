# Readonly Via bookkeeping and closed storage prefixes

This source leaf completes the known Via bookkeeping adaptations following
the six captured-frame pairs. It adds 32 closed `Runtime.callFunctionOn`
alternatives and mounts them in the three actual observers. Every target
program keeps `throwOnSideEffect:true`, `awaitPromise:false` and
`userGesture:false`. Legacy programs, rows, flags, wire bytes, native owner
code, original step grants and callback clocks remain unchanged.

| New phase | Fixed roles | Argument changes |
| --- | --- | --- |
| `via-main-begin-bookkeeping` | save, transaction, returned | None |
| `via-main-history-bookkeeping` | callback, branch, branchValue, writer, encryptEntry, cipher, cipherValue, sqlValue, sqlCallbackValue, commitReturned, projectReturned, saveReturned, controllerReturned | None |
| `via-main-structure-bookkeeping` | selected, selectedValue, update, rowsValue, exec, runValue, callbackValue, updateReturned, serviceReturned, controllerReturned, response, responseValue, finalSelect, finalEntry, finalReturned, finalValue | None |

The existing SQL run/callback roles retain their separate captured-frame
phases. Structure invocation, context, contextJoin, controller, query and
connection keep their original joins because their executed paths do not
perform the rejected copies. Keeping controller legacy also preserves its
original native body-marker path. Both variants use the same consumed-frame,
original-argument, spent-attempt and result-retention ledgers. Normal request
caps remain BEGIN 19, history 88 and structure 74, with no new request slots.

## Fixed copies and review correction

The same closed 26-form object-spread catalogue applies to the new bodies,
with fixed 13/15/19/2/5 replacement counts by source family. Two additional
exact history expressions replace `Object.fromEntries` with fresh field-copy
loops. Their callbacks still use the original `own()` reads, so the final
descriptor verification covers the same fields. Unknown forms, helper-name
collisions, duplicated patterns or census drift refuse before a program is
issued. No false readonly flag or live actor JSON exception was introduced.

Peer review found a real semantic gap in assignment to fresh scratch results:
an inherited setter/non-writable property differs from the own-data creation
performed by spread/fromEntries. The corrected shared writer refuses inherited
accessors/non-writable fields before assignment and verifies the exact own
writable/enumerable/configurable data descriptor with `Object.is` afterward.
It also requires the standard fresh-result/Object.prototype chain. The fix
hardens the earlier six rebase programs. A separate actual Inspector probe
confirmed that fresh `Object.defineProperty` is rejected under the true flag,
so that alternative was not used. Private-realm state/field regressions prove
zero setter hooks and conservative refusal; unchanged legacy copies still
produce their original result under the same synthetic drift.

Actual Node 24.18.0 Inspector checks pass for all five BEGIN consumers, seven
history consumers including both field snapshots, all 16 new structure
consumers and the three retained structure controller/query/connection joins.
The test helper executes fixed functions in each original inert VM realm with
actual object-reference arguments. API/getter counters stay zero. The actual
extracted BEGIN observer stops before joining after a lost next pause or
malformed frame. The real BEGIN custody still completes in exactly 19 requests
and refuses version/capture swaps or duplicate inflight reads.

## Fixed storage data

`current-pcb-via-main-program-storage-prefixes.ts` exports ten immutable
original/adapted helper prefixes with raw and JSON-escaped length/SHA metadata.
Every header/body cutpoint has a fixed census. The escaped NUL-joined table is
explicitly pinned to 10 rows, 65,148 bytes and SHA256
`419e62504f9d81a44caf2fcce570e5ae2c28acf0899f1667e95858ec74aa76bc`.
It remains below the unchanged 65,536-byte table ceiling. The original
completion helper is exactly 7,393 bytes with SHA256
`52f1fa754dd9b420d3f84549a56514ea2ac9e3e3c70c7bec2366539cfd1c87e3`;
its adapted helper is 7,640 bytes with SHA256
`595a2fdfb69da7842f743d4fe1e3c5d022c0deaf2f9981083d5616ab64d12cb0`.

A focused consumer test substitutes/restores these prefixes in every one of
the 242 actual Via native wire templates. Every prefix is used and every
original wire byte returns exactly. The module supplies data only. Root owns
purpose-specific storage/decoder integration, historical-parser preservation,
final composed size checks and C#5/CompileOnly proof. Raw generated Via source
grows by 85,830 bytes before that integration; no compiler ceiling is raised.

The first structure Inspector test omitted responseValue from its synthetic
fixture schedule. The actual response consumer was added, then all selected
roles passed. Initial full types exposed missing parent Main protocol/export
dependencies. Root's coherent `8b05ddda` and `0f0860d4` companions were picked
separately; neither belongs to this leaf's diff. Focused source and actual
Inspector evidence is separate from connected EasyEDA, native compilation,
original Job/owner enrollment and durable lifecycle proof.

Final verification passes 27 focused Node cases plus the one 242-wire storage
consumer, with zero skips. Server/stub and bridge source/test TypeScript
projects pass, as do strict changed-file lint, repository, MCP-contract and all
seven skill validators. No complete suite or extra C# campaign was run.

No Root Runner, Core, pipe, SQL-fence, native sender or generator file was
edited by this leaf. No MCP, C#, Windows/app actor, project, SQL, Save,
installation, publication, CI or user CAD action was performed.
