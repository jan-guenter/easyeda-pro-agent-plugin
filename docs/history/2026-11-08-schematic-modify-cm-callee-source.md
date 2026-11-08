# 2026-11-08 schematic Modify CM and Sheet callee source

This passive leaf pins 30 callable profiles from worker SHA
`0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046`.
It covers `ja` and inherited `Vc` methods for the selected existing TEXT,
new-ticket, pending-change branch; named-class alias `At = class dT` and its
selected static methods; the original EE comparer and inline forwarding,
lookup and pending predicates; and the Sheet TEXT publication methods.
Source matching supplies no live branch, receiver, alias or continuation grant.

Actual V8 metadata shows that dT has an implicit constructor of arity zero at
6:7582 and thirteen own fields: length, name, prototype and ten static methods.
The new decoder checks the complete roster and descriptors rather than reusing
a three-field class decoder. EE is a sloppy ordinary function with five own
fields, including arguments, caller and prototype. Method descriptions omit
leading `static`, while constructor descriptions retain their full class body.
Descriptions, script IDs and exact function locations are checked separately.
All original CM/Sheet receiver, callback, worker completion, Modify and Save
flags remain false.

The TEXT sheet callback forwards to inherited `ar.publishCanvas`. With a prior
TEXT row, the prior/current type comparison avoids its recursive type-deletion
publication. If the selected document is watched, the non-revoke branch still
appends a canvas row and may create a separate 20 ms timer. That timer retains
a native Promise in `project.publishTask`; only its actual callback resolves
and removes that Promise after publishing the canvas update. Cancelling this
timer alone would strand that task. This differs from the local ticket timer,
whose source retains no Promise. Live watch state, native calls and callback
settlement remain runtime work.

For node insertion, a proved single prior node without a list reaches the
replacement/list-creation return before Math.floor and splice. Existing-list
or older-pending branches require their own native and state proofs. The source
leaf does not silently exclude those branches. Likewise, `getFirstTicket`
references the inner dT class binding while `remoteChange` references module
alias At; the runtime must retain their original equality.

The complete tested runtime/test tree is
`4f09e2a168ba3c8039229477f017c0180871cad4`, based on
`99a5bbda`; this record is added afterward. Under Node 24.18.0, the two focused
cases passed with zero skips using the configured installed source root. They
cover all thirty source-preserving, uninvoked metadata profiles, plus an
unconditional dT/EE fixture and static-roster, shifted-location and foreign
script refusals. Both TypeScript configurations and strict type-aware
three-file lint exited 0. Initial lint failures are retained privately and
were fixed before the sealed checks. No constructors, selected source bodies,
C#, Windows, native owner, application or MCP operations were invoked. No
helper generation, runtime mount or payload-size claim is made.
