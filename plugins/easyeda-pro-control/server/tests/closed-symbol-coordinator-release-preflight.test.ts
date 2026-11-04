/** Isolate the permanent target claim for one genuine completed release flow. */
/* oxlint-disable node/no-top-level-await -- Install synthetic I/O profiles before dynamic stage imports. */
const { installClosedSymbolTestProfiles } = await import("./helpers/install-closed-symbol-test-profiles.ts");
await installClosedSymbolTestProfiles();
const { registerReleasePreflightRetry } = await import("./helpers/closed-symbol-disposable-entry-cases.ts");
registerReleasePreflightRetry();
