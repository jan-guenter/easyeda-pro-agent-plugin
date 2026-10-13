/** Test worker only: fixed source-profile I/O, never a stage or issuer replacement. */
import { registerHooks } from "node:module";

export async function installClosedSymbolTestProfiles(): Promise<void> {
  const original = new URL("../../src/library-native-profile.ts", import.meta.url);
  const fixture = new URL("closed-symbol-synthetic-navigation-profile.ts", import.meta.url);
  await import("../../src/library-native-profile.ts");
  registerHooks({ resolve(specifier, context, nextResolve) {
    const selected = nextResolve(specifier, context);
    return selected.url === original.href && context.parentURL !== fixture.href ? { url: fixture.href, shortCircuit: true } : selected;
  } });
  const { installSyntheticNativeProfile } = await import("./install-synthetic-native-profile.ts");
  await installSyntheticNativeProfile();
}
