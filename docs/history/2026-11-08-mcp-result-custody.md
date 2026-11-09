# Complete MCP result custody

On 2026-11-08, an agent formatted a successful ownership-conflict inspection by
printing only its MCP text blocks. Those blocks contained a summary; the own
process identity was in `structuredContent`. The original response was not
retained, so the formatted output could not bind a safe cleanup target.

The same original conflict-only connection remained usable. One correctly
retained metadata-only inspection supplied its own PID and the distinct
observed owner PID, with no lease, live control or admission. Independent
process identity checks and a retained pidfd preceded the supported
`close-conflict` call. Original exit was observed. No other process was closed,
no signal was sent and no native owner was reconstructed.

The lasting rule and
[connection reference](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#retain-the-complete-tool-result)
now require complete reply retention before formatting. They distinguish one
read-only metadata recovery on an open original conflict connection from
replaying a consumed native action or retrying a closed transport. The missing
first projection remains a failure; the later receipt does not recreate it.

This documentation follows the frozen development payload at canonical commit
`aec9c797c3b78d98e3cda3962ddc7ffa0620bd3f`. It does not change that selected
payload, grant live execution, or establish publication or installation.
