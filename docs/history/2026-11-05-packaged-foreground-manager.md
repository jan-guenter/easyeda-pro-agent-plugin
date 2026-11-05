# Packaged foreground manager source

The source build now emits a separate dependency-free
`server/dist/control-session-manager.mjs` frontend. It contains the maintained
manager, its existing transport and SDK1.32.1. A verified package or frozen
build can supply this one file without a TypeScript checkout or runtime
`node_modules`. The [controller guide](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/autonomous-controller-updates.md)
describes default-root selection, explicit target selection and retaining a
verified frontend copy outside a cache that an installer may prune.

The frontend is distinct from the facade's historical three-file native runtime
identity. The original server/supervisor publication pair and its journal schema
remain unchanged. No owner, native purpose, encoder, capacity or admission guard
was relaxed. The selected facade still needs its own complete package and actual
runtime admission. Neither a frontend build ID nor `--frontend-identity` grants
that admission. A trusted external build/package comparison must pin the actual
frontend bytes.

## Build and launch boundaries

The additional esbuild entry uses the existing Node24.18.0/Linux/x64/core-zero
host checks, descriptor-captured source, package-resolution seals, exact SDK
version and shipped license proofs. Runtime imports and requires must be Node
builtins. Optional ws native acceleration remains disabled. Facade/native owner
entrypoints are excluded from the frontend graph. The original facade build's
full dependency attribution remains unchanged; the frontend separately proves
every dependency that contributes emitted code.

Every imported executable's `import.meta.main` is fixed to `false` during the
frontend build. The dedicated entry invokes only the original manager CLI, so
inlining the legacy client cannot start another child. That client's legacy-only
stdio transport import now occurs inside its own executable path. This avoids
emitting its unused cross-spawn/which dependency graph. An earlier build correctly
refused that graph's incompatible repository attribution; its license guard was
preserved.

The launcher reads its canonical, single-link file through a bounded nonfollowing
descriptor and reproves its bytes across startup awaits. It enters the machine
profile's descriptor-verified Node24.18.0 with the same PID and stdio. A separate
atomic publisher writes only the complete frontend file and leaves the facade
pair untouched. CI's reproducibility check now includes that additional artifact.
The source checkout has not yet generated or admitted a release frontend.

## Offline evidence and retained failure

Three new focused tests passed under pinned Node24.18.0/npm11.16.0 with a zero
soft core limit. They proved byte-identical repeated sealed builds, exclusive
single-file publication with symlink refusal, pure frontend identity inspection,
and the actual packaged CLI without source files or `node_modules` in any
package ancestor. The actual CLI preserved its PID through the pinned executable
handoff, called only the original facade's offline metadata, retired that facade,
observed original EOF and exit0, then shut down. A separate unready startup case
retained its unused child and cooperatively closed it with `cleanup-startup`
before EOF. Synthetic metadata fixtures did not start their upstream process or
EasyEDA.

Five existing focused build/client guard checks, full types and strict targeted
lint also passed. The final private fixture frontend was 1,360,586 bytes with
SHA256 `5d124ccc7a683fe19b3d1b83b89e08efdef1124688573436e6567fb358bbf0ee`.
This is an offline fixture artifact, not installed/native validation. The combined
final build, repository/contract/skill validation and exact-commit CI remain the
release workflow's responsibility.

The first CLI fixture failed because its catalog was intentionally restricted
and the test had closed input before it could request startup cleanup. Its
readiness test timed out and retained an inert private offline child. After
exact PID/start/executable/module/resource checks and explicit authorization,
one pidfd-bound SIGTERM closed that isolated child; its manager then exited
normally without a manager signal. The failure and cleanup proof remain private.
The final harness keeps input open until readiness or a startup refusal and sends
supported original-child cleanup before EOF. A later assertion typo was retained
as a failed run and corrected before the final three-test pass.

No installed cache, global control lease, live upstream, native owner or current
pending capture was changed. The new frontend cannot hotpatch an already-running
manager. The [pending-call source record](2026-11-04-manager-in-flight-original-control.md)
and [cache envelope/arm record](2026-11-05-forward-cache-envelope-and-arm.md) retain
their separate implementation and validation limits.

## Provenance clarification, 2026-11-05

The original three-test packaging checkpoint used source base
`15dc1cc6fed3bb90cfebfff3e3ea3bf3cd45da8c` and the retained thirteen-file
packaging patch SHA-256
`31b29a3bb5fcade4a14a8166cc51a0a4ff5cb8ee2f47ddd31e2447d2a99dcf8c`.
That patch records captured preimages for the already prepared manager features;
the base commit alone did not contain the new packaging implementation.
The measured fixture frontend's build ID is
`bf312b9c43d8a9cb83f33ffca271453f8536aa1ca3290448e9f0a36d085fc600`.

The later composed commit `0ebd4c498a37148e61a9e69f7695126ab794b77e`
reproduced the identical 1,360,586-byte frontend, SHA-256
`5d124ccc7a683fe19b3d1b83b89e08efdef1124688573436e6567fb358bbf0ee`,
with that same build ID. This later reproduction preserves the original fixture
measurement and test attribution; it does not redate the focused tests or grant
facade/native admission.
