# Ordinary existing-profile startup

Date: 2026-10-13. Scope: EasyEDA Pro package `3.2.206.715d940d` on Windows.
Research used installed files as inert bytes and official documentation. No
application, bridge, private profile, project or settings operation was run.

## Decision

Implement ordinary startup, not a guaranteed empty or isolated editor session.
The user explicitly wants the agent to start EasyEDA. The official FAQ describes
starting the installed executable directly; this does not depend on the newer
CLI, whose documented minimum version is 4.1.60.
[Executable startup](https://prodocs.easyeda.com/en/faq/others/#how-do-i-enter-the-command-line-to-start-the-editor),
[newer CLI](https://prodocs.easyeda.com/en/api/guide/cli.html).

The earlier requirement to decode and bind the complete closed IndexedDB profile
was too broad for this contract. Such evidence would support the stronger claim
that all startup extension code and profile state are qualified. This launcher
makes no such claim. The extension-index observer remains observation-only.

## Source findings and implementation

Pinned `app.js` SHA-256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`,
UTF-16 offset 2652584, constructs the editor URL from persisted mode/log level
and recognized `.eprj`, `.eprj2` or `.elib` arguments. The native helper supplies
only the quoted executable, with no extra argument, environment override or
caller path. Consequently the tool supplies no project selector. Persisted
configuration still influences the URL; this is not a promise that the eventual
page has no selector or project.

At offset 1334400 the app merges its existing configuration. Local startup uses
the existing Electron profile; no supported clean-profile switch was established.
UI layout restoration at offset 16422020 of UI `3.2.196.26ed3d6c` filters saved
layout against already-open tab IDs rather than opening missing projects itself.
Enabled extension entry code can nevertheless run during startup. Normal app
startup also loads the configured project list and may write preferences, caches
and logs or contact services. The desktop guide documents the project-list
behavior and existing data directories.
[Desktop guide](https://prodocs.easyeda.com/en/faq/client/index.html#create-or-open-a-project).

`ordinary-launch.ts` pins the executable, app script, package metadata, startup
selector and packaged Windows helper. Facade bytes must match the maintained
reviewed manifest. The existing retained Job helper creates a process atomically
inside its Job, refuses an existing matching application instance, and retains
the original root process handle. The runtime independently compares its own
executable hash to the expected pin before starting the helper. No legacy design
compatibility admission is inherited.

A fixed process-name observation runs before the intent is reserved. An already
running EasyEDA process returns `already-running` without launching another or
consuming an operation ID. This observation is not authenticated ownership and
does not attach to that process. The helper still checks again during launch;
a process appearing between those checks remains an uncertain dispatch outcome.

Every launch requires an unused operation ID and an exclusive directory with a
durable intent before dispatch. Result and termination records are additive;
partial publication remains consumed. A fresh process cannot reinterpret an
unresolved operation as permission to launch again. Termination observation
requires the original retained Job/root and two empty/exited samples; it neither
closes the app nor selects Save/Discard. A durable termination receipt permits
another operation, including after a later facade restart. Missing original
ownership cannot be replaced with a PID or a serialized receipt. Recovery of an
unresolved launch after owner loss remains separate backlog.
Coordinator-owned failures before the runtime launch method is invoked can append
a bound nondispatch receipt. These do not block a different operation; the same
operation ID remains used. An arbitrary exception from the runtime never qualifies
as such a receipt.

Launch results explicitly say bridge authentication and Start Page were not
observed. They do not claim an isolated profile, startup qualification, design
authorization, absence of project-file access, or exclusion of extension effects.
The tool itself sends no navigation, design edit, Save or forced termination.

## Verification scope

Focused offline tests cover request boundaries, intent-before-dispatch, duplicate
and restarted-owner refusal, retained termination/relaunch, ambiguous dispatch
and wrong-Job termination. Synthetic coordinator tests substitute only internal
installation verification; they do not validate Windows execution or claim live
startup support. The default installation verifier has no caller-selected pins.
Actual publication and connected validation belong in the release record.
