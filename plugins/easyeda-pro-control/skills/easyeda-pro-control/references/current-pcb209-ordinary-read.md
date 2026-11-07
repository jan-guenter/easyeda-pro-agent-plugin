# Ordinary PCB observation on 3.2.209

Use this owner for a user-authorized ordinary registered local project. Discover
`pcb209-ordinary-read` with `query:{includeSchemas:true}` through
`easyeda_control_api`, then validate each inner request with
`pcb209-ordinary-read-validate`. Execute through
`easyeda_control_pcb209_opening` using
`request:{action:"ordinary",request:<inner>}`.

Use a distinct `pcb209-ordinary-*` operation ID. Launch requires
`confirmOrdinaryReadOnly:true`, `confirmDiagnosticLaunch:true` and
`acceptExistingProfileEffects:true`. Project opening requires
`confirmOrdinaryProject:true` and `acceptNormalOpenEffects:true`, plus the exact
registered Windows path, its path-derived project UUID, existing PCB UUID and
current file SHA-256. The facade preserves and rechecks the complete managed
checkpoint before navigation and derives its default branch.

Launch and normal opening can restore tabs, migrate files, replay caches, contact
services, change shared settings and automatically persist or Save. Normal
closure can also persist application data. These effects require user authority.
The reader stages offer no CAD edit, explicit Save or prompt-choice action.

Follow the [209 opening lifecycle](current-pcb209-opening.md) for browser, frame
and UI qualification, one project open, one PCB open and PCB source/identity
qualification. The ordinary owner then offers the same eight once-only readers:
`observe-layers`, `observe-primitives`, `observe-extended-primitives`,
`observe-selection-relations`, `observe-pad-shapes`, `observe-image-shapes`,
`observe-arc-shapes` and `observe-poured-shapes`. Every existing native predicate,
DTO limit, geometry restriction and transport ceiling remains in force. Query
published object results with their exact `resultRecordSha256`; historical
queries establish neither freshness nor current ownership.

Keep the original owner alive through normal close, separately observed original
root/Job termination, helper release and record settlement. Lost responses consume
their stages. Inspect before continuing; do not replay opening or observations.
Historical JSON cannot recreate native handles. Ordinary, disposable, spatial,
visual, compiler and writer purposes cannot exchange their ownership.

This route does not open schematic pages or project libraries. Loaded PCB
observations do not prove complete source, electrical connectivity, physical
stackup, asset content, render freshness, saved membership or writer eligibility.
Source implementation and synthetic tests are separate from connected admission.
