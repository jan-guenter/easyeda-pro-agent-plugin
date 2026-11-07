# Original schematic publisher bus family

The selected sheet publisher gets its project bus through xC in the main bundle
and e2 in the child bundle. Those factories import the CJS providers pL and fk.
The actual publish/post methods are the classes inside those provider closures.
A similarly named earlier BroadcastChannel bus in the same bundle is a different
copy. Qualifying that earlier copy would reject the real sender or prove the
wrong callback graph.

The fixed source table now binds the actual factory, publish, broadcastPublish,
post, loopback, onMessage and onReceivedPublish functions from both selected
providers. The actual post first sends its envelope through the retained native
BroadcastChannel, then schedules a local Promise callback. Local callback
rosters, receiver identities, native sender and eventual worker delivery remain
independent requirements. A post return alone proves none of them.

Fourteen uninvoked installed functions pass actual Node24 Inspector metadata
checks at their original source positions. Changed descriptions, foreign scripts,
shifted positions and accessor-bearing reply data refuse. Strict changed-file
lint and both TypeScript projects pass. These metadata leaves have not yet been
frozen or exercised as an original connected publisher.
