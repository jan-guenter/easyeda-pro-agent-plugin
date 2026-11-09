# Fixed nested Main joins without a free util binding

The request reader now captures the six original driver operands that remain
available in its nested closure. One fixed call normalizes those operands with
the original SQL capture and invokes the unchanged nine-slot request capture.
The existing capture metadata read supplies its own seven-slot legacy frame to
the original Fetch/legacy wrapper checks. This keeps the first Fetch observation
at 18 requests and adds no normalization RPC.

Saved registration has three corresponding fixed fused calls. Bind receives
three independent inputs: SQL capture, startup tracker, and selected path.
After-exec and opened receive the SQL capture and original registration tracker.
The original Date identities, SQL checks, source checks, and await order remain
in the unchanged consumers. The absolute registration ceiling stays 32. The
historical ten native templates retain their exact prefix checksum
`3724ba9e3d16e0033b97bf5b5696ac66866cbbe166b8476eb7be0ddef49379e2`;
six new registration templates are appended.

Actual local Node 24 Inspector execution rejected the fused driver, original
bind, and original rebind with `throwOnSideEffect:true`, then accepted each
unchanged function with the false flag. Their writes are limited to fresh
Inspector descriptor arrays, snapshots, state fields, and freezing those new
objects. No application hook ran. The new fixed bookkeeping phases use false;
the historical capture/bind/rebind/read vocabulary keeps its true flags. The
separate read probe also refused with the true flag in the synthetic Fetch
realm. No false-flag read was performed or authorized by this change.

The four fused functions are 9,299 / 12,755 / 10,897 / 11,015 UTF-8 bytes.
Their largest JSON string field is 13,302 bytes, below the unchanged 16,384-byte
limit. This is a source-row measurement, not a compiled-helper capacity claim.
There was no C#, Windows, application, native owner, MCP, SQL, or resume action.

The complete checked tracked tree is
`5c9b7ed59f8f315af74e52c1c3c30db032f2b0c7`, based on `04a793a3` plus
the test-only `6818e4a5` checkpoint and Root's three-file integration patch
`be4b42024f760b3debd32495161e1e58fa126166f09dd1200bfe72a71e2b7b29`.
This record was added after that seal. Final Node 24.18.0 / npm 11.16.0 checks
observed exit zero: 57 focused tests, zero skips, both TypeScript configurations,
and strict type-aware lint on eight changed files. Initial lint failures and
the local Inspector harness/refusal evidence remain in the private
`main-captured-scope-fused-joins-20261108` evidence directory. Root's three
production integration files are excluded from this source leaf's commit.
