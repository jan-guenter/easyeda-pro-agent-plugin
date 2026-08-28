import dns from "node:dns";
import dgram from "node:dgram";
import http from "node:http";
import http2 from "node:http2";
import https from "node:https";
import net from "node:net";
import { syncBuiltinESMExports } from "node:module";
import process from "node:process";
import tls from "node:tls";

const LOOPBACK_HOST = "127.0.0.1";

function deniedNetworkAuthority(name: string): never {
  throw new Error(`The private upstream sandbox prohibits ${name}.`);
}

function replaceCallable(
  target: object,
  property: string,
  replacement: (...arguments_: unknown[]) => unknown,
): void {
  if (
    typeof Reflect.get(target, property) !== "function" ||
    !Reflect.set(target, property, replacement)
  ) {
    throw new Error(`Could not restrict runtime authority ${property}.`);
  }
}

function blockCallableIfPresent(target: object, property: string): void {
  if (typeof Reflect.get(target, property) === "function") {
    replaceCallable(target, property, () =>
      deniedNetworkAuthority(`network authority ${property}`),
    );
  }
}

function validListenArguments(
  arguments_: readonly unknown[],
  expectedPort: number,
): boolean {
  const backlog = arguments_[2];
  const callback = arguments_[3];
  return (
    arguments_.length >= 2 &&
    arguments_.length <= 4 &&
    arguments_[0] === expectedPort &&
    arguments_[1] === LOOPBACK_HOST &&
    (backlog === undefined ||
      typeof backlog === "function" ||
      (typeof backlog === "number" && Number.isSafeInteger(backlog) && backlog > 0)) &&
    (callback === undefined || typeof callback === "function") &&
    !(typeof backlog === "function" && callback !== undefined)
  );
}

function restrictServerListen(expectedPort: number): void {
  const serverPrototype = net.Server.prototype;
  const originalListen: unknown = Reflect.get(serverPrototype, "listen");
  const originalListen2: unknown = Reflect.get(serverPrototype, "_listen2");
  if (typeof originalListen !== "function") {
    throw new TypeError("The Node TCP server listen primitive is unavailable.");
  }
  if (typeof originalListen2 !== "function") {
    throw new TypeError("The Node TCP server low-level listen primitive is unavailable.");
  }
  const restrictedServerListen = function restrictedServerListen(
    this: unknown,
    ...arguments_: unknown[]
  ): unknown {
    if (!validListenArguments(arguments_, expectedPort)) {
      throw new Error(
        `The upstream sandbox may listen only on ${LOOPBACK_HOST}:${String(expectedPort)}.`,
      );
    }
    return Reflect.apply(originalListen, this, arguments_);
  };
  if (!Reflect.set(serverPrototype, "listen", restrictedServerListen)) {
    throw new Error("Could not restrict the Node TCP server listen primitive.");
  }
  const restrictedServerListen2 = function restrictedServerListen2(
    this: unknown,
    ...arguments_: unknown[]
  ): unknown {
    const backlog = arguments_[3];
    if (
      arguments_.length !== 6 ||
      arguments_[0] !== LOOPBACK_HOST ||
      arguments_[1] !== expectedPort ||
      arguments_[2] !== 4 ||
      (backlog !== undefined &&
        backlog !== false &&
        (typeof backlog !== "number" ||
          !Number.isSafeInteger(backlog) ||
          backlog <= 0)) ||
      arguments_[4] !== undefined ||
      (arguments_[5] !== 0 && arguments_[5] !== false)
    ) {
      throw new Error(
        `The upstream sandbox low-level listener is restricted to ${LOOPBACK_HOST}:${String(expectedPort)} without an inherited descriptor.`,
      );
    }
    return Reflect.apply(originalListen2, this, arguments_);
  };
  if (!Reflect.set(serverPrototype, "_listen2", restrictedServerListen2)) {
    throw new Error("Could not restrict the Node TCP low-level listen primitive.");
  }
  blockCallableIfPresent(net, "_createServerHandle");
}

function restrictDatagramAuthority(): void {
  const socketConstructor: unknown = Reflect.get(dgram, "Socket");
  if (typeof socketConstructor !== "function") {
    throw new TypeError("The Node datagram socket constructor is unavailable.");
  }
  const socketPrototype: unknown = Reflect.get(socketConstructor, "prototype");
  if (typeof socketPrototype !== "object" || socketPrototype === null) {
    throw new TypeError("The Node datagram socket prototype is unavailable.");
  }
  for (const property of [
    "addMembership",
    "addSourceSpecificMembership",
    "bind",
    "connect",
    "send",
    "sendto",
    "setBroadcast",
    "setMulticastInterface",
    "setMulticastLoopback",
    "setMulticastTTL",
  ]) {
    blockCallableIfPresent(socketPrototype, property);
  }
  blockCallableIfPresent(dgram, "_createSocketHandle");
  replaceCallable(dgram, "Socket", () =>
    deniedNetworkAuthority("datagram socket construction"),
  );
}

