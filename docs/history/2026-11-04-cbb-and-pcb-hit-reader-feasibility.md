# CBB and PCB hit-reader feasibility

Source review on 2026-11-04 against main
`bd357765a3801afa3642014775b2af3afe9a3a58`. This review covers
`lib_Cbb.get`, `lib_Cbb.search`, `pcb_Document.getPrimitiveAtPoint` and
`pcb_Document.getPrimitivesInRegion`. None gained an enabled execution route.
No EasyEDA MCP, native diagnostic or editor call was made. This investigation
opened or edited no local project and changed no profile, installed package
or cache. Anonymous vendor HTTP probes are documented below. No new comparison
model or test was added.

## Primary implementation and declarations

Offsets below are UTF-16 code units into complete installed vendor files,
independent of the public documentation's current release.

| File below the installed assets root | SHA-256 |
| --- | --- |
| `pro-ui/3.2.198.2800f583/js/ui.js` | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

The official [CBB getter](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_cbb.get.html),
[CBB search](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_cbb.search.html),
[PCB point getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getprimitiveatpoint.html)
and [PCB region getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getprimitivesinregion.html)
remain beta. The region contract distinguishes complete enclosure from contact
through `leftToRight`. The point contract describes front-end mouse picking.
These contracts do not establish the installed implementation's completeness
or freedom from side effects.

## CBB has a project/profile contract

UI `LIB_Cbb.getInfo` at 17383877 treats the `Project` pseudo-library separately.
For another project, it fetches `PROJECT.GET` by the CBB UUID, then follows the
returned `branch_uuid` into `PROJECT.GET_PROFILE`. The supplied library UUID
does not constrain that remote-project lookup. It parses `structure`, joins
schematic and PCB `board` references into the board dictionary, and returns
board names plus schematic/PCB references. The public mapper returns the
project's `owner.uuid` as `libraryUuid`.

Consequently, adding docType 17 to the existing component-metadata getter
would use the wrong resource and omit required `ILIB_CbbItem.boards`.
The smallest useful anonymous getter needs a fixed system-owned, public CBB
project witness before its profile request. It must bind the returned project
and branch, bound the entire structure, and prove reciprocal board membership
with unique schematic/PCB references. Missing or failed profile data must
refuse, never become an empty boards array. No positive system-owned CBB
project/profile sample is available from this investigation.

Desktop search does not use the online component search. `zO` at 12194697
takes the desktop branch into `z7n` at 12192224. That calls
`CLIENT.GET_PROJECT_PATHS` with `cbb:true` and `refresh:"yes"` before filtering
the discovered local paths. It cannot be exposed as an anonymous public-catalog
read. The online nonempty-query branch instead calls component search with
docType 17, while its empty-query branch calls the CBB project list.

The installed CBB search mapper returns `c.path` as `libraryUuid` and derives
name, description and timestamp through alternative project fields. The
installed `ILIB_CbbSearchItem` declaration also requires `ascription` and
`lastModifiedBy`, which that mapper does not provide. A future HTTP subset
must state its actual projected fields and validate the ownership witness
instead of inferring it from the requested library or the SDK declaration.

Three anonymous, credential-free fixed-system requests were attempted once:
docType 17 component searches for `power` and `USB`, and the source-defined
`/api/cbbProject` list with `user_uuid` fixed to the system UUID. Each returned
HTTP 403. Redirects were disabled, successful response bodies had a 1 MiB
acceptance bound, and each request had a 20-second urllib timeout. No account or alternate endpoint
fallback was attempted. These refusals supply no positive response schema,
project eligibility or absence evidence. They do not replace the earlier
recorded empty CBB search sample.

The original submitted command and matching output were recovered from this
task's retained tool history, call
`call_516ddbe989c64dd6be62200d961c91aa`, submitted at
`2026-11-04T08:22:04.961Z` with output at `2026-11-04T08:22:05.288Z`.
The following are that command's actual request definitions, not parameters
inferred from the vendor source or a later reproduction. All three used origin
`https://pro.easyeda.com` and fixed public system-library UUID
`0819f05c4eef4c71ace90d822a990e87`.

The two searches used `POST /api/v2/components/search`, no URL query, and these
UTF-8 `application/x-www-form-urlencoded` bodies, respectively:

