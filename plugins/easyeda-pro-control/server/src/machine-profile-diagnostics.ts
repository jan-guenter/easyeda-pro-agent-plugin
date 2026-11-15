/** Small shared launcher diagnostics; imports no Linux control or SQLite state. */
import { z } from "zod";

export const machineInstallationFailureCodeSchema = z.enum([
  "machine-installation-upstream-root-unavailable",
  "machine-installation-upstream-package-unavailable",
  "machine-installation-upstream-version-mismatch",
  "machine-installation-upstream-entrypoint-unavailable",
  "machine-installation-assets-root-unavailable",
  "machine-installation-pcb-bundle-unavailable",
  "machine-installation-api-implementation-unavailable",
  "machine-installation-api-adapter-unavailable",
  "machine-installation-api-declarations-unavailable",
]);
export type MachineInstallationFailureCode = z.infer<typeof machineInstallationFailureCodeSchema>;
export class MachineProfileError extends Error {
  public readonly code: string;
  public constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "MachineProfileError";
  }
}
