# Cleanup publication scan

The original tracked cleanup created each metadata event through `#revalidate`,
which loaded its journal and scanned all recovery evidence. It then immediately
called `#publish`, which loaded that same original journal and performed another
fresh global isolation scan before the first artifact write. No native call or
asynchronous application operation separated event construction from publication.

Event construction now captures only its retained original source. The publisher
still verifies the exact current journal, retained method/runtime/nonce owners
and full fresh recovery isolation before writing. Native close, original
termination and final nonce consumption retain their separate current checks.
No evidence digest, admission result or ownership proof is cached or passed
between calls. Uncertain publication still retains its exact pending bytes and
consumed native close; local settlement never repeats that close.

All nine existing focused cleanup regressions pass with isolated control roots
on pinned Node24.18.0 and zero soft core limit. They cover original HMAC/root/Job
cleanup, copied owners, pending callbacks, wrong nonce, lost artifact/journal
acknowledgments, a foreign journal change and failed close acknowledgment.
Strict type-aware lint passes after a comment-style correction. Exact combined
types, bundles and final CI remain required. This source change makes no measured
end-to-end speed claim and changes no persistence or replay contract.
