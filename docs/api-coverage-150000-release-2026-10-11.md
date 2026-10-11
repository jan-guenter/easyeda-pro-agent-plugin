# Candidate 150000

`0.3.0+codex.20261011150000` continues draft PR9. The broader API task remains
unfinished. This continuation changed only the plugin and private validation
evidence. EasyEDA stayed closed; production and its project record were untouched.

## Changes

- Closed free-schematic creation now creates one META-only container while a
  clean ordinary PCB is active. It creates no page, template or canvas and does
  not open an editor or Save. Board attachment, hierarchy, inheritance, imported
  atom headers and inline component setters refuse. Exact native identity and
  full peer history proof are required. Native callbacks are not atomic against
  concurrent user project switches.
- The selected PCB object reader returns complete native-source DTOs for root
  Line, Arc, Via, standalone Pad, Component and STRING records. It preserves
  selection order and refuses an incomplete or unsupported selection. It checks
  complete owning-family correspondence and generated identity collisions;
  poured geometry must be absent. It does not return public class instances or
  silently omit unsupported objects.
- Standalone text creation v2 writes explicit native-default black, avoiding
  cached-decoder color carryover on reopen. Existing null and black values remain
  distinct and unchanged. Creation identity is still allocated and sealed once.
- Creation-only retained-Save reconciliation checks the original six phases,
  one consumed successful Save/close/reopen, fresh source and full durable proof.
  The legacy branch requires exactly one old black STRING followed by the original
  null creation. All-type physical history proves its order and exact raw suffix.
  Original null storage and observed black export stay separate evidence. No Save,
  navigation, creation, inverse or normalization occurs in recovery.

The inventory has 774 method paths: 192 public subsets, 97 native equivalents,
two lifecycle-only entries, eight blocked and 475 omitted. There are 350 guarded
execution routes, 176 fixed readers including 16 native readers, 108 design and
68 library schemas, 26 tools and seven skills. These are implementation counts,
not complete declared-contract or connected-validation counts.

## Evidence and unresolved journal

Installed131000 completed a forward text modification and explicit reverse
modification, each with one Save/close/reopen and full 11-document proof. Its
subsequent v1 creation retained one successful Save/close/reopen but failed the
new text's null-to-black reopened-source comparison. That original journal is
still `commit-needs-recovery`; it has not been replayed or accepted.

The new pure recovery predicate passed once against the original immutable
checkpoints, six artifacts and retained source. It preserves all ten peer
histories and 131 original target records. The old STRING's earliest physical
ticket257 precedes the created ticket265; the target raw chain adds exactly
DOCHEAD then STRING. Independent review rehashed all 16 listed private inputs,
1,267,554 bytes. Report:
`4faba00aec094c1d461ae7a970474c901e4ec6aa4a713273e724ae4002bec8bc`.
Its first executed helper refused a full-versus-reduced context comparison;
that failure remains retained. The corrected helper separately checks both
exact context shapes. No production guard or historical artifact was changed.

This proves a historical read-only predicate, not live coordinator recovery.
After installation and fresh-host admission, recover the original journal with
its retained ID and ordinary rebind/open/reconcile workflow. Never repeat the
creation or Save. Further v2 creation/deletion validation should use a fresh
clean disposable target unless independent strict preflight proves a later
write will preserve the legacy stored null.

## Release checks

Clean installation on Node24.18.0/npm11.16.0, strict TypeScript and type-aware
Oxlint pass with zero diagnostics. Dependency checks verify 151 registry
signatures and 40 attestations with zero reported vulnerabilities. All 424
bridge tests pass. The complete final facade suite passes 3,425 tests with one
platform skip and zero failures, under isolated control roots and hostile
inherited descriptors142/145. Repository/privacy, package, seven skills, all eight official
validators, workflow lint and offline doctor pass. Rebuilds reproduce the facade
bundles, descriptor sanitizer and synthetic authenticated bridge exactly. No real
key rotation or extension import occurred.

Frozen source: 192 files,
`df7a4f32368d1e7baecfc8588d6739914f7f791d091c05123249947f3b8ebfee`.
Runtime: three files,
`5a487af9205d1321edebb617378ddccbcb5b635f0db82a1c865ba0dff1e32df5`.
Manifest: `996d4e86a8d89a999cba27d4ec38710d90608fd8728bf827384a77847978b617`.
External EasyEDA, SDK, implementation and bridge pins are unchanged.

The first full passes exposed two stale test expectations, one for the expanded
reader catalog and one for the new creation-specific retained-Save gate. Both
tests were corrected and strengthened without changing production guards.
Their failed logs remain retained. The complete final facade log is
`51de1e0d0d7939ac26a18340876fdcd910c8e6db9167cdb81ea103d448a96b17`.
GitHub CI and official Git-marketplace installation remain pending.

The selected reader, schematic creation, v2 text lifecycle and live recovery
still require their own connected validation. Publication or installation alone
cannot establish those results.
