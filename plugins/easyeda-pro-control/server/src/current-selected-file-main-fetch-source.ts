/** Original Electron209 builtin source, extracted without executing the PE.
 * A source token proves bytes only; actual receiver/scope joins stay mandatory. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { captureManagedFixtureDispatchReply } from "./managed-fixture-dispatch-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE = freezeDeep({
  executable: { bytes: 222_989_936, sha256: "8770f2cea950d9483f230f961b486e5ceaeffd619e2c2816957cb6ff3fd0bb38" },
  embedded: { offset: 190_129_216, bytes: 745_782, encoding: "latin1" },
  url: "node:internal/deps/undici/undici", bytes: 745_783, sha256: "23b61b0a87994a38cc6ad6a6fa5fbf140c60b8496e170b7983a839e57f72ae59",
  method: { start: 555_057, end: 555_157, bytes: 100, sha256: "180a606211cf017cf590b192a8af6c2259df5ceda704534e3afbb99dd43b3d2b", name: "get method", arity: 0, lineNumber: 12_083, columnNumber: 16 },
  Request: { start: 543_609, end: 562_568, bytes: 18_959, sha256: "78e62193925f26abddef68c7f47df411986c91a57c0c6aa9a2fb57956d2144f0", name: "Request", arity: 1, lineNumber: 11_814, columnNumber: 17 },
  brand: { start: 295_370, end: 295_570, bytes: 200, sha256: "cb99a587a12561c42ba9b79c64c201ab460c6a9b75ff510c7b8bfb388ac4c1a9", name: "", arity: 2, lineNumber: 4799, columnNumber: 32 },
  wrappers: { fetch: { name: "BL", arity: 2, lineNumber: 1164, columnNumber: 51_519 }, legacy: { name: "zL", arity: 3, lineNumber: 1164, columnNumber: 53_700 } },
} as const);
export const CURRENT_SELECTED_FILE_MAIN_FETCH_METHOD_SOURCE = 'get method() {\n        webidl.brandCheck(this, _Request);\n        return this.#state.method;\n      }';
export const CURRENT_SELECTED_FILE_MAIN_FETCH_BRAND_SOURCE = 'function(V, I) {\n      if (!FunctionPrototypeSymbolHasInstance(I, V)) {\n        const err = new TypeError("Illegal invocation");\n        err.code = "ERR_INVALID_THIS";\n        throw err;\n      }\n    }';
export interface CurrentSelectedFileMainFetchSource { readonly profile: "private.selected-file-main-fetch-source.v1"; readonly receiverVerified: false }
const issued = new WeakSet<CurrentSelectedFileMainFetchSource>();
const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_MAIN_FETCH_SOURCE"); } }
export function qualifyCurrentSelectedFileMainFetchSource(input: unknown): CurrentSelectedFileMainFetchSource {
  const profile = CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE;
  need(typeof input === "string" && input.isWellFormed() && Buffer.byteLength(input) === profile.bytes && hash(input) === profile.sha256);
  for (const row of [profile.method, profile.Request, profile.brand]) { const text = input.slice(row.start, row.end); need(Buffer.byteLength(text) === row.bytes && hash(text) === row.sha256); }
  need(input.slice(profile.method.start, profile.method.end) === CURRENT_SELECTED_FILE_MAIN_FETCH_METHOD_SOURCE && input.slice(profile.brand.start, profile.brand.end) === CURRENT_SELECTED_FILE_MAIN_FETCH_BRAND_SOURCE);
  const token = Object.freeze({ profile: "private.selected-file-main-fetch-source.v1", receiverVerified: false } as const); issued.add(token); return token;
}
export function requireOriginalCurrentSelectedFileMainFetchSource(token: CurrentSelectedFileMainFetchSource): void { need(issued.has(token)); }
/** Full source reply is captured before any owner await; getters/proxies refuse. */
export function captureCurrentSelectedFileMainFetchScriptReply(input: unknown): Readonly<{ scriptSource: string }> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input));
  const proto: unknown = Object.getPrototypeOf(input); need((proto === null || proto === Object.prototype) && Reflect.ownKeys(input).length === 1);
  const descriptor = Object.getOwnPropertyDescriptor(input, "scriptSource"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value"));
  const source: unknown = descriptor.value; need(typeof source === "string" && source.isWellFormed() && Buffer.byteLength(source) === CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE.bytes);
  return Object.freeze({ scriptSource: source });
}
/** Exact actual function metadata, including its original scope list. Handles
 * are descriptive until the same source and live scope joins complete. */
export function decodeCurrentSelectedFileMainRequestFunction(input: unknown, role: "method" | "Request" | "brand" | "fetch" | "legacy", expectedScriptId?: string): Readonly<{ scriptId: string; scopes: string }> {
  const value = captureManagedFixtureDispatchReply(input).value; need(value !== null && typeof value === "object" && !Array.isArray(value));
  const internal: unknown = Reflect.get(value, "internalProperties"), result: unknown = Reflect.get(value, "result"); need(Array.isArray(result) && Array.isArray(internal));
  const profile = CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE; const expected = role === "fetch" || role === "legacy" ? profile.wrappers[role] : profile[role];
  const own = (rows: unknown[], key: string): Record<string, unknown> => { const found = rows.filter(row => row !== null && typeof row === "object" && Reflect.get(row, "name") === key); need(found.length === 1); const row: unknown = found[0]; need(row !== null && typeof row === "object" && !Array.isArray(row)); return Object.fromEntries(Object.entries(row)); };
  for (const [key, wanted] of [["name", expected.name], ["length", expected.arity]] as const) { const row = own(result, key); const data: unknown = row["value"]; need(row["isOwn"] === true && row["writable"] === false && row["enumerable"] === false && row["configurable"] === true && data !== null && typeof data === "object" && Reflect.get(data, "value") === wanted); }
  const location: unknown = own(internal, "[[FunctionLocation]]")["value"]; const scopes: unknown = own(internal, "[[Scopes]]")["value"];
  need(location !== null && typeof location === "object" && scopes !== null && typeof scopes === "object"); const at: unknown = Reflect.get(location, "value"); const id: unknown = Reflect.get(scopes, "objectId");
  need(at !== null && typeof at === "object" && typeof id === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(id)); const scriptId: unknown = Reflect.get(at, "scriptId");
  need(typeof scriptId === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(scriptId) && (expectedScriptId === undefined || scriptId === expectedScriptId) && Reflect.get(at, "lineNumber") === expected.lineNumber && Reflect.get(at, "columnNumber") === expected.columnNumber);
  return Object.freeze({ scriptId, scopes: id });
}
