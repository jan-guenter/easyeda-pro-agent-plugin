# Isolated official CLI execution

This follows the [static applicability research](2026-11-06-official-cli-applicability.md).
The official Linux archive identifies application `4.1.97.04b092ac`. Its complete
365,745,749 bytes have SHA256
`106133757742048009973b034ff2455a70226b6950241ed65ca334cf26f19071`.
The extracted, normalized runtime contains 580 regular files and
1,117,239,610 bytes. Archive CRCs, file hashes, the complete roster and single
links were checked. The publisher's cryptographic signature was not verified.
No installer, Windows installation, account or existing user profile was used.

The [official AI guide](https://github.com/easyeda/easyeda-client-cli/blob/5452c638fca802ea29e27277479a56d869feb10a/cli-for-ai.md)
warns that commands evolve and directs readers to actual installed help. The
actual package's command help was therefore checked separately from its static
declarations. CLI command tokens must precede the Chromium flags in this build.
Putting the flags first returned root help even for subcommand-help requests.
Corrected command-first requests returned distinct `open`, `doc api`, `invoke`
and `session list` help, each with exit code zero. The original incorrect
outputs remain retained and do not count as subcommand support.

## Actual isolation and metadata results

The pinned descriptor sanitizer entered Bubblewrap by descriptor. A pinned
Node process acted as PID1 inside separate user, mount, PID, network, IPC and
UTS namespaces, using UID/GID1000 and an ephemeral home. Runtime and library
mounts were read-only. No host design, home, display, credentials or network
was available. Private passwd/group entries were needed because the vendor
bootstrap calls `os.userInfo()`. Private font configuration and cache, with
read-only font files and GLib schemas, removed observed font and renderer
initialization errors without modifying the runtime.

Before vendor execution, the bootstrap closed the identity-matched descriptor
roles and checked that no duplicate of any original role remained. Earlier
prototype runs checked a smaller identity set after closure; their historical
flags do not establish the later complete audit. An initial benign namespace
probe also refused its descriptor assertion. The corrected benign probe passed
before any vendor launch. Both failures remain retained.

Root help and the four specific help requests completed. A broad `doc api`
overview exceeded the fixed output bound and was refused with exit125. Its
original namespace ended and its streams closed. The bound was not increased.
A narrow `doc api --class-name PCB_PrimitiveVia --method-name create` request
returned successful JSON documentation, including required parameters, optional
parameters, return type, example and asynchronous status. This is actual CLI
metadata execution, not invocation of the documented method.

A separately owned hidden server then passed `doctor` with exact bridge version
`4.1.97.04b092ac`, connected state and version match. One `stop` request returned
`stopping`; the original server closed normally with exit0 and closed streams.
The original outer process also had observed pidfd exit and closed streams.
Successful doctor/stop does not prove an editor or SDK method worked.

## Editor readiness remains unavailable

A fresh bare hidden-editor attempt failed with `BRIDGE_NOT_READY` after the
package's 20-second readiness interval. The error reported
`command-space-missing` and the absent `_EXTAPI_CLI_COMMAND_SPACE_` channel.
The subsequent private-font-configuration attempt removed the earlier font,
GLib and renderer errors but retained the same readiness failure.

One further distinct attempt used a private writable copy of the package's
bundled FPC example. The original example is 3,309,568 bytes with SHA256
`94de59b3f287ba09639a407f84959dcae219e8b64735a1fd16462379b518c49f`.
Opening that copy once also returned `BRIDGE_NOT_READY` with the same missing
command space. No session ID was accepted and no SDK method was invoked.
The original server acknowledged its one stop and closed normally with exit0.
Its original outer namespace process exited1, with pidfd exit and closed streams
observed. No explicit signal was used in that attempt. The original example
and failed open were not replayed.

The server also reported `SQLITE_READONLY` and a failed network lookup in the
isolated environment. Those observations do not establish which one caused the
missing editor command space. No readonly mount, activation rule or network
boundary was weakened to suppress them. No invariant or persistence success is
inferred from the absence of an explicit Save.

These results justify a bounded developer metadata probe. They do not admit
candidate SDK execution, project writing, saved/reopened results or a replacement
for the separately pinned current-runtime adapters. A future editor evaluation
needs a concrete readiness correction and fresh original ownership. The current
implementation keeps the candidate-only omission reason
`packaged-4197-runtime-not-admitted`.
