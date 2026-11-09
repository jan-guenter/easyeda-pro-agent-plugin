# Source-bound worker handler name

The registered worker arrow's metadata profile used the semantic label
`JP.bc.onmessage` as its own `Function.name`. The exact pinned JP constructor
creates an anonymous arrow whose own name is empty. The production metadata
decoder therefore refused that genuine handler before delivery.

The profile now requires the actual empty own name. Function description hash,
arity, complete own-field shape, script, location, scopes and prototype checks
remain unchanged. A source-preserving local Inspector regression constructs the
exact JP class with inert superclass and BroadcastChannel stand-ins. It proves
the actual name, passes the real decoder and rejects the old semantic label.
No registered callback, browser channel, app owner or CAD operation is invoked.
The initial real decoder refusal is retained.

The checked base is `0b02310e`. The runtime/test tree was sealed before final
checks as `2a54fc23e7f44657f402f98af11c49f537935733`; this record and history
index entries were added afterward. Seven focused cases passed with zero skips,
both TypeScript projects passed and strict two-file type-aware lint passed.
Initial Inspector parameter/remote-object TypeScript errors were corrected
before the final seal; no runtime guard or true side-effect flag was relaxed.

A Node schematic factory comparison retains the exact checked 2,070,635-byte
compiler SHA256 `d1e70063d6c22a909aa3e9c9d2df9801f544c37e9ae08d05c8f6209d89c1175a`.
The earlier bounded C# result therefore needs no repeat for this metadata-only
correction. This is source/Inspector evidence, not connected delivery or full
Modify/Save completion.
