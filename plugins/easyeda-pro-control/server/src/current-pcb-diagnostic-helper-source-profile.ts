/** Source-file growth only. The exact first-party helper still requires both
 * committed byte length and SHA-256. No runtime input, response or CDP budget
 * is selected by this fixed build/synthetic-smoke admission ceiling. */
export const CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
