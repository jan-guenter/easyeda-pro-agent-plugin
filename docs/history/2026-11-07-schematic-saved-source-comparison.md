# Separate saved-reader source comparison

A fresh reader must not manufacture Modify or Save flags from the original
writer to compare its reopened source. The data-only comparison now has a
separate entry point that accepts the raw source and the original expected
seven-record model. It verifies the exact modified Text, all six persistent
peers, explicit Relevance attribute, complete ID roster and normalized root
permutation. Existing live-stage and Save guards keep their separate checks.

The result records source equality facts only. Original reader, cold load,
persistence, reopened and execution flags remain false. The outer reader must
still join its genuine closed checkpoint, fresh generation, complete cache and
loading observations, model/endpoint-marker inspection and final closed SQL.
No new native purpose or runtime continuation is enabled by this data helper.

Four focused tests pass through the existing inert application model, including
the old live-stage checks and new readback comparison. The original Text,
changed peer, foreign page and invalid root index refuse. The comparison invokes
no model method or Save. Changed-file type-aware lint and both TypeScript
projects pass. This batch is source-only and is not an accepted cold reopen.

The first integrated typecheck caught the test treating its deliberately unknown
VM counter packet as a typed object. The assertion now compares the entire
packet directly. This changes no production guard or comparison behavior.
