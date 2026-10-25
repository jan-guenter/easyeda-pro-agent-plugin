# Supplied library and project-file metadata

Use `easyeda_control_library_files` to inspect supplied standalone libraries or
project archives without launching EasyEDA. This tool is available in every
facade mode. It implements a bounded native-task-equivalent metadata projection;
it does not invoke `sys_FileManager.extractLibInfo` or `extractProjectInfo`.

Discover `easyeda_control_api` action `library-files` with
`query:{includeSchemas:true}`. Validate the exact inner request using
`library-files-validate`. For `prepare-file`, validation checks the supplied
container content without writing a file or echoing its base64. For extraction
actions, it checks descriptor shape only. The extraction tool later reads and
verifies the actual managed bytes.

## Prepare and inspect

1. Send `request:{action:"prepare-file",name,base64,confirmLocalArtifact:true}`.
   Use canonical base64 of the actual supplied bytes and a simple ASCII name
   with its original supported extension. Preparation validates the full
   admitted container and writes one private, exclusive managed input.
2. Keep the returned `file` descriptor unchanged. It contains schema, name,
   managed path, byte length and SHA-256. A caller-selected external path is not
   an import route. A later hash, size, directory or name mismatch refuses.
3. For `.efoo`, `.epanl` or ordinary type-2 `.esym`, send
   `request:{action:"extract-library-info",files:[file]}`. A batch accepts up to
   sixteen distinct names. For `.epro` or `.epro2`, send
   `request:{action:"extract-project-info",file}`.

The tool does not accept a runtime fingerprint. It does not import a library,
open a project, save a design, access the network or extract archive members to
disk. `prepare-file` has a local artifact effect; extraction only reads the
exact managed input. Do not replace unsupported source records or rewrite the
input just to make the validator accept it.

## What the output means

Standalone-library UUIDs are SHA-256 hashes of filenames, and titles are filename
stems. The native metadata projection gives empty descriptions and tags. These
values are not manufacturer identities, catalog ownership or a complete library
record. Symbol input is limited to ordinary type 2. Net flags, ports, device
archives and vendor storage-ID string overloads are unavailable.

Project metadata is title, Boolean `cbbProject` and optional `editorVersion`.
`.epro` uses `project.json.config`; `.epro2` uses `project2.json` and its
`cbb_project` spelling. The native manager does not return introduction,
description or tags for this projection, even though the wrapper names them.
Their absence is not proof that the supplied project lacks those properties.

Successful extraction checks supported framing and archive integrity. It does
not prove drawable geometry, complete member references, electrical correctness,
pin-to-pad mapping, dependencies, renderability or import suitability. Unknown
fields remain in the retained input and are not followed or executed. Keep
`publicSdkMethodExecuted:false`, `installedRuntimeAdmission:false` and the
metadata-only limitations when reporting the result.

## Format and size limits

Standalone files require complete UTF-8 JSON-line framing, a matching
`["DOCTYPE",type,"1.0"]` first line and one HEAD record. `.esym` also requires
an unambiguous native textual `"symbolType":2` match. Duplicate headers,
multi-document bodies and names differing only by case refuse.

Project archives require unencrypted ZIP32 with bounded members. Every member's
extent, decompression and CRC is checked. ZIP64, data descriptors, extra fields,
multipart archives, links, unsafe or duplicate paths, conflicting manifests and
trailing compressed bytes are excluded. Member names use an ASCII subset;
metadata text may contain Unicode.

Limits are 4 MiB input, 8 MiB total expanded archive content, 256 archive members,
256 KiB standalone text or manifest, 8192 library records, sixteen standalone
files and 64 KiB response. Check the current discovered schema for exact names
and limits before preparing a file.
