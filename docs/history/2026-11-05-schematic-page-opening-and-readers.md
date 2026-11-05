# Ordinary schematic page opening and readers

This source-only follow-up to the
[ordinary PCB owner](2026-11-05-ordinary-pcb-read-owner.md) adds two registered
wrappers under `easyeda_control_pcb209_opening`. It changes no production design,
legacy schematic writer guard, native PCB frame predicate or Save authority.

`schematic-page-open` owns one `sch209-open-*` navigation in an already loaded
matching local project with no editor tabs or PCB iframes. It preserves a
complete exact original checkpoint and proves the ordinary `SCH_PAGE` and `SCH`
parent in the default branch. The fixed parent-UI program retains its native
receivers across registry and public `openDocument` awaits, with exact path,
project, branch, tab and physical-window identity checks. The index requires its original retained ordinary-launch runtime and rechecks
that same allocation around every await. The maintained tracked dispatcher binds
actual original process authority and global ambiguity quarantine. A durable navigation journal is consumed before dispatch. There is
no timeout race, replay, new-project opening, explicit Save or writer action.
Public acknowledgment is separate from page readiness and background work.

Opening can initialize drawings, update partition/title metadata, replay caches,
contact services, change shared state and automatically persist or Save. These
are disclosed normal-opening effects. The route promises neither passive
navigation nor unchanged storage. Original application cleanup stays with the
retained launch owner. Local journal inspection grants no historical ownership
or quarantine-clear authority.

`schematic-page-read` is a separate authenticated already-active type-1 read.
It supports Text/Wire/Bus `get`/`getAll` and supported selected DTOs. Existing
native DTO compilers keep their complete family/tree/source-ID/collection/scalar
predicates. Selection resolves one complete supported mixed roster, promotes
observed Wire/Bus line children to their parent group and preserves native
selection order after deduplication. Unknown, missing or inherited selected
families refuse whole. Stable source-ID membership is not full raw source,
connectivity, saved membership or persistence proof. Symbols, placed-component
pins and arbitrary annotations remain excluded.

## Exact installed source examined

- Application `3.2.209.8a704eab`, public API `0.3.59.1ca9efb5`, UI `3.2.198.2800f583`.
- SCH `3.2.193.5dbe8bb3` parent `sch-main.js`, 6,289,622 bytes,
  SHA-256 `e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c`.
- SCH `sch.js`, 6,472,538 bytes,
  SHA-256 `b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd`.
- Existing reviewed app bootstrap and `3.2.185.bf63a159` manager/worker pins are
  additionally required for opening. Legacy SCH192 writer pins stay unchanged.

Parent SCH source examination found the copying `getModels` at UTF-16 offset
4,291,192, copying `getSourceCodeIdMap` at 4,455,726, page construction/parent
identity around 5,370,000, active-document lookup at 5,758,737 and ordered native
selection lookup at 5,376,422. The source getter uploads objects through an
encoder and is deliberately not invoked. Full installed source pin verification
passed read-only for UI/SCH/opening dependencies. This is file-source admission,
not loaded-renderer or connected execution evidence.

The official [openDocument reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html),
[Text enumeration](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivetext.getall.html)
and [Wire enumeration](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivewire.getall.html)
were consulted as declarations. The fixed native DTOs do not claim SDK instance
parity or the entire declared contract.

## Verification and remaining scope

Node 24.18.0/npm 11.16.0 ran with soft core limit zero. Typecheck and strict
type-aware targeted Oxlint passed with zero warnings. Repository, plugin/MCP
contract and all-seven-skill validators passed. The final focused run passed
196 tests, including unchanged legacy DTO regressions. Earlier test-fixture and
scope-description expectation failures were retained before this passing run. The focused campaign
covers real managed checkpoints and encrypted synthetic SQLite history,
nonempty Text/Wire/Bus DTOs, supported/unsupported selection, receiver drift
around awaits, no timer-based false completion, actual registered callbacks,
consumed journal replay refusal, lost-acknowledgment quarantine, pre-dispatch
source drift, post-open runtime drift and coverage/facade scope descriptions.
All application and process behavior in these tests is synthetic. No live native
owner, application launch, user project opening, edit or Save was dispatched.
The subagent's startup-conflict stub was inspected and closed once through its
own supported session route; an independently retained pidfd observed its exit.
The observed other owner was untouched, and the closed transport was not retried.

Separate ordinary PCB coverage routes now describe ordinary admission without
rewriting the old disposable routes. New page routes cite their actual schemas,
source and regression tests. Generated coverage, bundles and compatibility
projections are left to the composed payload. No installation, connected
admission, live effect, saved/reopened proof or publication is claimed here.
