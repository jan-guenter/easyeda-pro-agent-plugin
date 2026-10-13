import { after } from "node:test";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";

// oxlint-disable-next-line node/no-top-level-await -- Install the exact worker-local I/O prerequisite mock before importing the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Actual stage cases load after the synthetic prerequisite seam; issuer modules stay unchanged.
await import("./helpers/aged-symbol-witness-stage-cases.ts");
