/** New stock-only schedule. Historical configuration and SQL-fence budgets
 * are immutable and supply no unused capacity to this separate origin. */
export const CURRENT_MAIN_STARTUP_LIBRARY_LIVE = Object.freeze({
  lineage: Object.freeze([Object.freeze({ lineNumber: 1025, columnNumber: 875 }), Object.freeze({ lineNumber: 1025, columnNumber: 847 }),
    Object.freeze({ lineNumber: 1025, columnNumber: 3601 }), Object.freeze({ lineNumber: 8519, columnNumber: 1796 })]),
  returnPoint: Object.freeze({ lineNumber: 8519, columnNumber: 1812 }),
  functionStart: Object.freeze({ lineNumber: 8519, columnNumber: 1734 }),
  functionEnd: Object.freeze({ lineNumber: 8519, columnNumber: 1813 }),
  limits: Object.freeze({ "sql-stock-frame": 1, "sql-stock-bind": 1, "sql-stock-points": 1, "sql-stock-arm": 1,
    "sql-stock-raw": 332, "sql-stock-captured": 332, "sql-stock-select": 332,
    "sql-stock-require": 333, "sql-stock-resume": 333, "sql-stock-return-frame": 1, "sql-stock-return-properties": 1, "sql-stock-return": 1, "sql-stock-remove": 1 }),
  requests: 1670,
});
export interface CurrentMainStartupLibraryOrigin { readonly profile: "private.current-main-startup-library-origin.v1"; readonly executionAuthorized: false }
export function isCurrentMainStartupLibraryPhase(phase: string): phase is keyof typeof CURRENT_MAIN_STARTUP_LIBRARY_LIVE.limits {
  return Object.hasOwn(CURRENT_MAIN_STARTUP_LIBRARY_LIVE.limits, phase);
}
/** The original, source-qualified app.js script URL supplies comparison data.
 * No configured library directory or caller path enters the stock origin. */
export function currentMainStartupLibraryAppDirectory(input: string): string {
  for (const character of input) {
    const point = character.codePointAt(0); if (point === undefined || point < 32 || point === 127) { throw new Error("MAIN_STARTUP_LIBRARY_APP_URL"); }
  }
  let path = input;
  if (path.startsWith("file:///")) {
    const url = new URL(path);
    if (url.protocol !== "file:" || url.hostname !== "" || url.search !== "" || url.hash !== "" || !/^\/[A-Z]:\//u.test(url.pathname)) { throw new Error("MAIN_STARTUP_LIBRARY_APP_URL"); }
    path = decodeURIComponent(url.pathname.slice(1)).replaceAll("/", "\\");
  }
  if (!/^[A-Z]:\\.+\\app\.js$/u.test(path) || path.includes("/")) { throw new Error("MAIN_STARTUP_LIBRARY_APP_URL"); }
  return path.slice(0, -7);
}
