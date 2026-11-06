# Original Via factory refusal journal

The outer Via workflow needs to journal allocation intent before entering its
factory. The original v1 terminal `no-allocation` intentionally applies only
before that intent. A factory failure after intent but before native allocation
therefore had no accurate terminal record. It must not be represented as an
observed process exit or helper release.

New journals use `private.pcb209-via-write-journal.v2` and v2 record envelopes.
The separate `allocation-refused` terminal requires a failed, still-pending
allocation stage and a proof from the original private Via factory. That factory
must retain the original preparation and plan, have state `no-resource`, and
have no original child, owner, EOF attempt or cleanup failure. Empty process
lists, copied JSON, a missing owner or an error string cannot issue this proof.
The new entry explicitly claims no original process exit or ownership transfer.

The journal reserves the attempt before its first await. It requires the genuine
proof again before publication, retains a lost pending publication, and refuses
a second attempt. The normal generic append route cannot write this terminal.
The immutable v1 records and pre-intent terminal still parse. Mixed versions and
the v2 terminal under a v1 envelope refuse. No existing journal is migrated or
rewritten, and the new terminal cannot resolve an allocated or ambiguous owner.

Focused tests use the real managed artifact publisher and explicit inert plan
and factory-proof seams. They verify the new terminal, copied-proof refusal,
once-only consumption and unchanged v1 parsing alongside the existing dispatch,
Save and publication cases. Separate real owner-boundary checks reject fabricated
plan/proof metadata. These source changes grant no native allocation, create,
Save, recovery adoption or persisted design proof.
