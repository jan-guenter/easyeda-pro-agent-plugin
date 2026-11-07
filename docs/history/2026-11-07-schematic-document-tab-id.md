# Schematic document tab identity

The original normal-history collector selected `doc.tabId` as an own data
property. The pinned document manager stores `_tabId` and implements `tabId`
through its base getter and the page or symbol getter. The previous inert
fixture used an own `tabId` value and hid this incompatibility.

The collector now compares the original own `_tabId` with the history recorder's
`belongTabId`. Its fixture uses a getter-backed document and proves that the
collector leaves that getter uncalled. A changed raw identity or accessor in
place of `_tabId` refuses. The existing24-function collection and718-request
ceiling remain unchanged. Raw identity equality grants no getter invocation.

A separate source and metadata leaf pins the base, schematic-page and symbol
getters in both complete reviewed schematic scripts. Six uninvoked functions
passed actual Node24 Inspector description, location and descriptor checks.
Foreign scripts, shifted coordinates, duplicate metadata fields and metadata
accessors refuse. These are inert checks, not original renderer ownership,
callback delivery, writer execution or saved/reopened validation.

Six focused cases and TypeScript checks passed. The first lint run reported
numeric separator style in the new generated table; that failure is retained
privately. The corrected table passes the unchanged strict lint configuration.
The normal-success callback still needs its own original document/prototype
binding before reading `tabId`. No user project was opened or edited.
