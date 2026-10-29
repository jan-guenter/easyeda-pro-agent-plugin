# Original-window PNG capture, 29 October 2026

This change adds one `capture-window` action to the separate disposable
`pcb209-visual-*` lifecycle. It is an original Windows window pixel observation,
not an implementation or validation of the SDK canvas/RGBA exporter.
The capture binds its HWND to the retained original root PID, process creation
identity and non-breakaway Job. Existing ordinary and diagnostic purposes cannot
upgrade into this route. No production design was used to develop this code.

## Execution and resource limits

The launch-sealed disposable PCB opening and its published source-qualified PCB
observation must already exist. The owner rechecks the original UI/PCB receiver,
active sealed PCB identity, parent frame and ancillary frame before and after
native capture. The entire action is consumed and journaled before possible
paint; a failed or lost reply gives no second paint attempt. A decoded native
candidate is retained before final owner/installation checks. A failed final
native-owner guard does not publish the PNG as an accepted observation.

The native helper accepts only the original unique HWND. It uses fixed
`WM_PRINT` flags for visible client, nonclient and child content, without
`PRF_OWNED`; it never reads a desktop DC or accepts a caller PID, message or
callback. Visible child windows must belong to the root process; total descendant
enumeration is capped at256. Ordered child rosters and window rectangles must
match before/after. These are samples, not continuous child-state proof.

Before allocating its DIB, the helper checks a maximum4096 pixels per side and
4,194,304 pixels overall. The top-down32-bit DIB is zeroed before dispatch. A
fixed1000ms `SendMessageTimeoutW` uses `SMTO_BLOCK`, `SMTO_ABORTIFHUNG` and
`SMTO_ERRORONEXIT`. The helper and application have distinct process/queue
ownership. Compression reuses a bounded row buffer and writes to nonexpandable
storage. Output is at most262144 PNG bytes,349528 base64 code units and360000
packet bytes. Unsupported size, incompressible output, missing acknowledgment,
changed ownership or geometry refuse rather than truncate. Ten remaining CDP
request slots are required before starting the stage. The initial4MiB helper
stdout reservation was found insufficient in adversarial review; the correction
below supersedes it without changing the aggregate96MiB limit.

A successful message acknowledgment does not establish that the renderer supports
WM_PRINT, that GPU or deferred drawing finished, or that pixels represent the
complete board. Zero RGB is reported explicitly. Result metadata always states
that incomplete/stale pixels and occlusion effects are possible, pixel stability
and render completion are unverified, and the image supplies no CAD, execution
or persistence authority. Nonzero pixels are not a render acceptance test.

## Retained native resources

Every path that may have sent WM_PRINT retains its original memory DC and DIB,
including successful capture. `GdiFlush` flushes only the calling thread; the
helper cannot use its own flush as proof that the application's deferred batches
have retired. A timeout is likewise not paint cancellation. The owner releases
these GDI resources only after retained original root exit and an empty original
Job have actually been observed. Normal release and EOF/protocol retention use
the same hook. Failed allocations before possible paint are cleaned immediately.
Bitmap, DC and stream ownership is explicit; borrowed stock bitmaps are never
deleted, and failed cleanup retains the remaining resource fields.

The TypeScript parser independently validates canonical base64, SHA256, every
PNG chunk and CRC, strict RGB8/filter0 format, bounded decompression, exact zlib
consumption and all decoded pixel rows. It publishes one private exclusive
managed PNG and returns its path, bytes, SHA256 and file identity. Public results
and journals contain this descriptor and small metadata, never base64. Historical
records cannot recreate the native owner. A lost metadata publication may settle
its retained result without recapturing; failed artifact publication does not
authorize another native attempt. An artifact can remain after a later publication
or owner failure and is not thereby an accepted observation.

## Evidence and remaining validation

