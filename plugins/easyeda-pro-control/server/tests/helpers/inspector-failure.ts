/** Inert test Inspector sessions only. Release a paused Node main thread before
 * its original rejection can be delivered to that same thread. */
import type {Session} from "node:inspector/promises";

export async function resumeInspectorBeforeReject(session:Pick<Session,"post"|"disconnect">,reject:(error:unknown)=>void,original:unknown):Promise<void>{
  try{await session.post("Debugger.resume");}
  catch{
    try{await session.post("Debugger.disable");}
    catch{
      // Preserve the original handler error.
    }
  }
  try{session.disconnect();}
  catch{
    // Disconnect failure cannot replace the original rejection.
  }
  reject(original);
}