```text
uid=0819f05c4eef4c71ace90d822a990e87&path=0819f05c4eef4c71ace90d822a990e87&page=1&pageSize=5&wd=power&needStr=false&returnListStyle=classifyarr&docType%5B%5D=17&type=3&isProject=false
```

```text
uid=0819f05c4eef4c71ace90d822a990e87&path=0819f05c4eef4c71ace90d822a990e87&page=1&pageSize=5&wd=USB&needStr=false&returnListStyle=classifyarr&docType%5B%5D=17&type=3&isProject=false
```

The list used `GET` with no request body and this exact path and URL query:

```text
/api/cbbProject?page=1&pageSize=5&user_uuid=0819f05c4eef4c71ace90d822a990e87&isCbb=true
```

The command supplied these same explicit headers to all three requests:

```text
Accept: application/json
Content-Type: application/x-www-form-urlencoded
path: 0819f05c4eef4c71ace90d822a990e87
```

It supplied no cookies or authorization header and installed no credential or
cookie handler. A three-worker executor submitted each request once through
`urllib.request.build_opener(NoRedirect()).open(req, timeout=20)`. The timeout
is urllib's socket timeout, not a cumulative wall-clock deadline. On success,
the command would read at most 1,048,577 bytes and reject bodies above
1,048,576 bytes. All three instead raised `HTTPError` with the recorded message
`HTTP Error 403: Forbidden`; their error bodies and response headers were not
read or retained. The retained evidence is the command and its tool output,
not a raw HTTP wire capture. No probe was rerun to recover these details.

## PCB hits must be captured before serialization

The point RPC begins at PCB 10305258. Its ordered result flows through
`Hr.pointSelect`, `qt.filter`, and `Hr.filterPartiton`, then removes every
object without `toJSON` before calling `Ey`. The public SDK applies another
family mapping that drops Text and unsupported types. A later supported hit
cannot establish the original first hit. The existing RPC cannot recover
discarded identities, even if every returned DTO is otherwise validated.

`Hr.pointSelect` at 7080602 depends on the native visible/pick filters, DRC
precedence, camera scale, environment and native hit tests. Its helper
`pointSelectBeforeFilter` at 7079069 derives a scale-dependent search margin.
Filtering independently enumerated DTOs by their bounding boxes would change
this contract and omit unsupported native families.

The region RPC at 10304933 constructs the native rectangle, then calls
`getItemsByBBox` at 7881961. That invokes `boxSelect`, which calls `select` at
7849553. `select` invokes the design-service `modify` path, clears/rebuilds
selection, updates selection order, publishes selection events, and can
schedule selected-source publication. Restoring selected IDs afterward would
not undo or prove absence of these effects. The same `toJSON` and SDK-family
losses follow this selection-changing call.

There is a concrete lower-level candidate for a nonselecting region reader.
The selection tool's `leftToRight` at 7860257 calls
`Hr.getSelectInside` at 7077061 through `qt.filterElement`.
`rightToLeft` at 7860383 uses `Hr.getSelectContect` at 7078862 and `YP`.
These method bodies do not call `boxSelect` or `select`. Their transitive
geometry/filter/cache behavior has not been qualified as nonmutating, and
their closure-held native objects are not an exposed, admitted reader route.
The similarly named sequential-move methods at 8545102 use a different
inside-selection option and an additional filter, so those are not substitutes.

## Next implementation boundary

For PCB readers, qualify one original-frame native selector capture that
retains the actual `Hr`, `qt`, selection-tool and geometry receivers. Inspect
and bound all native identities before serialization. Preserve hit order,
native family, global ID, parent and model ownership; reject unsupported
families without selecting a later supported item. Apply the real direction,
filter, partition and annotation semantics. Double-sample the complete
identity sequence and relevant selection/source observations under the same
owner. Disposable geometry must establish boundary/contact behavior and
selection/source invariance before a public read route is enabled.

For CBB readers, first obtain one positive anonymous system-owned CBB project
and its matching branch structure through the reviewed vendor contracts.
Then implement a separate bounded project/profile getter and search
projection, with exact ownership and reciprocal board membership. Neither
desktop path discovery nor a guessed component response fills that gap.

The existing four omission reasons remain accurate. This investigation
identified implementable native selector entry points and more precise CBB
requirements, but did not establish an executable public replacement. Source
and generated coverage/bundles/version pins were left unchanged.
