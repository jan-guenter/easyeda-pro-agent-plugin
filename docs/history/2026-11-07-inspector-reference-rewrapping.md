# Inspector reference rewrapping

An actual inert Node Inspector check proves that repeated wrapping of the same
JavaScript object produces distinct `objectId` strings, including within one
object group. Comparing those strings does not prove JavaScript identity.

The original timer return projection already receives the retained entry as
its exact argument, checks the original receiver and guard, then returns that
same entry in its frozen tuple. Its JavaScript identity proof remains intact.
Core and observer now check the tuple/reference shape without incorrectly
requiring the newly wrapped reference to reuse the earlier handle string.
Command arguments still require the exact retained handle issued by their
original native custody; that is a different provenance check.

Eight focused timer checks pass, including actual Inspector rewrapping with
`===` confirmed inside the original realm, actual frozen descriptors, the
fixed timer programs, and an observer reply carrying a rewrapped entry handle.
Both TypeScript projects and changed strict lint pass. Fixed runtime programs,
native messages, request limits and helper bytes are unchanged. No application
or connected owner was launched; native regeneration is unnecessary here.
