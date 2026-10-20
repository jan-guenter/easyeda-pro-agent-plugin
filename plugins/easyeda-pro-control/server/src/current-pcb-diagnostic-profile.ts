/** Reviewed comparison inputs for the validation-only diagnostic launcher.
 * No caller or environment override selects these bytes. This inventory does
 * not prove Windows catalog trust, loaded-image identity, startup isolation or
 * connected compatibility; native leases and the original lifecycle still bind.
 */
export const CURRENT_PCB_DIAGNOSTIC_PROFILE = Object.freeze({
  schema: "easyeda-pro-control.pcb-diagnostic-validation-profile.v1",
  reviewedAt: "2026-10-20",
  validationOnly: true,
  connectedValidation: false,
  projectFreeVerified: false,
  profileIsolated: false,
  debuggerSocketAbsenceVerified: false,
  powershell: Object.freeze({
    windowsPath: "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    bytes: 455_680,
    sha256: "9785001b0dcf755eddb8af294a373c0b87b2498660f724e76c4d53f9c217c7a3",
    offlineInventorySha256: "f81f09487919ffefb6f76e61fd0585a4e55e64e47d52835748bea5db5d250bf2",
    signatureTrustVerified: false,
  }),
});

export type CurrentPcbDiagnosticScriptFamily = "ui" | "pcb" | "public-api";
export interface CurrentPcbDiagnosticScriptProfile {
  readonly family: CurrentPcbDiagnosticScriptFamily;
  readonly relativePath: string;
  readonly scriptSha256: string;
  readonly scriptBytes: number;
}

/** Existing independently pinned assets, rehashed with exact byte counts for
 * source transport. A URL-path match alone is never accepted as source proof.
 */
export const CURRENT_PCB_DIAGNOSTIC_SCRIPTS: Readonly<Record<CurrentPcbDiagnosticScriptFamily, CurrentPcbDiagnosticScriptProfile>> = Object.freeze({
  ui: Object.freeze({ family: "ui", relativePath: "pro-ui/3.2.196.26ed3d6c/js/ui.js",
    scriptSha256: "3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a", scriptBytes: 17_456_671 }),
  pcb: Object.freeze({ family: "pcb", relativePath: "pro-pcb/3.2.193.682ed44e/js/pcb.js",
    scriptSha256: "217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33", scriptBytes: 10_976_299 }),
  "public-api": Object.freeze({ family: "public-api", relativePath: "pro-api/0.3.50.ab46409c/api.js",
    scriptSha256: "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76", scriptBytes: 1_964_920 }),
});
