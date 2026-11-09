# Modify cumulative roster bound

PR202 finding4508762615 identified a real mismatch in the original structure observer. Its cumulative Modify graph can retain up to256 objects from worker preparation, while the shared property parser admitted64 fields and the local size check used the separate128-new-object budget. The observer therefore refused valid larger original rosters before reaching its later proofs.

The Modify-only parser now admits256 indexed own data fields plus the single length descriptor. Its dense-array, duplicate-field, accessor, expected-length and complete-roster checks remain. The shared64-field schema and128-new-object graph budget are unchanged. The pure decoder is the same function used by the original private observer method; it supplies no owner, execution or continuation authority.

The focused boundary case accepts0,64,128 and256 selected fields and refuses257, sparse or duplicated fields, accessors and a mismatched expected length. An initial test caught a newly introduced use of the smaller clock-reply copier, which cannot hold257 property rows. The corrected Modify-only decoder uses the existing bounded descriptor-safe metadata copier before its separate257-field schema. A first lint failure on declaration order is also retained.

The checked source/test tree is `de4d175e9087263fa6a649c80f14951f9a3db15e`, based on `a679ccc5`. Both TypeScript projects, strict lint on the two changed TypeScript files and the focused boundary case passed under pinned Node24.18.0. No C#, native/app/MCP action, generated code, artifact, source program, request limit or continuation guard changed.
