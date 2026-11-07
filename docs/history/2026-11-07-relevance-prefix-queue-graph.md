# Seven-record action prefix: queue and listener graph

This source-only leaf supports the original held `run` preflight. It creates no owner, issuer, callback permission, setter permission or native command. It leaves `originalOwnerVerified`, `callbackReceiverVerified`, `continuationAuthorized` and `completeActionFrontierVerified` false. The actual collector must bind every packet to the original held frame and correlated request before using these projections.

`current-schematic-relevance-action-prefix-queue-source.ts` pins both complete installed schematic scripts and 23 exact spans in each. These cover the event base and queue, both history start/end listeners, the separate WillEnd callback, `clearTempData`, later reset/doc listener/register arrows, and listener/disposable cleanup including `dE`/`qM`. Regular-function strictness follows the pinned AST ancestry. Its module expressions are `[tn,dE,nC,wB]` and `[rn,qM,LC,IL]`; the final two values are actual symbols, never JSON substitutes.

The fixed programs in `...queue-programs.ts` use retained Raw19 native descriptor operations. Each stage returns newly found objects without traversing them. The collector must first obtain their actual non-Proxy metadata, then qualify every inspected prototype. `qualified` holds at most 384 actual JS references; `merge` deduplicates by JS equality rather than remote object ID equality.

| Projection | Exact result |
| --- | --- |
| `roots` | 9: will emitter, recorder, document emitter, shape container, resolver WeakMap, consistency manager, upload implementation, pause implementation, auto-cancel timer |
| `events` | 9: start/end emitters, disposable store, will/doc subscription arrays and options, optional doc/will queues |
| `details` | 7: start/end arrays, options, queues and disposable Set |
| `subscriptions` | 4: two start and two end subscriptions |
| `functions` | 18: 17 source callees followed by a descriptor/reference reproof function |
| `scopes` | 3: first-start `t`, second-start `e`, second-end `e`; all equal to retained shapes |
| `willEndRoot/Details/Subscription/Functions` | 1 / 3 / 1 / 3, preserving preceding tuple indices |
| `manager` | 2: original manager's own `_base` and `consistencyManager`; separate base identity check |
| `container` / `containerMembers` | 2 / 2: own Map/WeakMap, then sole ID and opaque WeakRef |

Start and end emitters have exactly two listeners and idle delivery queues. WillEnd has one listener and no queue. Only the runner's will-run emitter requires zero listeners and no queue. Options hooks must be absent through every qualified prototype. The disposable Set is initially empty. The same-reference proof snapshots full descriptors and prototypes; include qualified WillEnd objects before taking that snapshot to cover all three emitters.

The source lifecycle is start → WillEnd → end. First-start installs three handlers and two disposables. WillEnd disposes those subscriptions and invokes reset. End clears temporary command data and the second end callback resets the bus-group Set. Later `active` projections require their own preceding metadata boundary; their existence authorizes no callback.

Actual Node 24.18.0 Inspector packets for both exact variants expose first-start `t` and second-start/end `e`. **They do not expose lexical `this`**, even for arrows that reference it. First-end and WillEnd expose no closure binding. This leaf has no lexical-this scope decoder. `callbackReceiver` requires an actual held callback-entry receiver proved by the separate original collector; source text or a supplied history handle cannot replace it.

The single shape container has count one, one Map entry and a WeakMap mapping retained shapes to ID one. Actual V8 WeakRef metadata contains `[[Prototype]]` and `[[WeakRefTarget]]`; the latter must compare in JS to retained shapes without invoking `deref` during projection. Missing, collected, Proxy or substituted targets refuse.

The extra-intrinsic expression returns ten original objects, followed by seven prototypes and 38 members: 34 callable slots plus actual `Symbol.iterator`, `split`, `species`, `toStringTag`. It includes Array map/slice/forEach, String split/slice/trim, Function call, Reflect operations, Set/Map/WeakMap methods, WeakRef deref, Error/Promise operations and Array/Promise species getters. Capture invokes no getter. It rejects Error.prepareStackTrace and String separator split hooks, bounds the primitive stack limit, checks iterator aliases, constructor links and Promise tag, and retains species getter functions for metadata qualification. Truthy native trim excludes the trace-map replacement fallback.

The host must still qualify these actual native callable packets and original MapIterator.next / source-generator next and iterator chains before allowing the application path. This leaf invokes no iterator, WeakRef, event, getter or disposable to obtain proof. It makes no complete-frontier claim from empty queues or the data graph.

Five focused cases under pinned Node 24.18.0 and test isolation execute exact installed queue/disposable/listener methods on an inert VM graph, exercise start/WillEnd/end reset, reject callback/prototype/hook drift without hook execution, and inspect actual callback scopes and WeakRef metadata. Both TypeScript projects and changed strict type-aware lint pass. No app, native owner, MCP connection, helper, pin, bundle or version changed.
