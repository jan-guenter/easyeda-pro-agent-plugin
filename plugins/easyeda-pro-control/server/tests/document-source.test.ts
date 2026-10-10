import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareDocumentSources, parseDocumentSource } from "../src/document-source.ts";

function source(options: { time?: number; client?: string; x?: number; ticket?: number; net?: string } = {}): string {
  const time = options.time ?? 123;
  return `{"type":"DOCHEAD"}||${JSON.stringify({ docType: "PCB", uuid: "fixture", client: options.client ?? "1234567890abcdef", updateTime: time, version: String(time), editVersion: "3.2.149.88089769" })}|\n` +
    `{"type":"COMPONENT","id":"c1","ticket":${options.ticket ?? 1}}||${JSON.stringify({ x: options.x ?? 1, y: 2, net: options.net ?? "GND", attrs: { value: "text || separator" } })}`;
}

void describe("native exported document source", () => {
  void it("excludes only export metadata and tickets from semantic comparison", () => {
    const before = parseDocumentSource(source());
    const after = parseDocumentSource(source({ time: 234, client: "234567890abcdef1", ticket: 9 }));
    assert.deepEqual(before, after);
    assert.notEqual(before.sha256, parseDocumentSource(source({ x: 2 })).sha256);
    assert.notEqual(before.sha256, parseDocumentSource(source({ net: "OTHER" })).sha256);
  });
  void it("reports exact changed fields and rejects lossy/ambiguous records", () => {
    const before = parseDocumentSource(source());
    const after = parseDocumentSource(source({ x: 2 }));
    assert.deepEqual(compareDocumentSources(before, after).changed[0]?.fields, ["x"]);
    assert.throws(() => parseDocumentSource(`${source()  }|\n{"type":"LINE","id":"c1","ticket":2}||{}`), /duplicate/u);
    assert.throws(() => parseDocumentSource(source().replace('"x":1', '"x":1,"x":2')));
    assert.throws(() => parseDocumentSource(source().replace('"type":"COMPONENT"', '"type":"DELETE_DOC"')));
  });
});