function restrictProcessEscapeHatches(): void {
  const originalBinding: unknown = Reflect.get(process, "binding");
  if (typeof originalBinding !== "function") {
    throw new TypeError("The reviewed Node process binding primitive is unavailable.");
  }
  const restrictedBinding = (name: unknown, ...rest: unknown[]): unknown => {
    if (name !== "buffer" || rest.length > 0) {
      throw new Error("The upstream sandbox prohibits private Node bindings.");
    }
    return Reflect.apply(originalBinding, process, [name]);
  };
  if (!Reflect.set(process, "binding", restrictedBinding)) {
    throw new Error("Could not restrict the Node process binding primitive.");
  }
  for (const property of ["_linkedBinding", "dlopen", "getBuiltinModule"]) {
    blockCallableIfPresent(process, property);
  }
}

function restrictDnsLookup(): void {
  const originalLookup: unknown = Reflect.get(dns, "lookup");
  if (typeof originalLookup !== "function") {
    throw new TypeError("The Node DNS lookup primitive is unavailable.");
  }
  const restrictedLookup = (...arguments_: unknown[]): unknown => {
    const options = arguments_[1];
    const callback = arguments_[2];
    if (
      arguments_.length !== 3 ||
      arguments_[0] !== LOOPBACK_HOST ||
      typeof options !== "object" ||
      options === null ||
      Array.isArray(options) ||
      Object.keys(options).length !== 1 ||
      Reflect.get(options, "all") !== true ||
      typeof callback !== "function"
    ) {
      return deniedNetworkAuthority("DNS lookup outside exact IPv4 loopback");
    }
    return Reflect.apply(originalLookup, dns, arguments_);
  };
  if (!Reflect.set(dns, "lookup", restrictedLookup)) {
    throw new Error("Could not restrict the Node DNS lookup primitive.");
  }
}

function errorCode(value: unknown): string | undefined {
  return value !== null &&
    typeof value === "object" &&
    "code" in value &&
    typeof value.code === "string"
    ? value.code
    : undefined;
}

export async function assertOutboundConnectDeniedByKernel(): Promise<void> {
  const socket = net.createConnection({
    host: LOOPBACK_HOST,
    port: 1,
    signal: AbortSignal.timeout(1000),
  });
  const closed = Promise.withResolvers<true>();
  socket.once("close", () => {
    closed.resolve(true);
  });
  try {
    // oxlint-disable-next-line promise/avoid-new -- EventEmitter's error event must settle as data; events.once(connect) rejects first on that same error.
    const outcome = await new Promise<
      | { readonly connected: true }
      | { readonly connected: false; readonly error: unknown }
    >((resolve) => {
      socket.once("connect", () => {
        resolve({ connected: true });
      });
      socket.once("error", (error: unknown) => {
        resolve({ connected: false, error });
      });
    });
    if (outcome.connected || errorCode(outcome.error) !== "EPERM") {
      throw new Error(
        "The upstream seccomp boundary did not deny a decoy connect syscall with EPERM.",
        { cause: outcome.connected ? undefined : outcome.error },
      );
    }
  } finally {
    socket.destroy();
    await closed.promise;
  }
}

export function installUpstreamNetworkPolicy(expectedPort: number): void {
  if (
    !Number.isSafeInteger(expectedPort) ||
    expectedPort < 1 ||
    expectedPort > 65_535
  ) {
    throw new Error("The upstream network policy requires an exact TCP port.");
  }
  restrictServerListen(expectedPort);
  restrictDatagramAuthority();
  restrictDnsLookup();
  for (const [target, properties] of [
    [net, ["connect", "createConnection"]],
    [net.Socket.prototype, ["connect"]],
    [tls, ["connect"]],
    [http, ["get", "request"]],
    [https, ["get", "request"]],
    [http2, ["connect"]],
    [dgram, ["createSocket"]],
    [dns, ["lookupService", "resolve", "resolve4", "resolve6", "resolveAny", "resolveCaa", "resolveCname", "resolveMx", "resolveNaptr", "resolveNs", "resolvePtr", "resolveSoa", "resolveSrv", "resolveTxt", "reverse"]],
    [dns.promises, ["lookup", "lookupService", "resolve", "resolve4", "resolve6", "resolveAny", "resolveCaa", "resolveCname", "resolveMx", "resolveNaptr", "resolveNs", "resolvePtr", "resolveSoa", "resolveSrv", "resolveTxt", "reverse"]],
  ] as const) {
    for (const property of properties) {
      blockCallableIfPresent(target, property);
    }
  }
  for (const property of ["EventSource", "WebSocket", "fetch"]) {
    blockCallableIfPresent(globalThis, property);
  }
  restrictProcessEscapeHatches();
  syncBuiltinESMExports();
}
