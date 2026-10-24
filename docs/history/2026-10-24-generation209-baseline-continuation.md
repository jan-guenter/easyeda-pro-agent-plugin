# Generation209 private baseline continuation

This addition connects the original209 PCB session to the common/META and empty
raw-root reader. `CurrentPcb209WorkerStartupEmptySession` accepts only the actual
PCB session, its actual issued packet and the same original native dependency.
It derives the script, unique context and sealed target identity through those
objects. It does not accept a supplied observation, model tuple or SQL inventory.

The dormant PCB factory's preparation callback now returns its actual completed
SQL reader. The PCB session retains that object and its reader-completion token
at the checkpoint boundary, before opening the PCB. The continuation obtains
only that retained object and compares its identity at every subsequent check.
The future lifecycle caller must return its original `#projectPreparation`
inventory after validating the original managed checkpoint receipt and sealed
target. That caller integration remains unfinished. A matching serialized
inventory, a newly completed reader or matching source bytes cannot substitute
for the original callback object.

Root review caught an incorrect proposed binding to `expectedSourceSha256`.
That field hashes the original live file. SQLite backup can produce a checkpoint
with different bytes, so it is not interchangeable with `checkpointSha256`.
The final implementation uses retained reader identity and makes no source/hash
equivalence assumption. No connected operation used the rejected proposal.

## Ownership and request bounds

Every passive request uses the original dependency method and the original PCB
session ID. The continuation checks the exact original PCB source/context before
and after each await, and rechecks native process ownership around each native
request. The original project-worker identity is observed at entry and again
before the final packet is issued. It is not redundantly read between each graph
chunk. The final original worker check must pass; an earlier successful sample
cannot revive an owner that subsequently failed.

The fixed large common replies are captured as their original text before the
post-request ownership await. Their strict two-level envelope permits at most
524288 UTF-8 bytes. Getter/proxy envelopes refuse without invoking hooks. Small
scope and remote-object replies retain the existing bounded capture. A refusal
still leaves the original two remote-object group releases available through
the retained dependency's cleanup admission. Neither group cleanup nor a
completed reader proves continuous observation or unchanged live SQL storage.

The continuation has a maximum3101 CDP requests:3099 for the common/root runner,
including both releases, plus two original worker identity observations. Native
process ownership checks add helper exchanges and latency, not CDP request IDs.
The original startup source bound is now186 after the four bounded eval-source
stages added in the same batch. With one owner-factory proof and the existing64
PCB-session bound, the private combined source sum is3352 before optional stages
or remaining launch cleanup. This corrects the earlier pre-eval sums178/243/3344;
those historical records retain their original observations.

Even startup plus PCB alone totals251, above the existing224 normal-work
reservation within the256 native limit. Arithmetic below256 is not admission.
No current startup channel accepts the new continuation command type. A distinct
purpose must create its broader original dependency before startup, implement
fixed native selectors and derive the entire launch's request, reply-byte,
event, polling and cleanup bounds. There is no owner upgrade, counter reset or
caller-selected capacity. Ratline capture and later actor/native/server clock
stages require their own counted integration.

## Validation and remaining limits

Focused synthetic tests execute the actual continuation with two explicit
issuer import substitutions and an isolated completed SQL reader. They check
same-dependency/model dispatch, permanent single consumption, cleanup after
owner loss, final owner refusal, replacement-method rejection, original-reader
replacement and immutable bounded text capture. These coordinator tests do not
prove actual startup, PCB source availability, native transport admission or a
complete connected baseline. The original common/root runner retains its
separate real-reader integration tests.

The continuation exposes no public tool and enables no writer, Save or reopen.
Its complete-baseline, startup-completion and execution fields remain false.
The next implementation must wire the original lifecycle preparation callback,
qualify the expanded fixed native purpose and join original PCB/ratline captures.
Populated geometry, fresh full serialization, pending-producer completeness,
active-tool coverage, native/server clocks and saved/reopened verification remain
separate unfinished work.
