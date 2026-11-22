# Packaged inverse compiler smoke

The [isolated inverse native inputs](2026-11-17-isolated-inverse-native-inputs.md) established the canonical source and build outputs.

Both actual generated PowerShell helpers passed their fixed `-CompileOnly`
paths under Windows PowerShell 5.1. Each emitted its own strict receipt after
compiling the packaged input, checking its internal codecs and pipes, and
releasing an empty Job. Both reported `processLaunched: false`. Windows CI
now runs these two paths after compiling the readable canonical inputs. This
covers the code PowerShell actually compiles, including the V4 type aliases and
both storage codecs. The packaged payload and all native pins are unchanged.

The direct run used the following exact blobs from commit `b12ec000077d3bbffebe1a90f1d8067f65dc84a2`.

- `footprint-inverse-native-continuation-v4.ps1` (1,858,684 bytes), SHA-256 `95817ad53d2e90573e91f6497da4e102fc1b08e96c6bb562391ee146c6813635`.
- `footprint-inverse-native-delete-cold-ui.ps1` (690,866 bytes), SHA-256 `0a8137291d45a71acc9199218aef4728c4b50235f5db4762b52c3b29e4438cb2`.
