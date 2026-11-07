/** Synthetic peer values for the real Via cursor and actor observer. These
 * values issue no native owner or original persistence grant. */
import { mainRequestFragments as fragments } from "./footprint-main-request-fragments.ts";
import { syntheticRequestMetadata } from "./footprint-main-request-collector-fixture.ts";

type Data = Record<string, unknown>;
function property(name: string, value: Data, writable = true, enumerable = true, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
export function viaMainActorProperties(kind: "controller" | "actor" | "sql" | "PB" | "queryOne" | "promise", pending = false): Data {
  if (kind === "PB" || kind === "queryOne") { return syntheticRequestMetadata(kind === "PB"); }
  if (kind === "promise") { return { result: [], internalProperties: [
    { name: "[[Prototype]]", value: { type: "object", className: "Promise", objectId: "native-promise-prototype" } },
    { name: "[[PromiseState]]", value: { type: "string", value: pending ? "pending" : "fulfilled" } },
    { name: "[[PromiseResult]]", value: { type: "object", className: "yo", objectId: "native-yo" } },
  ] }; }
  const length = { controller: 12, actor: 10, sql: 7 }[kind], selected = kind === "controller" ? 8 : 6;
  const value = kind === "actor" ? { type: "object", subtype: "promise", className: "Promise", objectId: "native-dbPromise" } : {
    type: "function", className: kind === "controller" ? "AsyncFunction" : "Function", description: kind === "controller" ? fragments.editHead : fragments.sqlQueryOne,
    objectId: kind === "controller" ? "native-PB" : "native-queryOne",
  };
  return { result: [...Array.from({ length }, (_, index) => property(String(index), index === selected ? value : { type: "object", objectId: `member-${String(index)}` })),
    property("length", { type: "number", value: length }, true, false, false)],
  internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
export const viaMainActorValue = Object.freeze({ uuid: "c".repeat(32), username: "synthetic-user", nickname: "synthetic-name", updateTime: 1_700_000_000_123 });
