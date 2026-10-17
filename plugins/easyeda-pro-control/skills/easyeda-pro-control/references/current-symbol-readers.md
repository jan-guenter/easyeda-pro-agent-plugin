# Current symbol metadata and checkpoint preparation

Read [offline discovery](api-reference.md) first for schema lookup and coverage.
This reference defines the task-specific contract; it does not grant execution
or replace the current tool's runtime checks.

## Current project-local symbol metadata

Query `project-symbol` with `includeSchemas:true`, validate the exact request
with `project-symbol-validate`, then call `easyeda_control_project_symbol` with
the actual authenticated fingerprint. The method is `eda.lib_Symbol.get`, with
`arguments:{"symbolUuid":"<exact-symbol-id>"}` and the same explicit active PCB
project/branch/document/tab target used by current PCB readers.

Only a 64-hex local path-hash project ID is accepted. The result includes the
symbol UUID, project and owner UUIDs, exact displayed `name`, `description`,
native `tagsJson`, template `source`, `version` and numeric `ticket`. `source`
is not drawing content. Native empty-string fallbacks and JSON tag encoding
are preserved; this is not a lossless stored META record. Names, descriptions,
template references and versions are bounded to 512, 65536, 4096 and 128 characters;
tags encode at most 256 strings of 512 characters. The total limit is 384 KiB.

This is a project-qualified native metadata subset, not the public wrapper or
its full library contract. The selected symbol must be absent from the current
tab registry. The adapter requests no geometry/source loading, cloud-library
lookup, navigation, write or Save. Missing or inconsistent data refuses rather
than falling back to another library.

Two matching bounded samples observe native metadata while retaining the outer
RPC receiver and current project/tab references around awaits. This is not an
atomic lock on the module-private project worker, complete source, hidden-editor
absence, saved membership or persistence proof. No writer may accept this result
as its complete before-state. The separate ordinary metadata tool obtains its
own full baseline and lifecycle proof; installed123000 passed one unused
META-only case on a disposable fixture, not through this reader alone.

### Ordinary symbol metadata operation

