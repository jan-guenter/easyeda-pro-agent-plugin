/** Data arguments for a future original-owner Tg.create call. No command,
 * remote handles, dispatch permission or destination UUID are produced. */
import { currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintCopyV2NativeArguments {
  readonly createArgument: Readonly<{
    uuid: string; path: string; isProject: true; docType: 4; title: string; display_title: string;
    description: string; custom_tags: string; source: ""; version: "";
  }>;
  readonly expectedProjectUuid: string;
}

/** Pinned209 worker0e7a4743, create at UTF-16 1884898:1885523, accepts only
 * createArgument alone. expectedProjectUuid binds its original PROJECT receiver;
 * it is not a second Tg.create parameter. buildString selects display_title,
 * description and JSON.parse(custom_tags), and allocates the destination.
 * getProLibSource selects the source through isProject/path/docType/uuid;
 * its worker path crosses the UI notify bus before FOOTPRINT.GET_STR.
 * The public import matcher and Tg.clone must never receive this data. */
export function currentFootprintCopyV2NativeCreateArguments(plan: CurrentFootprintCopyV2Plan): CurrentFootprintCopyV2NativeArguments {
  currentFootprintCopyV2Rows(plan);
  const metadata = plan.destinationMetadata;
  return freezeDeep({ createArgument: { uuid: plan.source.footprintUuid, path: plan.source.projectUuid, isProject: true, docType: 4,
    title: metadata.title, display_title: metadata.title, description: metadata.description,
    custom_tags: JSON.stringify(metadata.tags), source: "", version: "" }, expectedProjectUuid: plan.source.projectUuid });
}
