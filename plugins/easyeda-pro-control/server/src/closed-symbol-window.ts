/** Select from retained root-owned windows using the native normal-close contract.
 * Process.MainWindowHandle is advisory: Chromium can report an ownerless tooltip.
 * The native close still rechecks ancestry, enabled/visible state, tool-window
 * style, title stability and process ownership immediately before dispatch.
 */
import { isRecord } from "./core.ts";

function application(row: unknown, rootPid: number): boolean {
  if (!isRecord(row) || row["pid"] !== rootPid || row["owner"] !== "0" || row["className"] !== "Chrome_WidgetWin_1" || row["minimized"] !== false) { return false; }
  const bounds = row["bounds"], title = row["title"];
  if (typeof title !== "string" || title.length > 1024 || title.trim().length === 0 || !title.isWellFormed() ||
    !Array.isArray(bounds) || bounds.length !== 4 || !bounds.every((value: unknown) => typeof value === "number" && Number.isFinite(value))) { return false; }
  const height: unknown = bounds[3], width: unknown = bounds[2];
  return typeof width === "number" && typeof height === "number" && width >= 320 && height >= 200 && width <= 16_384 && height <= 16_384;
}

export function selectClosedSymbolApplicationWindow(result: unknown, rootPid: number): string {
  if (!Number.isSafeInteger(rootPid) || rootPid <= 0 || !isRecord(result) || typeof result["mainWindowHandle"] !== "string" ||
    !/^(?:0|[1-9]\d{0,18})$/u.test(result["mainWindowHandle"])) { throw new Error("Closed-symbol owned windows unavailable."); }
  const rows = result["windows"];
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 64) { throw new Error("Closed-symbol owned windows unavailable."); }
  const candidates = rows.filter((row: unknown) => application(row, rootPid));
  const selected: unknown = candidates[0];
  if (candidates.length !== 1 || !isRecord(selected) || typeof selected["handle"] !== "string" || !/^[1-9]\d{0,18}$/u.test(selected["handle"]) ||
    rows.filter((row: unknown) => isRecord(row) && row["handle"] === selected["handle"]).length !== 1) {
    throw new Error("Closed-symbol main window is ambiguous or unavailable.");
  }
  return selected["handle"];
}
