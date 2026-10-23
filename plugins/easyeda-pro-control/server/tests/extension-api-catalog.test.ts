import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import { extensionApiCatalogQuerySchema, queryExtensionApiCatalog } from "../src/extension-api-catalog.ts";
import { extensionApiSnapshots } from "../src/extension-api-catalog-data.ts";
import { inventoryApiDeclarations } from "../src/extension-api-declarations.ts";

void test("official and reviewed declarations remain distinct, offline and non-executable", () => {
  const reviewed = queryExtensionApiCatalog({ namespace: "sys_WebSocket", detail: true });
  const latest = queryExtensionApiCatalog({ reference: "official-latest", namespace: "sys_WebSocket", detail: true });
  assert.equal(reviewed.offline, true);
  assert.equal(reviewed.invocationEnabled, false);
  assert.deepEqual(reviewed.provenance, { reference: "reviewed-installed", version: "0.2.53.aee2f57a", applicationVersion: "3.2.149.88089769",
    sourceUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.html", sourceSha256: "32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1",
    license: "Installed declaration metadata; signatures only, no implementation", sourceBytes: 678_232, retrievedAt: "2026-10-10" });
  assert.notDeepEqual(reviewed.provenance, latest.provenance);
  const entries = reviewed.entries;
  assert.equal(entries.length, 3);
  assert.equal(entries.find((entry) => entry.path === "eda.sys_WebSocket.register")?.signature,
    "register(id: string, serviceUri: string, receiveMessageCallFn?: (event: MessageEvent<any>) => void | Promise<void>, connectedCallFn?: () => void | Promise<void>, protocols?: string | Array<string>): void;");
  for (const entry of entries) {
    assert.equal(entry.executable, false);
    assert.equal(entry.runtimeAvailability, "not-probed");
    assert.equal(entry.validation, "declaration-only");
    assert.equal(entry.inputSchema, null);
  }
});

