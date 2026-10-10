# Disposable SDK read validation

`server/src/disposable-sdk-validation.ts` provides a reusable runner for connected
tests after a fresh chat has loaded the installed facade. It has no built-in
launcher, generic tool caller, raw JavaScript dispatcher, navigation or Save.
The caller supplies adapters to the already owned facade. Do not start a second
gateway to run these tests.

The default call is a dry run. It validates the complete plan and returns its
hash and fixed method list without calling any adapter. Execution requires
`mode: "execute"` and a facade adapter. An existing checkpoint must identify the
same disposable project path as the exact expected context. The runner refuses
production/category mismatches, missing runtime fingerprints, unknown methods,
wrong editor types, duplicate step IDs and more than 256 requests.

Before creating a plan, use the maintained tools in the fresh chat to identify
the sacrificial project, establish exact runtime/context, create its checkpoint
and capture its complete exact source. Do not use the user's real design
as a fixture. The runner does not create or open projects and cannot turn a
project into a disposable fixture through its label alone.

The plan schema requires these fields:

| Field | Evidence required |
|---|---|
| `schema` | `easyeda-pro-control.disposable-sdk-validation-plan.v1` |
| `fixture` | Category `disposable`, exact `projectUuid`, `projectPath`, and the literal attestation `This project is disposable and is authorized for SDK read validation.` |
| `expectedContext` | Exact `project.uuid/path` and `document.uuid/documentType/tabId`. Document types 1, 2, 3 and 4 only. |
| `expectedFingerprint` | Complete captured private runtime fingerprint. The actual facade independently verifies current admission for every read. |
| `checkpoint` | Existing `receiptPath`, original project-file `sourceSha256` and complete SQLite `sourceDumpSha256`. |
| `baselineSourceSha256` | The semantic hash from `parseDocumentSource` of the original exact source. It retains every design record and excludes only documented volatile DOCHEAD fields. |
| `steps` | Unique `id` plus the exact fixed SDK `{method, arguments}` request obtained from the offline `sdk-reads` catalog. |

The caller supplies three named adapter functions. `verifyCheckpoint` calls
`easyeda_control_checkpoint` with `action: "verify"` and returns its verified
structured result. `exactSource` calls `easyeda_control_exact_read` with the
provided source request, context and fingerprint. `sdkRead` calls
`easyeda_control_sdk_read` with the provided fixed request, context and
fingerprint. Read adapters return the complete evidence wrapper's `result`, not
a summary, truncated inline value or a guessed result extracted from text.
Use maintained receipt-bound artifact reads when a result is too large inline.

Each SDK read has its own sequence:

1. Verify the original checkpoint against the current source file, including
   exact path, original byte hash and complete logical SQLite hash.
2. Read the complete native document source twice through the exact reader and
   verify its identity, transport consistency hash and original semantic hash.
3. Record the one-shot request intent, then call that fixed SDK read once.
   The facade performs its normal two stable observations and runtime/context
   guards. The runner verifies the method, result schema and consistency hash.
4. Repeat the exact source and checkpoint checks. Only then record the step as
   completed and proceed to the next request.

An error, disconnect, inconsistent result, wrong owner, changed source, changed
SQLite data or failed evidence callback stops the sequence. The runner never
retries, continues after an ambiguous call, invokes recovery or chooses Save.
Inspect the original facade's journal/evidence before any further live action.
Its optional `record` callback can use the caller's existing exclusive evidence
mechanism. The returned summary does not contain raw design or native error text.

A completed run validates only those exact requests on that fixture and captured
runtime. It proves stable public observations and source/checkpoint invariance.
It does not validate a writer, every overload, arbitrary source shapes or a
save/close/reopen lifecycle. The checked-in mock tests exercise the runner's
guards; they are not connected EasyEDA evidence.
