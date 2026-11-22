# Wire encoder native checkpoint codebook

The private encoder checkpoint can now generate a fixed C# 5 request
codebook for one complete script-source read, 12 metadata reads and one
membership comparison. It uses the existing closed
[encoder source checkpoint](2026-11-22-wire-encoder-source-checkpoint.md)
phases and templates. The native cursor requires the original caller's
session and script handles, orders the three lanes and consumes each
accepted request ID once. The membership row carries exactly 26 remote
argument handles. All rows fit the existing 16 KiB request frame.

Focused TypeScript tests compare the generated table against the exact
source, metadata and membership commands at maximum handle length and
reject out-of-scope command shapes. The emitted C# 5 compiled with warnings
as errors and passed its isolated managed smoke against the retained
bounded decoder. The smoke compared exact message hashes and refused
wrong methods, fields, source IDs and request order. The native producer,
application and Windows helper were outside this fixture.

An original Core owner still needs to bind the qualified session, script,
holder and remote objects, route complete script replies to the separate
source framing, and account for actual helper-source and event delivery.
Original frame and normal-return observations, return equality, the
natural checker, upload and exact returned source, and the worker, Main and
SQL joins need their retained actor and request evidence. Execution and
Save remain false.
