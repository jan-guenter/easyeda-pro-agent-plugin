/** Data validation for the original-main inspector. Supplied rows and endpoint
 * text are comparison inputs, never process or connection authority. */
export const CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT = Object.freeze({
  schema: "easyeda-pro-control.original-main-transport.v1",
  launchArguments: Object.freeze(["--inspect-brk=127.0.0.1:0", "--inspect-publish-uid=stderr"]),
  endpointLineBytes: 2048, stderrBytes: 65_536, stdoutBytes: 1_048_576,
  tcpRows: 65_536, handshakeBytes: 8192, messageBytes: 4_194_304,
  totalReceivedBytes: 33_554_432, frames: 4096, normalRequests: 64,
  cleanupRequests: 8, normalMilliseconds: 3_600_000, totalMilliseconds: 3_660_000,
  handshakeMilliseconds: 10_000, normalPolls: 21_000, totalPolls: 24_000,
});

export interface OriginalMainEndpoint { readonly port: number; readonly token: string; }
const fail = (): never => { throw new Error("ORIGINAL_MAIN_TRANSPORT_CONTRACT"); };
export function parseOriginalMainEndpoint(line: string): OriginalMainEndpoint {
  if (typeof line !== "string" || line.length > CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.endpointLineBytes) { fail(); }
  const match = /^Debugger listening on ws:\/\/127\.0\.0\.1:([1-9]\d{0,4})\/([a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})$/u.exec(line);
  if (match === null) { return fail(); }
  const port = Number(match[1]), token = match[2];
  if (!Number.isInteger(port) || port > 65_535 || token === undefined) { return fail(); }
  return Object.freeze({ port, token });
}

export interface OriginalMainTcpRow {
  readonly state: number; readonly localAddress: number; readonly localPort: number;
  readonly remoteAddress: number; readonly remotePort: number; readonly pid: number;
}
export interface OriginalMainTcpComparison {
  readonly rootPid: number; readonly helperPid: number; readonly serverPort: number; readonly clientPort: number;
  readonly listenerRows: 1; readonly serverRows: 1; readonly clientRows: 1;
  readonly suppliedRowsOnly: true; readonly executionAuthorized: false;
}
const integer = (value: number, max: number): boolean => Number.isSafeInteger(value) && value >= 0 && value <= max;
const loopback = 0x01_00_00_7F;
/** The native transport independently queries these rows while retaining the
 * actual socket and kernel handles. This pure comparison cannot recreate them. */
export function compareOriginalMainTcpRows(rows: readonly OriginalMainTcpRow[], expected: Readonly<{
  rootPid: number; helperPid: number; serverPort: number; clientPort: number;
}>): OriginalMainTcpComparison {
  if (!Array.isArray(rows) || rows.length < 3 || rows.length > CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.tcpRows ||
    !integer(expected.rootPid, 0xFF_FF_FF_FF) || expected.rootPid === 0 || !integer(expected.helperPid, 0xFF_FF_FF_FF) ||
    expected.helperPid === 0 || expected.helperPid === expected.rootPid || !integer(expected.serverPort, 65_535) ||
    expected.serverPort === 0 || !integer(expected.clientPort, 65_535) || expected.clientPort === 0 || expected.clientPort === expected.serverPort) { fail(); }
  for (const row of rows) {
    if (!integer(row.state, 12) || row.state < 1 || !integer(row.localAddress, 0xFF_FF_FF_FF) || !integer(row.remoteAddress, 0xFF_FF_FF_FF) ||
      !integer(row.localPort, 65_535) || !integer(row.remotePort, 65_535) || !integer(row.pid, 0xFF_FF_FF_FF)) { fail(); }
  }
  const listener = rows.filter(row => row.state === 2 && row.localPort === expected.serverPort);
  const server = rows.filter(row => row.state === 5 && row.localAddress === loopback && row.localPort === expected.serverPort);
  const client = rows.filter(row => row.state === 5 && row.pid === expected.helperPid && row.localPort === expected.clientPort);
  const a = listener[0], b = server[0], c = client[0];
  if (listener.length !== 1 || server.length !== 1 || client.length !== 1 || a === undefined || b === undefined || c === undefined ||
    a.pid !== expected.rootPid || a.localAddress !== loopback ||
    b.pid !== expected.rootPid || b.remoteAddress !== loopback || b.remotePort !== expected.clientPort ||
    c.localAddress !== loopback || c.remoteAddress !== loopback || c.remotePort !== expected.serverPort) { fail(); }
  return Object.freeze({ ...expected, listenerRows: 1, serverRows: 1, clientRows: 1, suppliedRowsOnly: true, executionAuthorized: false });
}
