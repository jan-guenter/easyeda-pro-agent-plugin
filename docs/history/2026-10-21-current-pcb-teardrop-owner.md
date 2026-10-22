# Original subscribed teardrop owner

The diagnostic and String pre-create readers now recover the original teardrop
owner from six retained bound subscriptions. They no longer require a `Zec`
binding in the Save callback's lexical scope. This changes owner discovery,
not the accepted producer state or any execution permission.

## Source finding and historical limit

The pinned PCB bundle is `3.2.193.682ed44e`, 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
It was read as inert text, never evaluated. The identifier `Zec` occurs once,
at UTF-16 offset 10,793,176, in its top-level construction `Zec=new Sfe`.
No callback references that binding. Requiring it in a V8 closure scope was
therefore unsupported. An earlier synthetic fixture accidentally captured
`Zec`; the corrected fixture omits both that owner binding and its class from
the retained callback scope.

The connected 233238 attempt failed in `constructors-precreate` before its
constructor-property requests. Its raw selector exception was not retained.
The missing binding is a concrete source defect, but the exact cause of that
historical attempt remains unknown. New bounded selector diagnostics identify
the fixed bundle/profile/stage/reason without disclosing exception text,
design values, object handles or arbitrary property names.

## Fixed original-owner path

The Sfe constructor, beginning at offset 9,092,139, installs these subscriptions
through the original PCB message bus. Each callback is an ordinary bound
method with no bound arguments:

| Topic | Target method | Method source offset |
| --- | --- | ---: |
| isMoveSwitch | isMoveSwitch | 9,092,626 |
| SetSuspend | setSuspend | 9,092,656 |
| cheakTearDrop | addModify | 9,092,748 |
| addModifyTeardrop | addMaodifyTeardrop | 9,092,685 |
| flushTearDrop | flushService | 9,092,797 |
| refreshTearDrop | refreshService | 9,093,098 |

The fixed selector requires the original `MSG_BUS_PCB` HJ bridge, its Oet bus,
and exactly one active Z1e subscription for each topic. It retains all six
callbacks. Host decoders require complete bound-function metadata, each exact
target body/hash/name/arity/location in the admitted script, and a complete
empty `[[BoundArgs]]` inventory. Matching a class name or object shape is not
enough.

The fixed association receives all six `[[BoundThis]]` objects and target
functions from those inspector replies. In the original context it compares
the actual receiver identities, not remote-handle strings. Every receiver must
be the same Sfe instance. Each target must still occupy its original own
prototype method slot, with no instance shadow, and each registered callback
must still be the exact retained callback. The following constructor bundle
qualifies Sfe's source location and constructor metadata as before.

This takes 21 fixed requests: one callback selector, one tuple-property read,
three property reads per callback, and one association. The containing runner
retains its original lifecycle checks, effect-checking flags, request ceiling,
single object-group release and final owner check. The resulting proof tuple
is not a public input. Constructor and pending readers recheck its retained
subscription, target, prototype and descriptor associations at each use.
Root inventory and empty-producer readers keep their two-argument contract;
neither reads the teardrop owner.

No subscription, target method, constructor, getter, timer or cancellation
operation is called. Empty producer collections remain sampled observations,
not evidence of cancellation, atomic state or continuous quiescence. This
bound-function path says nothing about the separately unresolved hidden arrow
receivers, publisher provenance, native BroadcastChannel peers, Save authority
or writer admission.

## Remaining dormant consumer

`server/src/current-pcb-string-command-state.ts` remains an unregistered,
source-only post-create component. It still assumes lexical `Zec` and `Sfe`.
Before registration it must accept the retained original-owner proof, use the
qualified constructor association, and recheck the same six subscriptions.
Its synthetic tests must stop supplying those artificial lexical bindings.
No connected post-create support is claimed for it in this batch.

## Verification

An inert source audit matches all six method excerpts, hashes and locations
and confirms the single `Zec` occurrence. A real V8 inspector test uses a
synthetic class with those inert methods at the reviewed source positions;
the methods are never invoked. It verifies the 21-request proof with `Zec`
and `Sfe` absent from the callback scope. It rejects a same-class foreign
receiver, nonempty bound arguments, an own-method shadow and a callback swap
between metadata qualification and association. No instrumented getter or
vendor callback ran and no debugger pause occurred.

The constructor, pending, teardrop and dormant worker-gate suites pass 14
focused tests. Targeted strict type-aware lint is clean. These are source and
synthetic results; connected admission of this revised path remains separate.
