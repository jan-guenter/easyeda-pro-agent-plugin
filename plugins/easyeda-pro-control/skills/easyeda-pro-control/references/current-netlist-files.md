# Managed Allegro netlist comparison

Use `easyeda_control_netlist_files` to compare two supplied netlists through the
reviewed public `eda.sys_Tool.netlistComparison(File, File)` method. This route
accepts a bounded Allegro subset and reports footprint/designator and net/pin
membership differences. It does not export a design or compile its topology.

## Prepare and compare

Discover `netlist-files` with `query:{"includeSchemas":true}` through
`easyeda_control_api`. Validate each complete inner request using
`netlist-files-validate` before execution. Validation itself writes no artifact
and grants no execution authority.

Prepare each input with supplied text, a name ending in lowercase `.tel` and
`confirmLocalArtifact:true`. For example:

```json
{
  "request": {
    "action": "prepare-file",
    "name": "before.tel",
    "text": "$PACKAGES\nR_0603 ! RES ! 10k ; R1\n$NETS\nGND ; R1.1\nVCC ; R1.2\n$END\n",
    "confirmLocalArtifact": true
  }
}
```

Preparation contacts no app, project or network. It writes one exclusive private
artifact under the facade's managed data directory and returns its complete
descriptor in `result.file`. The artifact persists locally. No caller-selected
destination or existing external file path is accepted, and a partial failure
does not authorize overwriting a previous artifact. Omit `expectedFingerprint`
for this action; supplying one refuses before the write.

Prepare the other input the same way. Copy both returned descriptors unchanged
into `request:{"action":"compare-files","left":...,"right":...}` and supply
the actual authenticated status `expectedFingerprint` beside `request`.
The descriptors include schema, format, name, managed path, byte count and SHA-256.
Do not fabricate paths, change the extension to select another parser or replace
the hashes. Changed or unmanaged input bytes refuse before SDK dispatch.

Comparison requires the separately pinned EasyEDA3.2.209/API0.3.59/UI3.2.198
tuple. It uses the existing authenticated serialized bridge and requires no
project or document context. It neither opens a project nor reads a design file.
The generated program constructs two browser Files from the verified text,
checks their bytes and hashes, then calls the public File/File method twice.

## Accepted input

Each input is at most 65536 UTF-8 bytes, with printable ASCII and LF or CRLF.
It must begin with `$PACKAGES`, contain `$NETS` and finish with `$END`.
Optional `$A_PROPERTIES` accepts only `CODE` and `COMPONENT_HIGH_MAX` rows;
optional `$SCHEDULE` must be empty. Vendor comma-and-indented-line continuation
is supported. Use the exact validator for token syntax and section ordering.

Bounds are 1–256 components, at most 2048 pins and at most 1024 nets per file.
Unknown or ignored rows, duplicate designators/nets/pins, pins referring to
unknown components, function suffixes, inherited object keys, quoted whitespace,
embedded quotes and non-ASCII text refuse. Do not drop unsupported content just
to obtain a comparison result; that would change the input being compared.

Document UUID strings and document-object overloads are unavailable. `.enet`,
archives and other formats are excluded: their installed parser branches can
resolve project state and library references. The `.tel` restriction applies to
the filename extension; mixed-case basenames are allowed.

## Interpret the result

Successful `differences` retain the actual runtime fields `type`, `object`,
`net1` and `net2`. `type` is `NET` or `COMPONENT`; the declaration uses different
labels. For `NET`, `object` is the vendor net name and the arrays contain pin
members present only in the left or right input. For `COMPONENT`, `object` is
the footprint name and the arrays contain differing designators. Preserve raw
names, including vendor-added quotes around some net names.

Both complete SDK samples must agree and match an independent membership model.
`equalInScope:true` means no difference in those memberships. The installed
comparator does not compare device identity, component values or properties.
Equality therefore proves neither full circuit identity nor electrical or
manufacturing suitability. Input preparation does not validate a manufacturer's
pin mapping.

Responses are bounded to 192 KiB and refuse rather than truncate. A `false`,
`undefined`, malformed or incomplete SDK result is never accepted as equality.
`ok:false` with `kind:"netlist-files-refusal"` is a failed observation; its
`stage` and `attempted` counter supply limited diagnostics, not permission to retry.
The ten-second monotonic deadline is checked around awaits and before a second
sample. A cooperative timer and separate 60/70-second executor/transport limits
do not cancel outstanding RPC/FileReader work or interrupt synchronous vendor
code. Do not automatically retry a timed-out comparison.

`connectedValidation`, `cadAuthority` and `persistenceVerified` remain false.
Source review, synthetic parser checks and managed-file/runtime tests do not
prove a connected FileReader/IPC execution or saved design state.