void test("installed 209 discovery preserves both historical snapshots and records its exact independent declaration", () => {
  assert.equal(extensionApiSnapshots.length, 3);
  const preserved = new Map([
    ["reviewed-installed", "1f6d1ab997e3f8c73272f3561d7ac2f7721c2fa28d6647fbdce49291901acf60"],
    ["official-latest", "4af9c242ee42a3ab7573b9d50ce3858ebf8ac4cadd269de45183e3df1e93ecc2"],
  ]);
  for (const [reference, hash] of preserved) {
    const snapshot = extensionApiSnapshots.find((entry) => entry.reference === reference); assert.ok(snapshot);
    assert.equal(createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"), hash);
  }
  const current = queryExtensionApiCatalog({ reference: "installed-209", namespace: "dmt_SourceProject", detail: true });
  assert.deepEqual(current.provenance, { reference: "installed-209", version: "0.3.59.1ca9efb5", applicationVersion: "3.2.209.8a704eab",
    sourceUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.html", sourceSha256: "0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72",
    sourceBytes: 1_814_791, retrievedAt: "2026-10-23", license: "Installed declaration metadata; signatures only, no implementation" });
  assert.deepEqual(current.totals, { namespaces: 113, methods: 844, types: 436 });
  assert.equal(current.invocationEnabled, false); assert.equal(current.offline, true);
  assert.equal(current.entries.length, 3);
  for (const entry of current.entries) {
    assert.equal(entry.executable, false); assert.equal(entry.runtimeAvailability, "not-probed");
    assert.equal(entry.validation, "declaration-only"); assert.equal(entry.inputSchema, null);
  }
  assert.throws(() => queryExtensionApiCatalog({ namespace: "dmt_SourceProject" }), /absent/u);
  assert.equal(queryExtensionApiCatalog().provenance.reference, "reviewed-installed");
});

void test("catalog rejects coercion, caller code, prototype fields and unbounded selectors", () => {
  for (const input of [null, "script", { limit: 101 }, { limit: "25" }, { offset: -1 }, { offset: 10_001 }, { search: "" },
    { search: "x".repeat(101) }, { namespace: "pcb_PrimitivePad.constructor" }, { reference: "runtime" }, { code: "call()" },
    JSON.parse('{"__proto__":{"polluted":true}}') as unknown]) {
    assert.equal(extensionApiCatalogQuerySchema.safeParse(input).success, false);
    assert.throws(() => queryExtensionApiCatalog(input));
  }
  assert.throws(() => queryExtensionApiCatalog({ namespace: "pcb_Missing" }), /absent/u);
  assert.throws(() => queryExtensionApiCatalog({ kind: "types", namespace: "sys_WebSocket" }), /do not accept/u);
});

void test("literal search and pagination are deterministic and do not expose mutable inventory objects", () => {
  const all = queryExtensionApiCatalog({ namespace: "pcb_PrimitivePad", limit: 100, detail: true });
  const first = queryExtensionApiCatalog({ namespace: "pcb_PrimitivePad", limit: 2, detail: true });
  const second = queryExtensionApiCatalog({ namespace: "pcb_PrimitivePad", offset: 2, limit: 100, detail: true });
  assert.deepEqual([...first.entries, ...second.entries], all.entries);
  assert.equal(first.page.nextOffset, 2);
  assert.equal(second.page.nextOffset, null);
  assert.deepEqual(queryExtensionApiCatalog({ search: "[.*]+" }).entries, []);
  const entries = first.entries;
  const entry = entries[0];
  assert.ok(entry);
  assert.ok(entry.stabilityTags);
  entry.signature = "changed";
  entry.stabilityTags.push("changed");
  assert.notDeepEqual(queryExtensionApiCatalog({ namespace: "pcb_PrimitivePad", limit: 2, detail: true }).entries, entries);
});

void test("all mounted API namespaces and signatures are bounded and each page advances", () => {
  for (const snapshot of extensionApiSnapshots) {
    const counts = { "reviewed-installed": { namespaces: 93, methods: 749 }, "official-latest": { namespaces: 99, methods: 806 }, "installed-209": { namespaces: 113, methods: 844 } }[snapshot.reference];
    assert.equal(snapshot.namespaces.length, counts.namespaces);
    assert.equal(snapshot.namespaces.reduce((sum, entry) => sum + entry.methods.length, 0), counts.methods);
    const retainedSignatures = snapshot.namespaces.flatMap((entry) => entry.methods.map((method) => method.signature));
    const roundTrip = inventoryApiDeclarations(`declare class SYS_Probe {\n${retainedSignatures.map((signature) => `    ${signature}`).join("\n")}\n}\ndeclare class EDA {\n    sys_Probe: SYS_Probe;\n}\n`);
    assert.deepEqual(roundTrip.namespaces.flatMap((entry) => entry.methods.map((method) => method.signature)).toSorted(), retainedSignatures.toSorted());
    for (const namespace of snapshot.namespaces) {
      assert.ok(namespace.methods.length > 0);
      for (const method of namespace.methods) {
        assert.ok(method.signature.endsWith(";"));
        assert.ok(method.sourceLine > 0);
        assert.ok(method.signature.length < 32_768);
      }
    }
    let offset = 0;
    let returned = 0;
    do {
      const page = queryExtensionApiCatalog({ reference: snapshot.reference, offset, limit: 100, detail: true });
      const entries = page.entries;
      assert.ok(entries.length > 0);
      assert.ok(Buffer.byteLength(JSON.stringify(entries), "utf8") <= page.page.maxEntryBytes);
      assert.ok(Buffer.byteLength(JSON.stringify(page), "utf8") <= page.page.maxResponseBytes);
      returned += entries.length;
      const next = page.page.nextOffset;
      if (next === null) { break; }
      assert.equal(typeof next, "number");
      assert.ok(next > offset);
      offset = next;
    } while (offset < 10_000);
    assert.equal(returned, snapshot.namespaces.reduce((sum, entry) => sum + entry.methods.length, 0));
  }
});

void test("type search excludes unrelated bundled UI declarations", () => {
  const types = queryExtensionApiCatalog({ kind: "types", search: "IPCB_PrimitivePad" });
  assert.ok(types.entries.length > 0);
  assert.deepEqual(queryExtensionApiCatalog({ kind: "types", search: "RadioGroupProps" }).entries, []);
  assert.deepEqual(types.namespaces, []);
});

void test("declaration parser retains unions, multiline signatures and tags without accepting broken snapshots", () => {
  const source = "declare class PCB_Pad {\n    /** @beta */\n    get(primitiveId: string): Promise<{\n        x: number;\n    } | undefined>;\n}\ndeclare class PCB_NewPad {\n    create(x: number): void;\n}\ndeclare class EDA {\n    pcb_Pad: PCB_Pad | PCB_NewPad;\n}\n";
  const inventory = inventoryApiDeclarations(source);
  assert.deepEqual(inventory.namespaces[0]?.classNames, ["PCB_Pad", "PCB_NewPad"]);
  assert.equal(inventory.namespaces[0]?.methods[1]?.signature, "get(primitiveId: string): Promise<{ x: number; } | undefined>;");
  assert.deepEqual(inventory.namespaces[0]?.methods[1]?.tags, ["beta"]);
  for (const invalid of ["declare class EDA {\n", source.replace("PCB_Pad | PCB_NewPad", "PCB_Missing"),
    source.replace("    } | undefined>;", ""), source.replace("declare class EDA", "declare class PCB_Pad"),
    source.replace("pcb_Pad: PCB_Pad | PCB_NewPad;", "pcb_Pad: PCB_Pad | PCB_NewPad;\n    pcb_Pad: PCB_Pad;"),
    source.replace("pcb_Pad: PCB_Pad | PCB_NewPad;", "pcb_Pad: unknown;"),
    source.replace("pcb_Pad: PCB_Pad | PCB_NewPad;", "readonly pcb_Pad: PCB_Pad;")]) {
    assert.throws(() => inventoryApiDeclarations(invalid));
  }
});

void test("declaration parser retains same-indent object fields and delimiter-bearing comments or strings", () => {
  const method = [
    "  public open(props?: { /** field ; ) } */",
    "  title: string;",
    String.raw`  callback?: (value: { kind: '};)'; escaped: '\'('; }) => Promise<void>;`,
    "  /* A multiline comment with a fake method and terminator",
    "  ignored(): void; } */",
    '  mode?: "[;]"; commentStart?: "/**"; commentEnd?: "*/";',
    "  }): Promise<{ ok: boolean; items: Array<[number, number]> }> ;",
  ];
  const source = `declare class SYS_Frame {\n${method.join("\n")}\n  /*\n  ignored(): void;\n  */\n  start(value: "/**"): void;\n  end(value: "*/"): void;\n}\ndeclare class EDA {\n  sys_Frame: SYS_Frame;\n}\n/*\ndeclare class SYS_Commented {\n}\ninterface ISYS_Commented {}\n*/\n`;
  const inventory = inventoryApiDeclarations(source);
  const methods = inventory.namespaces[0]?.methods;
  assert.deepEqual(methods?.map((entry) => entry.name), ["end", "open", "start"]);
  assert.equal(methods?.[1]?.signature, method.map((line) => line.trim().replace(/^public /u, "")).join(" "));
  assert.equal(methods?.[1]?.sourceLine, 2);
  assert.deepEqual(inventory.types, [{ name: "EDA", kind: "class", sourceLine: 15 }, { name: "SYS_Frame", kind: "class", sourceLine: 1 }]);
});

const singleMethodSource = (method: string): string => `declare class SYS_Frame {\n  ${method}\n}\ndeclare class EDA {\n  sys_Frame: SYS_Frame;\n}\n`;

void test("declaration parser refuses incomplete, mismatched or unsupported method syntax instead of publishing prefixes", () => {
  for (const method of [
    "open(props: { title: string;",
    "open(props: [string}): void;",
    "open(value: 'unclosed): void;",
    // oxlint-disable-next-line eslint/no-template-curly-in-string -- Literal unsupported TypeScript template syntax must reach the declaration parser unchanged.
    "open(value: `prefix${string}`): void;",
    "open(): void; hidden(): void;",
    "open(props: { // unsupported line comment\n title: string; }): void;",
    "open(props: { /* unfinished comment title: string; }): void;",
    "/** same-line declaration is unsupported */ open(): void;",
    `open(value: '${"x".repeat(32_768)}'): void;`,
  ]) { assert.throws(() => inventoryApiDeclarations(singleMethodSource(method))); }
});
