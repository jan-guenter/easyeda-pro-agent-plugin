# Supplied libraries, project sources and raw design records

Use `easyeda_control_library_files` to inspect supplied standalone libraries,
reusable library archives or project archives without launching EasyEDA. This tool is available in every
facade mode. It implements bounded native-task-equivalent metadata projections
and lossless supplied-document source reads. It does not invoke the SDK's
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
writes a complete managed index. Symbol-source and project-document-source extraction also write one index each. Metadata extraction and source-page reads only
read the exact managed input. Do not replace unsupported source records or rewrite the
input just to make the validator accept it.

## What the output means

Standalone-library UUIDs are SHA-256 hashes of filenames, and titles are filename
stems. The native metadata projection gives empty descriptions and tags. These
values are not manufacturer identities, catalog ownership or a complete library
record. Symbol input is limited to ordinary type 2. Net flags, ports, device
archives and vendor storage-ID string overloads are unavailable. Reusable
`.elibz2` footprint and declared docType2 symbol archives have the separate
source workflow below.

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

## Read reusable library archive sources

Prepare the actual supplied `.elibz2` bytes with `prepare-file`, then send
`request:{action:"extract-library-archive-sources",file}`. The result supplies
`sourceSetSha256`, source counts and one exclusive managed `index`. The index
binds the whole archive SHA-256, both member hashes, the complete source roster,
selected metadata hashes and every original source body's hash and lengths.
Unknown metadata and records remain in the exact prepared archive.

Use `request:{action:"list-library-archive-sources",file,
expectedSourceSetSha256,offset:0,length:32}` to enumerate the roster, then
`request:{action:"read-library-archive-source",file,expectedSourceSetSha256,
sourceId,offset:0,length:4096}` for a selected source. Use only a `sourceId`
returned by the complete roster. Each call rereads the exact managed archive,
validates every member and source, and recomputes the full digest before paging.
Roster offsets count entries. Source offsets count UTF-16 units and retain the
same surrogate-pair, base64, page-hash and completion rules described below.
No source member is written to disk.

The supported archive has exactly two ZIP members. One is `footprint2.json`
or `symbol2.json`; the other has the canonical generated ProLib name and
`.elibu` extension. The manifest's devices, symbols, footprints and panelLibs
maps must describe exactly one supported family with 1 to 16 UUID-bound items.
Each body has an agreeing native DOCHEAD and a distinct copied-header plus
synthesized META prefix. The roster keeps `exportPrefix` byte offsets and
hashes separate from `memberByteOffset`, which locates the original body.
Source pages return that original body exactly, including its supplied final
delimiter state. The complete source member stays in the prepared archive.
Do not rename `.elibu` to `.efoo` or `.esym` or treat it as a project archive.

Missing, empty or extra source bodies, mismatched UUID/docType, mixed manifests,
legacy `.elibz`, device/panel archives, BLOB members and mutable histories
refuse. Tags support bounded flat string arrays; locale-dependent hierarchical
tag objects refuse. Each original body and the manifest must fit 256 KiB. Complete lexical
record framing does not validate shapes, electrical behavior, library ownership,
saved application state or importability. Manifest docType2 and the synthesized
META do not prove that the original symbol has ordinary subtype2. No archive
pin action is registered until that source model is independently established.
`libraryArchiveRecordFramingValidated:true` reports only the lexical checks;
`cadFramingValidated:false` and `symbolSubtypeVerified:false` retain their scope.
If a roster page exceeds the 64 KiB result limit, request fewer entries. The
tool refuses an oversized response instead of returning an incomplete entry.

This workflow invokes none of the public `get*FileBy*Uuid` library exporters.
Those methods can omit failed metadata/source reads, and the ordinary library
worker can export a retained unsaved canvas under a UUID from another library
path. A future live exporter needs its own original worker and route ownership,
complete File/member/source verification and persistence lifecycle. Offline
archive equality supplies none of that evidence.

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

## Read supplied symbol sources and pins

