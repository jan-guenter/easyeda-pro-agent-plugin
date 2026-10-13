import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install worker-local fixed synthetic source prerequisites before the actual stage graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Preserve source profile import order for the actual registry composition.
await import("./helpers/closed-symbol-aged-coordinator-baseline-cases.ts");
