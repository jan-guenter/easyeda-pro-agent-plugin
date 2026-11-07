# Fixed-purpose native builds

The source batch following `d17171fa` separates the seven-record schematic
display and wire helper from the shared PCB/footprint helper. The original
combined build reached the fixed compiler bound as new private protocols were
added. Both new layouts retain the 2 MiB helper and runtime compiler limits.

The frozen seed is the published first-party helper from
`b16fb1e64c0d4cb0b2f57d2c4f07a894bb80940d`, fixed by complete byte identity.
The forward generators reproduce their six released artifacts from this seed.
The schematic runtime loader checks complete bytes by descriptor and emits only
one fixed supported purpose flag. Its Windows read handle remains open through
helper execution. No caller supplies a path, fragment or source program.

At this source checkpoint the shared compiler is 1,883,552 bytes and the
schematic compiler is 1,689,133 bytes. The six focused source/custody/protocol
checks, strict changed-file lint and both TypeScript checks passed. The six
forward artifact generation checks remained exact. Windows CI now includes
empty-owner compilation for both schematic purposes; it has not run for this
unpublished payload. Full final-payload verification remains pending.

Both actual compiler bodies also compiled as C# 5 under the local .NET SDK.
The isolated entry points exercised the fixed protocol codecs only. They
constructed no native owner and launched no application. Private compilation
logs remain outside the repository.

These are source/build facts. There is no new connected writer validation,
saved/reopened result, installation or permission to continue another native
owner from this change.

The next integrated source checkpoint includes inverse ready-callee bindings
and the seven-record Main history result. Its shared helper is 1,374,245 bytes
with a 1,897,943-byte compiler input. The schematic helper is 1,230,256 bytes
with a 1,690,704-byte compiler input. The inverse worker's two-pass generation
and C# 5 codec checks passed separately. Seven combined callee/custody/Main-wait
checks passed on the integrated source.

The static identity check initially refused the process-owner source because
that file exceeds its ordinary 1 MiB source-read bound. The fix moves the two
shared helper pins to a small independent module. The checker, runtime import,
Windows smoke pins and isolated test package now use that module. The ordinary
source-read bound and both native limits are unchanged. The exact byte check,
its size/substitution checks and Main waiter checks passed after this change.
