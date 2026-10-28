# Supplied library metadata and project footprint sources

Use `easyeda_control_library_files` to inspect supplied standalone libraries or
project archives without launching EasyEDA. This tool is available in every
facade mode. It implements bounded native-task-equivalent metadata projections
and lossless footprint-source reads. It does not invoke the SDK's
`extractLibInfo`, `extractProjectInfo` or `getDocumentFootprintSources` methods.

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
disk. `prepare-file` writes the managed input, and footprint-source extraction
writes a complete managed index. Metadata extraction and source-page reads only
read the exact managed input. Do not replace unsupported source records or rewrite the
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
returned scope when reporting the result. Metadata actions return
`metadataOnly:true`, as do source-roster pages. Source-index extraction and
source-body pages return `metadataOnly:false` and `cadFramingValidated:false`.

## Read project footprint sources

For a prepared `.epro` or `.epro2`, send
`request:{action:"extract-project-footprint-sources",file}`. The result contains
`sourceSetSha256`, counts and an exclusive managed `index` descriptor. The index
lists every source in archive order with member path, footprint UUID, byte length,
SHA-256 and UTF-16 length. Use
`request:{action:"list-project-footprint-sources",file,expectedSourceSetSha256,
offset:0,length:32}` to page that roster through the same tool. Follow
`nextOffset` until `endOfRoster:true`. Roster offsets count source entries;
`completeRosterReturned` also requires a zero start. Each page recomputes the
whole archive and digest, and needs no general artifact-reader tool. The digest
binds the raw whole archive and complete roster. No source member is written
to disk.

Then send `request:{action:"read-project-footprint-source",file,
expectedSourceSetSha256,footprintUuid,offset:0,length:4096}` using the original
file descriptor and returned digest. Each page freshly verifies the entire
archive and recomputes the complete source set. Offsets and lengths count UTF-16
code units. Follow `nextOffset`; a split-surrogate start refuses and a split end
is shortened. A one-unit page that cannot contain the next character refuses.
`endOfSource` means this page reaches the end; `completeSourceReturned` means it
also starts at zero. Use `pageBase64`, `pageBytes` and `pageSha256` for the exact
corresponding UTF-8 bytes. The full source hash remains separate.

Every case-insensitive `.efoo` candidate must have a distinct canonical lowercase
16- or 32-hex `UUID.efoo` basename. Malformed names, case aliases, repeated UUIDs,
directories, empty sources and invalid UTF-8 refuse. Sources preserve BOM, line
endings and opaque future records. This path does not parse CAD framing or prove
geometry, dependency completeness or current document state. The direct SDK
getter's current-document export dependency remains unqualified. Do not run it
as a shortcut for reading a supplied archive.

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
files and 64 KiB response. Footprint sources share the archive bounds, with a
256 KiB complete index and at most4096 UTF-16 code units per source page. Each
page reparses the bounded archive. Check the current discovered schema for exact names
and limits before preparing a file.
