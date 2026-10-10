# Native symbol encoding and persistence

This profile covers the installed schematic editor `3.2.149.88089769` and its pinned `sch.js` implementation. It does not alter the generic document parser or discard fields from raw source/checkpoint hashes.

## Source effects

`setCommonPropsForConsistencyManager` emits `groupId` only when a real PART group owns the model. New ungrouped geometry therefore omits this property; an empty string is not its exported representation.

The symbol loader's `handleAdd` calls `getOrCreateAttr("Symbol")` for each PART. A previously unexported default attribute can enter source on the first edit. The effect verifier admits exactly one newly exported, 16-hex-character ATTR identity only when the baseline and intended source both lack that PART's Symbol attribute. Its entire body must match the pinned null-value, null-position default, exact PART parent and expected next zIndex. The complete record is retained in `symbolMaterializations`, the source delta and the raw hash. Extra properties, drawing coordinates, non-null values, changed old records or additional records fail.

A normal typed inverse cannot restore an absent default attribute after the loader materializes it. The adapter reports no exact inverse for that baseline; it does not claim restoration or offer an automatic database restore.

## Durable legacy conversion

Legacy import writes empty `groupId` fields and an ATTR `version:"2.0"` marker. The current model encoder emits neither an unowned group nor that import marker. The symbol parent resolver maps an empty ATTR parent to its explicitly named PART; the encoder subsequently writes that PART ID.

The symbol persistence verifier permits only observed forward conversions of existing ATTR/PIN records: empty group removal, ATTR version-2.0 removal, and empty ATTR parent to the exact single PART. After those precise substitutions, the entire old record body must equal the independently captured before-source body. The normal persistence verifier still checks the intended source delta and every other durable record. A newly inserted user stamp must exactly match unambiguous same-owner metadata already present in other baseline documents; replacement is not allowed.

Comparison copies have separate semantic commitments. Reports retain the original before/after checkpoint and source hashes, each converted record's ID and body hashes, changed fields and user-stamp evidence. No conversion permits a change to another document.

## Evidence and limits

One disposable symbol-circle call produced the intended circle plus the exact default attribute; all previously exported records were unchanged. Offline verification of that captured source passes the corrected effect proof. Five symbol tests, one focused persistence regression, TypeScript and owned lint passed before integration.

The subsequent checkpoint also contained legacy symbol conversion and a delayed, separately journaled footprint inverse. The symbol verifier correctly rejects that cross-document delta. Any recovery must preserve and prove both journals separately; it cannot relabel the combined database state as an isolated symbol transaction. Saved/reopened live validation of the integrated correction remains a separate result.

Pinned implementation locations used in review: `setCommonPropsForConsistencyManager` near offset 1921244; `appendChild` near 1931537; symbol parent resolution near 4652299; symbol `handleAdd` near 4653442; ATTR encoder near 6279814; legacy ATTR importer near 1765389; DOCHEAD user encoder `W2` near 1442016. Offsets are navigation aids, not admission criteria; the complete reviewed implementation hash remains the gate.
