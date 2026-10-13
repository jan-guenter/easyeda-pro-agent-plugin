import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install fixed synthetic I/O prerequisites before importing the actual stage graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Use the same maintained issuer instances after the prerequisite hooks.
await import("./helpers/closed-symbol-aged-coordinator-cases.ts");
