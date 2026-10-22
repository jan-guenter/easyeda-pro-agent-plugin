# Recording connected validation

Write independently reviewed disposable test cases as dated records in
[`history/`](history/README.md).
It is outside the plugin package and runtime fingerprint. It neither changes
the historical validation registry nor supplies execution authority. A passing
case does not validate every argument, object family or lifecycle of a method.
Current runtime, context, preference, checkpoint and journal gates still apply.

## Entry protocol

Create a `YYYY-MM-DD-topic.md` record for each new result or correction. Do not replace an earlier
pending, refused or failed observation with a later success. Link a correction to
the earlier ledger case and explain what changed. Never replay an operation to
make its record look successful.

Each entry must identify:

- The exact installed payload, package tree, source/runtime fingerprints and
  external implementation tuple. A later generation needs its own admission;
  these cases do not automatically transfer to changed source or bundles.
- The fixed route and tested argument domain, including object family, document
  type, requested membership and supported encoding. Distinguish native task
  equivalents from public SDK execution or public-instance parity.
- The actual phases completed. Reads require receipt/result consistency and
  source correlation. Writes additionally require original identity authority,
  exact immediate effect, consumed Save intent, acknowledgment, reopen, immutable
  checkpoint comparison and complete collateral proof appropriate to the route.
- Hash commitments for retained evidence and the independent verification used.
  Keep raw projects, native identifiers, paths, credentials and private reports
  outside this repository. Unkeyed hashes detect corruption; they do not
  authenticate evidence against a writer with access to its storage.
- Remaining limits: refused domains, untested recovery/inverse paths, visual or
  electrical checks, and the point in time proved. A stored checkpoint or a
  successful read does not establish continuing live-database invariance.

Record pending work as pending. Append its terminal review separately. A native
acknowledgment alone is not success, and a completed saved deletion is not an
unsaved rollback or byte-for-byte history restoration.

Link new results from the [history index](history/README.md). Existing generation
records remain in the [archived ledger](history/2026-10-11-through-2026-10-19-api-connected-validation-ledger.md).
