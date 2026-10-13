/** Test-only prerequisite. These bytes are NOT claimed to match vendor hashes. */
export { WITNESS_NATIVE_PINS, WITNESS_NATIVE_PINS_SHA256 } from "../../src/closed-symbol-native-profile.ts";
const seen: string[] = [];
let refuse = false;
export function resetSyntheticProfile(): void { seen.length = 0; refuse = false; }
export function refuseSyntheticProfile(value: boolean): void { refuse = value; }
export function syntheticProfileCalls(): readonly string[] { return Object.freeze([...seen]); }
export function verifyWitnessNativeProfile(assetsRoot: string): Promise<void> {
  if (assetsRoot !== "/synthetic/easyeda/resources/app/assets" || refuse || seen.length >= 10_000) {
    return Promise.reject(new Error("Synthetic native-profile prerequisite refused."));
  }
  seen.push(assetsRoot); return Promise.resolve();
}