Use `request:{action:"extract-symbol-sources",file}` with a prepared ordinary
standalone `.esym` or `.epro`/`.epro2` archive. Keep its `sourceSetSha256` and
index descriptor. Page the complete archive-order roster with
`request:{action:"list-symbol-sources",file,expectedSourceSetSha256,offset:0,
length:32}`. Each item has `symbolId`, `identityKind`, member path, exact byte
length, SHA-256 and UTF-16 length. For standalone input, `symbolId` is the native
filename SHA-256, not a vendor library UUID. For project input it is the exact
member UUID.

The pinned project exporter writes `SYMBOL/<uuid>.esym` and combines ordinary
symbols with block symbols. Every case-insensitive `.esym` candidate must have
that canonical path and a lowercase 16- or 32-hex UUID. A source roster does not
prove ordinary symbol subtype. Raw bodies stay opaque, including future records,
BOM and line endings. Missing or unsupported framing does not prevent lossless
source reading.

Read one source with `request:{action:"read-symbol-source",file,
expectedSourceSetSha256,symbolId,offset:0,length:4096}`. It uses the same lossless
UTF-16/base64 paging rules as footprint sources. Each request verifies the exact
whole input and recomputes its complete source-set digest. Unknown fields remain
available in these pages rather than being silently dropped from the file.

For a pin table, use `request:{action:"inspect-symbol-pins",file,
expectedSourceSetSha256,symbolId,offset:0,length:16}` and follow `nextOffset` to
`endOfPins:true`. The inspector recognizes complete ordinary type-2 SYMBOL1.0
JSON lines or exported native DOCHEAD SYMBOL source with unique record IDs.
Native member and DOCHEAD UUID must agree. Mutable histories, tombstones,
duplicate native IDs, repeated JSON-line part IDs, duplicate JSON-line pin or
attribute IDs within one part, and ambiguous known pin attribute keys refuse
pin inspection. Native attributes must match their parent pin's part. The same
JSON-line pin or attribute ID may occur in distinct parts.
Raw source reads remain available. Every pin is checked before a page returns,
so a malformed later pin cannot hide behind an earlier page.

The table reports literal pin IDs and part IDs, number, name, electrical-type
string, position, length, orientation, visibility and raw pin shape. Values use
raw file coordinates. JSON-line and native-source coordinates have different
conventions; no public API conversion is implied. Missing attributes have an
explicit `Present:false` flag and null value. Empty names, leading-zero numbers,
false visibility and null visibility remain distinct. The pin and every owned
attribute link to their full-source record index and SHA-256. Extra fields and
unknown record families stay in the complete hash-bound source. The result also
counts all record types.

`symbolPinRecordFramingValidated:true` describes the supported pin record
framing. `cadFramingValidated:false` and `designValidityVerified:false` remain.
The table performs no ERC, connectivity inference, dependency lookup, pin-to-pad
mapping or live membership check. It does not admit an SDK getter or writer.

## Read current combined project documents

For a prepared `.epro` or `.epro2`, send
`request:{action:"extract-project-document-sources",file}`. Keep the returned
`sourceSetSha256` and complete managed `index`. Page the roster with
`request:{action:"list-project-document-sources",file,expectedSourceSetSha256,
offset:0,length:32}`. Each source has a `sourceId`, document type, member path,
byte offset inside that member, byte length, full-source SHA-256 and UTF-16
length. `sourceId` identifies this exact source segment, rather than a catalog
part. Use the returned value instead of guessing it from a UUID.

The current exporter writes one root `<project-name>.epru` inside `.epro2`.
The index decodes every native header/body record before splitting original
DOCHEAD segments, including non-schematic peers. DOCHEAD text inside a JSON value
does not create another segment. Unique document IDs, complete framing and the
terminal `|\n` delimiter are required. The complete source bytes retain every
record, unknown field, ordering, numeric spelling and separator. A source index
can preserve history or tombstones without qualifying them for a raw design
report. A repeated DOCHEAD for the same document refuses as an ambiguous source.

