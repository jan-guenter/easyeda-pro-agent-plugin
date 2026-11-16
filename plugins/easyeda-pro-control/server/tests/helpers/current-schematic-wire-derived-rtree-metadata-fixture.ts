/** Original complete functions/classes retain their installed source PCs.
 * Captured modules are inert stand-ins; constructor bodies are not invoked. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE as SOURCE, qualifyCurrentSchematicWireDerivedRtreeSource as qualify } from "../../src/current-schematic-wire-derived-rtree-source.ts";
import type { CurrentSchematicWireDerivedRtreeRole as Role } from "../../src/current-schematic-wire-derived-rtree-source.ts";

export function wireDerivedRtreeMetadataFixture(source: string, variant: 0 | 1): string {
  assert.equal(qualify({ scriptSource: source }), variant); const rows = SOURCE[variant].rows; const pieces: { start: number; end: number; text: string }[] = [];
  const text = (role: Role): string => source.slice(rows[role].start, rows[role].end);
  const add = (start: number, end: number, value: string): void => { assert.equal(value.length, end - start); pieces.push({ start, end, text: value }); }; const before = (start: number, value: string): void => { add(start - value.length, start, value); }; const after = (end: number, value: string): void => { add(end, end + value.length, value); };
  const cls = text("connectionClass"); const supers = cls.slice(cls.indexOf("extends(") + 8, cls.indexOf("){constructor")).split(",").filter(value => value.includes("=")).map(value => value.split("=")[0]);
  const prefix = `(function(){"use strict";const refs={};let J,${  supers.join(",")  };`; add(0, prefix.length, prefix);
  const factory = rows.rbushFactory; before(factory.start, "refs.rbushFactory="); add(factory.start, factory.end, text("rbushFactory")); after(factory.end, ";");
  for (const role of ["basicPointClass", "modelTreeClass"] as const) { const row = rows[role]; before(row.start, `const ${  row.name  }=`); add(row.start, row.end, text(role)); after(row.end, `;refs.${  role  }=${  row.name  };${  role === "basicPointClass" ? `J=${  row.name  };` : ""}`); }
  const conn = rows.connectionClass; const range = rows.pointRangeClass; before(conn.start, `const ${  conn.name  }=`); add(conn.start, range.end, source.slice(conn.start, range.end)); after(range.end, `;refs.connectionClass=${  conn.name  };refs.pointRangeClass=${  range.name  };`);
  for (const [name, roles] of [["Base", ["baseBBoxForRTree", "baseUpdateSelfBBox"]], ["Line", ["lineBBox", "lineRenderBBox"]], ["Net", ["netRefresh", "netAnalyze", "netBuild"]]] as const) {
    const selected = roles.map(role => rows[role]); const start = Math.min(...selected.map(row => row.start)); const end = Math.max(...selected.map(row => row.end)); before(start, `refs.${  name  }=class{`); add(start, end, source.slice(start, end)); after(end, `};${  roles.map(role => `refs.${  role  }=refs.${  name  }.prototype.${  rows[role].name  };`).join("")}`);
  }
  const group = rows.groupRTreeAddible; before(group.start, "refs.Group=class{"); add(group.start, group.end, text("groupRTreeAddible")); after(group.end, '};refs.groupRTreeAddible=Object.getOwnPropertyDescriptor(refs.Group.prototype,"rTreeAddible").get;'); before(source.length, "return refs;})()");
  const out: string[] = []; let end = 0;
  for (const piece of pieces.toSorted((a, b) => a.start - b.start)) { assert.ok(piece.start >= end); out.push(source.slice(end, piece.start).replaceAll(/[^\r\n]/gu, value => " ".repeat(value.length)), piece.text); end = piece.end; }
  out.push(source.slice(end).replaceAll(/[^\r\n]/gu, value => " ".repeat(value.length))); return out.join("");
}
