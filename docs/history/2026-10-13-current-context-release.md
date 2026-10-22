# Current-version identity context

Candidate `0.3.0+codex.20261013201500` adds
`easyeda_control_editor_context`, a fixed read-only observation of registered
active-document and UI project/branch identity on EasyEDA 3.2.206.

The request is `{"action":"observe-editor-context"}`. Offline `editor-context`
and `editor-context-validate` expose its exact schemas and argument validation.
An authenticated fingerprint and separately pinned API/UI implementations are
required for execution. No caller code, method path or file selector is accepted.

The reader shares the existing bounded container/tree/tab scan, retaining owners
and comparing two samples. It distinguishes no active tab, Start Page,
placeholder, supported ordinary schematic/PCB document, and unsupported tab.
Project and branch fields retain absent/undefined/empty/value states where
admitted; missing metadata never becomes a closure claim. Unsupported tab IDs
can contain library paths and are not returned. Titles, content, selection,
manager RPCs, navigation and Save are outside the read closure.

This is a native metadata subset, not parity with the public detailed project
getter. It does not prove native editor readiness, manager/database identity,
persistence, restoration completion or authority for later operations. Source
evidence and the admitted ID grammar are in the
[research note](2026-10-13-current-context-research.md).

The restricted catalog has nine tools; the legacy catalog has34. Seven skills
remain. Public SDK coverage stays774 distinct methods:211 public subsets,
30 native equivalents,82 blocked implementations and451 omissions, with
308 guarded routes/94 blocked/two partial. This internal observer does not turn
the old public context routes into current-version supported methods.

## Verification and activation

Local focused adapter/runtime/registration/bundled-startup/SQL protocol checks
pass, as do424 bridge tests. Full types and strict type-aware lint are clean. The build and compatibility
checks pass, as do77 package checks,179 repository/privacy checks and seven
custom/official skill validations. Dependency verification accepted151 registry
signatures and40 attestations; the audit found0 vulnerabilities. Independent
reviews accepted the adapter, shared coordinator, integration and SQL-child fix.

Source322 projection is
`05df454a6f221d7154dd9933ad61c544e688c2e1839322c126b0d440823dc5a5`;
runtime3 projection is
`c7d00a16c5e896d545825c90cab99055a8901ce3fe1c045426b989e1a1d59b24`.
External runtime/bridge pins are unchanged. Required CI, publication and
installation are pending at this source snapshot; consult the release PR's
delivery receipt before repeating them. No live validation is claimed.

Initial PR16 CI38462036703 passed build verification but caught a test-helper
contract that still required the SQL child's old inherited-cwd options. The
synthetic launcher now explicitly requires the same fixed `/` cwd as the real
reader, retaining exact executable, descriptor, source, args, environment and
stdio checks. Independent review found no other stale option expectation.
The79 focused witness/recorded-native/protocol cases pass after this correction;
full types and strict lint remain clean. No runtime guard or test was removed.

Second PR16 CI38462535822 passed build verification and six test shards. Two
test-only failures remained: private race commands could be observed between
file creation and the asynchronous write, and cold PowerShell startup exceeded
the geometry test's10s deadline. Commands are now fully staged before atomic
publication; strict child checks remain. A deliberate partial-file schedule
reproduced the same hidden AssertionError shape, though the failed runner's
original inner message was unavailable. The pure geometry test now allows45s
for startup without changing production deadlines or result assertions. All
five CI-like race cases and the geometry case pass locally. Runtime source and
bundle projections are unchanged by these corrections.

The preceding193500 release is already published and installed through
[PR15](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/15),
main90b96777e32c909ac46285f9ba43f8147f80f93d. Required PR CI38457338169 and
[main CI38459136285](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38459136285)
passed all10 jobs. Its installed1141files/22211214bytes and modes were rechecked
exactly against Git; marketplace HEAD/origin/ref also match.

Despite the restart message, the existing chat still owned facade105403 from
182500. Its script path was removed and its cwd was a deleted installer backup;
only the old six tools were available. One status call refused historical C09
evidence as unavailable. The SQL reader inherits cwd and pinned Node's module
eval resolves it before running the embedded program, making the deleted cwd a
source-supported explanation. Actual child stderr was not captured, so this is
not a confirmed diagnosis of that specific call or evidence of journal damage.
No further live call, owner termination, cache patch or journal change followed.
Fresh skills and installed files do not prove a fresh MCP process.

The new source fixes this inherited-cwd dependency for future SQL readers by
giving the descriptor-bound child a fixed `/` working directory. Its input paths
remain absolute; it imports only builtins and writes no file there. One isolated
regression reproduced the old failure from a removed synthetic cwd and passes
with the fix, including actual child exit and exact checkpoint hash. This does
not repair an already-loaded host, weaken historical evidence validation or
authorize continuation of an old operation.

## Remaining work

The fresh-host ordinary-startup/authentication/shell check and one Start Page
identity-reader check subsequently passed. No project was opened or edited.
The [shortcut release note](2026-10-13-shortcut-reader-release.md#connected-predecessor-check)
records exact scope and reply hashes; it is not ordinary-document validation.

1. Fresh-host pickup of the next release; never replay the consumed launch.
2. Ordinary-document identity cases only when needed for the next implementation;
   do not expand the test matrix for this scoped release.
3. Current-version navigation and richer readers with their actual preference,
   backup, manager and document-owner effects reviewed.
4. Ordinary-launch reconciliation after facade restart loses retained handles.
5. Native structure-job completion/full SQL-effect proof for the blocked editing
   lifecycles and remaining feasible SDK families.
6. Bridge Auto-Connect persistence-error reporting, requiring a separately built
   and imported bridge generation. Preserve the existing private key and receipts.
