/** Test-only source-profile I/O. No native source read or issuer replacement. */
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../../src/library-native-profile.ts";

export { LIBRARY_NATIVE_IMPLEMENTATION } from "../../src/library-native-profile.ts";
export function verifyLibraryNativeProfile(assetsRoot: string): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> {
  if (assetsRoot !== "/synthetic/easyeda/resources/app/assets") { return Promise.reject(new Error("Synthetic navigation profile refused.")); }
  return Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION);
}
