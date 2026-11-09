# 2026-11-09 stock command switch lint correction

The first combined full-tree strict lint on source164498bf reported fourteen
style errors in the stock-origin original-reference switch: thirteen missing
case blocks and a missing default. The failed log is retained. Both TypeScript
projects had passed on that combined source.

Each fixed case now has its own block. An unknown phase explicitly refuses;
the thirteen admitted phases and their original frame/config/Promise joins
retain their existing checks. The corrected file passed strict type-aware
lint with zero warnings. No fixed program, wire row, native helper, request
budget, application or controller changed. Final merged-source checks remain
separate from this correction.
