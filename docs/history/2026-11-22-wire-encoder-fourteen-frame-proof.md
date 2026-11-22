# Wire encoder fourteen-frame proof

The independent C# 5 encoder codebook now accounts for the exact UTF-8
bytes of every accepted frame, including its terminating NUL. The
aggregate limit of 19,618 bytes derives from one maximum source request,
12 maximum metadata requests and one maximum membership request. The
unchanged per-frame cap is 16 KiB. Its smoke verifies the length and
SHA-256 for all 14 frames and checks their cumulative byte count. Invalid
requests and calls after the final membership row still refuse.

The focused fixture passed both pinned schematic bundles through the
[retained V5 source framing](2026-11-22-wire-encoder-original-source-receipt.md).
It supplies synthetic plan ownership and Inspector handles to the actual
typed peer reader. The 12 descriptor replies retain the exact upload
method descriptions and locations from each bundle. The reader generates
the expected fixed membership request. Replaying each resulting
14-request transcript through the independently compiled C# 5 encoder
matched every frame length and digest, with 6,537 encoded bytes per
fixture.

The existing V5 owner still needs a fixed binder for the original
before-graph, the original handler source-map pointer, the retained
reflection tuple and all six ordered peer handles. The mounted globals
and title lanes reserve their own commands and polls. The encoder needs a
separate native dispatch, poll and event reservation, including custody
and reproof of the original membership helper's generated script. The
already charged title source receipt cannot consume the first request in
the source-first C# cursor. Connected encoder execution and the later
natural encoding, worker, Main, SQL and Save evidence remain pending.
