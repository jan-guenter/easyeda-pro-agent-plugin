/** Synthetic automatic graph. Loading does not authorize native execution. */
/* oxlint-disable node/no-top-level-await -- Profile interception must finish before dynamic imports of concrete stage owners. */
import { installAutomaticHeadObserver } from "./helpers/install-closed-symbol-automatic-observer.ts";

installAutomaticHeadObserver();
const { installClosedSymbolTestProfiles } = await import("./helpers/install-closed-symbol-test-profiles.ts");
await installClosedSymbolTestProfiles();
const { registerFailedReference, registerRecent } = await import("./helpers/closed-symbol-coordinator-automatic-failure-cases.ts");
registerFailedReference();
registerRecent();
