import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

// oxlint-disable-next-line node/no-top-level-await -- Install fixed worker-local prerequisites before the actual coordinator graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- These unchanged cases must share the real maintained graph after its prerequisite hook.
await import("./helpers/closed-symbol-recorded-sql-cases.ts");
