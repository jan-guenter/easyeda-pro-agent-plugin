# Schematic consistency and Text echo callees

A publisher localChange first calls its consistency manager, then queues pending
upload data. The manager increments its ticket and records the local item before
remoteChange decides whether to publish the local echo. The installed constructor
sets isLocalChange true. Treating this stage as a guaranteed suppressed callback
would skip real application behavior.

The original callback sequence reaches the registered parser, onParseLine,
parseText and the concrete sheet manager's onText. onText invokes the handler's
onAddOrUpdate arrow. That arrow skips addTask and its change callback only while
its actual isPaused field is true. The registered parser can also update order
numbers when a calculation is present. Those concrete receiver, roster, field
and branch checks remain obligations of the original write owner.

A separate metadata table now qualifies twelve methods and lexical arrows in
both pinned schematic sources. It includes local/remote consistency changes,
callback dispatch and registration, ticket updates, Text parsing, order updates,
the concrete sheet callback and its paused handler. Its decoder checks exact
name, arity, source positions, script identity, own properties and retained
function/scope handles. No packet grants callback, ticket or continuation custody.

All twenty-four uninvoked functions were checked through actual Node24 Inspector
using the installed source's original UTF16 positions. Foreign descriptions,
scripts, shifted positions and property-accessor packets refuse. Focused checks,
strict changed-file lint and types passed. This is source-only evidence; native
publication, clocks, SQL changes, Save and reopened state remain separate.
