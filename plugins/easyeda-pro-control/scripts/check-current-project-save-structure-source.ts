/** Offline installed bytes/UTF16 check; no application or worker is run. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE, CURRENT_PROJECT_SAVE_STRUCTURE_METADATA_METHODS as METHODS, qualifyCurrentProjectSaveStructureSource } from "../server/src/current-project-save-structure-source.ts";
// oxlint-disable-next-line node/no-top-level-await -- This standalone source checker awaits its one bounded file read.
const source = await readFile(join(process.argv[2] ?? "/mnt/c/Program Files/easyeda-pro/resources/app/assets", CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE.relativePath), "utf8");
qualifyCurrentProjectSaveStructureSource(source);
const method = (role: keyof typeof METHODS): string => source.slice(METHODS[role].start, METHODS[role].end).replace(/^static /u, "");
const result: unknown = runInNewContext(`const methods={${method("pcb")},${method("schematic")},${method("sheet")},${method("setEditData")},${method("onHeadChange")}};
const ve={PCB:"PCB",SCH:"SCH",SCH_PAGE:"SCH_PAGE"},be={PCB:{ON_ADD:"pcb"},SHEET:{ON_ADD:"sheet"},SCHEMATIC:{ON_ADD:"schematic"}};
const manager=data=>({data,client:"client",projectManager:{uuid:"project",notifyWatcher(){}},publishUpdate(){},setEditData:methods.setEditData});
const head={version:"100",updateTime:100,createTime:100},project={pcb:manager({pcb:{uuid:"pcb",title:"PCB1",board:"",parent:"",source:"",...head}}),
schematic:manager({parent:{uuid:"parent",title:"Schematic1",board:"",source:"",...head}}),sheet:manager({page:{uuid:"page",title:"Sheet1",schematic:"parent",zIndex:1,source:"",...head}}),publishMaxTicket(){}};
for(const[docType,uuid]of[[ve.PCB,"pcb"],[ve.SCH_PAGE,"page"]])methods.onHeadChange.call(project,{docType,uuid,client:"client",updateTime:200,version:"200",ticket:20});
JSON.stringify({pcb:methods.pcb(project.pcb.data.pcb),schematic:methods.schematic(project.schematic.data.parent),sheet:methods.sheet(project.sheet.data.page)});`, {}, { timeout: 1000 });
assert.equal(result, JSON.stringify({ pcb: { uuid: "pcb", title: "PCB1", board: "", parent_uuid: "", source: "", version: "200", updateTime: 200 },
  schematic: { uuid: "parent", name: "Schematic1", board: "", source: "", version: "200", updateTime: 200 },
  sheet: { uuid: "page", title: "Sheet1", schematic_uuid: "parent", zIndex: 1, source: "", version: "200", updateTime: 200 } }));
process.stdout.write(`${JSON.stringify({ sourceQualified: true, sites: 6, timerFrameLocations: 1, metadataMethods: 5, plainDataProjectionChecked: true, nativeExecutionVerified: false, writerAuthority: false })}\n`);
