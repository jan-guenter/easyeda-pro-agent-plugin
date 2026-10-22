# PCB rename: acknowledgment and persistence clocks

The installed184000 disposable case reached the native title-only writer for
the first time. Startup passed, including the dormant standardization-panel
guard. The native update acknowledged the requested title and ticket778.
Normal closure and the original process/Job termination were proved.

The stored-effect stage then refused its immediate-post clock assertion:

| Observation | Epoch milliseconds |
| --- | ---: |
| Armed Windows lower bound | 1792352534147 |
| Acknowledged document timestamp | 1792352535116 |
| Immediate post-return Windows upper bound | 1792352535206 |
| Persisted EDIT_HEAD backend timestamp | 1792352535625 |

The persisted timestamp is419ms after the immediate-return upper bound, but
inside the predeclared60-second backend window. The appended441-byte chunk has
SHA-256 `c9106c4491420c2e0e63e282492ff0ddac46e26fe625af78bb0768660fa8460a`.
The complete stored-effect verifier returned before the later clock assertion
refused; this does not make the failed lifecycle accepted or reopened.

## Source cause and future contract

Pinned worker `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`
has PCB `updateData` at1906142 awaiting `uploadLocal`. At2031184, that method
awaits the local cache write, then calls `bufferedUploadCloud` without awaiting
backend persistence. Its `bufferedStream` at2029648 schedules the upload through
a500ms timer. The backend `saveProjectHistory` transaction runs later in pinned
APP `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`
at2594412. Offsets are zero-based JavaScript string positions.

Native-return clocks bound the renderer observations, not the later backend
transaction. A future invocation can bound persistence with the independently
issued original termination clock, after validating the same operation, capture,
process generation, close intent and empty Job. Its before/after samples bracket
the termination check, so use the outer after endpoint, not the pre-check sample.
Preserve the original armed
lower bound, fixed pre-dispatch60-second backend window, exact SQL relation and
immediate-return renderer bounds. This is not arbitrary timing slack, a retry,
or proof that pending persistent uploads cannot replay on reopening.

## Retained outcome

Case `pcb-rename-184000-20261018-case` is terminal retired/plan-invalidated after
its offered original-owner cleanup. Recovery classification is unresolved,
`closed-effect-not-established`; no verification continuation exists. Never
resume the case, repeat the write, issue an extra Save or restore its file as
part of this diagnosis. No explicit Save, inverse or production access occurred.

The changed disposable raw file is598016bytes, SHA-256
`d82dd6ff22e8aac3e8f3cb9cb938badb9649feb76abb734eb2d376972540c70b`.
Retained snapshot28 is3760bytes/SHA `bf7ea3c59aad0af89a2c622ed9b5fe3784b5d0ea056f664909f800c5bbc0ed22`;
stopped29 is488121bytes/SHA `d0598d7e8302987d4c35b68ac5865c9d3ed2af5e59641b936c41e78ab4957f6d`.
Retirement intent31 is3015bytes/SHA `69840e5c9b1c1fcac036c306375895cf0e0904e3f0d7cfbb2244ce92cb07b9ab`.
Artifacts and prior copies remain local, unmodified and unpublished. A fresh
installed invocation still needs the complete closed-SQL, reopened metadata and
final-closure lifecycle before any connected-validation claim.
