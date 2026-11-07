# Preserve original fixture preflight failure evidence

The actual second manager case failed before fixture generation/destination
allocation. Its prior coordinator wrapped the upstream refusal into a generic
message and discarded the underlying reply. It also refused inspection by the
original base ID while only the environment journal existed. Those failures are
retained in [the original case record](2026-11-06-generated-import-environment-refusal.md).
No guessed native cause or positive import validation is asserted.

The fixed environment program now returns a distinct strict refusal schema with
its exact execution stage, whether config GET/response/text consumption was
attempted, and bounded response status/URL classification. It returns no config
values on failure. Existing owner, empty StartPage, HALF_OFFLINE, response URL,
platform and complete directory predicates remain in place. Refusal keeps
unknown-effects quarantine and grants no retry or fallback.

Before decoding either actual SDK reply, the coordinator captures complete
bounded plain data without invoking getters/proxies/toJSON, retains it in
memory, and publishes an exclusive raw reply artifact. Extraction, malformed
native responses or later publication failures cannot erase that captured
failure. Inspection exposes its original bytes/digest/value without duplicating
the serialized text. A lost local publication can settle only its exact pending
candidate, never another native call. A reply above the bounded capture grammar
still refuses and keeps original cleanup custody; no truncated reply is accepted.

Inspection of the original base request can now report its actual retained
environment operation and cleanup nonce without adopting or aliasing any native
owner. Mutating cleanup still requires that exact environment ID and nonce.
Dispatch reporting distinguishes the environment getter from fixture import,
correcting the prior misleading import-possible flag for preflight-only failure.

Pinned Node24.18.0 and zero soft core limit ran the25 focused import program,
coordinator and actual Engine/HMAC-composition regressions successfully. New
cases verify pre-fetch versus response-metadata refusal, a24KiB upstream error
retained in the actual managed artifact, distinct typed refusal, original base
inspection, zero getter invocation, no importer/destination and no retry.
Strict types and type-aware lint pass after correcting an optional-artifact
assertion and two test expression-style findings; earlier logs are retained.
These are source/synthetic results, not execution of the revised native route.
No new application, controller, Save or user project was opened by this change.
