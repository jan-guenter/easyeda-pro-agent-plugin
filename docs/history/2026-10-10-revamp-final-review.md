# Independent review follow-up

The first revamp payload passed local checks, GitHub CI and an isolated installed
MCP probe. Independent review of PR8 then found three additional defects. The
initial installation is historical evidence, not the final release acceptance.
All fixes require a rebuilt, newly versioned payload and fresh checks.

## Exercise the actual marketplace startup path

The initial isolated installed probe started `server.mjs` directly. It correctly
verified the self-contained MCP bundle, but did not exercise `.mcp.json` startup.
That launcher imported TypeScript source and `zod`; Git marketplace packages have
no `node_modules`. An actual cached-source import confirmed `ERR_MODULE_NOT_FOUND`.
The earlier successful direct-bundle probe was therefore insufficient launch
acceptance. Do not compensate by editing an installed cache or relying on a
workspace's dependency tree.

The configured startup path now uses the existing self-contained server
bundle. A small entrypoint selects machine-profile launch before any MCP lease
or engine initialization, then uses the retained verified Node descriptor to
replace itself with the normal facade entry. Both startup stages use the same
PID. The existing atomic server/supervisor publication and three-file runtime
fingerprint remain intact; no separately published launcher bundle is introduced.
The trusted-checkout TypeScript script remains a developer wrapper, not the
marketplace runtime entrypoint.

Three packaging regressions launch the real built entrypoint outside the repo,
with no dependency directory, using a private synthetic profile. They verify
offline MCP enumeration/queries, pinned-runtime replacement, no upstream child
or bridge socket, and refusal before facade initialization for bad arguments or
missing profiles. All35 original adversarial build/publication tests still pass.
Final installed acceptance also must launch through the exact `.mcp.json`
command and arguments, not bypass them.

## Retain Node admission through launch

The machine launcher verified a Node executable, closed its descriptor, then
executed the pathname. Replacement between verification and handoff could run a
different executable. Profile loading also compared the expected hash after the
version probe, allowing a replaced executable to run with `--version` first.

The launcher now retains an `O_NOFOLLOW` executable descriptor through the final
kernel handoff. Its expected digest is checked before any version probe. The
bounded descriptor hash, canonical pathname identity, owner, permissions, link
count and metadata are rechecked. Final `execve` uses the retained procfs
descriptor, with no awaited work between final admission and handoff. There is
still one facade PID; stdio, signals and exit status are not mediated by another
owner process. Refusals close the descriptor.

Adversarial tests replace the pathname at the actual final `execve` boundary and
verify that the original executable inode runs while the replacement marker is
absent. Other cases cover hash mismatch before a version probe, symlink changes,
in-place writes, changed permissions/link count and descriptor cleanup. A real
handoff fixture checks PID, argv, working directory, environment, stdin, stdout,
stderr and exit status.

This closes pathname substitution, not every possible executable-content race.
An open read-only descriptor cannot prohibit a hostile same-UID writer from
changing its inode after the last observation. An absolute content-immutability
guarantee would require immutable executable storage. The plugin does not claim
that stronger guarantee.

## Distinguish timeout-shaped data from failed transport

The timeout classifier recursively inspected `result.error.code` even under an
explicit successful wrapper. Legitimate domain data containing `TIMEOUT` could
therefore quarantine an otherwise completed authenticated call.

Explicit success now shields descendant business data. It does not shield the
wrapper's own contradictory error, an outer transport failure, or a nested
explicit failure, unavailable result or unstable read. Bare and unknown-status
timeout replies, including legacy text-only JSON envelopes, remain ambiguous.
Exact native close/open deadlines also retain their no-repeat quarantine.

Tests cover structured and text envelopes, contradictory status fields and
nested wrappers. Authenticated in-memory dispatch fixtures prove exactly one
call: successful data ends the lease; real or uncertain timeout retains the
ambiguous-after-dispatch outcome. No raw error text is added to diagnostics.

## Classify upload barriers without exposing native text

Four fixed upload-barrier errors lacked native diagnostic classification. The
generated barrier now catches errors into a bounded allowlisted stage/code
envelope. Known original errors retain their meaning; unknown thrown values,
accessors and hostile proxies become a fixed `EXCEPTION` code without echoing
native text, paths or caller data. Legacy bare errors receive a generic native
preflight category rather than fabricated stage provenance.

The wrapper preserves host/context guards, RPC order, acknowledgment validation,
receipt format and final project proof. It adds no Save or navigation. Generated
program tests exercise initial/final project drift, exact known codes, unknown
private text and malicious error objects. Classification tests reject malformed,
overlong and unrecognized diagnostic envelopes.

Final combined test counts, compatibility projections, CI and installation
evidence belong in the [release validation record](2026-10-10-revamp-release-validation.md).
These are offline regression fixes, not new connected EasyEDA validation.
