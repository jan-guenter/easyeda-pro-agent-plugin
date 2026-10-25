# Managed library and project-file metadata

This batch implements two offline metadata equivalents through
`easyeda_control_library_files`. The tool is registered in every facade mode.
`easyeda_control_api` exposes `library-files` discovery and
`library-files-validate` argument/content validation. No public SDK method,
EasyEDA process, bridge, project, network endpoint or user design was accessed
for this implementation or its tests.

## Source contract and admitted subset

The official methods accept supplied File objects and return library/project
metadata. Their full contracts are wider than this adapter.
[Library extraction reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filemanager.extractlibinfo.html),
[project extraction reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filemanager.extractprojectinfo.html).

Installed UI `Aai` derives `.efoo` and `.epanl` identities with `B8`, the
SHA-256 of the filename. The filename stem becomes the title; description and
tags are empty. `.esym` uses `b2t` to select the first exact textual symbolType
match. The adapter accepts ordinary type 2 only and requires complete UTF-8
JSON-line framing, matching DOCTYPE1.0 and one HEAD. It refuses conflicting
symbol types and multi-document headers. The native batch helper `Mcn`
deduplicates by UUID with last-wins behavior. This adapter refuses duplicate or
case-alias names, preserving every accepted batch member.

Project wrapper `Icn` dispatches `/pro-mgr/unzip/extract` with a one-hour timeout.
Manager `Si.extract` selects `project.json.config` or `project2.json` and returns
title, cbbProject or cbb_project, and editorVersion. The wrapper Boolean-coerces
the project flag. The adapter accepts Boolean-or-absent flags and produces the
same result for that subset. The `.epro2` wrapper names introduction,
description and tags, but the manager does not return those fields. The adapter
leaves them absent.

The adapter reads bounded unencrypted ZIP32 archives in memory. It checks every
member's CRC, local/central agreement, extent and deflate consumption, including
members whose content is not projected. It rejects ambiguous manifests, unsafe
or duplicate paths, links, encryption, ZIP64, data descriptors, extra fields,
multipart archives and trailing compressed bytes. Nothing is extracted to disk.

`prepare-file` accepts canonical base64 and a bounded ASCII filename with
`confirmLocalArtifact:true`. Complete validation precedes exclusive publication
to the managed input directory. Later reads require the exact path/name, size
and SHA-256 descriptor and reject changed files or symlinks. Input is bounded to
4 MiB, total archive expansion to 8 MiB, member count to 256, text/manifest to
256 KiB, library records to 8192, standalone files to sixteen and response to
64 KiB. Validation summaries omit base64 content.

Metadata extraction does not interpret geometry, follow external references,
check complete member dependencies or establish import suitability. It does not
import, convert, open or save a project. Outputs state
`publicSdkMethodExecuted:false`, `installedRuntimeAdmission:false` and
`designValidityVerified:false`. Coverage distinguishes
`available-with-managed-file-guards` from runtime or network admission.

## Concrete omissions after this batch

Archive library extraction remains unavailable. Native `.epro`/`.elibz`
branches use `/pro-mgr/unzip` and `Scn` normalization. `.epro2` uses
`/pro-mgr/unzip/flow`, `flowRead` and project parser state. Vendor storage-ID
string overloads can reach `flowRead`/`flowWrite`. These need a complete library
archive/dependency model and owned storage effects. Standalone metadata does not
establish those contracts.

Both PCB and schematic BOM-template getters await `tb()` before selecting a
template and generating XLSX. `tb()` can run migration `Y6t` and `fMn`, then
calls `sNi`. When cached selected-template `xD` is missing or invalid, `sNi`
sets `U6` and invokes `ft.saveToServer(false)`. Active-document guards also
require a suitable PCB/footprint or schematic context. File hashing alone does
not cover shared template/preferences migration and persistence. A future
adapter must establish those effects before invoking either method. This is a
source finding; no settings change or network write was observed live.
[BOM template reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_manufacturedata.getbomtemplatefile.html).

Symbol rendering constructs `y4e`, resolves the library/project source and
optional subpart, then awaits `generateSymbolImg`. Footprint rendering uses
shared `Cc.deviceImgData` and `generateFootprintImg`. Both handlers construct
canvas/Image objects, assign a generated URL and resolve through image.onload
and canvas.toBlob. The handlers have no image.onerror or visible terminal
resource cleanup. A future adapter needs exact source/subpart and dependency
ownership, bounded image dimensions/content, failure settlement and renderer
retirement. A caller timeout is not cancellation. Render methods remain
omitted, rather than being exposed as if a declared Blob return proved them.

## Pinned installed source

Paths are relative to `resources/app/assets`. These full hashes identify the
source inspected without evaluating it. The named functions above locate the
relevant branches; no unverified character offset is treated as a byte offset.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1,980,754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-mgr/3.2.185.bf63a159/js/pro-mgr.js` | 2,196,424 | `b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d` |

## Verification and limits

Seven isolated synthetic tests cover metadata, JSON framing, unsupported
symbols, complete ZIP integrity, path aliases, expansion/deflate bounds,
managed tampering and batch preservation. Three additional registration/API
tests exercise actual all-mode registration with synthetic supplied files,
strict request rejection and metadata-only coverage. The existing facade-mode
and coverage suite passed alongside those tests, 61 tests in that run.
TypeScript, focused strict type-aware lint, coverage generation/check and the
skill validator pass under Node24.18.0/npm11.16.0 with core limit zero.

Source review corrected ZIP file/directory aliases. Independent review found
and corrected an action/schema mismatch for file extensions and case-folded
duplicate names.
No connected extraction, SDK invocation, import or live CAD validation is
claimed. Build, publication and installation belong to the combined release,
not this source-only record.
