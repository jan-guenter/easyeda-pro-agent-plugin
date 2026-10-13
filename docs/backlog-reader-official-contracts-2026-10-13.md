# Bounded project and LCSC readers

Research date: 2026-10-13. This note records official documentation, not connected
validation. No EasyEDA calls, cloud-library queries or design access occurred.
The extension-development skill's separate declaration/runtime review rule
applies. The current installed generation needs its own implementation review;
this note does not admit either method on it.

## Project information

`eda.dmt_Project.getProjectInfo` accepts one project UUID and asynchronously
returns `IDMT_BriefProjectItem` or `undefined`. The documentation describes
`undefined` as retrieval failure, not proof that a project does not exist. It
does not return the document tree. The separate `getCurrentProjectInfo` method
provides detailed information about the project associated with the last-focused
editor. Neither method's page promises a timeout, stable snapshot, authentication
behavior or absence of cache/network effects.
[Project lookup](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.getprojectinfo.html),
[current project](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.getcurrentprojectinfo.html).

The brief result contains `uuid`, `teamUuid`, `friendlyName`, `itemType` and
optional `folderUuid`. The declared item type is either PROJECT or CBB_PROJECT.
The detailed type adds `name`, `data`, optional `description` and optional
`collaborationMode`. A brief-result adapter must not advertise detailed tree
coverage or synthesize missing fields.
[Brief result](https://prodocs.easyeda.com/en/api/reference/pro-api.idmt_briefprojectitem.html),
[detailed result](https://prodocs.easyeda.com/en/api/reference/pro-api.idmt_projectitem.html).

Recommended first subset, subject to installed-source review: require one exact
project UUID already established by the admitted current context. Validate the
returned identity, bounded strings and item type; compare two complete samples
and reprove the context around awaited work. Reject `undefined` and malformed
results. Do not enumerate an account, fall back to opening a project or query a
different project when retrieval fails. This is a proposed privacy boundary,
not a restriction documented by EasyEDA. Owner/team identifiers remain private
metadata even when no design geometry is returned.

## LCSC device lookup

`eda.lib_Device.getByLcscIds` has an array overload returning a promise of
`ILIB_DeviceSearchItem[]`. It accepts optional library UUID and multiple-match
flag. The documented default library is the system library. Without multiple
matches it returns the first match for each C number; the remarks say enabling
the flag returns multiple matches. The API is beta and unavailable in private
deployments. The page does not specify request limits, returned ordering,
duplicate handling, partial success or a distinct missing-item/error result.
[Batch overload](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.getbylcscids_1.html).

The single-string overload is internally inconsistent: its conditional return
type selects a single item or `undefined` when the flag is true, while its
remarks associate true with multiple matches. Preserve this discrepancy in
discovery. Do not infer the installed behavior from that declaration or silently
pick one interpretation.
[Single-string overload](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.getbylcscids.html).

The current documented search-result interface lists device/library identity,
name, ordinal, symbol identity/name/reference, footprint and 3D identities, plus
optional footprint/3D names and references, description, classification,
image UUIDs and an `otherProperty` scalar map. Its page does not list stock,
price or dedicated manufacturer/supplier fields. The batch example nevertheless
reads `supplierId`. That example does not establish a mandatory result field or
prove one-to-one input correlation.
[Search-result fields](https://prodocs.easyeda.com/en/api/reference/pro-api.ilib_devicesearchitem.html),
[batch example](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.getbylcscids_1.html).

Recommended first subset, subject to installed-source review: a small bounded
array of unique canonical C numbers, system library only, and an explicitly
fixed match mode. Label results as the complete returned result set, not a
complete inventory of every requested number. Missing-item classification needs
reviewed runtime evidence. Reject unbounded or malformed results and preserve
transport failure separately from an empty array. Do not fetch geometry,
download datasheets, place parts or save shared-library assets as a fallback.

Classify this as a potentially network-backed library read until implementation
review proves otherwise. The method pages specify neither a required login nor
the absence of account requests, cache writes or telemetry. They describe no
purchase, project mutation or shared-library write. The absence of such a
description is not a side-effect proof. Explicit private-library UUID support
needs its own owner and disclosure rules.

## Decision

Both methods could support useful read-only subsets. Project lookup has the
clearer return contract; restricting it to the admitted current project avoids
an arbitrary-account reader. The library route has unresolved result-shape and
failure semantics that require native implementation evidence.

Neither route should be enabled from this research alone. The repository's
reviewed declaration catalog records `0.2.53.aee2f57a`; live support must bind
the actual installed application and implementation hashes separately. EasyEDA
states that API versions differ from application versions and that patch
releases may change TypeScript declarations.
[Official version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

Next work is a separate review of the newly installed generation and its exact
call paths, followed by a bounded adapter and focused read verification if the
implementation permits it. No old compatibility pin should be refreshed merely
to make either method callable.
