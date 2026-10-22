# PowerShell diagnostic-dispatch boundary

## Observed failure and evidence limit

Installed `0.3.0+codex.20261020081744` created its original owned application
process. Its first browser observation failed with
`PCB_DIAGNOSTIC_PIPE_OUTPUT`. No browser result was retained, and no frame,
script or project-opening stage ran.

That error alone does not identify the original native refusal. The installed
facade replaced every failed native send with `WRITE_FAILED`, then the byte
pipe reduced that to `PIPE_OUTPUT`. It retained a native fixed error label
only for launch failures. The following source finding cannot retroactively
supply the discarded live label.

## Deterministic source defect

The PowerShell request dispatcher called:

```powershell
$owner.Send([int]$request.requestId, $request.method,
  $request.targetId, $request.sessionId, $request.scriptId,
  $request.uniqueContextId)
```

For `Browser.getVersion`, all four optional request fields are absent. Their
PowerShell values are null, but `Send` declared them as C# strings. PowerShell's
conversion rules turn null into an empty string. Object-typed parameters preserve
their input instead. Missing properties yield null in this non-strict script.
[Microsoft conversion rules, sections 6.8 and 6.17](https://learn.microsoft.com/en-us/powershell/scripting/lang-spec/chapter-06),
[Microsoft null-property behavior](https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-null#in-place-of-an-object)

The strict C# encoder immediately checks that a non-evaluation request has
`uniqueContextId == null`. The converted empty string fails that check with
`pcb-diagnostic-discovery-fields`, before `SendMessage` or `WriteFile`.
Other optional parameters produce the same class of defect. The model encoder
also uses explicit null checks.

The prior compile smoke test invoked the encoder from C# with actual null
values. It never exercised PowerShell's method binder, so its successful result
did not cover the real dispatcher path. No output-size change, alternative
CDP method, timeout extension or application retry fixes this defect.

## Correction contract

Preserve absence at the PowerShell-to-C# boundary deliberately. Optional
arguments now use object-typed boundary parameters and a converter that accepts
only null or a string. It passes actual C# null and unchanged strings to the
existing encoder, which still rejects explicit empty fields. The exact
PowerShell request-field sets, token bounds and fixed CDP vocabulary remain.

Do not change the encoder to treat every empty string as absence. An explicitly
supplied empty field is invalid input, not the same request as an absent field.
The regression must call the shared boundary through PowerShell's actual binder,
then compare its encoded result. Direct C# calls alone are insufficient.

The helper's `CompileOnly` path now exercises this shared boundary through the
actual PowerShell binder. It compares browser and model encodings, including
release with absent handles, and rejects explicit empty or non-string fields.
Main ran that source helper under Windows PowerShell successfully: native
compilation, empty Job, pipe checks and binder assertions passed, with no
application launched. This does not recover the old live error label or qualify
the corrected browser path in EasyEDA.

## Diagnostic preservation

The facade now retains the fixed native error label for a failed send and
includes it in the resulting byte-pipe error:

```text
PCB_DIAGNOSTIC_PIPE_OUTPUT:pcb-diagnostic-partial-write
```

This is diagnostic evidence, not no-dispatch proof. A label such as
`partial-write` explicitly permits an effect before failure. The original
channel remains failed, its attempt stays consumed, and original normal-close
handling remains separate.

Only a label already admitted by the strict helper-envelope parser can reach
this error. Arbitrary exception text, paths, commands and payloads still fail
the envelope check and are never copied into the response. Two focused
synthetic owner tests cover fixed-label retention, rejection of private
exception text, no retry and preserved original helper ownership.

This investigation made no live application call or process change.
