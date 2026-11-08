# Foreground tool argument files

The original controller observed a complete fingerprint request truncated by
canonical PTY input to 4,096 bytes. JSON rejection reported `dispatched:false`
and left the original manager active. This source change starts from
`0169ed8d`; it does not change that running manager, terminal or selected payload.

Both maintained foreground clients accept a strict tool-call-only
`argumentsFile:{path,expectedSha256}` selector, mutually exclusive with inline
`arguments`. The file contains the ordinary tool argument object. Its original
bytes and selector line share the existing 65,536-byte input bound. Manager
control and original-cleanup selectors cannot use file input, and the facade's
tool catalogue, operation gates and cleanup ownership remain authoritative.

The reader opens one nonblocking, no-follow descriptor. It requires a canonical
owner-only `0700` parent and an owner-only `0600` regular single-link file.
Named and descriptor metadata must agree before and after the bounded read,
including inode, device, size, mode and nanosecond timestamps. It checks the
complete length, trailing byte and SHA before strict UTF-8 and JSON decoding.
The decoded ordinary arguments are retained for dispatch, original cleanup and
the private call intent. Actual input bytes enter the existing budget reserve.
There is no automatic reload or retry.

A private admission latch lets the stdin driver wait for local file validation
before identifying the existing pending-capture side lane. Inline requests keep
their synchronous admission ordering. The first manager run exposed an initial
regression in that ordering: 39 cases passed and one existing original-cleanup
case failed. That failure is retained. The implementation was corrected without
changing its assertion. The first strict lint run also failed on new source and
test style issues; the corrected final run is separate.

Final checks used Node 24.18.0, zero soft core limit and test isolation. All
returned actual completed subprocess exit 0:

- All 57 cases in `control-session-arguments-file.test.ts`,
  `control-session.test.ts` and `control-session-manager.test.ts` passed with
  zero skips. Cases cover a short selector carrying complete 6 KB arguments,
  exact combined byte limits, malformed/hash/encoding/symlink/hardlink/mode
  refusals without dispatch, unchanged inline grammar and a real private stdio
  manager. Its pending capture remains controllable after file loading, and
  overwriting the file cannot change the original cleanup or retained intent.
- Both TypeScript configurations passed: the main project and bridge stubs.
- Type-aware Oxlint with `--deny-warnings` passed on all five changed source and
  test files. Whole-plugin lint and full suites were not run for this leaf.

Private logs and changed-source hashes are retained in
`foreground-argument-files-UMcm6p` under the implementation evidence cache. These
are filesystem and isolated stdio checks, not connected validation. No request
reached EasyEDA or the running controller. No Windows, C#, host MCP, helper or
native-owner action occurred.
No helper, pin, bundle, official version or current frontend changed. The new
input form becomes available only in a later verified frontend build.
