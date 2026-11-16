/** Original native task poststate. It reuses immutable descriptor/read
 * algorithms, never the public preference owner or legacy after-round issuer. */
import { types } from "node:util";
import {
  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS as CALLS,
  CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_FLAGS as FLAGS,
} from "./current-footprint-inverse-native-delete-collateral-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteCollateralPrepared } from "./current-footprint-inverse-native-delete-collateral-collector.ts";
import {
  currentFootprintInversePreferenceCount,
  decodeCurrentFootprintInversePreferenceCensus,
} from "./current-footprint-inverse-public-preferences-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue } from "./current-footprint-inverse-public-service-replies.ts";
import { validateCurrentFootprintInverseNativeDeletePoststateCommand } from "./current-footprint-inverse-native-delete-poststate-protocol.ts";
import type { CurrentFootprintInverseNativeDeletePoststateCommand } from "./current-footprint-inverse-native-delete-poststate-protocol.ts";

interface Bindings {
  readonly reflection: string;
  readonly before: CurrentFootprintInverseNativeDeleteCollateralPrepared;
  readonly assertOriginalCallerCompleted: () => void;
  readonly current: () => void;
  readonly assertOriginalExit: () => void;
  /** Core retains and qualifies the immediate original helper-source request
   * before this exact Promise resolves. No application method is invoked. */
  readonly request: (command: CurrentFootprintInverseNativeDeletePoststateCommand) => Promise<unknown>;
  readonly requireOriginalPhysicalComplete: () => void;
}
export interface CurrentFootprintInverseNativeDeletePoststateData {
  readonly profile: "private.current-footprint-inverse-native-delete-poststate-data.v1";
  readonly originalNativeCallerJoined: true;
  readonly originalTabDescriptorsUnchanged: true;
  readonly originalStorageHandleJoined: true;
  readonly originalStorageUnchanged: true;
  readonly originalSelectedPreferencesUnchanged: true;
  readonly publicPreferenceRemovalObserved: false;
  readonly restorationAuthorized: false;
  readonly persistenceVerified: false;
  readonly coldAbsenceVerified: false;
  readonly wholeInverseVerified: false;
  readonly cdpRequests: 5;
}
function need(value: boolean): asserts value {
  if (!value) { throw new Error("INVERSE_NATIVE_DELETE_POSTSTATE_CUSTODY"); }
}
const originals = new WeakSet<object>();
export class CurrentFootprintInverseNativeDeletePoststateCollector {
  readonly #b: Bindings;
  readonly #requests: Promise<unknown>[] = [];
  #pending: Promise<Readonly<CurrentFootprintInverseNativeDeletePoststateData>> | null = null;
  #data: Readonly<CurrentFootprintInverseNativeDeletePoststateData> | null = null;
  #ended = false;
  #failed = false;
  #cause: unknown;
  public constructor(bindings: Bindings) {
    this.#b = Object.freeze({ ...bindings });
    originals.add(this); Object.freeze(this);
  }
  #current(): void {
    if (this.#failed) { throw this.#cause; }
    this.#b.current(); this.#b.assertOriginalCallerCompleted(); need(!this.#ended);
  }
  async #read(input: unknown): Promise<unknown> {
    this.#current(); need(this.#requests.length < 3);
    const command = validateCurrentFootprintInverseNativeDeletePoststateCommand(input);
    const pending = this.#b.request(command); need(types.isPromise(pending));
    this.#requests.push(pending);
    const value = await pending; this.#current(); return value;
  }
  public start(): Promise<Readonly<CurrentFootprintInverseNativeDeletePoststateData>> {
    this.#current(); need(this.#pending === null);
    const gate = Promise.withResolvers<null>();
    const pending = (async (): Promise<Readonly<CurrentFootprintInverseNativeDeletePoststateData>> => {
      await gate.promise;
      try {
        this.#current();
        const before = this.#b.before;
        const tab = CALLS.tabReprove;
        requireCurrentFootprintInversePublicServiceTrue(await this.#read({
          round: "after", phase: "inverse-native-delete-collateral-call", role: "tabReprove",
          method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.reflection,
            functionDeclaration: tab.program, arguments: [{ objectId: before.tabProof }], returnByValue: true },
        }));
        const storage = CALLS.storageReprove;
        const count = currentFootprintInversePreferenceCount(await this.#read({
          round: "after", phase: "inverse-native-delete-collateral-call", role: "storageReprove",
          method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.reflection,
            functionDeclaration: storage.program, arguments: [{ objectId: before.storageProof }], returnByValue: true },
        }));
        const after = decodeCurrentFootprintInversePreferenceCensus(await this.#read({
          round: "after", phase: "inverse-native-delete-collateral-properties", role: "storage",
          method: "Runtime.getProperties", params: { objectId: before.storage,
            ownProperties: true, accessorPropertiesOnly: false, generatePreview: false },
        }));
        this.#current(); this.#b.requireOriginalPhysicalComplete();
        need(this.#requests.length === 3 && count === before.storageKeys && after.count === count &&
          after.peerSha256 === before.storagePeerSha256);
        // The original storageReprove closure compares every original own
        // Descriptor/value, including both selected preference keys. The
        // Census also joins the same actual Storage handle and peer bytes.
        this.#data = Object.freeze({
          profile: "private.current-footprint-inverse-native-delete-poststate-data.v1",
          originalNativeCallerJoined: true, originalTabDescriptorsUnchanged: true,
          originalStorageHandleJoined: true, originalStorageUnchanged: true,
          originalSelectedPreferencesUnchanged: true, publicPreferenceRemovalObserved: false,
          restorationAuthorized: false, persistenceVerified: false,
          coldAbsenceVerified: false, wholeInverseVerified: false, cdpRequests: 5,
        });
        return this.#data;
      } catch (error) { this.#failed = true; this.#cause = error; throw error; }
    })();
    this.#pending = pending; gate.resolve(null); return pending;
  }
  public requireOriginal(data: Readonly<CurrentFootprintInverseNativeDeletePoststateData>): void {
    this.#current(); need(this.#data === data && this.#pending !== null);
  }
  /** Historical identity only; normal current/context checks intentionally
   * cannot run after the original root and entire Job have exited. */
  public requireOriginalAfterOriginalExit(data: Readonly<CurrentFootprintInverseNativeDeletePoststateData>): void {
    this.#b.assertOriginalExit(); need(!this.#failed && this.#data === data && this.#pending !== null);
  }
  public async settleAfterOriginalExit(): Promise<void> {
    this.#b.assertOriginalExit(); this.#ended = true;
    await Promise.allSettled([this.#pending, ...this.#requests]);
    this.#b.assertOriginalExit();
  }
}
Object.freeze(CurrentFootprintInverseNativeDeletePoststateCollector.prototype);
Object.freeze(CurrentFootprintInverseNativeDeletePoststateCollector);
export function assertOriginalCurrentFootprintInverseNativeDeletePoststateCollector(value: CurrentFootprintInverseNativeDeletePoststateCollector): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) &&
    Object.getPrototypeOf(value) === CurrentFootprintInverseNativeDeletePoststateCollector.prototype && Reflect.ownKeys(value).length === 0);
}
