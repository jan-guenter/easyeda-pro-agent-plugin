/** Ordinary isolated wrapper. Fixed synthetic profiles precede stage imports. */
/* oxlint-disable node/no-top-level-await -- Install synthetic I/O profiles before dynamic stage imports. */

const { installClosedSymbolTestProfiles } = await import("./helpers/install-closed-symbol-test-profiles.ts");
await installClosedSymbolTestProfiles();
const { registerSuccess } = await import("./helpers/closed-symbol-disposable-entry-cases.ts");
registerSuccess("aged");
