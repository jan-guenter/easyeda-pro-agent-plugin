import assert from "node:assert/strict";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { fixtureDocumentRecordHistory, fixtureRebindDocumentRecordHistory } from "./document-record-history-fixture.ts";

export const PCB_CREATE_ID = "c".repeat(16);
export const PCB_CREATE_CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
export const PCB_CREATE_OPERATION = { id: "create-free-pcb", action: "document.pcb.create" };
export function pcbCreateRehash(documents: readonly NativeDocumentSnapshot[], checkpointSha256 = "a".repeat(64)): NativeHistorySnapshot {
  const values = documents.map((document) => ({ ...fixtureRebindDocumentRecordHistory(document, checkpointSha256), semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: values,
    semanticSha256: sha256Json(values.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
export function pcbCreateHistory(created = false, peerClockChanged = false): NativeHistorySnapshot {
  const documents = ["active", "peer", "parent", "page", ...(created ? [PCB_CREATE_ID] : [])].map((uuid) => {
    let docType = "PCB";
    if (uuid === "parent") { docType = "SCH"; } else if (uuid === "page") { docType = "SCH_PAGE"; }
    const time = uuid === PCB_CREATE_ID ? 2 : 1;
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: time, version: String(time), editVersion: "3.2",
      ...(uuid === PCB_CREATE_ID ? {} : { user: { uuid: "original-author" } }) };
    const titles: Record<string, string> = { active: "PCB1", peer: "PCB7", [PCB_CREATE_ID]: "PCB8" };
    const body = { title: titles[uuid] ?? uuid,
      source: "", zIndex: docType === "SCH_PAGE" ? 1 : null, ...(docType === "SCH_PAGE" ? { schematic: "parent" } : { board: "" }),
      ...(docType === "PCB" ? { parent: "" } : {}) };
    return fixtureDocumentRecordHistory({ uuid, docType, metadata, records: [{ id: "META", type: "META", body, ticket: peerClockChanged && uuid === "active" ? 99 : time,
      client: uuid === PCB_CREATE_ID ? "a".repeat(16) : null }], semanticSha256: "" }, "a".repeat(64), undefined, uuid === PCB_CREATE_ID);
  });
  return pcbCreateRehash(documents);
}
export class PcbCreateDomNode {
  public readonly children: PcbCreateDomNode[];
  public readonly attributes: Record<string, string>;
  public readonly tagName: string;
  public constructor(tagName: string, attributes: Record<string, string> = {}, children: PcbCreateDomNode[] = []) { this.tagName = tagName; this.attributes = attributes; this.children = children; }
  public get id(): string { return this.attributes["id"] ?? ""; }
  public get classList(): { contains: (name: string) => boolean } { return { contains: (name): boolean => (this.attributes["class"] ?? "").split(" ").includes(name) }; }
  public getAttribute(name: string): string | null { return this.attributes[name] ?? null; }
  public hasAttribute(name: string): boolean { return Object.hasOwn(this.attributes, name); }
  public contains(node: PcbCreateDomNode): boolean { return this === node || this.children.some((child) => child.contains(node)); }
  private matches(selector: string): boolean {
    if (selector.startsWith("#")) { return this.id === selector.slice(1); }
    if (selector.startsWith(".")) { return this.classList.contains(selector.slice(1)); }
    if (selector === "iframe") { return this.tagName === "IFRAME"; }
    if (selector === "[id^=\"frame_\"]") { return this.id.startsWith("frame_"); }
    if (selector === "iframe[src*=\"entry=\"]") { return this.tagName === "IFRAME" && (this.attributes["src"] ?? "").includes("entry="); }
    if (selector === "[c_doctype]" || selector === "[c_dbid]") { return this.hasAttribute(selector.slice(1, -1)); }
    throw new Error("The test DOM only models the fixed selector inventory.");
  }
  public querySelectorAll(selector: string): PcbCreateDomNode[] {
    const all: PcbCreateDomNode[] = [];
    for (const child of this.children) { if (selector.split(",").some((part) => child.matches(part))) { all.push(child); } all.push(...child.querySelectorAll(selector)); }
    return all;
  }
}
export function pcbCreateDom(fault?: string): PcbCreateDomNode {
  const frame = new PcbCreateDomNode("IFRAME", { id: "frame_active@project", class: "editframe un_ruler", c_dbid: "active@project", c_doctype: "3", src: "editor?entry=pcb", "pcb-canvas": "true" });
  const body = new PcbCreateDomNode("DIV", { uuid: "active@project", class: "tabbar-panel ruler-theme" }, [new PcbCreateDomNode("DIV", { class: "top_tab_tips" }), frame, new PcbCreateDomNode("DIV", { class: "bottom-layer-bar" })]);
  const root = new PcbCreateDomNode("DIV", { id: "tabbar_bodies" }, [...["commandWin", "exitSmartSizeTool", "exitPadShapeTool", "project-blank-page", "assembly-variant-page"].map((id) => new PcbCreateDomNode("DIV", { id })), body]);
  const document = new PcbCreateDomNode("DOCUMENT", {}, [root, new PcbCreateDomNode("DIV", { id: "tab_page1" })]);
  if (fault === "duplicate-root") { document.children.push(new PcbCreateDomNode("DIV", { id: "tabbar_bodies" })); }
  if (fault === "duplicate-body") { root.children.push(body); }
  if (fault === "outside-root") { document.children.push(new PcbCreateDomNode("DIV", { class: "editframe", c_dbid: "page@project" })); }
  if (fault === "anonymous-export") { root.children.push(new PcbCreateDomNode("DIV", {}, [new PcbCreateDomNode("IFRAME", { class: "editframe", id: "frame_export_target" })])); }
  if (fault === "marker-free-export") { body.children.push(new PcbCreateDomNode("DIV", {}, [new PcbCreateDomNode("IFRAME")])); }
  if (fault === "schematic-orphan") { root.children.push(new PcbCreateDomNode("DIV", { uuid: "page@project" }, [new PcbCreateDomNode("DIV", { class: "editframe", c_dbid: "page@project" })])); }
  if (fault === "panel-pool") { root.children.push(new PcbCreateDomNode("DIV", { uuid: "sheet-1", class: "tabbar-panel ruler-theme blankIframeDiv" }, [new PcbCreateDomNode("IFRAME", { id: "frame_sheet-1", class: "editframe", c_dbid: "sheet-1", c_doctype: "26", blankIframe: "panel", src: "editor?entry=panel" })])); }
  if (fault === "static-frame") { const first = root.children[0]; assert.ok(first); first.children.push(new PcbCreateDomNode("IFRAME")); }
  if (fault === "unknown-static") { const first = root.children[0]; assert.ok(first); first.attributes["id"] = "unknown"; }
  if (fault === "missing-canvas") { delete frame.attributes["pcb-canvas"]; }
  if (fault === "from-file") { frame.attributes["fromFile"] = "true"; }
  if (fault === "json-cache") { frame.attributes["jsonCacheReady"] = "true"; }
  if (fault === "wrong-id") { frame.attributes["c_dbid"] = "target@project"; }
  if (fault === "wrong-src") { frame.attributes["src"] = "editor?entry=panel"; }
  return document;
}
