# Original Fetch request read continuation

The current Electron backend constructs a Fetch `Request` for its `BL` wrapper.
`Request.method` is an original builtin getter, so treating it as an own data
property safely paused even project GETs. The shared driver condition now reads
only the source-known wrapper's own `pureUrl` and pauses project requests. The
same original main cursor qualifies the method before any continuation.

The builtin profile comes from the pinned installed executable, read without
executing it: the NUL-delimited 745782-byte Latin1 source at offset 190129216
becomes 745783 UTF8 bytes. The actual CDP script must match the complete builtin
hash, original main execution context, getter/class/brand function locations,
and original scope references. The fixed program joins the request prototype,
original `_Request`, `webidl.brandCheck` and native
`FunctionPrototypeSymbolHasInstance` references. It rechecks those joins around
one original method getter invocation. It reads no Request URL/body getter and
calls no application method.

A descriptor snapshot retains the original `BL`/`zL` wrapper and its private
headers object. The returned observation contains only method, own URL/query
snapshots and the own path header. Cookie and authorization values/getters are
neither read nor serialized. A copied observation or another runner cannot
recover the original packet/pause registration.

Only GET or HEAD for the checkpoint path-derived project can obtain one driver
resume. The resume requires its original current pause and real resumed event.
POST, another project, an unknown getter/source or any drift remains held.
Every raw/prepared SQL mutation remains fenced independently; this request
continuation supplies no SQL, Save or persistence authority. Later Via request
observers can use the same original packet/read method without another getter
scheme or inspector connection.

The finite graph adds six fixed command cases and reserves twenty original
source/scope proof requests plus sixty-four read request observations of at
most six commands each, including the single resume. Existing mutation and
configuration reservations remain separate. The resulting Via main budget is
715 normal plus twelve cleanup requests; the schematic main budget is 692
normal plus eight cleanup. Released renderer/forward graphs are unchanged.

Twenty-nine focused tests cover the production original main cursor and reader
with explicit inert source/inspector seams, wrong source locations, private
packet forgery, selected GET versus held POST/foreign GET, descriptor/proxy
refusal and header privacy. A separate test qualifies the actual embedded PE
source when installed assets are present. Strict TypeScript/type-aware lint
pass. The full composed native source compiles and its refusal/parity smokes
pass under Linux. No EasyEDA, Windows native process, live MCP or helper
regeneration was used for this increment.
