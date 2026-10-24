# Disposable empty-PCB baseline on 3.2.209

Use this route to compare an empty PCB's observed common data with the original
managed SQL checkpoint. It launches a separate native owner and retains it
through project capture, PCB opening, observation and cleanup. It cannot adopt
an ordinary process or upgrade an existing startup owner.

Query `pcb209-empty-baseline` with `query:{includeSchemas:true}` through
`easyeda_control_api`. Validate each inner request with
`pcb209-empty-baseline-validate`. Dispatch the validated request through the
existing startup tool using this wrapper:

```json
{
  "request": {
    "action": "empty-baseline",
    "request": {
      "action": "inspect",
      "operationId": "pcb209-empty-example-01"
    }
  }
}
```

The wrapper is required for every action, including inspection and cleanup.
The inner validator does not require the wrapper. A `pcb209-startup-*` operation
belongs to the [separate constructor workflow](current-pcb209-worker-startup.md).
An allocated native owner keeps its original purpose. Historical inspection
alone does not lock the tool to that purpose; switching is allowed after all
calls have settled and no native reservation or unfinished cleanup remains.

## Sequence

1. Launch a fresh `pcb209-empty-*` operation with `confirmValidationOnly:true`,
   `confirmDiagnosticLaunch:true` and `acceptExistingProfileEffects:true`.
   Retain its binding digest and keep the Codex session alive through release.
2. Qualify `browser-observation`, `inspect-frames` with the observed target ID,
   and `inspect-script` with the observed top-level frame and `family:"ui"`.
3. Use `capture-project` once with the exact registered disposable target and
   all three capture acknowledgments described in the constructor workflow.
   Its target document must be a PCB in the managed checkpoint. The coordinator
   retains the completed SQL reader; a supplied inventory cannot replace it.
4. Only after successful published constructor capture, call
   `observe-empty-baseline` with the same `operationId`,
   `expectedBindingSha256` and `acceptNormalOpenEffects:true`. It accepts no new
   target. It durably consumes intent before opening the retained PCB, qualifies
   the PCB source and context, then reads common data between two empty raw-root
   samples. Populated geometry or mismatched stored records cause refusal.
5. Inspect the retained result or failure. A successful response identifies the
   complete private result record by path, byte count and digest. Inspecting
   that record makes no new live observation and recreates no ownership.
6. Use `observe-window`, one `normal-close`, `observe-termination`, and
   `release-closed`. Settle an offered pending record using its original intent
   digest. Release requires both the original root exit and the original Job
   becoming empty.

## Limits and recovery

The native purpose is fixed before launch. Request IDs, byte totals, event and
poll counts continue across startup and PCB stages. The original monotonic
launch time anchors the normal-work deadline and cleanup reserve. There are
separate bounds for scope replies, packet handles, chunks, final text, root
samples and cleanup; a pending large source reply cannot enlarge another
command's allowance. No caller can select these budgets or reset them.

The observation joins the original common/SQL comparison with matching empty
raw-manager samples, including models without views. It does not establish
source serialization, full live membership, atomicity, continuous ownership,
producer or queue completion, active-tool coverage, startup completion, backend
clock provenance, saved content or reopened equality. No writer or explicit
Save action is offered. Ratline construction and callback completion remain
separate work.

Existing-profile launch and normal opening can restore tabs, migrate files,
replay caches, use network services and automatically persist data. Debugger
pauses alter timing. A timeout, lost reply or refused observation consumes its
attempt. Use retained inspection and cleanup; never repeat navigation or switch
to another purpose to bypass the refusal. Late opening replies remain evidence
only. Normal exit does not prove discard or file invariance. Leave Save/Discard
prompts unanswered unless the user authorized that choice.

This route requires connected validation on its installed generation. Offline
callback tests, compiled encoder parity and installation are separate evidence.
