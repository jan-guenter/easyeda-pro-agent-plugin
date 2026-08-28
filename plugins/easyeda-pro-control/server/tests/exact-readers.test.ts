import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import {
  buildExactReadCode,
  exactReadDocumentType,
  exactReadRequestSchema,
  validateExactReadPayload,
  validateExactReadRequest,
} from "../src/exact-readers.ts";
import type { ExactReadRequest } from "../src/exact-readers.ts";

type UnknownRecord = Record<string, unknown>;
type StateGetter = () => Promise<unknown>;
type StateObject = Record<string, StateGetter>;

type AsyncFunctionConstructor = new (
  ...parameters: string[]
) => (eda: unknown) => Promise<unknown>;

interface FixtureRecord extends UnknownRecord {
  arcPrecision: string;
  bounds: FixtureRecord;
  cbb: unknown;
  cbbSymbol: unknown;
  component: unknown;
  componentOtherPropertyFiltering: string;
  componentPadWrapper: string;
  componentPinOtherProperty: string;
  cbbLibraryOwnership: string;
  compiledConnectivity: FixtureRecord[];
  count: number;
  designator: string | null;
  directPads: string;
  fillModes: string;
  footprint: unknown;
  heatWelding: unknown;
  hole: unknown;
  id: string;
  length: number;
  limitations: FixtureRecord;
  minX: number;
  netRules: FixtureRecord[];
  noConnected: boolean;
  pad: unknown;
  padPairGroups: FixtureRecord[];
  padPairMinimumWireLength: string;
  pads: FixtureRecord[];
  padType: number;
  parentComponentPrimitiveId: string;
  pinNumbers: string[];
  pinColor: unknown;
  pins: FixtureRecord[];
  pourFills: FixtureRecord[];
  pourPrimitiveId: string;
  primitiveId: string;
  primitiveIds: string[];
  primitiveType: string;
  regionRuleTypes: string;
  solderMaskExpansion: unknown;
  solderMaskAndPasteMaskExpansion: unknown;
  source: string;
  specialPad: unknown;
  status: string;
  sub: FixtureRecord[];
  symbol: unknown;
  unreviewed?: boolean;
  viaPrecision: string;
  viaType: number;
  interactiveMode: number;
  wireGeometry: string;
  x: number;
  y: number;
}

interface FixtureRecordIndex extends Record<string, FixtureRecord> {
  "arcs-1": FixtureRecord;
  "component-pad-1": FixtureRecord;
  "fills-1": FixtureRecord;
  "pad-standalone-1": FixtureRecord;
  "pcb-u1": FixtureRecord;
  "pours-1": FixtureRecord;
  "regions-1": FixtureRecord;
  "sch-r1": FixtureRecord;
  "vias-1": FixtureRecord;
}

interface FixtureUniqueIdIndex extends Record<string, FixtureRecord> {
  gge1: FixtureRecord;
}

interface FixtureFamily {
  status: string;
  count: number;
  primitiveIds: string[];
  byPrimitiveId: FixtureRecordIndex;
}

interface FixtureFamilies extends Record<string, FixtureFamily> {
  arcs: FixtureFamily;
  components: FixtureFamily;
  fills: FixtureFamily;
  pads: FixtureFamily;
  pours: FixtureFamily;
  regions: FixtureFamily;
  vias: FixtureFamily;
}

interface FixturePayload extends UnknownRecord {
  authority: FixtureRecord;
  byPrimitiveId: FixtureRecordIndex;
  compiledConnectivity: FixtureRecord[];
  componentCorrelation: FixtureRecord & {
    byUniqueId: FixtureUniqueIdIndex;
    pinCount: number;
  };
  componentPadCorrelation: FixtureRecord & {
    byComponentPrimitiveId: Record<string, string[]>;
    byPrimitiveId: FixtureRecordIndex;
  };
  enumeratedPrimitiveCount: number;
  families: FixtureFamilies;
  limitations: FixtureRecord;
  nets: string[];
  physicalPadCount: number;
  pouredCorrelation: FixtureRecord & {
    byPourPrimitiveId: FixtureRecordIndex;
    pourPrimitiveIds: string[];
  };
  pouredFillPieceCount: number;
  primitiveIds: string[];
  rules: FixtureRecord & {
    differentialPairs: unknown[];
    netRules: FixtureRecord[];
    padPairGroups: FixtureRecord[];
  };
  standalonePadCount: number;
  units: FixtureRecord;
}

interface SchematicApiOptions {
  components?: StateObject[];
  declaredIds?: string[];
  pins?: StateObject[];
  getAll?: () => Promise<unknown>;
}

interface SchematicApis {
  sch_PrimitiveComponent: {
    getAll: () => Promise<unknown>;
    getAllPrimitiveId: () => Promise<unknown>;
    getAllPinsByPrimitiveId: () => Promise<unknown>;
  };
  sch_Primitive: {
    getPrimitivesBBox: () => Promise<unknown>;
  };
}

interface PcbComponentApiOptions {
  components?: StateObject[];
  declaredIds?: string[];
  pads?: StateObject[];
  bbox?: { minX: number; minY: number; maxX: number; maxY: number };
}

interface PcbPadOptions {
  primitiveId?: string;
  primitiveType?: string;
  parentComponentPrimitiveId?: string;
  padType?: unknown;
}

interface InventoryOptions {
  padType?: unknown;
  viaType?: unknown;
  interactiveMode?: unknown;
}

interface InventoryApi {
  getAllPrimitiveId: () => Promise<unknown>;
  getAll: () => Promise<unknown>;
}

type InventoryEda = Record<string, InventoryApi | undefined> & {
  pcb_PrimitiveComponent: InventoryApi;
  pcb_PrimitivePoured: InventoryApi;
  pcb_PrimitiveImage?: InventoryApi;
};

interface RulesApis {
  pcb_Drc: Record<string, () => Promise<unknown>> & {
    getCurrentRuleConfiguration: () => Promise<unknown>;
    getNetByNetRules: () => Promise<unknown>;
    getNetRules: () => Promise<unknown>;
  };
  pcb_Net: { getAllNetsName: () => Promise<unknown> };
}

interface TopologyOptions {
  onFormat?: ((format: string) => void) | undefined;
  onComponentCall?: ((method: string, args: unknown[]) => void) | undefined;
  componentUniqueId?: string;
  componentDesignator?: string;
  componentPinNumbers?: string[];
  netlistUniqueId?: string;
  netlistDesignator?: string;
  netlistPinNumbers?: string[];
}

