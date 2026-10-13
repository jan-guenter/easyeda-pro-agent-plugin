/** Actual retained v2 graph with fixed synthetic transports and isolated profiles. */
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
// oxlint-disable-next-line node/no-top-level-await -- Register worker-local profile I/O before actual stage imports.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Preserve actual stage registration order after the isolated test prerequisite.
await import("./helpers/closed-symbol-aged-terminal-restart-cases.ts");
