const kinds = ["metadata-read", "file-export", "project-footprint-write", "document-open"] as const;
const stages = ["api-lookup", "api-call", "result-check", "file-read", "file-hash", "activate", "encode"] as const;
const codes = ["LIBRARY_NATIVE_METHOD_MISSING", "LIBRARY_EXPORT_FILE_INVALID", "LIBRARY_EXPORT_FILE_CHANGED", "LIBRARY_METADATA_MISSING", "LIBRARY_OPEN_TAB_MISSING", "LIBRARY_OPEN_ACTIVATION_FAILED", "LIBRARY_WRITE_ACK_INVALID", "LIBRARY_OUTPUT_TOO_LARGE", "NATIVE_REJECTED"] as const;

/** Exact fixed marker only; arbitrary native exception details never escape. */
export function libraryRuntimeFailureCategory(message: unknown): string | null {
  if (typeof message !== "string" || message.length > 180) { return null; }
  const parts = /^Library operation refused: ([a-z-]+):([a-z-]+):([A-Z_]+)$/u.exec(message);
  if (parts === null || !kinds.some((value) => value === parts[1]) || !stages.some((value) => value === parts[2]) || !codes.some((value) => value === parts[3])) { return null; }
  return `native-preflight:LIBRARY_${parts[1]?.toUpperCase().replaceAll("-", "_")}_${parts[2]?.toUpperCase().replaceAll("-", "_")}_${parts[3]}`;
}

/** Included only in facade-owned library expressions, never caller scripts. */
export function libraryRuntimeCatchCode(kind: string): string {
  if (!kinds.some((value) => value === kind)) { throw new Error("Unreviewed library runtime kind."); }
  return `
const known = ${JSON.stringify(codes)};
const descriptor = error !== null && (typeof error === 'object' || typeof error === 'function') ? Object.getOwnPropertyDescriptor(error,'message') : undefined;
const message = descriptor && Object.hasOwn(descriptor,'value') ? descriptor.value : undefined;
const code = typeof message === 'string' && known.includes(message) ? message : 'NATIVE_REJECTED';
throw new Error('Library operation refused: '+${JSON.stringify(kind)}+':'+stage+':'+code);`;
}
