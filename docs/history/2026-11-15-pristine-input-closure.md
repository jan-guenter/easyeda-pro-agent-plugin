# Pristine manager input closure, 2026-11-15

The foreground manager now retires its untouched ready metadata connection and
shuts down through its existing supported commands when original stdin reaches
EOF before any caller tool dispatch. The original connection must remain exact,
all evidence and output publications must settle, and no pending capture,
interrupted call, fault or uncertain retirement may exist. The attempt is consumed
before dispatch and is never retried. Caller activity retains the previous EOF
behavior. No process signal, helper adoption or lease edit is introduced.

The actual isolated facade regression observes original child stdin EOF, exit
and transport closure, then verifies that a caller-dispatched connection stays
active until explicitly retired. It passed with no selected-test skips. Strict
type-aware lint reports zero warnings and errors for the changed source and test.
These are synthetic lifecycle checks, not connected native validation. The
already-selected development batch remains unchanged; the new source has not
yet been published or installed.
