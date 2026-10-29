/** Process-local diagnostic only. The bundled module URL identifies the serving
 * snapshot without rereading a cache that may have been removed after startup.
 * It establishes neither source integrity nor runtime/native ownership. */
import process from "node:process";

export function queryLoadedFacade(): Readonly<{
  schema: "easyeda-pro-control.loaded-facade.v1";
  pid: number;
  moduleUrl: string;
  nodeVersion: string;
  admissionGranted: false;
}> {
  return Object.freeze({ schema: "easyeda-pro-control.loaded-facade.v1", pid: process.pid,
    moduleUrl: import.meta.url, nodeVersion: process.version, admissionGranted: false });
}
