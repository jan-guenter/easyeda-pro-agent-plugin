# Retained application normal close

Candidate: `0.3.0+codex.20261014201000`. Publication and installation pending.

## Scope

The ordinary launcher adds `observe-window` and `normal-close`. Both require
the original successful launch ID, its exact inspected digest and this facade's
retained process/Job handles. The observer returns a unique application HWND or
an explicit unavailable/ambiguous result, never window titles or other desktop
content. Normal close also requires that HWND and `confirmNormalClose:true`.

The coordinator reobserves the window and publishes an exclusive durable close
intent before dispatch. The original Windows helper checks the retained root,
start identity and Job, then requires a visible, enabled, ownerless, unminimized,
non-tool `Chrome_WidgetWin_1` with application-sized bounds and stable title.
It posts fixed WM_CLOSE once. The supervisor and helper both reject repeat
attempts, including after a lost reply. No general window-message endpoint,
foreground input, prompt response or forced termination is added.

Acknowledgment and exit remain separate. `observe-termination` proves the
original root exited and its retained Job became empty; inspection and that
observation remain available after close uncertainty. A prompt or delayed exit
does not authorize a second close. Normal closure can persist application data,
so this is not a no-write, saved-design or rollback guarantee.

The existing bridge quarantine and runtime-allocation gates remain. This first
scope does not close a quarantined disposable-opening owner or recover process
handles after a facade restart. Historical supervision abandonment remains a
separate explicit relinquishment policy, not authority to close a matching PID.

The SDK has no suitable application-close method on the reviewed installation.
Document close can discard unsaved data, and iframe close only closes extension
dialogs. [Source research](current-normal-close-research-2026-10-14.md) records
those distinctions and the native helper paths. No public SDK method count is
increased by this application-lifecycle adapter.

## Compatibility and evidence

The packaged Windows helper changes deliberately for the new observer and close
guards. Current launch/clock consumers pin its exact new bytes. Historical
record decoding preserves prior helper identities as data only, without
restoring live authority. Previous ordinary-launch profile receipts remain
eligible only for their separately guarded supervision-abandonment policy.
EasyEDA, API, UI, upstream and authenticated bridge identities do not change.

The restarted190000 installed package was independently verified against its
tested and merged trees. This turn does not launch EasyEDA or access a design.
The previous disposable opening and normal termination remain completed;
their journals and receipts were not changed or replayed.

Independent review accepts the coordinator, native helper, compatibility and
documentation changes. Local checks pass76native/process cases,84clock/history/
registration cases and22rebuilt-startup/coordinator cases. Strict types and
type-aware lint have zero warnings; build, compatibility, API coverage,
package/repository/privacy and all seven official skill validators pass.
Dependency audit reports zero vulnerabilities,151verified registry signatures
and40attestations. Windows compile-only accepts the exact helper without
starting or closing EasyEDA.

Source340: `c7110f818baf9e364ee4e24b719955d3886a4080e563d4f3453636ac7ec35f49`.
Runtime3: `8315f38a395e5958893143df0e7853eeab9fcdfe8122871bc27c1d0e8ad8abb3`.
Helper: `fa5cff83eea61dea9a58dad282c76a2016bc7cbcb6f54dea1ef51375d9a91161`.
The full existing suite and reproducibility checks run on the frozen payload
in GitHub CI. Exact-head CI and installed verification remain pending at this
source checkpoint. Source tests and compilation are not connected normal-close
support; final delivery evidence belongs to the pull request.

## Remaining work

- One installed disposable normal-close/retained-termination check. Combine it
  with the pending explicit-ID and layer/Line/Arc/Via reader checks where the
  disposable fixture supports them. Prompt handling stays observation-only.
- A separately reviewed close allowance for an exact quarantined opening,
  if needed. No shared quarantine bypass is implemented.
- Lost-handle process supervision, bridge Auto-Connect error reporting, blocked
  design-write completion and the broader API backlog remain separate work.

The control skill now explains the fixed observe/close/termination sequence and
its stopping conditions. Broad test matrices and extra tutorial work remain
deferred; no production design or project record is in scope.
