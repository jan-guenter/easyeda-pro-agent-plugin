# Bounded facade identifier compaction

The frozen development package's repository scan refused the18433085-byte
facade bundle. It exceeded the existing16MiB release-file and installed-payload
limit, so the file was not accepted or selected. Complete privacy scanning was
also incomplete for that oversized file. Those failures remain retained.

The facade/upstream pair now compacts lexical identifiers while preserving
function and class names with `keepNames:true`. Syntax minification remains
false; properties, reviewed program strings and the admission banner retain
their contracts. The build commitment includes every selected minification
option. The foreground manager keeps its existing build settings.
[esbuild documents independent minification options](https://esbuild.github.io/api/#minify)
and [runtime name preservation](https://esbuild.github.io/api/#keep-names).

The first rebuilt facade is13445830 bytes, within the unchanged16777216-byte
cap. The repository validator's separate exact build-command contract also now
requires the schematic and inverse helper checks. No release-file ceiling,
secret/privacy rule or installed-file bound was increased.

Changed-source strict lint passed. Final type, reproducibility, offline startup
and complete repository checks are pending on the frozen payload. This build
change grants no connected CAD execution or persistence proof.