Discover `project-symbol-operation` with `includeSchemas:true`, then validate
the exact request with `project-symbol-operation-validate` and
`query:{request:...}`. The live tool is
`easyeda_control_project_symbol_metadata`. Read the
[ordinary workflow](current-project-opening.md#ordinary-forward-only-symbol-metadata)
before opening or editing. Its strict outer object accepts `request` and an
optional `expectedFingerprint`; only `open` may supply the fingerprint.

This is a narrow native equivalent of `lib_Symbol.modify`, not execution of its
public wrapper. It changes only name and/or non-null description on one unused,
closed, META-only project-local symbol. Complete raw history, startup effects,
original owners, clocks, SQL effects and reopened content are checked. The
forward-only route cannot consume disposable ownership or supply an inverse.
Discovery returns `registrationEnabled:true`, but never execution authority.
The shared writer passed installed101500 disposable forward/inverse validation;
the ordinary entrypoint separately passed installed123000's unused META-only
forward lifecycle on a disposable fixture. Neither result grants current-call
authority or covers ordinary drawn-symbol editing. Generic
`library.symbol.modify` and the older `symbol_metadata` tool stay blocked.

### Symbol observation with no editor tabs

For creating a drawn-symbol fixture in a disposable project, use the separate
[symbol-copy workflow](current-symbol-copy.md). Metadata-reader results alone
cannot authorize that operation; it seals its source against the original
checkpoint and complete SQL inventory. Ordinary copying remains unsupported.

When the project is loaded but only Start Page/its hidden blank tab remains,
use the separate `project-symbol-preflight` discovery and
`project-symbol-preflight-validate` actions. Pass the validated request to the
same `easyeda_control_project_symbol` tool with the authenticated fingerprint.
Do not open a PCB merely to satisfy the older metadata reader's context.

This request has `target:{projectUuid,branchUuid,symbolUuid,ownerUuid}` and
`expectedBefore:{name,description,tagsJson,source,version,ticket}`; it has no
`method` or `arguments` field. Use exact known metadata, not guesses or values
normalized for display. Two samples must match all expected fields. The guard
checks the complete bounded tab/container registry and native DOM for hidden
editors, and rejects pending restored tabs, URL commands, dirty tabs, cached
read-only state or strict concurrent mode. It observes the project client and
maximum ticket, agreeing UI actor caches and four renderer/notify clock samples.
No geometry, permission dialog, navigation, mutation or Save is requested.

These are loaded-state comparisons, not source provenance or a worker lock.
The UI actor is not the backend transaction actor; clock agreement is not
timestamp-producer qualification. Permission, startup completion, saved-state
membership and writer authority remain false. A deadline does not cancel a
native read already in flight. Never turn a successful preflight into permission
to invoke the disabled writer or substitute it for a retained lifecycle.

### Checkpoint-bound symbol preparation

The offline API also prepares a name and/or non-null description change from an
existing managed checkpoint. It does not call EasyEDA or the metadata reader.
Discover the exact schemas first:

```json
{"request":{"action":"project-symbol-preparation","query":{"includeSchemas":true}}}
```

Use `project-symbol-prepare-validate` with `query:{"request":...}` for argument
validation only, then `project-symbol-prepare` with the same query to read the
checkpoint. The inner request has:

- `checkpoint:{path,bytes,sha256}`: an existing canonical absolute `.eprj2` path
  beneath this profile's managed `checkpoints` directory, with exact size and
  SHA-256. Limit 256 MiB; file must be owner-owned, owner-only and single-link.
- `target:{projectUuid,branchUuid,ownerUuid,symbolUuid}`: exact identities;
  project ID is 64 hex, branch/owner 32 hex, symbol 16 or 32 hex.
- `patch:{name?,description?}`: at least one field. Name must be nonblank and
  at most 512 characters; description at most 65536. Null, classification,
  caller code and other fields refuse.

The reader verifies the complete selected linked-history branch, its identity,
an undeleted ordinary SYMBOL with supported DOCHEAD/META, and all active peer
symbol names. It returns before/after metadata, unchanged tags/template source,
peer names, selected-history counts and complete selected-branch record hash.
The original file descriptor, named file, parent directory, hash and sidecar
absence are checked. It creates no checkpoint, artifact or journal and accepts
no arbitrary original-project path. The wrapped result must fit 512 KiB;
excess data refuses without truncation or an artifact fallback.

Optional `observationProjection` correlates metadata from the current symbol
reader, not its decorated tool envelope. Explicitly select these core fields:
`ok`, `kind`, `method`, `target`, `value`, `samples`, `implementationKind`,
`targetClosedInRegistry`, `hiddenEditorsVerified`, `workerIdentityVerified`,
`cadAuthority`, `persistenceVerified`, `sourceMembershipVerified`. Discovery
returns the exact strict schema. Supplied values establish no provenance or
freshness. The correlation compares identities, name, description, tags and
template source; it does not compare ticket or version.

`preparationSha256` binds the returned preparation, not the live application.
`writerReady`, `inverseReady`, `executionAuthorized`, `cadAuthority`,
`persistenceVerified` and `sqlInventoryVerified` stay false. This is selected-
branch storage preparation, not all-branch/SQL proof, hidden-editor absence,
current actor/worker identity or permission to execute the legacy writer.

### Retained baseline comparison

Query `baseline-analysis` with `includeSchemas:true`, validate with
`baseline-analysis-validate`, then call `baseline-analyze`. Both validation and
execution take `query:{request:{operationId}}`. No caller path, runtime or code
is accepted. The command requires a successfully retired 24-phase disposable
baseline lifecycle with both closed snapshots captured.

It compares complete logical SQL plus selected-branch native records and
provenance using only retained managed files. It returns bounded table/document
hashes and counts, not raw contents, and refuses oversized results without
truncating comparisons. It writes nothing and does not open the original
project. Follow the [snapshot analysis workflow](current-project-opening.md#compare-retained-snapshots)
to distinguish historical equality from startup classification, current state
and writer authority.
