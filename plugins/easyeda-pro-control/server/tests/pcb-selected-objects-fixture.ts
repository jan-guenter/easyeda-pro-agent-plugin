import assert from "node:assert/strict";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";

export type Value = Record<string, unknown>;
export interface Item { primitiveId: string; primitiveType: string; net: string | null; parentComponentPrimitiveId?: string; padNumber?: string; }
export interface Family { status: "adapter-enumerated"; count: number; primitiveIds: string[]; byPrimitiveId?: Record<string, Item>; }
export interface Fixture { objects: NativeSourceObject[]; inventory: { ok: true; kind: "pcb-inventory"; documentType: 3; families: Record<string, Family>;
  pouredCorrelation: { status: "derived-subset"; count: number; pourPrimitiveIds: string[]; byPourPrimitiveId: Record<string, unknown> };
  pouredFillPieceCount: number; physicalPadCount: number; standalonePadCount: number; enumeratedPrimitiveCount: number; units: Value; limitations: Value;
  componentPadCorrelation: { status: "exact-subset"; count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Item>; byComponentPrimitiveId: Record<string, string[]> } }; }
export const context = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
export function object(type: string, id: string, body: Value): NativeSourceObject { return { type, id, body }; }
export function snapshot(objects: NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function family(rows: Item[]): Family { return { status: "adapter-enumerated", count: rows.length, primitiveIds: rows.map((row) => row.primitiveId).toSorted(), byPrimitiveId: Object.fromEntries(rows.map((row) => [row.primitiveId, row])) }; }
export function fixture(): Fixture {
  const objects = [object("LINE", "line", { netName: "SIGNAL", startX: 1, endX: 42 }), object("LINE", "unassigned", { netName: "" }),
    object("ARC", "arc", { netName: "SIGNAL" }), object("VIA", "via", { netName: "SIGNAL" }), object("PAD", "pad", { netName: "SIGNAL", num: "3" }),
    object("COMPONENT", "component", { footprintUuid: "footprint", x: 100, rotation: 90 }),
    object("PAD_NET", '["PAD_NET","component","1","local"]', { padNet: "SIGNAL" }),
    object("STRING", "text", { text: "Selected text Ω", x: 12.34, y: -56, layerId: 3, specialColor: null }),
    object("STRING", "peer-text", { text: "Unselected peer", locked: true }),
    object("ATTR", "name", { parentId: "component", key: "Name", value: "Useful part", valueVisible: false }),
    object("CANVAS", "origin", { x: 0, y: 0 }), object("BOARD", "outline", { path: ["CIRCLE", 0, 0, 100] }), object("FILL", "fill", { netName: "SIGNAL" })];
  const families: Record<string, Family> = Object.fromEntries(["components", "pads", "vias", "lines", "arcs", "strings", "attributes", "polylines", "regions", "pours", "fills", "dimensions", "images", "objects"]
    .map((name) => [name, { status: "adapter-enumerated" as const, count: 0, primitiveIds: [] }]));
  Object.assign(families, {
    lines: family([{ primitiveId: "line", primitiveType: "Line", net: "SIGNAL" }, { primitiveId: "unassigned", primitiveType: "Line", net: null }]),
    arcs: family([{ primitiveId: "arc", primitiveType: "Arc", net: "SIGNAL" }]), vias: family([{ primitiveId: "via", primitiveType: "Via", net: "SIGNAL" }]),
    pads: family([{ primitiveId: "pad", primitiveType: "Pad", net: "SIGNAL", padNumber: "3" }, { primitiveId: "componentlocal", primitiveType: "Pad", net: "SIGNAL", padNumber: "1", parentComponentPrimitiveId: "component" }]),
    components: { status: "adapter-enumerated", count: 1, primitiveIds: ["component"] }, strings: { status: "adapter-enumerated", count: 2, primitiveIds: ["peer-text", "text"] },
    attributes: { status: "adapter-enumerated", count: 1, primitiveIds: ["name"] }, fills: { status: "adapter-enumerated", count: 1, primitiveIds: ["fill"] },
  });
  return { objects, inventory: { ok: true, kind: "pcb-inventory", documentType: 3, families,
    pouredCorrelation: { status: "derived-subset", count: 0, pourPrimitiveIds: [], byPourPrimitiveId: {} }, pouredFillPieceCount: 0,
    physicalPadCount: 2, standalonePadCount: 1, enumeratedPrimitiveCount: Object.values(families).reduce((total, value) => total + value.count, 0),
    units: { coordinatesAndLengths: "mil", angles: "degree", layers: "numeric EPCB_LayerId" },
    limitations: { directPads: "fixture", componentPadCorrelation: "fixture", pouredCorrelation: "fixture", regionRuleTypes: "fixture", fillModes: "fixture", arcPrecision: "fixture", viaPrecision: "fixture", unmonitoredFamilies: "fixture" },
    componentPadCorrelation: { status: "exact-subset", count: 1, primitiveIds: ["componentlocal"],
      byPrimitiveId: { componentlocal: { primitiveId: "componentlocal", primitiveType: "ComponentPad", parentComponentPrimitiveId: "component", padNumber: "1", net: "SIGNAL" } },
      byComponentPrimitiveId: { component: ["componentlocal"] } } } };
}
export function getFamily(state: Fixture, name: string): Family { const value = state.inventory.families[name]; assert.ok(value); return value; }
export function sourceRow(state: Fixture, id: string): NativeSourceObject { const value = state.objects.find((row) => row.id === id); assert.ok(value); return value; }
export function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample),
  contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } }; }
export function sourceString(objects: NativeSourceObject[]): string {
  const value = snapshot(objects); return [`{"type":"DOCHEAD"}||${JSON.stringify(value.document)}`,
    ...value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
}
export function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest(); const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: pinned.nodeVersion, bridge_connected: true, easyeda_version: pinned.easyedaVersion,
      extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion, ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api-types.d.ts" } } };
}
