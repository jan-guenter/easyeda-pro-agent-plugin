# Schematic display scene baseline

The explicit Relevance fixture has seven serialized page rows including CANVAS,
six persistent source IDs, and eight native indexed models after ordinary
initialization. The two extra models are the original Wire's UnConnectDot
endpoint markers. They have no source ID and do not add history. The original
NetPointManager initializer creates them before bbox/history watches start.
Original Wire sorting places LINE, both markers, then Relevance, giving the
native Relevance ATTR a zIndex of 3. The archive's stored ATTR index is unchanged.

The Relevance display program now calls the exact shared scene projection from
`generated-schematic-relevance-scene-program.ts`. That projection checks every
indexed model, persistent source ID, parent, original Wire/LINE/ATTR reference,
endpoint, point-node contact set, marker membership and original dot-ID map.
It also requires the root's settled three-child index permutation. Unknown
children and source IDs refuse. Display retains all eight model references
through each before/after observation, including both markers. Text-only bbox
updates do not trigger the source's net-point refresh branch, so display grants
no marker replacement exception.

The old six-row profile now explicitly refuses source-excluded model children.
Its prior bounded tree/index equality allowed an unknown model outside the
source-ID roster. The six-row profile cannot silently absorb the implicit
Relevance/endpoint scene or supply authority for the explicit seven-row fixture.
Their original argument, checkpoint and result schemas remain distinct.

Nine focused VM, argument and pending Save-body cases pass, including unknown
children, malformed/source-listed markers, foreign pin contacts, wrong ATTR
index and marker identity replacement. Both TypeScript projects and strict
changed-file lint pass. The shared scene/source dependency independently pins
and executes the original initializer and Wire sorting on inert objects. These
are source and offline results. No original Relevance writer was allocated, no
native stage ran, and no Modify, Save, SQL, persistence or reopened claim follows.
The distinct seven-row native factory and genuine lifecycle remain necessary.
