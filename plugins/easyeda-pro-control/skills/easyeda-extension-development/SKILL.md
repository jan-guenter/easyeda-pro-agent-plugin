---
name: easyeda-extension-development
description: Research, build, review and test EasyEDA Pro extensions or narrow agent adapters. Use for Pro SDK methods, extension packaging, typed MCP coverage, compatibility upgrades and bridge lifecycle bugs. Not for live circuit edits or EasyEDA Standard scripts.
---

# EasyEDA Pro extension development

Start with the exact target application, declaration and implementation versions.
Pro uses per-extension `eda` instances; Standard's command API is different.
Documentation describes a contract, not the installed build's behavior.

Read [SDK and adapter engineering](references/sdk-and-adapters.md) before adding
support. Read [validation and release](references/validation-and-release.md)
before changing compatibility pins, publishing or importing an extension.
For public utility getters or File-based adapters, also read
[utility and file adapter boundaries](references/public-utility-and-file-adapters.md)
for UI receiver qualification, complete parser recognition and timeout limits.

1. Inspect the repository rules, current compatibility tuple and retained
   operation journals. Preserve dirty user changes, credentials and historical
   evidence. Do not start a competing bridge owner.
2. Use `easyeda_control_api` SDK queries for separately pinned reviewed/latest
   signatures, then operation queries for exact typed argument schemas and
   separately reported execution availability. Schema presence is not admission.
   Query `coverage` for each exact mounted method before implementing it. Preserve
   the distinction between direct calls, native task equivalents and internal
   lifecycle use. Update the exhaustive inventory and its regression tests with
   every added route or changed omission reason.
   Read the relevant official declaration and method page, including overloads,
   union branches, stability tags, units and completion promises.
3. Classify the operation: local metadata read, navigation, design write,
   calculation, export, filesystem/network or external/cloud mutation. A getter
   or UI-only method is not automatically harmless. Match user authority.
4. Implement one strict data schema and a fixed supported method/adapter. Bind
   exact owner/context, protect locks, await native completion and journal before
   dispatch. Do not expose arbitrary JavaScript, arbitrary `eda.*` paths, private
   invoke names, event callbacks or compatibility override switches.
5. Define exact complete source/connectivity and persistence effects before
   enabling writes. Preserve peer documents/assets. Unsupported native encodings
   refuse before dispatch rather than stripping unknown fields or relaxing proof.
6. Test malformed arguments, owner changes, disconnects, delayed callbacks,
   partial native effects, oversized output, failed Save and restart/rebind.
   Prove that ambiguous writes, Save and navigation are never blindly retried.
7. Report separately: source implementation, offline tests, build provenance,
   installed package, connected admission, live effect, saved/reopened result.
   Use a disposable fixture for new live writer validation; never a user board.

For native startup, cache, source-route or renderer investigations, select the
[diagnostic task](../easyeda-pro-control/references/task-navigation.md#extension-diagnostics)
and read its specific operating reference before choosing a launch purpose.

For actual live editor work also use `$easyeda-pro-control`. Source updates do
not grant permission to repair an unfinished production journal, restore a
database or broaden external writes. A newer declaration package is research
material until its installed implementation is deliberately admitted.

For iterative adapter validation, the control skill's
[foreground client](../easyeda-pro-control/references/connection-and-context.md#foreground-mcp-session)
can target one verified installed snapshot or trusted frozen build while the
next source batch is developed. Require a free control lease, keep the selected
payload unchanged through the run and retain its original process through
cleanup. This supports validation without repeatedly publishing intermediate
versions; it supplies no admission for another client or snapshot.

For the separate read-only main-realm Date/SQL-head age workflow, read
[the native head-age control reference](../easyeda-pro-control/references/current-footprint-head-age.md).
It binds the actual closed checkpoint and completed SQL reader before allocating
a distinct native generation. It offers no project-open, writer or Save grant.
Keep the original owner through separately observed termination and release.

For the separate read-only native CacheStorage qualification lifecycle, read
[the held-cache control reference](../easyeda-pro-control/references/current-footprint-held-cache.md).
It documents original checkpoint/factory custody, first/fresh observations,
synchronous abort reservation before journal awaits, and separately observed
termination/release. Its public wrapper supplies no project-open or saved-copy
authority; keep the private held-saved composition separate when extending it.

Finish with the implemented scope, exact versions, test evidence, remaining
unavailable methods and any required fresh-chat/import step. Do not label the
entire SDK callable because it is discoverable.