Fourteen focused tests pass with zero failures or skips. They exercise actual lifecycle intent/result publication with a
synthetic native owner, managed artifact identity, lost-result settlement without
recapture, consumed failures, malformed packet/PNG bounds and blank pixel status.
The full helper compiles with C#5 syntax and warnings as errors under .NET10; its
inert capture encoder/bounds smoke passes alongside existing visual, allocation78
and packed-program smokes. A separate inert round trip fed a265-byte PNG from
the actual compiled C# encoder into the strict TypeScript parser and verified all
320x200 zero RGB pixels. These checks perform no Windows drawing. Connected
WM_PRINT behavior, actual Electron output and native resource retirement still
need a fresh installed disposable visual owner; no live capture is claimed here.

## Primary interface references

- [SendMessageTimeoutW](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendmessagetimeoutw)
  defines timeout, flags and its same-queue exception. A zero result can mean
  timeout or failure and is not reliable proof of cancellation.
- [WM_PRINT](https://learn.microsoft.com/en-us/windows/win32/gdi/wm-print)
  describes requested print areas and child/owned-window flags; it does not
  establish browser canvas or GPU render completion.
- [CreateDIBSection](https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-createdibsection)
  describes bitmap memory ownership and synchronization requirements.
- [GdiFlush](https://learn.microsoft.com/en-us/windows/win32/api/wingdi/nf-wingdi-gdiflush)
  flushes only the calling thread's current batch. This is why the application
  exit/Job-empty boundary, rather than a helper flush, retires retained pixels.
- [EnumChildWindows](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-enumchildwindows)
  states that its return value is unused and newly created children may be absent
  from enumeration. The fixed implementation checks callback state and rosters,
  without treating the function return or samples as atomic ownership proof.

## Adversarial correction: helper stdout reservation

The original4MiB calculation was wrong: ten ordinary CDP replies can each reach
1MiB, in addition to the existing8MiB unsolicited-event allowance. Native polls
base64-encode those bytes and add a JSON envelope on every response. A raw byte
limit cannot bound envelope cost when polls return tiny fragments or empty data.

The corrected capture-only budget shares the unchanged transport constants with
the actual pipe and owner. It reserves32MiB remaining stdout before the stage
starts, under the existing96MiB aggregate cap. The budget permits at most512 poll
requests and16 other helper requests for this stage, consumed before any helper
write. Each poll must have one canonical bounded base64 field and at most512
bytes of actual raw JSON envelope overhead; send/control replies must fit512
bytes. A complete oversized response rejects only the pending capture-stage
request, without poisoning original native cleanup. The single PNG response has
a separate360128-byte ceiling.

Ten1MiB replies including delimiters,8MiB of events and their maximum4096
delimiters total18,878,474 raw bytes. The stage checks this aggregate on decoded
poll data, before passing it to the ordinary pipe. Aggregate base64 plus at most
four padding bytes per poll requires25,173,348 bytes. Poll/control envelopes add
270336 bytes; PNG adds360128 bytes; one final invalid ordinary response may use
100000 bytes. This yields25,903,812 stage bytes. Another16 maximum-size cleanup
control responses require1,600,000 bytes. Their sum27,503,812 rounds up to32MiB.
The calculation uses enforced bounds, without assuming typical reply sizes or
canonical helper JSON order. The ordinary100000-byte line limit stays unchanged
for every non-image response.

This raw maximum fits within512 full native65536-byte polls. Fragmentation or
empty polling can consume the finite poll count earlier; that refuses the stage
before another helper request rather than consuming the cleanup reservation.
The stage budget is removed in the original owner's `finally` block, so original
native close/abort, termination observation and release are not charged to the
exhausted stage. A separate retained reserve also blocks later normal helper
requests before their maximum reply could consume the1,600,000 cleanup bytes;
only original identity/window/normal-close/abort/termination/release controls
have access. The allowance covers bounded cleanup responses, not unlimited
repeated cleanup requests. Focused boundary checks cover exact headroom, both
finite counters, raw/envelope checks, no downstream request on exhaustion, and
remaining cleanup capacity. No full suite or live application was used for this
correction.
