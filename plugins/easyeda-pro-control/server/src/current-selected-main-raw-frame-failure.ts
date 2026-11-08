/** Fixed labels for a refused Inspector frame reply. No exception text,
 * source, path, runtime handle or caller-selected label leaves this module. */
import { types } from "node:util";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as EXPRESSIONS } from "./current-selected-file-main-sql-fence-programs.ts";

/** Read only own inert JSON data after rejecting Proxy and exotic containers. */
function own(input: unknown, key: string): unknown {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return undefined; }
  const prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== null && prototype !== Object.prototype) { return undefined; }
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && Object.hasOwn(descriptor, "value") ? descriptor.value as unknown : undefined;
}

/** Categorize only this fixed site's already received, refused reply. A
 * missing binding can be named only if it occurs in that site's literal
 * expression. The caller still throws its original schema error and keeps
 * the original pause stopped; this function issues no request or approval. */
export function currentSelectedMainRawFrameFailure(site: keyof typeof EXPRESSIONS, input: unknown): string {
  if (typeof site !== "string" || !Object.hasOwn(EXPRESSIONS, site)) { return "SELECTED_SQL_RAW_FRAME_UNKNOWN_SITE_SCHEMA"; }
  const prefix = `SELECTED_SQL_RAW_FRAME_${site.toUpperCase()}`;
  const result = own(input, "result");
  if (own(result, "type") !== "object" || own(result, "subtype") !== "error" || own(input, "exceptionDetails") === undefined) { return `${prefix}_SCHEMA`; }
  const className = own(result, "className"), description = own(result, "description");
  if (typeof description !== "string" || description.length > 16_384 || !description.isWellFormed()) { return `${prefix}_SCHEMA`; }
  const line = description.split("\n", 1)[0] ?? "";
  if (className === "EvalError" && line === "EvalError: Possible side-effect in debug-evaluate") { return `${prefix}_SIDE_EFFECT_CHECK`; }
  if (className === "ReferenceError") {
    const missing = /^ReferenceError: ([A-Za-z_$][A-Za-z\d_$]*) is not defined$/u.exec(line)?.[1] ??
      /^ReferenceError: Cannot access '([A-Za-z_$][A-Za-z\d_$]*)' before initialization$/u.exec(line)?.[1];
    const names = EXPRESSIONS[site].slice(1, -1).split(",").map(operand => operand.split(".", 1)[0]);
    if (missing !== undefined && names.includes(missing)) { return `${prefix}_BINDING_${missing.replaceAll("$", "DOLLAR").toUpperCase()}`; }
    return `${prefix}_REFERENCE_ERROR`;
  }
  if (className === "EvalError") { return `${prefix}_EVAL_ERROR`; }
  if (className === "TypeError") { return `${prefix}_TYPE_ERROR`; }
  if (className === "SyntaxError") { return `${prefix}_SYNTAX_ERROR`; }
  return `${prefix}_SCHEMA`;
}
