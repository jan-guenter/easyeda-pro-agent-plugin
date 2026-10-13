import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

// oxlint-disable-next-line node/no-top-level-await -- Install worker-local synthetic profiles before the real stage graph loads.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Register the actual restart test only after its synthetic profile setup.
await import("./helpers/closed-symbol-terminal-restart-cases.ts");
