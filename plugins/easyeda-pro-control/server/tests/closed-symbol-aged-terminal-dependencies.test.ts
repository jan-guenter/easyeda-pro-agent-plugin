import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Register fixed worker-local I/O before loading actual stages.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Load the actual graph after test prerequisites.
await import("./helpers/closed-symbol-aged-terminal-dependencies-cases.ts");
