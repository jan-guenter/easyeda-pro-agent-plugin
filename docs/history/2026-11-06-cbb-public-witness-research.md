# Public CBB project witness research

On 2026-11-06 this bounded, application-independent check found concrete public
API/type contracts, but no literal system-owned CBB project UUID, branch UUID
and reciprocal board/document tuple in the inspected pages. A positive witness
remains pending. This is no claim that system CBB data do not exist or that a
runtime search would be empty. No app, account, vendor catalog endpoint or SDK
method was queried; no module was copied, downloaded, opened or placed.

The official `LIB_Cbb.search` contract defaults an omitted library UUID to the
system library and returns CBB search-item data. The official copy example
obtains system and personal library IDs at runtime and chooses the first search
result; it does not publish a fixed source module identity. These are lookup
recipes, not an independently retained witness.
[Search contract](https://prodocs.lceda.cn/cn/api/reference/pro-api.lib_cbb.search.html),
[copy example](https://prodocs.lceda.cn/cn/api/reference/pro-api.lib_cbb.copy.html).

The official CBB item interface includes its library UUID, module UUID and a
`boards` array. The board interface links `parentProjectUuid`, `pcb` and
`schematic`. This provides a concrete documented relationship to check if an
eligible public identity is later obtained. Those type definitions contain no
particular module/project/branch values. Inferring current system ownership or
reciprocal linkage from the types alone would be invalid.
[CBB item](https://prodocs.lceda.cn/cn/api/reference/pro-api.ilib_cbbitem.html),
[board item](https://prodocs.lceda.cn/cn/api/reference/pro-api.idmt_boarditem.html).

The public file-manager contract documents CBB archive retrieval by module UUID,
with optional schematic/PCB template UUIDs, and expressly requires the Team
Module download permission. Its sample also derives the module ID from a
runtime system-library search. The documented API therefore supplies no
account-independent static archive or project/branch witness in that example.
No permission check or download was attempted.
[Official file-manager method](https://prodocs.lceda.cn/cn/api/reference/pro-api.sys_filemanager.getcbbfilebycbbuuid.html).

The official reuse-template guide describes a reuse block as a special project
with associated schematic, PCB and symbol, linked by matching names. This
supports the intended relationship model but supplies no explicit witness tuple
in the inspected text. The official EasyEDA reuse-block extension README
instead describes catalogs detected from the current client's personal, team
and local libraries and optional user-exported catalog JSON; it is not a
published system-library project snapshot.
[Reuse-template guide](https://prodocs.easyeda.com/en/pcb/design-update-place-and-route-from-reuse-template/),
[official extension README](https://github.com/easyeda/eext-ai-reuse-block-placement/blob/main/README.md).

The inspected material is limited to those public documentation pages, the CBB
get/open method pages and that README. Restricted GitHub directory views and
document timeouts were not retried and are not negative catalog evidence.
No earlier403/empty vendor-catalog probe was repeated. Any future positive
fixture still needs an explicit public system-owner identity, actual project
and selected branch, complete matching board/SCH/PCB identities and independent
reciprocal checks under the maintained lifecycle. No fallback identity, API
example, library name or schematic/PCB name establishes that evidence.
