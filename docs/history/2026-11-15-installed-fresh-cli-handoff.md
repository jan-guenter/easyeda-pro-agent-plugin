# Installed fresh-CLI handoff

PR [213](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/213) merged
reviewed head `92229567253e258577f792029e7dad92a65d3e14` as
`ced687c65e262859a95ee7e36c2c9374dd7d846c`. All thirteen exact-head CI checks
passed, CodeRabbit reviewed that head, and both reported review threads were
resolved. The merged tree matches the reviewed tree.

The official marketplace workflow installed
`0.3.0+codex.20261115160744` on Linux and Windows. Full verification compared
5,073 files, 47 directories and 98,270,791 bytes with the merged public
plugin subtree `1f763c0f1cfeabd27bec384499c8d9ffc71ea799`. Linux also checked
exact POSIX modes; Windows byte/link/path verification makes no POSIX-mode or
NTFS-ACL claim. The maintained Windows configuration command selected the
verified Linux package without changing WSL disks or distribution settings.

## Metadata-only fresh client proofs

Fresh Codex CLI 0.168.0 app-server clients completed on both hosts. They
initialized an ephemeral read-only thread, selected only the intended plugin
server, and directly called loaded-facade, session inspection, retirement and
close-retired. No model turn, ordinary status, native allocation, bridge or
project operation was involved. The app-server remained alive through closure.

Both `threadId` and `serverName` must be supplied to
`mcpServerStatus/list` for this CLI version's actual thread-server snapshot. A
thread-only list can use temporary discovery and does not prove that the
thread's callable connection has the same tools. Direct
`mcpServer/tool/call` uses the server's bare tool name. Preserve the full
JSON-RPC result and its `structuredContent` before displaying it.

The successful proofs retained original Linux pidfds and namespace file and
ancestor descriptors before retirement, required explicit retirement and lease
release acknowledgments, then observed the original facade's exit. The Windows
proof also retained the original CLI-lineage process handles and observed the
original Node and WSL children exit. Both clients and their observers closed
normally. A pidfd exit observation alone supplies no Linux exit code.

Earlier discovery/observer failures remain in private evidence. They were not
replayed as design operations. No signal, lease edit or installed-cache patch
was required. This proves a fresh metadata connection and supported cleanup;
it proves neither desktop-tool refresh nor native/runtime admission. A later
fresh source agent independently received the latest installed MCP tools.

## Subsequent runtime finding

That agent's ordinary status call passed local integrity checks but failed
before upstream PID admission. The retained stderr matches the exact source
literal `bwrap: setting up uid map: Operation not permitted`. The
metadata-only success above does not cover this nested-user-namespace failure.
A separate inert comparison reproduced the failure with outer UID zero and
zero capabilities, and succeeded with a caller-owned nonzero outer UID while
retaining zero capabilities and read-only captured files. The runtime fix and
its own admission evidence remain separate work. No EasyEDA process launched
during this failure.

Source-only guidance now obtains an ordinary connection's PID from offline
loaded-facade, rather than starting upstream status merely to find a PID. The
startup-conflict stub instead returns its own PID from its session inspection.
The two contracts retain their own supported closure paths.


## 2026-11-16 pre-dispatch status retirement correction

A subsequent installed Windows-client status refused in the existing read-only
journal-admission preflight, before diagnostic scanning, upstream startup or
its status handler. The original facade's native-owner retirement guard passed,
but the earlier status callback had permanently ended both existing reference
classifications. Retirement therefore unnecessarily reached unrelated historical
journal qualification. The refusal and its original cleanup evidence remain
retained privately; this correction does not reinterpret those journals.

The source correction adds a separate monotonic private callback classification.
Only source references and status callbacks whose original fixed admission
preflight refuses retain this local retirement route. Every admitted or queued
callback must settle first. Successful preflight revokes eligibility before any
diagnostic, upstream or status-handler work; missing, repeated, detached or
reentrant preflight hooks and every other non-reference callback remain strict.
The prior reference and historical-metadata classifications are never restored,
and the existing historical coordinator route is unchanged. Native custody is
still checked before the local retirement decision. Status and CAD admission,
errors, result schemas, authority-close ordering and lease acknowledgments are
unchanged; failed retirement does not authorize connection closure.

Focused isolated regressions cover the actual SDK callback and status wrapper,
queued and pending callbacks, native-first retirement, foreign callback history,
strict journal fallback and normal retired closure with independent original-child
exit observation. The original unreadable design and unrelated future diagnostic
journals remain byte-identical. These are source and isolated-process proofs,
not connected native/runtime admission. Facade and bridge TypeScript checks and
strict type-aware lint accompany the focused checks; final payload build, pins,
complete CI and installation remain the enclosing release workflow's work.

The two focused files passed all 33 cases on Linux x86_64 with Node 24.18.0,
npm 11.16.0 and soft core limit zero. Both facade and bridge TypeScript checks
passed, and the four changed TypeScript files had zero type-aware lint warnings
or errors. An earlier passing run used Node 26.13.1/npm 12.2.2 and is retained
only as non-target evidence; it does not satisfy the pinned-runtime checks.
