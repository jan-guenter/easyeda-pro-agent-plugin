# Original schematic publisher source

The supplied schematic bundles each contain two similar publication implementations. Following the sheet manager's constructor selects XE through fse/pse in the main bundle and MP through Rle/kle in the child bundle. The child uses the second implementation. Matching only a method description or choosing its first occurrence would not establish this source relation.

A separate source/metadata table now covers the selected publisher class, pending-data cache, batch publisher, local change, unique-ID getter, consistency client/unique getters, timer callback and Promise executor. It also pins the complete manager, manager-base, manager-core and consistency class blueprints. Full source hashes, spans, descriptions and actual V8 locations must match. All eighteen uninvoked functions across both bundles pass actual Node24 metadata checks. Foreign source, locations, field rosters and getter-bearing reply objects refuse. These checks issue no publisher, timer, receiver or continuation authority.

The source confirms that completed initialization sets the publisher's own `isDestroy` false, even though its constructor omits that field. The zero-delay timer calls the original batch publisher, resolves its captured Promise and then clears `pendTimer`; it retains the Promise field. Publishing empties the old per-document pending arrays and replaces the cache object. The source reads its module topic namespace, not the instance `busTopic.pushPend`. The live controller must bind that actual namespace and its data property before publication.

Both TypeScript projects, strict changed-file lint and two focused actual Inspector/refusal cases pass. Source audit tools and raw metadata remain private. No application, timer, publisher instance, native helper, primitive write or Save was created. The controller's original callback, receiver and publication completion work remains separate.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `307aac56c041410c494947a6a598c82e757410f4`; its
committed tree is `9cd2ceede8a6f850e12e413e7ace7bf28280f3b7`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