Legacy exported `.epro` archives use
`SHEET/<schematic-id>/<sheet_id>.esch`, `PCB/<uuid>.epcb`,
`SYMBOL/<uuid>.esym` and `FOOTPRINT/<uuid>.efoo`. These bodies remain opaque during
indexing. `sheetId` comes from the filename and remains separate from the
document UUID. A legacy sheet therefore reports `documentUuid:null` until a
separate supported inspector reads its header. Typed PCB/symbol/footprint members
retain their filename UUID so a supported inspector can check header agreement. Mixed combined and legacy
source layouts refuse. Unknown peer members stay in the exact prepared archive.
`sourceLayout` distinguishes the combined-stream and recognized-legacy-member
domains. Legacy PANEL, INSTANCE, assets and other unindexed member families
remain opaque peers. `completeRosterReturned` covers this recognized source
roster, not every document or dependency in the project.
`completeProjectDocumentInventory` stays false for both layouts.

Read any indexed document through
`request:{action:"read-project-document-source",file,expectedSourceSetSha256,
sourceId,offset:0,length:4096}`. Follow `nextOffset` as for footprint pages.
Every list, read and report freshly verifies the whole supplied archive and its
complete source-set digest. No member is written to disk and no external
dependency is followed. An archive index does not prove a live design, missing
dependency completeness, saved application state or import suitability.

For an indexed SYMBOL source, use
`request:{action:"inspect-project-symbol-pins",file,expectedSourceSetSha256,
sourceId,offset:0,length:16}`. This reuses the raw pin inspector described above,
including its complete-source checks and8192-record bound. The original filename
or native DOCHEAD supplies the selected symbol UUID. It does not resolve a
schematic component's inherited pins or qualify that component's dependencies.

## Inspect raw schematic and PCB records

For an indexed SCH or SCH_PAGE source, send
`request:{action:"inspect-schematic-records",file,expectedSourceSetSha256,
sourceId,offset:0,length:16}`. The inspector first validates the entire native
source, one agreeing DOCHEAD and unique object IDs. Mutable history, tombstones,
multiple headers and unsupported framing refuse this report while lossless
source reads remain available.

The page reports raw COMPONENT, PIN, WIRE, LINE, NET, ATTR, RELEVANCE, PART, PORT
and NET_LABEL records. Each retains its original text, header/body projection,
record index and SHA-256. Record-type counts cover the full source, including
unknown families. Follow `nextOffset` until `endOfRecords:true`.
`completeRecordsReturned` requires a zero start. The report resolves no inherited
symbol pins or component dependencies and infers no connection from geometric
contact or a stored net label. `connectivityCompiled`, `netMembershipVerified`
and `electricalRulesEvaluated` stay false. This route never invokes the compiled
netlist getter that can annotate parts and Save All.

For an indexed PCB source, send
`request:{action:"inspect-pcb-stack-rules",file,expectedSourceSetSha256,
sourceId,section:"all",offset:0,length:16}`. `section` can be `stack`, `rules`,
`selectors` or `all`. The inspector accepts a complete unique native PCB source
or an ordinary PCB1.x JSON-line source with HEAD. It reports exact stored layer,
physical-layer, active-layer, rule-template/rule and selector/equal-length
records, fourteen known rule-family counts, and unknown families. Populated
selectors are retained as raw records instead of normalized or discarded.

Numeric fields and layer IDs retain their raw encoding. No live default repair,
native parser, rule getter, merge or initialization runs. Stored records do not
prove effective precedence, net/pad applicability, physical fabrication stackup
or current loaded state. The corresponding verification flags stay false.
Neither report enables a live SDK reader, writer, DRC, ERC or fabrication action.

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
page reparses the bounded archive. Symbol sources share those bounds and an
8192-record recognized pin-inspection limit. Pin pages contain at most16 entries
and32 KiB of pin DTOs; if even one complete DTO cannot fit, use the raw source
pages. These bounds do not truncate a pin or an unknown record. Check the current discovered schema for exact names
and limits before preparing a file.

Combined project streams allow at most65,536 complete records and256 document
segments within the existing8 MiB expanded archive limit. Project document
indexes share the256 KiB index and4096-unit source-page bounds. Schematic and
PCB record pages contain at most16 complete records and32 KiB of report rows.
PCB reports accept at most32,768 complete source records. If one record cannot
fit a report page, use lossless source pages. Reports never return a truncated
record as complete.
