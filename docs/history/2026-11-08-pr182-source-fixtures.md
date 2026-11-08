# PR182 installed-source and fixture corrections

The review's three inline comments and four nits were checked against the
current source. The inverse lookup graph already used the shared configured
source helper. That fix and its configured-failure behavior remain unchanged.

Twenty-eight schematic test files now use the same `EASYEDA_ASSETS_ROOT`
resolver, as do the two inverse delete-job fixture consumers. Only unset
configuration skips with the shared explicit reason. Empty configuration,
missing configured files, invalid UTF-8 and source/hash drift still fail.
The optional embedded-builtin check uses `EASYEDA_PRO_EXECUTABLE` under the same
unset-versus-broken distinction. These variables are documented in
`CONTRIBUTING.md`. No test learns a workstation path or launches EasyEDA.

The delete-job fixture's blank source now preserves each character's UTF-16
length. An offset-only synthetic counterexample includes astral characters
before both fixed splice anchors and retains CRLF. It produces the same inert
source as the equivalent whitespace input. The saved-reader generation test
loads the baseline through `CURRENT_NATIVE_BASELINE.relativePath`.

The ordinary cleanup fixture validates isolation before constructing its
receivers or writing a journal. Its cleanup hook is registered before journal
creation and removes only a journal whose creation actually completed. A
bounded child deliberately omits the preload under a new fake home; it refuses
before creating the default control directory. The ambient synthetic sentinels
remain exact.

The first migration run exposed TypeScript inference that needed explicit
source types. It also hit the Linux argument-size limit when the complete
installed source was placed in a child argument. The child now independently
reads through the same configured helper and rechecks the pinned source hash.
The affected two variants subsequently passed. Strict lint also exposed
pre-existing type/declaration issues in the two status tests; their assertions
and fixed programs were preserved while removing those lint errors.

The 32 configured source test files passed their 96 checks across the bounded
runs, with zero skips. Another 24 helper, actual cleanup and isolation checks
passed. Complete TypeScript and strict changed-file lint passed. This is
source-only evidence; no app/native owner, SDK invocation or persistence proof
was issued, and no native helper, pin or bundle was regenerated.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`b6c5bbfc7d0ad7ff5be19129e5ce55d05958a781`; its committed tree is
`52b2bb9b9626f37163f6444fac6debf252e42062`. Its Git author timestamp is
`2026-11-08T03:44:51+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
