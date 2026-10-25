import type { ApiCoverageOmission } from "./extension-api-coverage.ts";

const evidence = [
  "docs/history/2026-10-23-installed-209-declaration-inventory.md",
  "assets/pro-api/0.3.59.1ca9efb5/api.js@sha256:e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
  "assets/pro-ui/3.2.198.2800f583/js/ui.js@sha256:3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
] as const;

interface OmissionGroup {
  readonly paths: readonly string[];
  readonly omission: ApiCoverageOmission;
}

/** Closed path lists classify only the reviewed additions. Future declarations
 * cannot inherit these source findings from a namespace prefix or method name.
 */
const groups: readonly OmissionGroup[] = [
  {
    paths: ["lib_Device.searchByProperties"],
    omission: {
      code: "installed-209-library-routing-unqualified",
      reason: "API 0.3.59 sends uid without the local device controller's required body/header path. System uid can choose the online proxy only under HALF_OFFLINE plus NETWORK; personal-library handling requires qualified database routing. The wrapper also fetches 3D references through a hidden component search, while footprint/symbol-name filters make separate default-system lookups and use first-result matching. These source findings do not establish an unconditional live failure.",
      nextRequirement: "Qualify exact owner selection, desktop routing/storage effects and every hidden asset lookup, then add bounded complete response validation. A fixed anonymous system catalog task equivalent does not validate this direct SDK method or personal-library access.",
      evidence: [...evidence, "docs/history/2026-10-25-netlist-symbol-readers-and-bootstrap.md"],
    },
  },
  {
    paths: ["lib_LibrariesList.getAllLibrariesList", "lib_LibrariesList.getPersonalLibraryUuid", "lib_LibrariesList.getFavoriteLibraryUuid"],
    omission: {
      code: "installed-209-library-discovery-mutates-ui",
      reason: "The desktop handlers call allLibrariesList/getClientLibList with refresh, rebuild client library lists and classification filters, fetch/search classifications and select a library category. They are not passive owner-ID reads. Desktop CLIENT rows may leave PERSONAL/STAR-specific getters undefined, and the all-libraries handler filters several library categories instead of returning a complete inventory. Backend refresh/storage effects remain unqualified.",
      nextRequirement: "Model and qualify the library UI changes and backend effects before exposing these getters, or build a separately qualified passive owner reader. The fixed getSystemLibraryUuid route does not enumerate or authorize personal/team/project owners.",
      evidence: [...evidence, "docs/history/2026-10-25-netlist-symbol-readers-and-bootstrap.md"],
    },
  },
  {
    paths: [
      "dmt_SourceBoard.addBoard", "dmt_SourceBoard.getAllBoards", "dmt_SourceBoard.getBoard", "dmt_SourceBoard.removeBoard",
      "dmt_SourcePcb.addPcb", "dmt_SourcePcb.removePcb", "dmt_SourcePcb.updatePcb",
      "dmt_SourceProject.closeVirtualProject", "dmt_SourceProject.getAllVirtualOpenedProjects", "dmt_SourceProject.virtualOpenProject",
      "dmt_SourceSchematic.addPage", "dmt_SourceSchematic.addSchematic", "dmt_SourceSchematic.removePage", "dmt_SourceSchematic.removeSchematic", "dmt_SourceSchematic.updatePage",
      "sch_SourceDrc.check", "sch_SourceNet.getConnections", "sch_SourceNetlist.getNetlistInRegion",
    ],
    omission: {
      code: "installed-209-error-stub",
      reason: "The exact 3.2.209 API 0.3.59 implementation returns a literal failed result with INTERNAL_ERROR and an empty message, without invoking a backend. A typed facade wrapper would expose only that failure. Virtual-project declarations also share persisted project data and do not provide isolation.",
      nextRequirement: "Review a generation that implements this exact method, or build a separately qualified native equivalent. Source design writes require complete effect, ownership and disposable saved/reopened proof; virtual opening must never be treated as a sandbox.",
      evidence,
    },
  },
  {
    paths: [
      "sch_SourceDocument.getElementsInRegion", "sch_SourceDocument.getFunctionGroups", "sch_SourceDocument.removeFunctionGroup", "sch_SourceDocument.renderRegion", "sch_SourceDocument.transformFunctionGroup",
      "sch_SourcePrimitiveArc.add", "sch_SourcePrimitiveArc.remove",
      "sch_SourcePrimitiveAttribute.addNetLabel", "sch_SourcePrimitiveAttribute.removeNetLabel", "sch_SourcePrimitiveAttribute.updateNetLabel",
      "sch_SourcePrimitiveCircle.add", "sch_SourcePrimitiveCircle.remove",
      "sch_SourcePrimitiveComponent.add", "sch_SourcePrimitiveComponent.addNetFlag", "sch_SourcePrimitiveComponent.get", "sch_SourcePrimitiveComponent.remove", "sch_SourcePrimitiveComponent.removeNetFlag", "sch_SourcePrimitiveComponent.replace", "sch_SourcePrimitiveComponent.update", "sch_SourcePrimitiveComponent.updateAttribute",
      "sch_SourcePrimitivePolygon.add", "sch_SourcePrimitivePolygon.remove", "sch_SourcePrimitiveRectangle.add", "sch_SourcePrimitiveRectangle.remove",
      "sch_SourcePrimitiveText.add", "sch_SourcePrimitiveText.remove", "sch_SourcePrimitiveWire.add", "sch_SourcePrimitiveWire.remove", "sch_SourcePrimitiveWire.removePinWires",
    ],
    omission: {
      code: "installed-209-source-backend-absent",
      reason: "API 0.3.59 contains source-operation RPC wrappers, but their named UI or /mgr/projectWorker/source routes are absent from the inspected 3.2.209 UI registry, manager/project-worker and schematic bundles. Some wrappers turn transport failure into INTERNAL_ERROR; declaration presence is not a functioning source editor.",
      nextRequirement: "Qualify an installed backend containing the exact route and its completion/effect contract before adding a typed adapter. Bind source project/page identity, preserve peers and validate disposable persistence for writes. These are source findings, not observed live failures.",
      evidence,
    },
  },
  {
    paths: ["dmt_EditorControl.getDocumentReadyState", "dmt_EditorControl.waitForDocumentReady", "dmt_Project.getReadyState", "dmt_Project.waitForReady"],
    omission: {
      code: "installed-209-readiness-backend-absent",
      reason: "The exact API exposes readiness RPC wrappers, but the four named handlers are absent from the 3.2.209 UI registry. Official declarations describe these beta methods as added in EDA 4.1.79. Calling the wrappers cannot replace the existing original-owner readiness proof.",
      nextRequirement: "Review an installed implementation with these handlers, then test exact target identity, timeout, failure and completion semantics. Do not repeat navigation or reinterpret a missing response as readiness.",
      evidence,
    },
  },
  {
    paths: ["pcb_Document.cancelAutoJob", "pcb_Document.getAutoJobLog", "pcb_Document.getAutoJobStatus", "pcb_Document.startAutoLayout", "pcb_Document.startAutoRouting"],
    omission: {
      code: "installed-209-auto-job-backend-absent",
      reason: "The five API 0.3.59 auto-job wrappers target named UI RPC handlers absent from the inspected 3.2.209 UI and PCB bundles. Declarations specify EDA 4.1.79 jobs whose lifetime outlasts the initiating call; a job ID or cancellation request is not completed geometry or termination proof.",
      nextRequirement: "First qualify a backend implementing the job protocol. Then retain original job/context ownership, bounded logs and terminal completion, and prove the complete routed/placed geometry and disposable saved/reopened result. No caller-supplied job ID may adopt another operation.",
      evidence,
    },
  },
  {
    paths: ["pcb_RayTracerEngine.addSceneElement", "pcb_RayTracerEngine.exportImage", "pcb_RayTracerEngine.getSceneElements", "pcb_RayTracerEngine.removeSceneElement", "pcb_RayTracerEngine.setSceneElementTransform"],
    omission: {
      code: "installed-209-raytracer-backend-absent",
      reason: "The five API 0.3.59 scene/image wrappers target named UI RPC handlers absent from the inspected 3.2.209 UI and PCB bundles. The existing raytracer registry does not register these additions. Blob results and scene handles also lack a retained facade resource owner.",
      nextRequirement: "Qualify the exact renderer backend and retained scene lifetime, then add bounded scene projections and managed input/output Blob validation, completion and disposal. Export success alone cannot qualify a design writer or manufacturing result.",
      evidence,
    },
  },
];

/** Source findings for this generation only, never callable paths or admission. */
export function installed209ApiOmission(path: string): ApiCoverageOmission | undefined {
  const group = groups.find((entry) => entry.paths.includes(path));
  return group === undefined ? undefined : structuredClone(group.omission);
}
