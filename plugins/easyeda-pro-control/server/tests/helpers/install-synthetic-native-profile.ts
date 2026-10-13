/** Test worker only: install before dynamic consumer imports, then unregister.
 * No production override, hash replacement, copied vendor bundle or issuer mock.
 */
import { registerHooks } from "node:module";
import type { WITNESS_NATIVE_PINS, WITNESS_NATIVE_PINS_SHA256, verifyWitnessNativeProfile } from "../../src/closed-symbol-native-profile.ts";
import type { refuseSyntheticProfile, resetSyntheticProfile, syntheticProfileCalls } from "./synthetic-native-profile.ts";

interface NativeProfileExports {
  readonly WITNESS_NATIVE_PINS: typeof WITNESS_NATIVE_PINS; readonly WITNESS_NATIVE_PINS_SHA256: typeof WITNESS_NATIVE_PINS_SHA256;
  readonly verifyWitnessNativeProfile: typeof verifyWitnessNativeProfile;
}
interface FixtureProfileExports extends NativeProfileExports {
  readonly resetSyntheticProfile: typeof resetSyntheticProfile; readonly refuseSyntheticProfile: typeof refuseSyntheticProfile;
  readonly syntheticProfileCalls: typeof syntheticProfileCalls;
}

export async function installSyntheticNativeProfile(): Promise<Readonly<{
  unregister: () => void;
  original: NativeProfileExports;
  fixture: FixtureProfileExports;
}>> {
  const originalUrl = new URL("../../src/closed-symbol-native-profile.ts", import.meta.url);
  const fixtureUrl = new URL("synthetic-native-profile.ts", import.meta.url);
  // The real module exports metadata without reading installed source files.
  // Preserve its original function separately for direct refusal regressions.
  const original = await import("../../src/closed-symbol-native-profile.ts");
  const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
    const selected = nextResolve(specifier, context);
    if (selected.url === originalUrl.href && context.parentURL !== fixtureUrl.href) { return { url: fixtureUrl.href, shortCircuit: true }; }
    return selected;
  } });
  const fixture = await import("./synthetic-native-profile.ts"); fixture.resetSyntheticProfile();
  return Object.freeze({ unregister: (): void => { hooks.deregister(); }, original, fixture });
}
