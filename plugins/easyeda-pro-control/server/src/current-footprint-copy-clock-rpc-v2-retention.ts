/** Private original-runner retention, not native ownership. No binding factory
 * is exported; only the completed registration runner issues its opaque token. */
import type { CurrentFootprintCopyClockRegistrationV2Source } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRpcV2Command } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";

export interface CurrentFootprintCopyClockRpcV2RegistrationRetention { readonly profile: "private.current-footprint-clock-rpc-registration-retention.v2" }
export interface CurrentFootprintCopyClockRpcV2RegistrationBinding {
  readonly issuer: object;
  readonly sessionId: string;
  readonly uiRoute: string;
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly windowTabId: string;
  readonly wrapperScriptId: string;
  readonly callbackScriptId: string;
  readonly registrationArrayObjectId: string;
  readonly wrapperObjectId: string;
  readonly callbackObjectId: string;
  readonly bindingsArrayObjectId: string;
  readonly wrapperSource: CurrentFootprintCopyClockRegistrationV2Source;
  readonly callbackSource: CurrentFootprintCopyClockRegistrationV2Source;
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => void;
}
export interface CurrentFootprintCopyClockRpcV2Event {
  readonly method: "Debugger.paused" | "Debugger.resumed";
  readonly sessionId: string;
  readonly params: unknown;
}
/** Internal unmounted composition only. This shape authenticates no kernel,
 * channel or native owner; a future genuine issuer must join both original
 * runners, opening, route, sessions and generation before mounting anything. */
export interface CurrentFootprintCopyClockRpcV2Transport {
  readonly assertOriginal: () => Promise<void>;
  readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyClockRpcV2Command, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyClockRpcV2Event | null;
  readonly fail: () => void;
  readonly retire: () => Promise<void>;
}
