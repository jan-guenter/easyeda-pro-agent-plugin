# Original Text history recording

The original Relevance7 callback observer now exposes
`continueOriginalHistoryToFinish()`. It continues the held history callback only
through the ordinary Text command branch, the original command's attribute
recording method and the held final debugger statement of the generated action
callback. That callback has not returned, and normal transaction success,
consistency/publication, worker delivery, Modify completion and Save remain
closed.

Two exact function-call points are acknowledged before the history callback
continues. The first holds `getModelHistoryCommand` before its first body read,
where the actual receiver, Text argument and current lexical Tk/y8 constructor
are joined to the original source-qualified references. The second holds
`onAttrChange` before its body, with the actual command, arguments and current
Fl/Zl parent key. These continuations and the later callback-finish hold require
separate consumed reservations, actual write acknowledgments and resumed events.
The same original UI event stream handles pauses on either side of each ACK.

The current Text parent/tagName getter mappings, native collection methods,
constructor/base/prototype links and absence of constructor-field hooks are
reproved. The group-model cases are excluded by the original constant Text
getter. The implicit derived constructor forwards its arguments directly,
without an Array iterator call, as specified by
[ECMAScript ClassDefinitionEvaluation](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-runtime-semantics-classdefinitionevaluation).
Its actual source-qualified base constructor writes only the original model and
two fresh dictionaries.

The new command must have exactly those three standard own fields. Before
attribute recording, both dictionaries are empty; the original Map contains
only Text→command and the original command Set contains only that command.
After recording, both dictionaries have exactly `attrs,parent`, with distinct
standard dictionaries containing only the planned old/new underline values.
Parent references remain exact. New Raw snapshot deltas admit only the two
collection insertions in addition to the already proved underline/AST/view
changes. Existing immutable guards and all unrelated fields stay exact.

The separate own7 lane reserves 56 requests: 46 readonly observations, two arms,
three resumes and five controls. It grants neither callback return nor Modify
or Save completion, and sibling purposes reject its encoding. It does not read
`doc.tabId`; the inherited tabId getter frontier remains separate.

Validation: 25 focused cases pass, including both complete pinned source
variants, actual Node 24.18.0 Inspector readonly calls with
`throwOnSideEffect:true`, actual get-model and attribute entry frames, child
constructor/parent aliases, a zero-hook inherited-field refusal, ACK/event
orderings, distinct-purpose encoding and whole native source idempotence/bounds.
Both TypeScript projects and changed strict lint pass. The complete schematic
C#5 source compiles on Linux and its new fixed codec smoke passes without owner
construction (1,811,199 compiler bytes). No app, Windows process, MCP operation,
saved project or tracked generated/installed helper was used or changed.
