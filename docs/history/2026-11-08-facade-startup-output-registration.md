# Facade startup output registration

The first verified development payload passed the calculation-mode offline
catalog probe but failed ordinary facade initialization before serving a tool.
The schematic display writer had an input registration without an entry in
the common output-schema map. The resulting registration error stopped the
whole facade. No application, native workflow or writer was started.

Canonical fix `08493937` imports the existing result and diagnostic schemas
as runtime values and adds their strict output entry. A new contract check
covers every named facade registration, including the two computed writer
names. Another evaluates the actual schematic output-schema property and
rejects malformed results, authority-bearing diagnostics and unknown fields.
Both focused checks, both TypeScript configurations and changed-file strict
lint passed.

The original failed controller's child exit was observed. Its manager then
acknowledged its supported shutdown and exited, observed through the original
retained process descriptor. No signal was used. The frozen failed package was
preserved. CodeRabbit review188 later independently reported this same missing
schema outside its immediate diff. The canonical fix addresses that issue.

A separate rebuilt development payload passed all required local non-suite,
dependency and security checks, three-bundle reproducibility, seven skill
checks, exact Git byte/mode verification and the 81-query offline probe. Its
fresh foreground manager successfully initialized and exposed both writers.
These startup and source checks establish no design effect, saved content,
helper release or official publication. The original failed Via journal still
requires its separate historical metadata resolution.
