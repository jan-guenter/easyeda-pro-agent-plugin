# Separate native graph for the cold forward birth

The reviewed forward artifacts remain byte-exact. The original emitter, phase
and request limits were restored from frozen commit `1b35ca1`. Its current
independent shared-helper projection still reproduces all three released files:

| Role | Bytes | SHA256 |
| --- | ---: | --- |
| driver | 93261 | `3be2c39e827bc554b193c4d01df50a1289a357c8044b3ef2545523c341fac7ea` |
| core | 945293 | `7c940543bf2ede0ea1c026d7804f3ab97dad36d71320894fe026fbeb52984656` |
| phase | 30558 | `f70a5207436f132f780ebbffddae05cf5c05019d4ef10d204c9eec517d595368` |

The released three files, their pin module, loader, generator entrypoint and
smoke script have no changes. The released physical request ceiling remains
1003, with 942 normal and 61 cleanup commands. Historical source and opening
readers do not select a replacement graph.

The cold additions now live in separate `current-footprint-forward-cold-*`
emitter, phase, limits, clock-budget, pin and loader modules. Their generated
directory is `scripts/footprint-forward-cold-execution/`. Only the actual new v2
native factory captures this loader. Cold-capacity consumers select the new
1175-request budget explicitly. The old artifact reader and old allocation
counter retain their original imports and behavior.

| New cold role | Bytes | SHA256 |
| --- | ---: | --- |
| driver | 95539 | `abd801d6571421892f00194bf1040653c43642a52817d722df22dd7cba046230` |
| core | 945442 | `23073a94f6bcdf5c6ef8853736fb90e411e7f393e48c65e7f2d0e6bad8b04251` |
| phase | 43570 | `4a2bf509c848280f3db17456ab14a8c6ca51a60b4fb6e9be85f3ad872614a8c3` |

Both graphs have independent exact source/identity checks in the build. The
Windows native workflow compiles the new graph in a separate no-application
PowerShell child, retaining the existing released graph check. The new smoke
schema is `easyeda-pro-control.footprint-forward-cold-execution-compile.v1`;
the released compile-v2 and wire/result schemas are unchanged.

Seventeen focused old/new graph, original descriptor reader, clock and wire
tests passed. They include reproduction of the released hashes and independent
loader paths/pins. Full TypeScript, strict type-aware lint and repository,
skill and MCP-contract validators passed under Node 24.18.0/npm 11.16.0 with
core limit zero. The emitted new C# graph compiled under .NET 10.0.113 and its
empty-owner/codebook/ledger/alias-refusal smoke passed. Windows execution is
reserved for the exact integrated workflow. No application or native Job was
started locally. The shared helper, shared pins, bundles and compatibility
metadata were not regenerated.
