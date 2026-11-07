# Generated PCB Via write

This controller is limited to a generated disposable Via-only or Line/Via
fixture. It creates one normal, unlocked Via with an empty net name, attempts
one Save, then verifies the closed file and a separate saved reader generation.
It offers no ordinary-project writer or inverse.

First call `easyeda_control_api` with:

```json
{"request":{"action":"pcb209-via-write","query":{"includeSchemas":true}}}
```

Read `mountedInPublicUtilities` and the serving facade's actual tool list. A
false mounted value means the writer is unavailable in that payload. Report
that result; do not substitute a private script, an older owner, or direct SDK
execution. Matching schemas and source implementation do not prove connected
execution. The source controller still needs its matching native payload and a
complete connected case.

## Prepare and execute

Use the [generated fixture workflow](managed-fixture-import.md) to establish
the disposable source. This controller takes data from the same facade's
released original closed-data qualification. It does not adopt the earlier
import process or native helper. Query `closed-generated-fixture-data` for its
current exact arguments and resource-release requirements.

`prepare` takes the original `fixtureOperationId`, a new `pcb209-via-write-*`
operation ID and Via geometry in mil. Only that named PCB qualification can
supply its original data token. The hole diameter must be smaller than the Via
diameter. Named nets and other fixture families refuse. Preparation consumes
the data token before checkpoint work; it cannot be reconstructed from JSON.

Validate the complete request with offline `pcb209-via-write-validate` before
calling `easyeda_control_current_pcb_via_write`. Query the execute schema rather
than omitting its confirmations. Existing task authorization supplies user
consent; confirmation fields do not replace the controller's provenance,
installation or original-owner checks. Keep other application workflows closed.

Execution runs in the background so `inspect` and cleanup remain available.
Retain its operation ID and original facade. The controller holds the original
launch exclusion through the writer and separate saved reader. Its SDK Save,
Main SQL, local producer and upload drain run together. Only the original
observer can continue their captured callbacks and join their actual Promises.
An SDK acknowledgement by itself proves no saved result.

## Inspect and finish cleanup

Use this controller's `inspect`. Source/reference API queries and local session
inspection remain available while the controller reserves native work. Managed
file preparation, competing launches and retirement remain gated.

If the operation fails, preserve its original result and journal. An unknown
Save result consumes that Save. Never repeat execute, create, navigation or
Save to obtain a clearer response.

If `cleanup.publicationPending` is true, use `settle-publication` to join the
original publication first. `observe-termination` and `release` join the
original bounded cleanup and any allowed later exit observation. They cannot
create a replacement owner. A failed original reserve must be reconciled before
failure cleanup can issue its closure proof.

`abort` requires the original-Job-only confirmation and acts on that
controller's original resources. An unknown Abort acknowledgement permits
independent observation of the same original root and empty Job, with no second
Abort. File-capture release remains separate from application/helper release.
Keep an unacknowledged resource or publication visible as pending.

After a failed operation's actual resources close, its coordinator can publish
a separate immutable abandonment record. This can clear historical quarantine
while `saved` and `reopened` stay false. It permits no replay, inverse, owner
transfer or reuse of the failed fixture as a verified saved result. If its write
acknowledgement is lost, settlement reads the same retained bytes; it does not
write another sidecar.

## Accept the result and update

Require completed status with saved, reopened, complete SQL and peer preservation
verified, plus original helper release and no pending publication. Retain the
original evidence artifacts. The controller must compare the full closed source
and logical SQLite inventory and then the separate reader's observed and closed
state. This concerns the selected fixture and its original request and upload
callbacks; it is not a general network-client or shared-account exclusion proof.
Timestamps, previews and Save toasts cannot substitute for those proofs.

Once the controller finishes its own resources and records, use
[cooperative retirement](connection-and-context.md#cooperative-retirement-and-update-handoff)
and the [foreground manager](autonomous-controller-updates.md) for an update.
Verify the replacement's actual loaded snapshot and source admission. A new
subagent alone does not refresh a plugin, and historical closure never adopts
an unfinished native owner.
