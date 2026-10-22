# Default-font String box prediction

The existing post-create comparison now rejects matching raw samples whose text
box differs from the pinned default-font geometry. It does not treat two equal
wrong boxes as an acceptable partial effect. No writer or native call was added.

The fixed create plan remains layer3, nonmirrored, rotation0, LEFTLOW origin,
font size12 and stroke0.8 internal units, with printable nonblank ASCII. The new
pure model retains the original plan's identity and derives a complete rectangle.
Copied plans, getters and Proxies cannot supply that original identity.

## Source relation

The complete PCB source remains pinned to
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Only inert source parsing was used. No vendor font routine was evaluated.

- `Qy.fontPath` spans UTF-16 offsets3628338..3635614, 7276UTF-8 bytes,
  SHA256 `77fb93d6c3f1e02e158f64247348fd07aa23b5d15737627d9eb0e6825c11e37f`.
  All94 non-space printable ASCII glyphs have paths containing at least two
  points. The packaged numeric table contains their maximum x coordinates only.
- `Qd` subtracts stroke width from font size before scaling glyphs by1/32.
  `BFe` rounds each endpoint to two decimal places before calculating maxima and
  advancing the next glyph. Spaces advance the cursor but add no outline.
- The bounding builder starts at the origin and expands by half the stroke.
  Thus trailing spaces do not enlarge the resulting width. A vertical glyph
  such as `I` still has the stroke's width, not zero width.
- `h3`, `Ae.getMatrix4`, `S.multiply4` and `rd.reset4` place the fixed rectangle
  at the requested internal position. Unrounded floating-point sums are kept:
  width23.99 plus x12 is35.989999999999995, not a normalized35.99.

An independent review parsed all94 metrics from the pinned literal and compared
the compressed metric model with a separately written full-endpoint calculation
for100 strings, including all glyphs, spaces and the256-character input bound.
The widths matched exactly. This is source/synthetic evidence, not a connected
renderer observation or a proof that its mutable glyph table remains pristine.

## Scope

The post-create relation independently decodes the raw String, checks its generated
ID and fixed scalar fields, then compares all four box corners without an epsilon.
The raw state is still retained in its projection hash. The box prediction has
its own digest; it is not a raw source or saved-file digest.

Outline points, native data-state flags, actual glyph-table provenance, rendering,
other model families, complete effects and saved/reopened persistence remain
unverified. Their flags stay false. This change provides one narrower exact
relation for the future lifecycle, not permission to invoke the dormant writer.
