export const exactDiagnosticAllowed = {
  kind: new Set("schematic-components schematic-topology pcb-components pcb-inventory pcb-rules schematic-source pcb-source symbol-source footprint-source".split(" ")),
  stage: new Set("setup api-lookup api-call api-result getter-lookup getter-call getter-result".split(" ")),
  api: new Set("none sys_FileManager pcb_Drc pcb_Net pcb_Primitive pcb_PrimitiveArc pcb_PrimitiveAttribute pcb_PrimitiveComponent pcb_PrimitiveDimension pcb_PrimitiveFill pcb_PrimitiveImage pcb_PrimitiveLine pcb_PrimitiveObject pcb_PrimitivePad pcb_PrimitivePolyline pcb_PrimitivePour pcb_PrimitivePoured pcb_PrimitiveRegion pcb_PrimitiveString pcb_PrimitiveVia sch_ManufactureData sch_Netlist sch_Primitive sch_PrimitiveComponent".split(" ")),
  method: new Set(("none getDocumentSource getAll getAllPrimitiveId getAllPinsByPrimitiveId getPrimitivesBBox getNetlist getNetlistFile getAllNetsName getCurrentRuleConfigurationName getCurrentRuleConfiguration getNetRules getNetByNetRules getRegionRules getAllNetClasses getAllDifferentialPairs getAllEqualLengthNetGroups getAllPadPairGroups getPadPairGroupMinWireLength " +
    "getState_AddIntoBom getState_AddIntoPcb getState_ArcAngle getState_Cbb getState_CbbSymbol getState_ComplexPolygon getState_Component getState_ComponentType getState_DesignRuleBlindViaName getState_Designator getState_Diameter getState_EndX getState_EndY getState_Footprint getState_HeatWelding getState_Hole getState_HoleDiameter getState_HoleOffsetX getState_HoleOffsetY getState_HoleRotation getState_InteractiveMode getState_Layer getState_LineWidth getState_Manufacturer getState_ManufacturerId getState_Metallization getState_Mirror getState_Model3D getState_Name getState_Net getState_NoConnected getState_OtherProperty getState_Pad getState_PadNumber getState_PadType getState_Pads getState_ParentComponentPrimitiveId getState_PinColor getState_PinLength getState_PinName getState_PinNumber getState_PinShape getState_Polygon getState_PourFillMethod getState_PourFills getState_PourName getState_PourPrimitiveId getState_PourPriority getState_PreserveSilos getState_PrimitiveId getState_PrimitiveLock getState_PrimitiveType getState_RegionName getState_Rotation getState_SolderMaskAndPasteMaskExpansion getState_SolderMaskExpansion getState_SpecialPad getState_StartX getState_StartY getState_SubPartName getState_Supplier getState_SupplierId getState_Symbol getState_UniqueId getState_ViaType getState_X getState_Y getState_pinType").split(" ")),
  expectation: new Set("unset array object finite-number integer string nonempty-string boolean json association polygon unique-identities bounds".split(" ")),
};

/** Only facade-owned enum values may survive native error-message withholding. */
export function exactReaderFailureCategory(message: unknown): string | null {
  if (typeof message !== "string" || message.length > 512) {
    return null;
  }
  const [prefix, kind, stage, api, method, expectation, ...extra] = message.split("|");
  if (
    prefix !== "EASYEDA_EXACT_READ_FAILURE" || extra.length > 0 ||
    kind === undefined || !exactDiagnosticAllowed.kind.has(kind) ||
    stage === undefined || !exactDiagnosticAllowed.stage.has(stage) ||
    api === undefined || !exactDiagnosticAllowed.api.has(api) ||
    method === undefined || !exactDiagnosticAllowed.method.has(method) ||
    expectation === undefined || !exactDiagnosticAllowed.expectation.has(expectation)
  ) {
    return null;
  }
  return ["exact-reader", kind, stage, api, method, expectation].join(":");
}

/** Bounded read-only drift evidence, never a substitute for an equal snapshot. */
export function firstJsonDifference(left: unknown, right: unknown): Record<string, unknown> {
  const before = JSON.stringify(left);
  const after = JSON.stringify(right);
  let offset = 0;
  while (offset < before.length && offset < after.length && before[offset] === after[offset]) { offset += 1; }
  return { equal: before === after, beforeLength: before.length, afterLength: after.length, firstDifference: offset,
    before: before.slice(Math.max(0, offset - 160), offset + 320), after: after.slice(Math.max(0, offset - 160), offset + 320) };
}