interface TopologyApis {
  sch_PrimitiveComponent: Record<
    string,
    (...args: unknown[]) => Promise<unknown>
  >;
  sch_Netlist: { getNetlist: (format: string) => Promise<unknown> };
}

/* oxlint-disable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access -- The test must construct generated async programs through the runtime's AsyncFunction constructor. */
const AsyncFunction = Object.getPrototypeOf(
  async (): Promise<void> => undefined,
).constructor as AsyncFunctionConstructor;
/* oxlint-enable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access */

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Missing fixture value: ${label}`);
  }
  return value;
}

function assertUnknownRecord(value: unknown): asserts value is UnknownRecord {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  assert.equal(Array.isArray(value), false);
}

function assertFixturePayload(value: unknown): asserts value is FixturePayload {
  assertUnknownRecord(value);
}

function isFixtureFactory(value: unknown): value is () => unknown {
  return typeof value === "function";
}

function liveContext(expectedContext: ExpectedContext): ContextProbePayload {
  const context = structuredClone(expectedContext);
  const { tabId } = context.document;
  if (tabId === undefined || tabId.length === 0) {
    throw new Error("Fixture context requires a tab ID.");
  }
  return { ...context, document: { ...context.document, tabId } };
}

async function executeReader(
  request: unknown,
  eda: unknown,
): Promise<FixturePayload> {
  const payload = await new AsyncFunction("eda", buildExactReadCode(request))(
    eda,
  );
  assertFixturePayload(payload);
  return payload;
}

function stateObject(values: UnknownRecord): StateObject {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      `getState_${name}`,
      async () => (isFixtureFactory(value) ? value() : structuredClone(value)),
    ]),
  );
}

function schematicComponent(
  primitiveId = "sch-r1",
  designator = "R1",
  uniqueId = "gge1",
): StateObject {
  return stateObject({
    PrimitiveId: primitiveId,
    PrimitiveType: "Component",
    ComponentType: "Normal",
    Component: { uuid: "device-1" },
    Symbol: { uuid: "symbol-1" },
    Footprint: { uuid: "footprint-1" },
    X: 100,
    Y: 200,
    Rotation: 90,
    Mirror: false,
    SubPartName: null,
    AddIntoBom: true,
    AddIntoPcb: true,
    Net: null,
    Designator: designator,
    Name: "10k",
    UniqueId: uniqueId,
    Manufacturer: "Fixture Inc.",
    ManufacturerId: "FIX-10K",
    Supplier: "Fixture Supply",
    SupplierId: "C1",
    OtherProperty: { tolerance: "1%" },
  });
}

function schematicPin(primitiveId = "pin-1"): StateObject {
  return stateObject({
    PrimitiveId: primitiveId,
    PinNumber: "1",
    PinName: "A",
    X: 95,
    Y: 200,
    Rotation: 0,
    PinLength: 10,
    PinColor: "#000000",
    PinShape: "Line",
    pinType: "Passive",
    NoConnected: false,
    OtherProperty: {},
  });
}

function schematicApis({
  components = [schematicComponent()],
  declaredIds = ["sch-r1"],
  pins = [schematicPin()],
  getAll = async () => components,
}: SchematicApiOptions = {}): SchematicApis {
  return {
    sch_PrimitiveComponent: {
      getAll,
      getAllPrimitiveId: async () => declaredIds,
      getAllPinsByPrimitiveId: async () => pins,
    },
    sch_Primitive: {
      getPrimitivesBBox: async () => ({
        minX: 90,
        minY: 190,
        maxX: 110,
        maxY: 210,
      }),
    },
  };
}

function pcbComponent(
  primitiveId = "pcb-u1",
  designator = "U1",
  padSummary?: unknown,
): StateObject {
  return stateObject({
    PrimitiveId: primitiveId,
    PrimitiveType: "Component",
    Component: { uuid: "device-1" },
    Footprint: { uuid: "land-1" },
    Model3D: { uuid: "model-1" },
    Layer: 1,
    X: 2650,
    Y: -6265,
    Rotation: 180,
    PrimitiveLock: true,
    AddIntoBom: true,
    Designator: designator,
    Pads: padSummary,
    Name: "Fixture IC",
    UniqueId: "gge2",
    Manufacturer: "Fixture Inc.",
    ManufacturerId: "FIX-IC",
    Supplier: "Fixture Supply",
    SupplierId: "C2",
    OtherProperty: {},
  });
}

function pcbPad({
  primitiveId = "pad-1",
  primitiveType = "ComponentPad",
  parentComponentPrimitiveId = "pcb-u1",
  padType = 1,
}: PcbPadOptions = {}): StateObject {
  return stateObject({
    PrimitiveId: primitiveId,
    PrimitiveType: primitiveType,
    ParentComponentPrimitiveId: parentComponentPrimitiveId,
    Layer: 99,
    PadNumber: "1",
    X: 2841.732283464567,
    Y: -6215,
    Rotation: 0,
    Pad: ["ELLIPSE", 67, 67],
    SpecialPad: [[1, 1, ["RECT", 60, 40, 0]]],
    Net: "GND",
    Hole: ["ROUND", 126],
    HoleOffsetX: 0,
    HoleOffsetY: 0,
    HoleRotation: 0,
    Metallization: true,
    PadType: padType,
    SolderMaskAndPasteMaskExpansion: {
      topSolderMask: 4,
      bottomSolderMask: 4,
      topPasteMask: 0,
      bottomPasteMask: 0,
    },
    HeatWelding: {
      connectionMethod: "Divergent",
      divergenceSpacing: 8,
      divergenceLineWidth: 10,
      divergenceAngle: 45,
    },
    PrimitiveLock: true,
  });
}

function pcbComponentApis({
  components,
  declaredIds = ["pcb-u1"],
  pads,
  bbox = {
    minX: 558.2677165354326,
    minY: -7120.511811023622,
    maxX: 2841.732283464567,
    maxY: -6215,
  },
}: PcbComponentApiOptions = {}): UnknownRecord {
  const directPads = pads ?? [pcbPad()];
  const directComponents = components ?? [
    pcbComponent(
      "pcb-u1",
      "U1",
      directPads.map(() => ({ primitiveId: "pad-1" })),
    ),
  ];
  return {
    pcb_PrimitiveComponent: {
      getAll: async () => directComponents,
      getAllPrimitiveId: async () => declaredIds,
      getAllPinsByPrimitiveId: async () => directPads,
    },
    pcb_Primitive: {
      getPrimitivesBBox: async () => bbox,
    },
  };
}

const inventoryDefinitions = [
  ["components", "pcb_PrimitiveComponent"],
  ["pads", "pcb_PrimitivePad"],
  ["vias", "pcb_PrimitiveVia"],
  ["lines", "pcb_PrimitiveLine"],
  ["arcs", "pcb_PrimitiveArc"],
  ["strings", "pcb_PrimitiveString"],
  ["attributes", "pcb_PrimitiveAttribute"],
  ["polylines", "pcb_PrimitivePolyline"],
  ["regions", "pcb_PrimitiveRegion"],
  ["pours", "pcb_PrimitivePour"],
  ["fills", "pcb_PrimitiveFill"],
  ["dimensions", "pcb_PrimitiveDimension"],
  ["images", "pcb_PrimitiveImage"],
  ["objects", "pcb_PrimitiveObject"],
] as const;

function inventoryApis({
  padType = 1,
  viaType = 0,
  interactiveMode = 0,
}: InventoryOptions = {}): InventoryEda {
  const eda: Record<string, InventoryApi | undefined> = {};
  const monitoredFamilies = new Set([
    "pads",
    "vias",
    "lines",
    "arcs",
    "polylines",
    "regions",
    "pours",
    "fills",
  ]);
  for (const [family, apiName] of inventoryDefinitions) {
    const primitiveId = `${family}-1`;
    let objects: StateObject[];
    if (family === "components") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          Pads: [
            { primitiveId: "component-pad-1", padNumber: "1", net: "GND" },
          ],
        }),
      ];
    } else if (family === "pads") {
      objects = [
        pcbPad({
          primitiveId: "component-pad-1",
          primitiveType: "ComponentPad",
          parentComponentPrimitiveId: "components-1",
          padType,
        }),
        pcbPad({
          primitiveId: "pad-standalone-1",
          primitiveType: "Pad",
          parentComponentPrimitiveId: "",
          padType,
        }),
      ];
    } else if (family === "vias") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          PrimitiveType: "Via",
          Net: "GND",
          X: 100,
          Y: 200,
          HoleDiameter: 12,
          Diameter: 24,
          ViaType: viaType,
          DesignRuleBlindViaName: null,
          SolderMaskExpansion: { topSolderMask: 2, bottomSolderMask: 2 },
          PrimitiveLock: false,
        }),
      ];
    } else if (family === "arcs") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          PrimitiveType: "Arc",
          Net: "GND",
          Layer: 1,
          StartX: 0,
          StartY: 0,
          EndX: 10,
          EndY: 10,
          LineWidth: 5,
          PrimitiveLock: false,
          ArcAngle: 90,
          InteractiveMode: interactiveMode,
        }),
      ];
    } else if (family === "pours") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          PrimitiveType: "Pour",
          Net: "GND",
          Layer: 1,
          ComplexPolygon: (): UnknownRecord => ({
            getSource: () => ({ paths: [[0, 0, 20, 20]] }),
          }),
          PourFillMethod: { mode: "solid" },
          PreserveSilos: true,
          PourName: "GND plane",
          PourPriority: 1,
          LineWidth: 5,
          PrimitiveLock: false,
        }),
      ];
    } else if (family === "regions") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          PrimitiveType: "Region",
          Layer: 1,
          ComplexPolygon: (): UnknownRecord => ({
            getSource: () => ({ paths: [[0, 0, 10, 10]] }),
          }),
          RuleType: () => {
            throw new Error(
              "unreliable region RuleType getter must not be called",
            );
          },
          RegionName: "Keepout",
          LineWidth: 5,
          PrimitiveLock: false,
        }),
      ];
    } else if (family === "fills") {
      objects = [
        stateObject({
          PrimitiveId: primitiveId,
          PrimitiveType: "Fill",
          Net: "GND",
          Layer: 1,
          ComplexPolygon: (): UnknownRecord => ({
            getSource: () => ({ paths: [[0, 0, 5, 5]] }),
          }),
          FillMode: () => {
            throw new Error("hardcoded FillMode getter must not be called");
          },
          LineWidth: 5,
          PrimitiveLock: false,
        }),
      ];
    } else if (monitoredFamilies.has(family)) {
      objects = [];
    } else {
      objects = [stateObject({ PrimitiveId: primitiveId })];
    }
    eda[apiName] = {
      getAllPrimitiveId: async (): Promise<unknown[]> =>
        Promise.all(
          objects.map((object) => {
            const getter = object["getState_PrimitiveId"];
            if (!getter) {
              throw new Error("Fixture primitive has no primitive-ID getter.");
            }
            return getter();
          }),
        ),
      getAll: async (): Promise<StateObject[]> => objects,
    };
  }
  const pouredObject = stateObject({
    PrimitiveId: "pours-1",
    PrimitiveType: "Poured",
    PourPrimitiveId: "pours-1",
    PourFills: () => [
      {
        id: "poured-fill-piece-1",
        path: { getSource: (): UnknownRecord => ({ paths: [[0, 0, 20, 20]] }) },
        lineWidth: 5,
        fill: true,
      },
    ],
  });
  eda["pcb_PrimitivePoured"] = {
    getAllPrimitiveId: async (): Promise<string[]> => ["pours-1"],
    getAll: async (): Promise<StateObject[]> => [pouredObject],
  };
  const componentApi = eda["pcb_PrimitiveComponent"];
  const pouredApi = eda["pcb_PrimitivePoured"];
  if (componentApi === undefined || pouredApi === undefined) {
    throw new Error(
      "PCB inventory fixture omitted a required component or poured API.",
    );
  }
  return {
    ...eda,
    pcb_PrimitiveComponent: componentApi,
    pcb_PrimitivePoured: pouredApi,
  };
}

function rulesApis(differentialPairs: unknown): RulesApis {
  return {
    pcb_Drc: {
      getCurrentRuleConfigurationName: async () => "Fixture Six Layer",
      getCurrentRuleConfiguration: async () => ({
        name: "Fixture Six Layer",
        config: { id: "configuration-1" },
      }),
      getNetRules: async () => [
        {
          type: "group",
          name: "USB",
          sub: [
            { type: "net", name: "DM", rule: "default" },
            { type: "net", name: "DP", rule: "default" },
          ],
        },
        { type: "net", name: "GND", rule: "default" },
      ],
      getNetByNetRules: async () => ({ GND: [] }),
      getRegionRules: async () => [{ id: "region-1" }],
      getAllNetClasses: async () => [
        { name: "Ground", nets: ["GND"], color: null },
      ],
      getAllDifferentialPairs: async () => differentialPairs,
      getAllEqualLengthNetGroups: async () => [],
      getAllPadPairGroups: async () => [
        { name: "Length fixture", padPairs: [["U1.1", "U2.1"]] },
      ],
      getPadPairGroupMinWireLength: async () => [
        { padPair: ["U1.1", "U2.1"], minWireLength: 1250 },
      ],
    },
    pcb_Net: { getAllNetsName: async () => ["DM", "DP", "GND"] },
  };
}

function topologyApis({
  onFormat,
  onComponentCall,
  componentUniqueId = "gge1",
  componentDesignator = "R1",
  componentPinNumbers = ["1"],
  netlistUniqueId = "gge1",
  netlistDesignator = "R1",
  netlistPinNumbers = ["1"],
}: TopologyOptions = {}): TopologyApis {
  const component = schematicComponent(
    "sch-r1",
    componentDesignator,
    componentUniqueId,
  );
  return {
    sch_PrimitiveComponent: {
      getAll: async (...args: unknown[]) => {
        onComponentCall?.("getAll", args);
        return [component];
      },
      getAllPrimitiveId: async (...args: unknown[]) => {
        onComponentCall?.("getAllPrimitiveId", args);
        return ["sch-r1"];
      },
      getAllPinsByPrimitiveId: async (...args: unknown[]) => {
        onComponentCall?.("getAllPinsByPrimitiveId", args);
        return componentPinNumbers.map((pinNumber, index) =>
          stateObject({
            PrimitiveId: `pin-${index + 1}`,
            PinNumber: pinNumber,
          }),
        );
      },
    },
    sch_Netlist: {
      getNetlist: async (format: string) => {
        onFormat?.(format);
        return JSON.stringify({
          components: {
            [netlistUniqueId]: {
              props: {
                "Unique ID": netlistUniqueId,
                Designator: netlistDesignator,
              },
              pinInfoMap: Object.fromEntries(
                netlistPinNumbers.map((pinNumber) => [
                  pinNumber,
                  { number: pinNumber, net: "GND" },
                ]),
              ),
            },
          },
        });
      },
    },
  };
}

void describe("facade-owned exact reader contracts", () => {
  void test("enforces strict request schemas, one selector, and the editor document type", () => {
    assert.throws(
      () =>
        exactReadRequestSchema.parse({ kind: "pcb-inventory", extra: true }),
      /unrecognized key/iu,
    );
    assert.throws(
      () =>
        exactReadRequestSchema.parse({
          kind: "schematic-components",
          selector: { all: true, primitiveIds: ["sch-r1"] },
        }),
      /exactly one/iu,
    );
    assert.throws(
      () =>
        exactReadRequestSchema.parse({
          kind: "pcb-components",
          selector: { primitiveIds: ["pcb-u1", "pcb-u1"] },
        }),
      /duplicates/iu,
    );
    assert.throws(
      () =>
        validateExactReadRequest(
          { kind: "schematic-components", selector: { all: true } },
          { document: { documentType: 3 } },
        ),
      /requires document type 1, not 3/u,
    );
    assert.equal(exactReadDocumentType("pcb-rules"), 3);
    assert.throws(
      () => exactReadDocumentType("library-components"),
      /Unsupported exact-reader kind/u,
    );
  });

  void test("uses only the declared lower-case EasyEDA API and fails on missing APIs", async () => {
    const request: ExactReadRequest = {
      kind: "schematic-components",
      selector: { all: true },
      includePins: false,
      includeBounds: false,
    };
    const source = buildExactReadCode(request);
    assert.match(source, /const value = eda\[lower\]/u);
    assert.doesNotMatch(source, /eda\[_upper\]/u);

    await assert.rejects(
      executeReader(request, {
        SCH_PrimitiveComponent: schematicApis().sch_PrimitiveComponent,
      }),
      /sch_PrimitiveComponent API is unavailable/u,
    );
    const payload = await executeReader(request, schematicApis());
    assert.deepEqual(payload.primitiveIds, ["sch-r1"]);
  });

  void test("rejects non-array enumerations and component ID-set mismatches", async () => {
    const request: ExactReadRequest = {
      kind: "schematic-components",
      selector: { all: true },
      includePins: false,
      includeBounds: false,
    };
    await assert.rejects(
      executeReader(request, schematicApis({ getAll: async () => ({}) })),
      /component getAll did not return an array/u,
    );
    await assert.rejects(
      executeReader(request, schematicApis({ declaredIds: ["different-id"] })),
      /component ID and object enumerations disagree/u,
    );
  });

  void test("reports Component3-backed schematic fields while omitting unobservable pin properties", async () => {
    const request: ExactReadRequest = {
      kind: "schematic-components",
      selector: { primitiveIds: ["sch-r1"] },
      includePins: true,
      includeBounds: false,
    };
    const payload = await executeReader(request, schematicApis());
    const component = payload.byPrimitiveId["sch-r1"];
    const pin = required(component.pins[0], "schematic pin");
    assert.equal(component.cbb, null);
    assert.equal(component.cbbSymbol, null);
    assert.equal(pin.x, 95);
    assert.equal(pin.y, 200);
    assert.equal(pin.noConnected, false);
    assert.equal(Object.hasOwn(pin, "otherProperty"), false);
    assert.match(payload.limitations.componentPinOtherProperty, /Omitted/u);
    assert.match(
      payload.limitations.componentOtherPropertyFiltering,
      /Adapter-filtered/u,
    );
    assert.match(payload.limitations.cbbLibraryOwnership, /Unavailable/u);

    const malformedPinColor = structuredClone(payload);
    required(
      malformedPinColor.byPrimitiveId["sch-r1"].pins[0],
      "malformed schematic pin",
    ).pinColor = { red: 0 };
    assert.throws(
      () => validateExactReadPayload(malformedPinColor, request),
      /pinColor must be a string or null/u,
    );
  });

  void test("normalizes library-association placeholders without dropping real UUID identities", async () => {
    const component = schematicComponent();
    component["getState_Component"] = async (): Promise<unknown> => ({});
    component["getState_Cbb"] = async (): Promise<unknown> => ({
      libraryUuid: "",
      uuid: "",
      name: "",
    });
    component["getState_CbbSymbol"] = async (): Promise<unknown> => ({
      libraryUuid: "",
      cbbUuid: "cbb-symbol-1",
      name: "CBB symbol",
    });
    component["getState_Symbol"] = async (): Promise<unknown> => ({
      uuid: "",
      name: "",
    });
    component["getState_Footprint"] = async (): Promise<unknown> => ({
      libraryUuid: "library-1",
      uuid: "footprint-1",
      name: "Real footprint",
    });

    const payload = await executeReader(
      {
        kind: "schematic-components",
        selector: { primitiveIds: ["sch-r1"] },
        includePins: false,
        includeBounds: false,
      },
      schematicApis({ components: [component] }),
    );
    const record = payload.byPrimitiveId["sch-r1"];
    assert.equal(record.component, null);
    assert.equal(record.cbb, null);
    assert.equal(record.symbol, null);
    assert.deepEqual(record.cbbSymbol, {
      cbbUuid: "cbb-symbol-1",
      name: "CBB symbol",
    });
    assert.deepEqual(record.footprint, {
      libraryUuid: "library-1",
      uuid: "footprint-1",
      name: "Real footprint",
    });
  });

  void test("rejects observable partial library associations without an identity UUID", async () => {
    for (const association of [
      { libraryUuid: "library-only" },
      { name: "named but unidentified" },
      { libraryUuid: "library-only", name: "named but unidentified" },
    ]) {
      const component = schematicComponent();
      component["getState_Component"] = async (): Promise<unknown> =>
        association;
      await assert.rejects(
        executeReader(
          {
            kind: "schematic-components",
            selector: { all: true },
            includePins: false,
            includeBounds: false,
          },
          schematicApis({ components: [component] }),
        ),
        /nonidentity association fields without an observable UUID/u,
      );
    }
  });

  void test("rejects string and object coercion for typed boolean and identity fields", async () => {
    const stringBoolean = schematicComponent();
    stringBoolean["getState_Mirror"] = async (): Promise<unknown> => "false";
    await assert.rejects(
      executeReader(
        {
          kind: "schematic-components",
          selector: { all: true },
          includePins: false,
          includeBounds: false,
        },
        schematicApis({ components: [stringBoolean] }),
      ),
      /schematic component mirror is not boolean/u,
    );

    const coercibleIdentity = schematicComponent();
    coercibleIdentity["getState_PrimitiveId"] = async (): Promise<unknown> => ({
      toString: (): string => "sch-r1",
    });
    await assert.rejects(
      executeReader(
        {
          kind: "schematic-components",
          selector: { all: true },
          includePins: false,
          includeBounds: false,
        },
        schematicApis({ components: [coercibleIdentity] }),
      ),
      /component primitive ID is not a valid string/u,
    );

    const pcbStringBoolean = pcbComponent();
    pcbStringBoolean["getState_PrimitiveLock"] = async (): Promise<unknown> =>
      "false";
    await assert.rejects(
      executeReader(
        {
          kind: "pcb-components",
          selector: { all: true },
          includePins: false,
          includeBounds: false,
        },
        pcbComponentApis({ components: [pcbStringBoolean], pads: [] }),
      ),
      /PCB component lock state is not boolean/u,
    );
  });

  void test("preserves PCB pad identity, parentage, bounds, and raw transformed mil positions", async () => {
    const request: ExactReadRequest = {
      kind: "pcb-components",
      selector: { all: true },
      includePins: true,
      includeBounds: true,
    };
    const payload = await executeReader(request, pcbComponentApis());
    const component = payload.byPrimitiveId["pcb-u1"];
    const pad = required(component.pads[0], "PCB component pad");
    assert.deepEqual(payload.units, {
      coordinates: "mil",
      bounds: "mil",
      transformedPadCoordinates: "mil",
    });
    assert.equal(pad.primitiveId, "pad-1");
    assert.equal(pad.primitiveType, "ComponentPad");
    assert.equal(pad.parentComponentPrimitiveId, "pcb-u1");
    assert.equal(pad.x, 2841.732283464567);
    assert.equal(component.bounds.minX, 558.2677165354326);
    assert.equal(pad.hole, undefined);
    assert.equal(pad.bounds, undefined);
    assert.equal(
      pad.source,
      "component-pin-wrapper-transformed-placement-only",
    );
    assert.match(
      payload.limitations.componentPadWrapper,
      /0\.1 drill-scale defect/u,
    );

    const wrongTypePad = pcbPad({ primitiveType: "Pad" });
    const wrongTypeApis = pcbComponentApis({ pads: [wrongTypePad] });
    await assert.rejects(
      executeReader(request, wrongTypeApis),
      /pad type mismatch/u,
    );
    const wrongParentPad = pcbPad({ parentComponentPrimitiveId: "pcb-other" });
    const wrongParentApis = pcbComponentApis({ pads: [wrongParentPad] });
    await assert.rejects(
      executeReader(request, wrongParentApis),
      /pad parent mismatch/u,
    );
    const firstDuplicatePad = pcbPad();
    const secondDuplicatePad = pcbPad();
    const duplicatePadApis = pcbComponentApis({
      pads: [firstDuplicatePad, secondDuplicatePad],
    });
    await assert.rejects(
      executeReader(request, duplicatePadApis),
      /duplicate primitive IDs/u,
    );
  });

  void test("enumerates direct pads once and models component pads and poured state as correlations", async () => {
    const payload = await executeReader(
      { kind: "pcb-inventory" },
      inventoryApis(),
    );
    assert.deepEqual(
      Object.keys(payload.families).toSorted(),
      inventoryDefinitions.map(([family]) => family).toSorted(),
    );
    for (const family of Object.values(payload.families)) {
      assert.equal(family.status, "adapter-enumerated");
      assert.equal(family.count, family.primitiveIds.length);
    }
    assert.equal(Object.hasOwn(payload.families, "componentPads"), false);
    assert.equal(Object.hasOwn(payload.families, "poured"), false);
    assert.equal(payload.componentPadCorrelation.status, "exact-subset");
    assert.equal(payload.componentPadCorrelation.count, 1);
    assert.deepEqual(
      payload.componentPadCorrelation.byPrimitiveId["component-pad-1"],
      {
        primitiveId: "component-pad-1",
        parentComponentPrimitiveId: "components-1",
        padNumber: "1",
        net: "GND",
        source: "component-getState_Pads",
      },
    );
    assert.deepEqual(payload.componentPadCorrelation.byComponentPrimitiveId, {
      "components-1": ["component-pad-1"],
    });
    assert.equal(
      payload.families.pads.byPrimitiveId["component-pad-1"]
        .parentComponentPrimitiveId,
      "components-1",
    );
    assert.deepEqual(
      payload.families.pads.byPrimitiveId["component-pad-1"].pad,
      ["ELLIPSE", 67, 67],
    );
    assert.deepEqual(
      payload.families.pads.byPrimitiveId["component-pad-1"].specialPad,
      [[1, 1, ["RECT", 60, 40, 0]]],
    );
    assert.deepEqual(
      payload.families.pads.byPrimitiveId["component-pad-1"].hole,
      ["ROUND", 126],
    );
    assert.equal(
      payload.families.pads.byPrimitiveId["pad-standalone-1"].padType,
      1,
    );
    assert.equal(payload.families.vias.byPrimitiveId["vias-1"].viaType, 0);
    assert.equal(
      payload.families.arcs.byPrimitiveId["arcs-1"].interactiveMode,
      0,
    );
    assert.equal(
      Object.hasOwn(
        payload.families.regions.byPrimitiveId["regions-1"],
        "ruleType",
      ),
      false,
    );
    assert.equal(
      Object.hasOwn(
        payload.families.fills.byPrimitiveId["fills-1"],
        "fillMode",
      ),
      false,
    );
    assert.match(payload.limitations.regionRuleTypes, /Omitted/u);
    assert.match(payload.limitations.fillModes, /Omitted/u);
    assert.match(payload.limitations.arcPrecision, /rounded to one decimal/u);
    assert.match(payload.limitations.viaPrecision, /rounded to one decimal/u);
    assert.equal(
      payload.families.pads.byPrimitiveId["component-pad-1"].source,
      "pcb_PrimitivePad-direct-state",
    );
    assert.equal(payload.physicalPadCount, 2);
    assert.equal(payload.standalonePadCount, 1);
    assert.equal(
      payload.enumeratedPrimitiveCount,
      Object.values(payload.families).reduce(
        (count, family) => count + family.count,
        0,
      ),
    );
    assert.equal(payload.pouredCorrelation.status, "derived-subset");
    assert.deepEqual(payload.pouredCorrelation.pourPrimitiveIds, ["pours-1"]);
    assert.equal(
      payload.pouredCorrelation.byPourPrimitiveId["pours-1"].pourPrimitiveId,
      "pours-1",
    );
    assert.deepEqual(
      Object.keys(
        payload.pouredCorrelation.byPourPrimitiveId["pours-1"],
      ).toSorted(),
      [
        "pourFills",
        "pourPrimitiveId",
        "primitiveId",
        "primitiveType",
      ].toSorted(),
    );
    assert.deepEqual(
      payload.pouredCorrelation.byPourPrimitiveId["pours-1"].pourFills.map(
        ({ id }) => id,
      ),
      ["poured-fill-piece-1"],
    );
    assert.equal(payload.pouredFillPieceCount, 1);

    const omittedPrecision = structuredClone(payload);
    delete (omittedPrecision.limitations as Partial<FixtureRecord>)
      .arcPrecision;
    assert.throws(
      () =>
        validateExactReadPayload(omittedPrecision, { kind: "pcb-inventory" }),
      /omitted primitive families/u,
    );

    const wrongComponentIndex = structuredClone(payload);
    wrongComponentIndex.componentPadCorrelation.byComponentPrimitiveId[
      "components-1"
    ] = [];
    assert.throws(
      () =>
        validateExactReadPayload(wrongComponentIndex, {
          kind: "pcb-inventory",
        }),
      /component-to-pad index is inconsistent/u,
    );

    const unexpectedFamilyState = structuredClone(payload);
    unexpectedFamilyState.families.vias.byPrimitiveId["vias-1"].unreviewed =
      true;
    assert.throws(
      () =>
        validateExactReadPayload(unexpectedFamilyState, {
          kind: "pcb-inventory",
        }),
      /missing or unexpected fields/u,
    );

    const malformedHostShapes: readonly (readonly [
      (candidate: FixturePayload) => void,
      RegExp,
    ])[] = [
      [
        (candidate) => {
          candidate.families.pads.byPrimitiveId["component-pad-1"].pad = {};
        },
        /pad-shape tuple/u,
      ],
      [
        (candidate) => {
          candidate.families.pads.byPrimitiveId["component-pad-1"].specialPad =
            [[1]];
        },
        /malformed layer tuple/u,
      ],
      [
        (candidate) => {
          candidate.families.pads.byPrimitiveId["component-pad-1"].hole = [
            "SLOT",
            126,
          ];
        },
        /wrong tuple length/u,
      ],
      [
        (candidate) => {
          candidate.families.pads.byPrimitiveId[
            "component-pad-1"
          ].solderMaskAndPasteMaskExpansion = { topSolderMask: "4" };
        },
        /topSolderMask must be finite/u,
      ],
      [
        (candidate) => {
          candidate.families.pads.byPrimitiveId["component-pad-1"].heatWelding =
            {
              enabled: false,
            };
        },
        /malformed connection method or unexpected field/u,
      ],
      [
        (candidate) => {
          candidate.families.vias.byPrimitiveId["vias-1"].solderMaskExpansion =
            { top: 2 };
        },
        /unexpected field/u,
      ],
    ];
    for (const [mutate, expectedError] of malformedHostShapes) {
      const candidate = structuredClone(payload);
      mutate(candidate);
      assert.throws(
        () => validateExactReadPayload(candidate, { kind: "pcb-inventory" }),
        expectedError,
      );
    }

    const wrongGlobalTotal = structuredClone(payload);
    wrongGlobalTotal.enumeratedPrimitiveCount += 1;
    assert.throws(
      () =>
        validateExactReadPayload(wrongGlobalTotal, { kind: "pcb-inventory" }),
      /wrong total/u,
    );

    const malformedPouredRow = structuredClone(payload);
    malformedPouredRow.pouredCorrelation.byPourPrimitiveId[
      "pours-1"
    ].pourPrimitiveId = "different-pour";
    assert.throws(
      () =>
        validateExactReadPayload(malformedPouredRow, { kind: "pcb-inventory" }),
      /poured-state record is malformed/u,
    );

    const missingComponentPad = inventoryApis();
    missingComponentPad.pcb_PrimitiveComponent.getAll =
      async (): Promise<unknown> => [
        stateObject({
          PrimitiveId: "components-1",
          Pads: [
            {
              primitiveId: "missing-component-pad",
              padNumber: "1",
              net: "GND",
            },
          ],
        }),
      ];
    await assert.rejects(
      executeReader({ kind: "pcb-inventory" }, missingComponentPad),
      /absent from pcb_PrimitivePad/u,
    );

    const orphanPouredState = inventoryApis();
    const orphan = stateObject({
      PrimitiveId: "missing-pour",
      PrimitiveType: "Poured",
      PourPrimitiveId: "missing-pour",
      PourFills: [],
    });
    orphanPouredState.pcb_PrimitivePoured.getAllPrimitiveId =
      async (): Promise<unknown> => ["missing-pour"];
    orphanPouredState.pcb_PrimitivePoured.getAll =
      async (): Promise<unknown> => [orphan];
    await assert.rejects(
      executeReader({ kind: "pcb-inventory" }, orphanPouredState),
      /parent absent from pcb_PrimitivePour/u,
    );

    const missingFamily = inventoryApis();
    delete missingFamily.pcb_PrimitiveImage;
    await assert.rejects(
      executeReader({ kind: "pcb-inventory" }, missingFamily),
      /pcb_PrimitiveImage API is unavailable/u,
    );
    for (const options of [
      { padType: "ThroughHole" },
      { viaType: 1.5 },
      { interactiveMode: "interactive" },
    ]) {
      await assert.rejects(
        executeReader({ kind: "pcb-inventory" }, inventoryApis(options)),
        /is not finite|is not an integer enum/u,
      );
    }
  });

  void test("normalizes rule arrays and object-keyed branches while enforcing exact shapes", async () => {
    for (const differentialPairs of [
      [],
      [{ name: "DP1", positiveNet: "DP", negativeNet: "DM" }],
    ]) {
      const payload = await executeReader(
        { kind: "pcb-rules" },
        rulesApis(differentialPairs),
      );
      assert.deepEqual(payload.rules.differentialPairs, differentialPairs);
      assert.deepEqual(payload.nets, ["DM", "DP", "GND"]);
      assert.deepEqual(payload.rules.padPairGroups, [
        {
          name: "Length fixture",
          padPairs: [["U1.1", "U2.1"]],
          minimumWireLengths: [
            { padPair: ["U1.1", "U2.1"], minWireLength: 1250 },
          ],
        },
      ]);
      assert.equal(payload.units.padPairMinimumWireLength, "mil");
    }

    const badNetRules = rulesApis([]);
    badNetRules.pcb_Drc.getNetRules = async (): Promise<unknown> => ({});
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, badNetRules),
      /PCB net rules did not return an array/u,
    );
    const badNetByNet = rulesApis([]);
    badNetByNet.pcb_Drc.getNetByNetRules = async (): Promise<unknown> => [];
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, badNetByNet),
      /PCB net-to-net rules did not return an object/u,
    );
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, rulesApis({ DP1: {} })),
      /PCB differential pairs did not return an array/u,
    );

    const mismatchedConfiguration = rulesApis([]);
    mismatchedConfiguration.pcb_Drc.getCurrentRuleConfiguration =
      async (): Promise<unknown> => ({
        name: "Different configuration",
        config: {},
      });
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, mismatchedConfiguration),
      /configuration getters disagree/u,
    );
    const malformedConfiguration = rulesApis([]);
    malformedConfiguration.pcb_Drc.getCurrentRuleConfiguration =
      async (): Promise<unknown> => ({
        name: "Fixture Six Layer",
      });
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, malformedConfiguration),
      /omitted its config object/u,
    );
    const emptyConfiguration = rulesApis([]);
    emptyConfiguration.pcb_Drc.getCurrentRuleConfiguration =
      async (): Promise<unknown> => ({
        name: "Fixture Six Layer",
        config: {},
      });
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, emptyConfiguration),
      /configuration config is empty/u,
    );

    const missingRuleLeaf = rulesApis([]);
    missingRuleLeaf.pcb_Drc.getNetRules = async (): Promise<unknown> => [
      { type: "net", name: "DM", rule: "default" },
      { type: "net", name: "GND", rule: "default" },
    ];
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, missingRuleLeaf),
      /rule leaves do not cover every live net exactly once/u,
    );

    const duplicateRuleLeaf = rulesApis([]);
    duplicateRuleLeaf.pcb_Drc.getNetRules = async (): Promise<unknown> => [
      { type: "net", name: "DM", rule: "default" },
      { type: "net", name: "DP", rule: "default" },
      { type: "net", name: "GND", rule: "default" },
      { type: "net", name: "GND", rule: "duplicate" },
    ];
    await assert.rejects(
      executeReader({ kind: "pcb-rules" }, duplicateRuleLeaf),
      /duplicate net leaves/u,
    );

    const validPayload = await executeReader(
      { kind: "pcb-rules" },
      rulesApis([]),
    );
    assert.throws(
      () =>
        validateExactReadPayload(
          {
            ...validPayload,
            rules: {
              ...validPayload.rules,
              configuration: { name: "Different configuration", config: {} },
            },
          },
          { kind: "pcb-rules" },
        ),
      /omitted rules or nets/u,
    );
    const missingValidatedLeaf = structuredClone(validPayload);
    required(
      missingValidatedLeaf.rules.netRules[0],
      "first net-rule row",
    ).sub.pop();
    assert.throws(
      () =>
        validateExactReadPayload(missingValidatedLeaf, { kind: "pcb-rules" }),
      /rule leaves do not cover every live net exactly once/u,
    );
  });

  void test("uses only compiled JLCEDA connectivity and disclaims unavailable wire geometry", async () => {
    const request: ExactReadRequest = { kind: "schematic-topology" };
    const formats: string[] = [];
    const componentCalls: { method: string; args: unknown[] }[] = [];
    const rawPayload = await executeReader(
      request,
      topologyApis({
        onFormat: (format: string) => {
          formats.push(format);
        },
        onComponentCall: (method: string, args: unknown[]) => {
          componentCalls.push({ method, args });
        },
      }),
    );
    assert.deepEqual(formats, ["JLCEDA"]);
    assert.deepEqual(componentCalls, [
      { method: "getAll", args: ["part", true] },
      { method: "getAllPrimitiveId", args: ["part", true] },
      { method: "getAllPinsByPrimitiveId", args: ["sch-r1"] },
    ]);
    assert.deepEqual(rawPayload.authority, {
      connectivity: "sch_Netlist.getNetlist(JLCEDA)",
      wireGeometry: "unavailable",
    });
    assert.equal(rawPayload.limitations.length, 2);
    assert.equal(Object.hasOwn(rawPayload, "wires"), false);
    assert.equal(Object.hasOwn(rawPayload, "netNames"), false);
    assert.equal(Object.hasOwn(rawPayload, "netTree"), false);
    assert.deepEqual(rawPayload.compiledConnectivity, [
      {
        uniqueId: "gge1",
        designator: "R1",
        pins: [{ pinNumber: "1", net: "GND" }],
      },
    ]);
    assert.deepEqual(rawPayload.componentCorrelation, {
      status: "exact-match",
      source: "sch_PrimitiveComponent.getAll(part,true)",
      componentCount: 1,
      pinCount: 1,
      primitiveIds: ["sch-r1"],
      uniqueIds: ["gge1"],
      byUniqueId: {
        gge1: {
          primitiveId: "sch-r1",
          designator: "R1",
          pinNumbers: ["1"],
        },
      },
    });

    const upstream = {
      async callTool(): Promise<unknown> {
        return {
          structuredContent: { ok: true, result: structuredClone(rawPayload) },
        };
      },
    };
    const engine = new EasyedaControlEngine(upstream);
    engine.assertContext = async (
      expectedContext,
    ): Promise<ContextProbePayload> => liveContext(expectedContext);
    const compact = await engine.exactRead(request, {
      project: { uuid: "project-1", path: "/tmp/project.eprj2" },
      document: { uuid: "document-1", documentType: 1, tabId: "tab-1" },
    });
    assert.deepEqual(
      compact["compiledConnectivity"],
      rawPayload.compiledConnectivity,
    );
    const readConsistency = compact["read_consistency"];
    assertUnknownRecord(readConsistency);
    assert.equal(readConsistency["stable"], true);
    assert.equal(readConsistency["attempts"], 2);

    assert.throws(
      () =>
        validateExactReadPayload(
          {
            ...rawPayload,
            authority: { ...rawPayload.authority, wireGeometry: "complete" },
          },
          request,
        ),
      /omitted compiled connectivity provenance/u,
    );
    assert.throws(
      () =>
        validateExactReadPayload(
          {
            ...rawPayload,
            componentCorrelation: {
              ...rawPayload.componentCorrelation,
              byUniqueId: {
                gge1: {
                  ...rawPayload.componentCorrelation.byUniqueId.gge1,
                  pinNumbers: ["2"],
                },
              },
            },
          },
          request,
        ),
      /compiled and public component state disagree/u,
    );
    const malformed = topologyApis();
    malformed.sch_Netlist.getNetlist = async (): Promise<unknown> =>
      "not JSON connectivity";
    await assert.rejects(
      executeReader(request, malformed),
      /JSON sequence could not be parsed/u,
    );
    await assert.rejects(
      executeReader(
        request,
        topologyApis({ componentUniqueId: "different-gge" }),
      ),
      /netlist identity does not match all-page part components/u,
    );
    await assert.rejects(
      executeReader(request, topologyApis({ componentPinNumbers: ["2"] })),
      /netlist identity does not match all-page part components/u,
    );
  });

  void test("accepts an exactly correlated zero-pin compiled-topology component", async () => {
    const request: ExactReadRequest = { kind: "schematic-topology" };
    const payload = await executeReader(
      request,
      topologyApis({ componentPinNumbers: [], netlistPinNumbers: [] }),
    );
    assert.deepEqual(payload.compiledConnectivity, [
      { uniqueId: "gge1", designator: "R1", pins: [] },
    ]);
    assert.equal(payload.componentCorrelation.pinCount, 0);
    assert.deepEqual(
      payload.componentCorrelation.byUniqueId.gge1.pinNumbers,
      [],
    );
    assert.equal(validateExactReadPayload(payload, request), payload);
  });

  void test("validates payload indexes and rejects unstable double reads", async () => {
    const request: ExactReadRequest = {
      kind: "schematic-components",
      selector: { primitiveIds: ["sch-r1"] },
      includePins: true,
      includeBounds: true,
    };
    const valid = await executeReader(request, schematicApis());
    assert.equal(validateExactReadPayload(valid, request), valid);
    assert.throws(
      () =>
        validateExactReadPayload(
          { ...valid, primitiveIds: ["sch-r1", "sch-r2"] },
          request,
        ),
      /internally inconsistent/u,
    );

    let observation = 0;
    const upstream = {
      async callTool(
        name: string,
        argumentsValue: UnknownRecord | undefined,
      ): Promise<unknown> {
        assert.equal(name, "easyeda_execute");
        const code = argumentsValue?.["code"];
        if (typeof code !== "string") {
          throw new TypeError("Fixture call omitted generated code.");
        }
        assert.match(code, /"kind":"schematic-components"/u);
        observation += 1;
        return {
          structuredContent: {
            ok: true,
            result: {
              ...structuredClone(valid),
              byPrimitiveId: {
                "sch-r1": {
                  ...valid.byPrimitiveId["sch-r1"],
                  x: observation,
                },
              },
            },
          },
        };
      },
    };
    const engine = new EasyedaControlEngine(upstream);
    engine.assertContext = async (
      expectedContext,
    ): Promise<ContextProbePayload> => liveContext(expectedContext);
    await assert.rejects(
      engine.exactRead(request, {
        project: { uuid: "project-1", path: "/tmp/project.eprj2" },
        document: { uuid: "document-1", documentType: 1, tabId: "tab-1" },
      }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(
          error.message,
          /changed between two consecutive observations/u,
        );
        assert.ok("mismatches" in error);
        const mismatches = error.mismatches;
        assert.ok(Array.isArray(mismatches));
        const firstMismatch: unknown = mismatches[0];
        assertUnknownRecord(firstMismatch);
        assert.equal(firstMismatch["pointer"], "/");
        return true;
      },
    );
  });
});
