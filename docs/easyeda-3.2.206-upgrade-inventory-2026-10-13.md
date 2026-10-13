# Installed EasyEDA update inventory

Read-only observation on 2026-10-13. The application files now identify
EasyEDA Pro `3.2.206.715d940d`, while the plugin still admits the reviewed
`3.2.149.88089769` tuple. This inventory does not admit the new implementation,
change compatibility pins or authorize a connected call. No project was opened
or inspected.

## Exact installed files

The assets root still exists at
`/mnt/c/Program Files/easyeda-pro/resources/app/assets`. The old pinned API,
schematic, PCB and UI version directories are absent there. The configured
machine profile still refers to the old API and PCB version directories.
This is an application-version mismatch, not a missing assets-root directory.

Paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app`. Each complete file was read
and SHA-256 hashed without executing it.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `package.json` | 248 | `e349f8d80f809f82a057f1b81799430ba25bfa0f7c7cb96f6155327b49391455` |
| `version.txt` | 36 | `fc553f3d0a58fb917eb910997e45f9773228af239e9f3ebfcdc759fbd759fe54` |
| `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `assets/pro-sch/3.2.192.b79ad524/js/sch.js` | 6472338 | `9360b7f9c8f531e05679ab282bcd33327faecf93240cd7e68d6cafd9c255512f` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

The package's version is `3.2.206.715d940d`. `version.txt` contains
`3.2.206.715d940d.6d5480, 10/10/2026` plus its final newline. These are file
observations, not proof of a running application's identity or the update time.

## Declaration differences

The maintained declaration parser reads the new local declaration into 97
mounted namespaces, 783 signatures, 750 distinct mounted method paths and
321 relevant declared types. The committed catalog remains unchanged at
749 reviewed signatures and 806 official-reference signatures.

Comparison below keys methods by mounted namespace and method name, then
compares the sorted receiver-class/signature strings literally. A textual
change includes formatting, quote spelling, comments and receiver-class
changes. It is not a count of breaking semantic changes. Matching declaration
text does not prove matching implementation behavior.

| Compared with | Exact matches | Textually changed paths | Added paths | Absent paths |
| --- | ---: | ---: | ---: | ---: |
| Reviewed `0.2.53.aee2f57a` | 537 | 159 | 54 | 1 |
| Frozen official `0.4.26` reference | 645 | 105 | 0 | 23 |

Four namespaces appear relative to the reviewed snapshot:
`lib_SimulationModel`, `sys_ExternalApi`, `sys_Help` and `sys_Math`.
The old `sys_Dialog.createReactComponentizationDialogInterface` method is
absent. Compared with the newer official reference, this installed generation
still lacks `pcb_ImageTool` and `pcb_Tool`, among other individual methods.

The new `sys_Math` namespace offers 16 potential calculation adapters:
`bboxIntersects`, `calculateArea`, `calculatePerimeter`, `contains`,
`containsPoint`, `distanceToPoint`, `getBBox`, `getCentroid`, `intersection`,
`intersects`, `rotate`, `scale`, `subtract`, `translate`, `union` and `xor`.
These are useful candidates for the next implementation review, not newly
enabled operations. Their input shapes, bounds, returned values and actual
implementation dependencies still need review.

## Parser correction found during inventory

The old parser used indentation and a line-ending semicolon to identify the
end of a method. In this new declaration format, object fields can have the
same indentation as their enclosing method. It silently published method
prefixes ending at an inner field instead of refusing the unsupported input.
The four observed examples are:

| Method | Declaration source line |
| --- | ---: |
| `sys_HeaderMenu.removeSystemHeaderMenuItem` | 40839 |
| `sys_HeaderMenu.insertSystemHeaderMenuItem` | 40885 |
| `sys_IFrame.openIFrame` | 41355 |
| `sys_Tool.pcbComparison` | 43880 |

The correction in
[extension-api-declarations.ts](../plugins/easyeda-pro-control/server/src/extension-api-declarations.ts)
tracks parentheses, brackets and braces while ignoring quoted strings and
block comments. Only a semicolon outside those constructs completes a method.
Malformed delimiters, unterminated strings, trailing declarations, oversized
signatures, template literals and line comments refuse. It remains a narrow
declaration inventory parser, not a TypeScript grammar or executable allowlist.
Independent review also found that the outer comment handler could skip a real
method containing an inline comment or comment-like string, and could inventory
methods inside ordinary block comments. Leading comments now have their own
bounded handling; actual method lines go to the signature scanner. Same-line
comment-plus-member forms outside that supported grammar refuse within classes.

Eight focused catalog/parser tests pass with zero failures; strict type-aware
lint on the two changed files is clean. All 749 reviewed and 806 official
retained signatures round-trip exactly through the corrected parser. The
complete new installed declaration also parses, and the four examples above
retain their complete argument and return declarations.
The focused independent rereview accepts the comment-handling correction.

No installed declaration was copied into the committed catalog. No application
file, machine profile, external checksum, writer gate or execution route was
changed by this inventory or parser correction.

## Next compatibility work

Keep packaged offline documentation and diagnostics available when an installed
application no longer matches its profile. Connected calls must still refuse
the mismatch. Review the new public wrappers and every delegated native
implementation used by an enabled route before admitting a replacement tuple.
Treat declaration differences, implementation review, reproducible packaging
and disposable connected acceptance as separate evidence.

The earlier bounded-reader research remains in
[project and LCSC reader contracts](backlog-reader-official-contracts-2026-10-13.md).
Neither proposed lookup has an enabled route from this work.
