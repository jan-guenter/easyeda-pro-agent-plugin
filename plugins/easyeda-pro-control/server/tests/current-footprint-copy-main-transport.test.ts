import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE, compareOriginalMainTcpRows, parseOriginalMainEndpoint } from "../src/current-footprint-copy-main-transport-contract.ts";
import type { OriginalMainTcpRow } from "../src/current-footprint-copy-main-transport-contract.ts";
import { currentFootprintCopyMainTransportNativeSource } from "../src/current-footprint-copy-main-transport-native.ts";

const endpoint = "Debugger listening on ws://127.0.0.1:12345/01234567-89ab-cdef-0123-456789abcdef";
const expected = { rootPid: 17, helperPid: 18, serverPort: 12_345, clientPort: 23_456 };
const rows: readonly OriginalMainTcpRow[] = [
  { state: 2, localAddress: 0x01_00_00_7F, localPort: 12_345, remoteAddress: 0, remotePort: 0, pid: 17 },
  { state: 5, localAddress: 0x01_00_00_7F, localPort: 12_345, remoteAddress: 0x01_00_00_7F, remotePort: 23_456, pid: 17 },
  { state: 5, localAddress: 0x01_00_00_7F, localPort: 23_456, remoteAddress: 0x01_00_00_7F, remotePort: 12_345, pid: 18 },
];
const changedRow = (row: OriginalMainTcpRow, field: string, value: number): OriginalMainTcpRow => ({ ...row, [field]: value });

void describe("original-main transport comparison contract", () => {
  void it("accepts only the literal stderr endpoint with a finite canonical port", () => {
    assert.deepEqual(parseOriginalMainEndpoint(endpoint), { port: 12_345, token: ["01234567", "89ab", "cdef", "0123", "456789abcdef"].join("-") });
    for (const value of [endpoint.replace(":12345/", ":65536/"), endpoint.replace(":12345/", ":01234/"),
      endpoint.replace("127.0.0.1", "localhost"), endpoint.replace("127.0.0.1", "0.0.0.0"),
      endpoint.replace("ws://", "wss://"), `${endpoint}\n`, `${endpoint}?token=x`, endpoint.replace("abcdef", "ABCDEF"),
      endpoint.slice(22), "x".repeat(PROFILE.endpointLineBytes + 1)]) { assert.throws(() => parseOriginalMainEndpoint(value)); }
  });
  void it("joins the exact listener and reciprocal original-root/helper tuples without claiming authority", () => {
    const comparison = compareOriginalMainTcpRows(rows, expected);
    assert.deepEqual(comparison, { ...expected, listenerRows: 1, serverRows: 1, clientRows: 1, suppliedRowsOnly: true, executionAuthorized: false });
    assert.equal(Object.isFrozen(comparison), true);
    // Microsoft leaves both remote fields undefined for LISTEN rows. They
    // Supply no connection evidence; the ESTABLISHED pair is checked below.
    assert.deepEqual(compareOriginalMainTcpRows(rows.map((row, index) => index === 0 ? changedRow(changedRow(row, "remoteAddress", 42), "remotePort", 9876) : row), expected), comparison);
  });
  void it("refuses missing, duplicated, transplanted and nonreciprocal owner rows", () => {
    for (let index = 0; index < rows.length; index += 1) {
      assert.throws(() => compareOriginalMainTcpRows(rows.filter((_row, i) => i !== index), expected));
      const selected = rows[index]; assert.notEqual(selected, undefined);
      if (selected === undefined) { throw new Error("test-row"); }
      assert.throws(() => compareOriginalMainTcpRows([...rows, selected], expected));
      for (const [field, value] of Object.entries({ pid: 91, localAddress: 0, localPort: 19_876, remoteAddress: 0x01_00_00_7E, remotePort: 19_877 }).filter(([candidate]) => index !== 0 || !candidate.startsWith("remote"))) {
        assert.throws(() => compareOriginalMainTcpRows(rows.map((row, i) => i === index ? changedRow(row, field, value) : row), expected));
      }
    }
  });
  void it("refuses competing connected peers, wildcard listeners and malformed tables", () => {
    const server = rows[1]; if (server === undefined) { throw new Error("test-row"); }
    assert.throws(() => compareOriginalMainTcpRows([...rows, { ...server, remotePort: 34_567 }], expected));
    assert.throws(() => compareOriginalMainTcpRows(rows, { ...expected, helperPid: expected.rootPid }));
    for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY, 65_536, 1.5]) {
      assert.throws(() => compareOriginalMainTcpRows(rows, { ...expected, clientPort: value }));
      assert.throws(() => compareOriginalMainTcpRows(rows.map((row, i) => i === 1 ? changedRow(row, "remotePort", value) : row), expected));
    }
    assert.throws(() => compareOriginalMainTcpRows(Array.from({ length: PROFILE.tcpRows + 1 }, () => server), expected));
  });
  void it("generates an internal native transport with independent bounded cleanup", () => {
    const source = currentFootprintCopyMainTransportNativeSource();
    assert.ok(source.startsWith("internal sealed class EasyedaOriginalMainTransport"));
    assert.ok(source.includes("GetExtendedTcpTable"));
    assert.ok(source.includes("socket.LocalEndPoint"));
    assert.ok(source.includes("socket.RemoteEndPoint"));
    assert.ok(source.includes("TerminateJobObject(job,0x4544414d)"));
    assert.ok(source.includes("Need(ObserveTermination(),\"release-reobserve\")"));
    assert.ok(source.includes("requests++;if(cleanup)cleanupRequests++;else normalRequests++;WriteFrame"));
    assert.ok(!source.includes("Process.GetProcessById"));
    assert.ok(!source.includes("/json/list"));
    assert.ok(!source.includes("Runtime.evaluate"));
  });
});
