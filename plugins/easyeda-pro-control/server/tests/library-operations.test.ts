import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { MANAGED_FILE_MAX_BYTES, compileLibraryOperation, libraryOperationSchema, listLibraryOperationCapabilities } from "../src/library-operations.ts";

void describe("typed library, lifecycle and export operation catalog", () => {
  void it("compiles exact library positional contracts, associations and plural model results", () => {
    const create = compileLibraryOperation({ id: "device", action: "library.device.create", libraryUuid: "project-library", name: "Socket", association: { symbol: { uuid: "s", libraryUuid: "project-library" }, footprint: { uuid: "f", libraryUuid: "project-library" } }, property: { designator: "J?", addIntoPcb: true } });
    assert.equal(create.call.api, "lib_Device");
    assert.equal(create.call.method, "create");
    assert.deepEqual(create.call.args[2], { kind: "undefined" });
    assert.deepEqual(create.call.args[3], { kind: "literal", value: { symbol: { uuid: "s", libraryUuid: "project-library" }, footprint: { uuid: "f", libraryUuid: "project-library" } } });
    assert.equal(create.call.args.length, 6);
    const modify = compileLibraryOperation({ id: "modify", action: "library.device.modify", libraryUuid: "project-library", target: { resultOf: "device" }, patch: { association: { model3D: null }, property: { manufacturer: "Maker" } } });
    assert.deepEqual(modify.call.args[0], { kind: "identity", target: { resultOf: "device" } });
    assert.deepEqual(modify.call.args[4], { kind: "literal", value: { model3D: null } });
    assert.deepEqual(modify.call.args[5], { kind: "undefined" });
    assert.deepEqual(modify.call.args[6], { kind: "literal", value: { manufacturer: "Maker" } });
    assert.equal(modify.expectedFields[0]?.comparison, "patch-with-null-clears");
    const model = compileLibraryOperation({ id: "model", action: "library.model3d.create", libraryUuid: "project-library", file: { artifactId: "managed-model", sha256: "a".repeat(64), bytes: 1024, name: "socket.step", mime: "application/step" }, unit: "mm" });
    assert.equal(model.resultKind, "identities");
    assert.equal(model.call.args[1]?.kind, "managed-file");
    assert.equal(model.fileTransfer?.ownership, "executor-managed");
    assert.ok(model.requiredProofs.includes("every-returned-model-identity"));
    const symbol = compileLibraryOperation({ id: "symbol", action: "library.symbol.create", libraryUuid: "lib", name: "S", symbolType: 2 });
    assert.deepEqual(symbol.call.args, [{ kind: "literal", value: "lib" }, { kind: "literal", value: "S" }, { kind: "undefined" }, { kind: "literal", value: 2 }, { kind: "undefined" }]);
  });

  void it("binds source replacement and editor lifecycle to explicit identities without equating save with persistence", () => {
    const open = compileLibraryOperation({ id: "open", action: "library.footprint.open", libraryUuid: "lib", target: { uuid: "fp" } });
    assert.deepEqual(open.call, { api: "dmt_EditorControl", method: "openLibraryDocument", args: [{ kind: "literal", value: "lib" }, { kind: "literal", value: "4" }, { kind: "identity", target: { uuid: "fp" } }, { kind: "undefined" }] });
    const symbol = compileLibraryOperation({ id: "open-symbol", action: "library.symbol.open", libraryUuid: "lib", target: { uuid: "symbol" } });
    assert.deepEqual(symbol.call, { api: "lib_Symbol", method: "openInEditor", args: [{ kind: "identity", target: { uuid: "symbol" } }, { kind: "literal", value: "lib" }, { kind: "undefined" }] });
    const source = compileLibraryOperation({ id: "source", action: "library.footprint.source.replace", libraryUuid: "lib", target: { uuid: "fp" }, documentSource: "native document source" });
    assert.equal(source.call.method, "updateDocumentSource");
    assert.deepEqual(source.documentTypes, [4]);
    assert.equal(source.inverse.kind, "restore-source-from-before");
    assert.ok(source.requiredProofs.includes("active-library-document-matches-target"));
    assert.ok(source.beforeReads.some((read) => read.method === "getDocumentSource" && read.args.length === 0));
    const page = compileLibraryOperation({ id: "page", action: "document.page.create", schematic: { uuid: "schematic" } });
    assert.deepEqual(page.call, { api: "native-project-message-bus", method: "/PrjDB/sheet/addData", args: [] });
    assert.ok(page.beforeReads.some((read) => read.method === "getAllSchematicPagesInfo"));
    assert.deepEqual(page.documentTypes, [1, 3]); assert.equal(page.contextTransition, "preserve");
    assert.deepEqual(page.inverse, { kind: "none", api: null });
    assert.ok(page.requiredProofs.includes("original-native-created-identity"));
    assert.ok(page.requiredProofs.includes("one-empty-page-addition-and-unchanged-complete-peer-hierarchy"));
    assert.ok(!page.requiredProofs.includes("save-close-reopen-persistence"));
    assert.ok(page.limitations.some((limit) => limit.includes("template/drawing-frame initialization and editor-open workflow are not invoked")));
    const save = compileLibraryOperation({ id: "save", action: "document.schematic.save", target: { uuid: "page" } });
    assert.deepEqual(save.call, { api: "sch_Document", method: "save", args: [] });
    assert.deepEqual(save.target, { identity: { uuid: "page" }, libraryUuid: null });
    assert.ok(save.requiredProofs.includes("active-document-matches-explicit-target"));
    assert.ok(save.requiredProofs.includes("independent-logical-database-and-reopened-proof"));
    const project = compileLibraryOperation({ id: "project", action: "project.open", target: { uuid: "project" } });
    assert.ok(project.requiredProofs.includes("proven-clean-project-before-open"));
    const close = compileLibraryOperation({ id: "close", action: "document.close", tabId: "page@project" });
    assert.ok(close.requiredProofs.includes("no-unresolved-save-or-discard-dialog"));
  });

  void it("exports Files through bounded managed transfer and never save dialogs or arbitrary paths", () => {
    const netlist = compileLibraryOperation({ id: "netlist", action: "export.schematic.netlist", fileName: "connectivity", fileType: "JLCEDA", maxBytes: 8192 });
    assert.deepEqual(netlist.call, { api: "sch_ManufactureData", method: "getNetlistFile", args: [{ kind: "literal", value: "connectivity" }, { kind: "literal", value: "JLCEDA" }] });
    assert.equal(netlist.resultKind, "managed-file");
    assert.deepEqual(netlist.fileTransfer, { direction: "output", maxBytes: 8192, chunkBytes: 262_144, hash: "sha256", ownership: "executor-managed" });
    assert.ok(netlist.requiredProofs.includes("real-nonempty-File-result"));
    const gerber = compileLibraryOperation({ id: "gerber", action: "export.pcb.gerber", fileName: "fabrication-draft", maxBytes: 65_536, colorSilkscreen: false, unit: "mm", digitalFormat: { integerNumber: 2, decimalNumber: 6 }, other: { metallicDrillingInformation: true, nonMetallicDrillingInformation: true, drillTable: false, flyingProbeTestingFile: false }, layers: [{ layerId: 1, isMirror: false }, { layerId: 2, isMirror: false }], objects: ["Pad", "Via", "Track", "BoardOutline"] });
    assert.equal(gerber.call.method, "getGerberFile");
    assert.equal(gerber.call.args.length, 7);
    assert.equal(gerber.effect.identity, "read");
    const pdf = compileLibraryOperation({ id: "pdf", action: "export.pcb.pdf", fileName: "board", maxBytes: 2048 });
    assert.equal(pdf.call.args.length, 1);
    assert.ok(pdf.limitations.some((limit) => limit.includes("ignores most PDF options")));
  });

  void it("rejects injected calls, malformed payloads and declared-but-stubbed methods", () => {
    const bad = [
      { id: "bad", action: "project.delete", target: { uuid: "p" } },
      { id: "bad", action: "library.device.source.replace", libraryUuid: "lib", target: { uuid: "d" }, documentSource: "x" },
      { id: "bad", action: "library.device.create", libraryUuid: "lib", name: "x", association: {} },
      { id: "bad", action: "library.device.create", libraryUuid: "lib", name: "x", association: { symbol: { uuid: "s", libraryUuid: "lib" } }, property: { manufacturer: null } },
      { id: "bad", action: "library.symbol.modify", libraryUuid: "lib", target: { uuid: "s" }, patch: {} },
      { id: "bad", action: "library.symbol.get", libraryUuid: "lib", target: { uuid: "s", resultOf: "another" } },
      { id: "bad", action: "export.pcb.pdf", fileName: "../../file", maxBytes: 100 },
      { id: "bad", action: "export.pcb.pdf", fileName: "board", maxBytes: MANAGED_FILE_MAX_BYTES + 1 },
      { id: "bad", action: "export.pcb.pdf", fileName: "board", maxBytes: 100, path: "/tmp/out.pdf" },
      { id: "bad", action: "export.pcb.pdf", fileName: "board", maxBytes: 100, method: "saveFile" },
      { id: "bad", action: "library.model3d.create", libraryUuid: "lib", file: { artifactId: "m", sha256: "a".repeat(64), bytes: 100, name: "m.step", mime: "application/step", path: "/tmp/m.step" }, unit: "mm" },
    ];
    for (const operation of bad) { assert.equal(libraryOperationSchema.safeParse(operation).success, false); }
    const catalog = listLibraryOperationCapabilities();
    assert.equal(z.toJSONSchema(libraryOperationSchema).oneOf?.length, 68);
    assert.equal(new Set(catalog.map(({ action }) => action)).size, catalog.length);
    assert.ok(catalog.some(({ action, status }) => action === "project.delete" && status === "native-stub"));
    assert.ok(catalog.some(({ action, status }) => action === "eco.schematic-to-pcb" && status === "visible-dialog-gate"));
    assert.ok(catalog.some(({ action, status }) => action === "library.device.modify" && status === "typed-descriptor-awaiting-executor-validation"));
  });
});
