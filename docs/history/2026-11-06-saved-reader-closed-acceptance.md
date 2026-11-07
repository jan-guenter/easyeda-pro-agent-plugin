# Original saved-reader closed acceptance

The final data proof is now concrete in
`current-pcb-via-saved-readback-closed-proof.ts`:

```ts
const model = reader.qualifySavedReadbackModel();
// Close this original reader; independently observe its original root/Job exit.
const termination = originalCurrentPcbViaSavedReadbackTermination(reader);
const capture = new CurrentPcbViaSavedReadbackClosedCapture(reader, termination, model);
const proof = await capture.capture();
await capture.settleRelease();
requireOriginalCurrentPcbViaSavedReadbackClosedProof(proof, reader, model);
// Release the reader's original helper separately.
```

The constructor accepts only the genuine original saved reader, exact original
termination and its privately issued completed fresh model/effect join. It
consumes one capture per reader before asynchronous file work. It acquires new
read-only no-follow directory/file descriptors, refuses source substitutions
and sidecars, copies the complete bounded source, and retains those descriptors
through publication, the completed SQL reader and the final full hash read.

Acceptance requires the exact saved-source SHA, equality of the complete schema,
database properties and every row/cell against the original writer's completed
closed inventory, and successful complete history decoding. Every acquired FD
must actually close before the returned proof can be looked up. A copied proof,
wrong model/owner/termination, partial history or changed unrelated SQL row
cannot issue reopened acceptance. No historical native owner is adopted.

Only this completed conjunction issues `persistenceVerified:true` and
`reopenedVerified:true`. The report schema is
`easyeda-pro-control.generated-pcb-via-saved-readback-closed-capture.v1`;
it is deliberately distinct from ordinary/generated-reader reports. The
original native helper still needs its separate supported release/closure.

Four focused cases ran the actual Linux FD/artifact/full-SQL path with explicit
inert native/model issuer seams: positive complete acceptance, sidecar refusal,
unrelated historical-row difference, and original-model drift during the
pending capture. Exact Node 24.18/npm 11.16, full types and strict file lint pass.
No native application, Windows process, MCP call or source SQLite write ran.

The source route is ready for parent composition. Connected writer/reader
validation still depends on the genuine planned Save producer continuation and
all actual native source/SQL/structure completions; synthetic tests do not
provide those observations.
