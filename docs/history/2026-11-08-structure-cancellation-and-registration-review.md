# Structure cancellation and registration review fixes

Cancellation could arrive while `CurrentProjectStructureObservationWorkflow.arm`
awaited its original main lease. The first stop revoked the worker while the
main observer was still absent. Constructing the main observer afterwards and
then throwing the retained cancellation left that newly received lease live,
because the stop method deliberately preserves its first failure. The workflow
now cancels that observer immediately after construction when cancellation has
already won, before the current-state check throws. No normal request can resume.

The focused regression uses the actual combined factory, Main runner, private
lease issuer and main observer from the maintained original-reference fixture.
Only the workflow's outer owner/worker boundaries and delayed delivery are
synthetic. The original genuine lease is delivered after cancellation; the
actual observer then refuses normal arm and its inert helper receives zero arm
sends. The original main lease remains available solely for its supported
cleanup. No production registry is written by the test.

Registration target preparation and the actual fixed Inspector bind now share
paired cases for a `@1.2` suffix, trailing `@`, multiple dots, dots plus a version,
and the literal basename `@1.2`. Both paths retain the existing K0 behavior;
no new filename or semantic-version rule was introduced. Each actual bind is
also checked against changed metadata and performs zero application calls.

The registration source qualifier's intended non-string `TypeError` now runs
before its delegate, which previously rejected the input first and made that
branch unreachable. The delegate and complete hash/location guards still run
for strings. An object with a throwing conversion hook is rejected without
executing that hook.

Twelve focused workflow/registration cases pass, with both TypeScript
configurations and changed-file strict lint. No native program bytes, request
budgets, helper artifacts, source pins, live transports or app data changed.
