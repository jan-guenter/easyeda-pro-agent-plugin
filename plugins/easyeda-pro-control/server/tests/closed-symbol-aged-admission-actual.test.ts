import { installAdmissionDependencyObserver } from "./helpers/closed-symbol-admission-cache-load-observer.ts";
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

// Fixed test-only module-load observation precedes profile and stage imports; no source substitution.
installAdmissionDependencyObserver();
// oxlint-disable-next-line node/no-top-level-await -- Fixed synthetic source-profile I/O must be installed before actual stage imports.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- Actual graph imports follow the fixed module observer and profile hooks.
await import("./helpers/closed-symbol-aged-admission-actual-cases.ts");
