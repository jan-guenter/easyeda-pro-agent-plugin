/** Metadata selection only. The original owner independently reproves target
 * membership, frame custody and the full actual UI source before any action. */
import { win32 } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const start = /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#?$/u;
const target = z.strictObject({ targetId: token, type: z.string().max(128), url: z.string().max(8192), attached: z.boolean() });
const browser = z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-browser-observation.v1"), targets: z.array(target).max(256) });
const frame = z.strictObject({ id: token, loaderId: token, url: z.string().max(8192), securityOrigin: z.string().max(8192), parentId: token.optional() });
const inventory = z.looseObject({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-frame-inventory.v1"), targetId: token,
  frames: z.array(frame).min(1).max(128) });
export interface CurrentPcb209StartPageSelection { readonly targetId: string; readonly url: string }
/** An observed startup transition only. Empty inventories precede birth;
 * after birth the same unattached page may progress from blank to Start Page. */
export function observeCurrentPcb209StartPageCandidate(input: unknown, previousTargetId: string | null): Readonly<{ targetId: string | null; ready: boolean }> {
  if (previousTargetId !== null) { token.parse(previousTargetId); }
  const value = browser.parse(captureCurrentPcbStringClockReply(input).value); const pages = value.targets.filter(row => row.type === "page");
  if (new Set(value.targets.map(row => row.targetId)).size !== value.targets.length || pages.length > 1) { throw new Error("PCB209_START_PAGE_BIRTH"); }
  const page = pages[0];
  if (page === undefined) {
    if (previousTargetId !== null) { throw new Error("PCB209_START_PAGE_CLOSED"); }
    return Object.freeze({ targetId: null, ready: false });
  }
  if (page.attached || previousTargetId !== null && page.targetId !== previousTargetId || !["", "about:blank"].includes(page.url) && !start.test(page.url)) { throw new Error("PCB209_START_PAGE_TRANSITION"); }
  return Object.freeze({ targetId: page.targetId, ready: start.test(page.url) });
}
export function selectCurrentPcb209StartPage(input: unknown): CurrentPcb209StartPageSelection {
  const value = browser.parse(captureCurrentPcbStringClockReply(input).value); const pages = value.targets.filter(row => row.type === "page");
  const selected = pages[0];
  if (pages.length !== 1 || selected === undefined || selected.attached || !start.test(selected.url) || new Set(value.targets.map(row => row.targetId)).size !== value.targets.length) { throw new Error("PCB209_START_PAGE_SELECTION"); }
  return Object.freeze({ targetId: selected.targetId, url: selected.url });
}
export interface CurrentPcb209OriginalStartPageRoster {
  readonly editor: Readonly<CurrentPcb209StartPageSelection & { type: "page"; attached: false }>;
  readonly ancillaryTargetId: string | null;
}

function refuseOriginalStartPage(): never { throw new Error("PCB209_START_PAGE_SELECTION"); }

/** Classify an original decoded inventory against the exact launched executable.
 * Only the editor may leave the owner's private startup roster. */
export function proveCurrentPcb209OriginalStartPageRoster(
  targets: readonly Readonly<Record<string, unknown>>[],
  executable: string,
  previous?: CurrentPcb209OriginalStartPageRoster,
): CurrentPcb209OriginalStartPageRoster {
  if (!/^[A-Z]:\\/u.test(executable) || win32.normalize(executable) !== executable || win32.basename(executable) !== "easyeda-pro.exe") {
    return refuseOriginalStartPage();
  }
  const loaderPath = win32.join(win32.dirname(executable), "resources", "app", "assets", "view", "index.html");
  const loaderPrefix = `${pathToFileURL(loaderPath, { windows: true }).href}?`;
  let editor: CurrentPcb209OriginalStartPageRoster["editor"] | null = null;
  let ancillaryTargetId: string | null = null;
  for (const { targetId, url, attached } of targets.filter(row => row["type"] === "page")) {
    if (attached !== false || typeof targetId !== "string" || typeof url !== "string") { return refuseOriginalStartPage(); }
    if (editor === null && start.test(url)) {
      editor = Object.freeze({ targetId, type: "page", url, attached });
    } else if (ancillaryTargetId === null && url.startsWith(loaderPrefix) && url.length > loaderPrefix.length && !/[#\r\n\0]/u.test(url)) {
      ancillaryTargetId = targetId;
    } else { return refuseOriginalStartPage(); }
  }
  if (editor === null || previous !== undefined && (editor.targetId !== previous.editor.targetId || editor.url !== previous.editor.url ||
      ancillaryTargetId !== null && ancillaryTargetId !== previous.ancillaryTargetId)) { return refuseOriginalStartPage(); }
  return Object.freeze({ editor, ancillaryTargetId });
}

export function selectCurrentPcb209StartPageFrame(input: unknown, selected: CurrentPcb209StartPageSelection): Readonly<{ targetId: string; frameId: string; frameUrl: string }> {
  const original = z.strictObject({ targetId: token, url: z.string().regex(start) }).parse(captureCurrentPcbStringClockReply(selected).value);
  const value = inventory.parse(captureCurrentPcbStringClockReply(input).value); const roots = value.frames.filter(row => row.parentId === undefined); const root = roots[0];
  if (value.targetId !== original.targetId || roots.length !== 1 || root === undefined || root.securityOrigin !== "https://client" || !start.test(root.url) ||
    root.url.replace(/#$/u, "") !== original.url.replace(/#$/u, "") || new Set(value.frames.map(row => row.id)).size !== value.frames.length) { throw new Error("PCB209_START_PAGE_FRAME_SELECTION"); }
  return Object.freeze({ targetId: original.targetId, frameId: root.id, frameUrl: root.url });
}
