# Check publication history as well as current files

Repository validation found two implementation records containing an excluded
production identifier. Commit1708c3ef removes it from the current files, but
older versions remain reachable from the unpublished branch. A current-file
scan cannot establish that pushing this history is safe.

The new `repository:history:check` command reads every outgoing commit, tree and
blob against an explicit reviewed public base. It shares the current repository
secret/privacy rules, refuses shallow history and grafts, disables replacement
refs and bounds object count, size and total bytes. It reports object IDs and
rule labels without returning matched content. It retains its own Git child
through observed close and handles pipe errors. It changes no ref or file.

Two isolated Git regressions pass. Clean history includes actual binary-safe
objects; private content and a synthetic secret added and later deleted still
fail, even when the final tree equals the base. An actual child-process output
check confirms that findings omit matched text and filenames. Types and strict
changed-file lint pass. The complete outgoing source history before remediation
was scanned:6522objects,438322601bytes,eight finding objects, all with the
private-design-name label. This is an expected refusal, not publication approval.

AGENTS and the contributor guide now require the check before the first branch
push. A separate read-only GitHub Actions job repeats it with complete history
against the pull request's public base. Earlier unpublished blobs still need
verified redaction before any push. Keep original private backup refs private;
no history rewriting or publication occurred in this increment.
