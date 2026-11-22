# Packaged inverse compiler smoke

The [isolated inverse native inputs](2026-11-17-isolated-inverse-native-inputs.md) established the canonical source and build outputs.

Both actual generated PowerShell helpers passed their fixed `-CompileOnly`
paths under Windows PowerShell 5.1. Each emitted its own strict receipt after
compiling the packaged input, checking its internal codecs and pipes, and
releasing an empty Job. Both reported `processLaunched: false`. Windows CI
now runs these two paths after compiling the readable canonical inputs. This
covers the code PowerShell actually compiles, including the V4 type aliases and
both storage codecs. The packaged payload and all native pins are unchanged.
