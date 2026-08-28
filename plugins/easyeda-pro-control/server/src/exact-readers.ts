import { z } from 'zod';

type UnknownRecord = Record<string, unknown>;

interface ValidationRecord extends UnknownRecord {
  addIntoBom?: unknown;
  angles?: unknown;
  arcPrecision?: unknown;
  byPrimitiveId?: Record<string, ValidationRecord>;
  bounds?: unknown;
  cbb?: unknown;
  cbbSymbol?: unknown;
  complexPolygon?: unknown;
  component?: unknown;
  componentOtherPropertyFiltering?: unknown;
  componentPadCorrelation?: unknown;
  componentPadWrapper?: unknown;
  componentPinOtherProperty?: unknown;
  componentCorrelationSource?: unknown;
  componentType?: unknown;
  connectionMethod?: unknown;
  connectivity?: unknown;
  config?: unknown;
  coordinatesAndLengths?: unknown;
  count?: unknown;
  cbbLibraryOwnership?: unknown;
  designRuleBlindViaName?: unknown;
  designator?: unknown;
  fill?: unknown;
  fillModes?: unknown;
  footprint?: unknown;
  heatWelding?: unknown;
  hole?: unknown;
  id?: unknown;
  interactiveMode?: unknown;
  layer?: unknown;
  maxX?: unknown;
  maxY?: unknown;
  metallization?: unknown;
  minWireLength?: unknown;
  minX?: unknown;
  minY?: unknown;
  minimumWireLengths?: ValidationRecord[];
  mirror?: unknown;
  model3D?: unknown;
  name?: unknown;
  negativeNet?: unknown;
  net?: unknown;
  nets?: unknown[];
  noConnected?: unknown;
  otherProperty?: unknown;
  pad?: unknown;
  padPair?: unknown;
  padNumber?: unknown;
  padPairs?: unknown[];
  padType?: unknown;
  pads?: ValidationRecord[];
  parentComponentPrimitiveId?: unknown;
  path?: unknown;
  pinColor?: unknown;
  pinName?: unknown;
  pinNumber?: unknown;
  pinNumbers?: unknown[];
  pinShape?: unknown;
  pinType?: unknown;
  pins?: ValidationRecord[];
  polygon?: unknown;
  positiveNet?: unknown;
  pourFills?: ValidationRecord[];
  pourName?: unknown;
  pourPrimitiveId?: unknown;
  preserveSilos?: unknown;
  primitiveId?: unknown;
  primitiveIds?: unknown[];
  primitiveLock?: unknown;
  primitiveType?: unknown;
  regionName?: unknown;
  regionRuleTypes?: unknown;
  solderMaskAndPasteMaskExpansion?: unknown;
  solderMaskExpansion?: unknown;
  source?: unknown;
  specialPad?: unknown;
  status?: unknown;
  sub?: ValidationRecord[];
  subPartName?: unknown;
  symbol?: unknown;
  type?: unknown;
  uniqueId?: unknown;
  viaType?: unknown;
  viaPrecision?: unknown;
  wireGeometry?: unknown;
}

interface FamilyCandidate extends UnknownRecord {
  status?: unknown;
  count?: unknown;
  primitiveIds?: unknown[];
  byPrimitiveId?: Record<string, ValidationRecord>;
  enumeratedPrimitiveCount?: unknown;
}

interface ComponentCorrelationCandidate extends UnknownRecord {
  status?: unknown;
  source?: unknown;
  componentCount?: unknown;
  pinCount?: unknown;
  primitiveIds?: unknown[];
  uniqueIds?: unknown[];
  byUniqueId?: Record<string, ValidationRecord>;
}

interface ComponentPadCorrelationCandidate extends UnknownRecord {
  status?: unknown;
  count?: unknown;
  primitiveIds?: unknown[];
  byPrimitiveId?: Record<string, ValidationRecord>;
  byComponentPrimitiveId?: Record<string, unknown[]>;
}

interface PouredCorrelationCandidate extends UnknownRecord {
  status?: unknown;
  count?: unknown;
  pourPrimitiveIds?: unknown[];
  byPourPrimitiveId?: Record<string, ValidationRecord>;
}

interface RulesCandidate extends UnknownRecord {
  configurationName?: unknown;
  configuration?: ValidationRecord;
  netRules?: ValidationRecord[];
  regionRules?: ValidationRecord[];
  netByNetRules?: Record<string, unknown>;
  netClasses?: ValidationRecord[];
  differentialPairs?: ValidationRecord[];
  equalLengthGroups?: ValidationRecord[];
  padPairGroups?: ValidationRecord[];
}

interface ExactPayloadCandidate extends UnknownRecord {
  ok?: unknown;
  kind?: unknown;
  documentType?: unknown;
  primitiveIds?: unknown[];
  detail?: { pins?: unknown; bounds?: unknown };
  byPrimitiveId?: Record<string, ValidationRecord>;
  limitations?: unknown[] | ValidationRecord;
  authority?: ValidationRecord;
  componentCorrelation?: ComponentCorrelationCandidate;
  compiledConnectivity?: ValidationRecord[];
  units?: ValidationRecord;
  families?: Record<string, FamilyCandidate>;
  componentPadCorrelation?: ComponentPadCorrelationCandidate;
  pouredCorrelation?: PouredCorrelationCandidate;
  physicalPadCount?: unknown;
  standalonePadCount?: unknown;
  pouredFillPieceCount?: unknown;
  enumeratedPrimitiveCount?: unknown;
  rules?: RulesCandidate;
  nets?: unknown[];
}

const PCB_INVENTORY_FAMILY_NAMES = [
  'arcs',
  'attributes',
  'components',
  'dimensions',
  'fills',
  'images',
  'lines',
  'objects',
  'pads',
  'polylines',
  'pours',
  'regions',
  'strings',
  'vias',
] as const;
type PcbInventoryFamilyName = (typeof PCB_INVENTORY_FAMILY_NAMES)[number];

const PCB_MONITORED_FAMILY_NAMES = [
  'arcs',
  'fills',
  'lines',
  'pads',
  'polylines',
  'pours',
  'regions',
  'vias',
] as const;
type PcbMonitoredFamilyName = (typeof PCB_MONITORED_FAMILY_NAMES)[number];

interface ValidatedFamily {
  count: number;
  primitiveIds: string[];
  byPrimitiveId?: Record<string, ValidationRecord>;
}

interface ValidatedMonitoredFamily extends ValidatedFamily {
  byPrimitiveId: Record<string, ValidationRecord>;
}

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite.`);
  }
  return value;
}

function assertUniqueNames(rows: readonly ValidationRecord[], label: string): void {
  const names = rows.map((row) => row.name);
  if (
    names.some((name) => typeof name !== 'string' || name.length === 0) ||
    new Set(names).size !== names.length
  ) {
    throw new Error(`Exact PCB rules reader returned malformed or duplicate ${label} names.`);
  }
}

function assertPayloadCandidate(value: unknown): asserts value is ExactPayloadCandidate {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Exact reader returned a non-object payload.');
  }
}

interface ExpectedContext {
  document?: {
    documentType?: number;
  };
}

const primitiveIdSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9._:-]+$/u);
const designatorSchema = z.string().min(1).max(160);

const selectorSchema = z
  .object({
    all: z.literal(true).optional(),
    primitiveIds: z.array(primitiveIdSchema).min(1).max(100).optional(),
    designators: z.array(designatorSchema).min(1).max(100).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const choices = [value.all === true, value.primitiveIds !== undefined, value.designators !== undefined];
    if (choices.filter(Boolean).length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'selector requires exactly one of all=true, primitiveIds, or designators.',
      });
    }
    const selections: ReadonlyArray<readonly [string, readonly string[] | undefined]> = [
      ['primitiveIds', value.primitiveIds],
      ['designators', value.designators],
    ];
    for (const [key, items] of selections) {
      if (items !== undefined && new Set(items).size !== items.length) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} must not contain duplicates.`,
        });
      }
    }
  });

const componentOptions = {
  selector: selectorSchema,
  includePins: z.boolean().default(true),
  includeBounds: z.boolean().default(true),
};

export const exactReadRequestSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('schematic-components'),
      ...componentOptions,
    })
    .strict(),
  z
    .object({
      kind: z.literal('pcb-components'),
      ...componentOptions,
    })
    .strict(),
  z.object({ kind: z.literal('schematic-topology') }).strict(),
  z.object({ kind: z.literal('pcb-inventory') }).strict(),
  z.object({ kind: z.literal('pcb-rules') }).strict(),
]);

export type ExactReadRequest = z.infer<typeof exactReadRequestSchema>;
export type ExactReadKind = ExactReadRequest['kind'];

export function exactReadDocumentType(kind: unknown): 1 | 3 {
  if (kind === 'schematic-components' || kind === 'schematic-topology') return 1;
  if (kind === 'pcb-components' || kind === 'pcb-inventory' || kind === 'pcb-rules') return 3;
  throw new Error(`Unsupported exact-reader kind: ${String(kind)}`);
}

export function validateExactReadRequest(
  request: unknown,
  expectedContext: ExpectedContext,
): ExactReadRequest {
  const parsed = exactReadRequestSchema.parse(request);
  const requiredType = exactReadDocumentType(parsed.kind);
  if (expectedContext?.document?.documentType !== requiredType) {
    throw new Error(
      `Exact reader ${parsed.kind} requires document type ${requiredType}, not ${String(expectedContext?.document?.documentType)}.`,
    );
  }
  return parsed;
}

function assertExactRecordKeys(
  value: unknown,
  requiredKeys: readonly string[],
  label: string,
): asserts value is ValidationRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  const actual = Object.keys(value).toSorted();
  const expected = [...requiredKeys].toSorted();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} has missing or unexpected fields.`);
  }
}

function assertFiniteFields(
  value: UnknownRecord,
  fields: readonly string[],
  label: string,
): void {
  for (const field of fields) {
    if (typeof value[field] !== 'number' || !Number.isFinite(value[field])) {
      throw new TypeError(`${label}.${field} must be finite.`);
    }
  }
}

function assertNullableString(value: unknown, label: string): void {
  if (value !== null && typeof value !== 'string') {
    throw new Error(`${label} must be a string or null.`);
  }
}

function assertBounds(value: unknown, label: string): void {
  assertExactRecordKeys(value, ['minX', 'minY', 'maxX', 'maxY'], label);
  const minX = requireFiniteNumber(value.minX, `${label}.minX`);
  const minY = requireFiniteNumber(value.minY, `${label}.minY`);
  const maxX = requireFiniteNumber(value.maxX, `${label}.maxX`);
  const maxY = requireFiniteNumber(value.maxY, `${label}.maxY`);
  if (minX > maxX || minY > maxY) {
    throw new Error(`${label} has inverted extents.`);
  }
}

function assertNonemptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a nonempty string.`);
  }
}

function assertJsonContainer(value: unknown, label: string): void {
  if (value === null || typeof value !== 'object') {
    throw new Error(`${label} must be a JSON object or array.`);
  }
}

function assertPadShape(value: unknown, label: string): void {
  if (value === null) return;
  if (!isUnknownArray(value)) throw new Error(`${label} must be a pad-shape tuple or null.`);
  const [shape] = value;
  if (typeof shape === 'string' && ['ELLIPSE', 'OVAL', 'NGON'].includes(shape)) {
    if (value.length !== 3) throw new Error(`${label} has the wrong ${shape} tuple length.`);
    assertFiniteFields({ first: value[1], second: value[2] }, ['first', 'second'], label);
    if (shape === 'NGON') {
      const sideCount = requireFiniteNumber(value[2], `${label}[2]`);
      if (!Number.isInteger(sideCount) || sideCount <= 2) {
        throw new Error(`${label} has an invalid regular-polygon side count.`);
      }
    }
    return;
  }
  if (shape === 'RECT') {
    if (value.length !== 4) throw new Error(`${label} has the wrong rectangle tuple length.`);
    assertFiniteFields(
      { width: value[1], height: value[2], round: value[3] },
      ['width', 'height', 'round'],
      label,
    );
    return;
  }
  if (shape === 'POLYGON') {
    if (value.length !== 2) throw new Error(`${label} has the wrong polygon tuple length.`);
    assertJsonContainer(value[1], `${label}[1]`);
    return;
  }
  throw new Error(`${label} has an unknown pad-shape discriminator.`);
}

function assertSpecialPadShape(value: unknown, label: string): void {
  if (value === null) return;
  if (!Array.isArray(value)) throw new Error(`${label} must be an array or null.`);
  for (const [index, layerShape] of value.entries()) {
    if (
      !Array.isArray(layerShape) ||
      layerShape.length !== 3 ||
      !Number.isInteger(layerShape[0]) ||
      !Number.isInteger(layerShape[1])
    ) {
      throw new Error(`${label}[${index}] has a malformed layer tuple.`);
    }
    assertPadShape(layerShape[2], `${label}[${index}][2]`);
    if (layerShape[2] === null) {
      throw new Error(`${label}[${index}][2] must contain a pad shape.`);
    }
  }
}

function assertPadHole(value: unknown, label: string): void {
  if (value === null) return;
  if (!isUnknownArray(value)) throw new Error(`${label} must be a hole tuple or null.`);
  const [holeType] = value;
  const expectedLength = holeType === 'ROUND' ? 2 : holeType === 'SLOT' ? 3 : 0;
  if (!expectedLength || value.length !== expectedLength) {
    throw new Error(`${label} has an unknown type or the wrong tuple length.`);
  }
  for (let index = 1; index < value.length; index += 1) {
    if (typeof value[index] !== 'number' || !Number.isFinite(value[index])) {
      throw new TypeError(`${label}[${index}] must be finite.`);
    }
  }
}

function assertMaskExpansion(value: unknown, label: string): void {
  if (value === null) return;
  const fields = ['topSolderMask', 'bottomSolderMask', 'topPasteMask', 'bottomPasteMask'];
  if (!isUnknownRecord(value)) {
    throw new Error(`${label} must be a mask-expansion object or null.`);
  }
  if (Object.keys(value).some((key) => !fields.includes(key))) {
    throw new Error(`${label} has an unexpected field.`);
  }
  assertFiniteFields(value, Object.keys(value), label);
}

function assertHeatWelding(value: unknown, label: string): void {
  if (value === null) return;
  const required = ['connectionMethod'];
  const optional = ['divergenceSpacing', 'divergenceLineWidth', 'divergenceAngle'];
  if (!isUnknownRecord(value)) {
    throw new Error(`${label} must be a thermal-connection object or null.`);
  }
  if (
    Object.keys(value).some((key) => ![...required, ...optional].includes(key)) ||
    typeof value['connectionMethod'] !== 'string' ||
    !['Divergent', 'Direct-connected', 'Non-connected'].includes(value['connectionMethod'])
  ) {
    throw new Error(`${label} has a malformed connection method or unexpected field.`);
  }
  assertFiniteFields(
    value,
    optional.filter((key) => Object.hasOwn(value, key)),
    label,
  );
}

function assertCanonicalUniqueStrings(
  value: unknown,
  label: string,
  { allowEmpty = true }: { allowEmpty?: boolean } = {},
): asserts value is string[] {
  if (
    !isStringArray(value) ||
    (!allowEmpty && value.length === 0) ||
    value.some((item) => item.length === 0) ||
    new Set(value).size !== value.length ||
    JSON.stringify(value) !== JSON.stringify(value.toSorted(compareStrings))
  ) {
    throw new Error(`${label} must be a sorted array of unique nonempty strings.`);
  }
}

function assertAssociation(
  value: unknown,
  label: string,
  kind: 'library' | 'cbb' | 'cbb-symbol' = 'library',
): void {
  if (value === null) return;
  if (!isUnknownRecord(value)) {
    throw new Error(`${label} must be a library association or null.`);
  }
  const allowed =
    kind === 'cbb-symbol'
      ? new Set(['libraryUuid', 'cbbUuid', 'uuid', 'name'])
      : new Set(['libraryUuid', 'uuid', 'name']);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new Error(`${label} has unexpected association fields.`);
  }
  const identityKeys = kind === 'cbb-symbol' ? ['cbbUuid', 'uuid'] : ['uuid'];
  if (!identityKeys.some((key) => Object.hasOwn(value, key))) {
    throw new Error(`${label} has no observable association identity.`);
  }
  for (const key of allowed) {
    if (Object.hasOwn(value, key)) assertNonemptyString(value[key], `${label}.${key}`);
  }
}

function assertOtherProperty(value: unknown, label: string): void {
  if (value === null) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a flat property object or null.`);
  }
  for (const [key, fieldValue] of Object.entries(value)) {
    if (!key || !['string', 'number', 'boolean'].includes(typeof fieldValue)) {
      throw new Error(`${label} contains a malformed property.`);
    }
    if (typeof fieldValue === 'number' && !Number.isFinite(fieldValue)) {
      throw new TypeError(`${label} contains a non-finite property.`);
    }
  }
}

export function validateExactReadPayload<T>(payload: T, request: ExactReadRequest): T {
  assertPayloadCandidate(payload);
  if (
    payload.ok !== true ||
    payload.kind !== request.kind ||
    payload.documentType !== exactReadDocumentType(request.kind)
  ) {
    throw new Error('Exact reader returned an inconsistent kind, document type, or success flag.');
  }
  if (request.kind === 'schematic-components' || request.kind === 'pcb-components') {
    if (
      !Array.isArray(payload.primitiveIds) ||
      payload.detail?.pins !== request.includePins ||
      payload.detail?.bounds !== request.includeBounds ||
      !payload.byPrimitiveId ||
      typeof payload.byPrimitiveId !== 'object' ||
      Array.isArray(payload.byPrimitiveId)
    ) {
      throw new Error('Exact component reader omitted its primitive index.');
    }
    const componentByPrimitiveId = payload.byPrimitiveId;
    const primitiveIds = payload.primitiveIds;
    const keys = Object.keys(componentByPrimitiveId).toSorted();
    if (
      new Set(primitiveIds).size !== primitiveIds.length ||
      JSON.stringify(keys) !== JSON.stringify(primitiveIds)
    ) {
      throw new Error('Exact component reader primitive index is internally inconsistent.');
    }
    for (const id of keys) {
      const component = componentByPrimitiveId[id];
      if (component?.primitiveId !== id) {
        throw new Error(`Exact component reader returned a mismatched primitive record for ${id}.`);
      }
      const schematic = request.kind === 'schematic-components';
      const baseKeys = schematic
        ? [
            'primitiveId',
            'primitiveType',
            'componentType',
            'component',
            'cbb',
            'cbbSymbol',
            'symbol',
            'footprint',
            'x',
            'y',
            'rotation',
            'mirror',
            'subPartName',
            'addIntoBom',
            'addIntoPcb',
            'net',
            'designator',
            'name',
            'uniqueId',
            'manufacturer',
            'manufacturerId',
            'supplier',
            'supplierId',
            'otherProperty',
          ]
        : [
            'primitiveId',
            'primitiveType',
            'component',
            'footprint',
            'model3D',
            'layer',
            'x',
            'y',
            'rotation',
            'primitiveLock',
            'addIntoBom',
            'designator',
            'name',
            'uniqueId',
            'manufacturer',
            'manufacturerId',
            'supplier',
            'supplierId',
            'otherProperty',
          ];
      if (request.includePins) baseKeys.push(schematic ? 'pins' : 'pads');
      if (request.includeBounds) baseKeys.push('bounds');
      assertExactRecordKeys(component, baseKeys, `Exact component ${id}`);
      assertNonemptyString(component.primitiveType, `Exact component ${id}.primitiveType`);
      assertFiniteFields(component, schematic ? ['x', 'y', 'rotation'] : ['layer', 'x', 'y', 'rotation'], `Exact component ${id}`);
      if (!schematic && !Number.isInteger(component.layer)) {
        throw new Error(`Exact component ${id}.layer must be an integer enum.`);
      }
      if (component.designator !== null && typeof component.designator !== 'string') {
        throw new Error(`Exact component ${id}.designator must be a string or null.`);
      }
      for (const field of [
        'name',
        'uniqueId',
        'manufacturer',
        'manufacturerId',
        'supplier',
        'supplierId',
      ]) {
        assertNullableString(component[field], `Exact component ${id}.${field}`);
      }
      assertAssociation(component.component, `Exact component ${id}.component`);
      assertAssociation(component.footprint, `Exact component ${id}.footprint`);
      assertOtherProperty(component.otherProperty, `Exact component ${id}.otherProperty`);
      if (request.includeBounds) assertBounds(component.bounds, `Exact component ${id}.bounds`);
      if (schematic) {
        assertNonemptyString(component.componentType, `Exact component ${id}.componentType`);
        assertAssociation(component.cbb, `Exact component ${id}.cbb`, 'cbb');
        assertAssociation(component.cbbSymbol, `Exact component ${id}.cbbSymbol`, 'cbb-symbol');
        assertAssociation(component.symbol, `Exact component ${id}.symbol`);
        assertNullableString(component.subPartName, `Exact component ${id}.subPartName`);
        assertNullableString(component.net, `Exact component ${id}.net`);
        for (const field of ['addIntoBom', 'addIntoPcb']) {
          if (component[field] !== null && typeof component[field] !== 'boolean') {
            throw new Error(`Exact component ${id}.${field} must be boolean or null.`);
          }
        }
        if (typeof component.mirror !== 'boolean') {
          throw new TypeError(`Exact component ${id}.mirror must be boolean.`);
        }
        if (request.includePins) {
          if (!Array.isArray(component.pins)) {
            throw new TypeError(`Exact component ${id}.pins must be an array.`);
          }
          const pinIds = [];
          for (const [index, pin] of component.pins.entries()) {
            const label = `Exact component ${id}.pins[${index}]`;
            assertExactRecordKeys(
              pin,
              [
                'primitiveId',
                'pinNumber',
                'pinName',
                'x',
                'y',
                'rotation',
                'pinLength',
                'pinColor',
                'pinShape',
                'pinType',
                'noConnected',
              ],
              label,
            );
            assertNonemptyString(pin.primitiveId, `${label}.primitiveId`);
            assertNonemptyString(pin.pinNumber, `${label}.pinNumber`);
            if (typeof pin.pinName !== 'string') throw new Error(`${label}.pinName must be a string.`);
            assertFiniteFields(pin, ['x', 'y', 'rotation', 'pinLength'], label);
            assertNullableString(pin.pinColor, `${label}.pinColor`);
            if (typeof pin.pinShape !== 'string' || typeof pin.pinType !== 'string') {
              throw new TypeError(`${label} has malformed pin shape or type.`);
            }
            if (typeof pin.noConnected !== 'boolean') {
              throw new TypeError(`${label}.noConnected must be boolean.`);
            }
            pinIds.push(pin.primitiveId);
          }
          if (new Set(pinIds).size !== pinIds.length) {
            throw new Error(`Exact component ${id}.pins contains duplicate primitive IDs.`);
          }
        }
      } else {
        assertAssociation(component.model3D, `Exact component ${id}.model3D`);
        if (typeof component.primitiveLock !== 'boolean' || typeof component.addIntoBom !== 'boolean') {
          throw new TypeError(`Exact PCB component ${id} has malformed boolean state.`);
        }
        if (request.includePins) {
          if (!Array.isArray(component.pads)) {
            throw new TypeError(`Exact PCB component ${id}.pads must be an array.`);
          }
          const padIds = [];
          for (const [index, pad] of component.pads.entries()) {
            const label = `Exact PCB component ${id}.pads[${index}]`;
            assertExactRecordKeys(
              pad,
              [
                'primitiveId',
                'primitiveType',
                'parentComponentPrimitiveId',
                'layer',
                'padNumber',
                'x',
                'y',
                'rotation',
                'net',
                'source',
              ],
              label,
            );
            assertNonemptyString(pad.primitiveId, `${label}.primitiveId`);
            if (pad.primitiveType !== 'ComponentPad' || pad.parentComponentPrimitiveId !== id) {
              throw new Error(`${label} has the wrong type or parent.`);
            }
            assertFiniteFields(pad, ['layer', 'x', 'y', 'rotation'], label);
            if (typeof pad.padNumber !== 'string') throw new Error(`${label}.padNumber must be a string.`);
            assertNullableString(pad.net, `${label}.net`);
            if (pad.source !== 'component-pin-wrapper-transformed-placement-only') {
              throw new Error(`${label} has the wrong source marker.`);
            }
            padIds.push(pad.primitiveId);
          }
          if (new Set(padIds).size !== padIds.length) {
            throw new Error(`Exact PCB component ${id}.pads contains duplicate primitive IDs.`);
          }
        }
      }
    }
    if (request.selector.primitiveIds) {
      const requested = [...request.selector.primitiveIds].toSorted();
      if (JSON.stringify(keys) !== JSON.stringify(requested)) {
        throw new Error('Exact component reader did not return every requested primitive ID exactly once.');
      }
    }
    if (request.selector.designators) {
      const actual = keys
        .map((id) => {
          const designator = componentByPrimitiveId[id]?.designator;
          assertNonemptyString(designator, `Exact component ${id}.designator`);
          return designator;
        })
        .toSorted(compareStrings);
      const requested = request.selector.designators.toSorted(compareStrings);
      if (JSON.stringify(actual) !== JSON.stringify(requested)) {
        throw new Error('Exact component reader did not return every requested designator exactly once.');
      }
    }
    const limitations = payload.limitations;
    if (request.kind === 'schematic-components') {
      if (
        !isUnknownRecord(limitations) ||
        typeof limitations['componentPinOtherProperty'] !== 'string' ||
        typeof limitations['componentOtherPropertyFiltering'] !== 'string' ||
        typeof limitations['cbbLibraryOwnership'] !== 'string'
      ) {
        throw new Error('Exact schematic component reader omitted adapter limitations.');
      }
      for (const id of keys) {
        const component = componentByPrimitiveId[id];
        for (const pin of component?.pins ?? []) {
          if (Object.hasOwn(pin, 'otherProperty')) {
            throw new Error('Exact schematic component reader exposed unobservable pin properties.');
          }
        }
      }
    } else if (
      !isUnknownRecord(limitations) ||
      typeof limitations['componentPadWrapper'] !== 'string'
    ) {
      throw new Error('Exact PCB component reader omitted its adapter limitation.');
    }
  } else if (request.kind === 'schematic-topology') {
    if (
      !Array.isArray(payload.compiledConnectivity) ||
      payload.authority?.connectivity !== 'sch_Netlist.getNetlist(JLCEDA)' ||
      payload.authority?.wireGeometry !== 'unavailable' ||
      payload.componentCorrelation?.status !== 'exact-match' ||
      payload.componentCorrelation?.source !==
        'sch_PrimitiveComponent.getAll(part,true)' ||
      typeof payload.componentCorrelation?.pinCount !== 'number' ||
      !Number.isSafeInteger(payload.componentCorrelation?.pinCount) ||
      payload.componentCorrelation.pinCount < 0 ||
      !Array.isArray(payload.componentCorrelation?.uniqueIds) ||
      !Array.isArray(payload.componentCorrelation?.primitiveIds) ||
      !payload.componentCorrelation?.byUniqueId ||
      typeof payload.componentCorrelation.byUniqueId !== 'object' ||
      Array.isArray(payload.componentCorrelation.byUniqueId) ||
      !Array.isArray(payload.limitations)
    ) {
      throw new Error('Exact schematic topology reader omitted compiled connectivity provenance.');
    }
    assertExactRecordKeys(
      payload.componentCorrelation,
      [
        'status',
        'source',
        'componentCount',
        'pinCount',
        'primitiveIds',
        'uniqueIds',
        'byUniqueId',
      ],
      'Exact schematic topology component correlation',
    );
    assertCanonicalUniqueStrings(
      payload.componentCorrelation.primitiveIds,
      'Exact schematic topology correlated primitive IDs',
    );
    assertCanonicalUniqueStrings(
      payload.componentCorrelation.uniqueIds,
      'Exact schematic topology correlated unique IDs',
    );
    const connectivityIds = [];
    const correlatedPrimitiveIds = [];
    for (const component of payload.compiledConnectivity) {
      assertExactRecordKeys(
        component,
        ['uniqueId', 'designator', 'pins'],
        'Exact schematic topology compiled component',
      );
      if (!Array.isArray(component.pins)) {
        throw new TypeError('Exact schematic topology compiled connectivity is malformed.');
      }
      assertNonemptyString(component.uniqueId, 'Exact schematic topology compiled unique ID');
      assertNullableString(component.designator, 'Exact schematic topology compiled designator');
      const compiledPinNumbers = [];
      for (const [index, pin] of component.pins.entries()) {
        const pinLabel = `Exact schematic topology ${component.uniqueId} pin[${index}]`;
        assertExactRecordKeys(pin, ['pinNumber', 'net'], pinLabel);
        assertNonemptyString(pin.pinNumber, `${pinLabel}.pinNumber`);
        assertNullableString(pin.net, `${pinLabel}.net`);
        compiledPinNumbers.push(pin.pinNumber);
      }
      if (
        new Set(compiledPinNumbers).size !== compiledPinNumbers.length ||
        JSON.stringify(compiledPinNumbers) !== JSON.stringify([...compiledPinNumbers].toSorted())
      ) {
        throw new Error('Exact schematic topology compiled pin numbers are not canonical and unique.');
      }
      const correlation = payload.componentCorrelation.byUniqueId[component.uniqueId];
      assertExactRecordKeys(
        correlation,
        ['primitiveId', 'designator', 'pinNumbers'],
        `Exact schematic topology correlation ${component.uniqueId}`,
      );
      assertNonemptyString(
        correlation.primitiveId,
        `Exact schematic topology correlation ${component.uniqueId}.primitiveId`,
      );
      assertNullableString(
        correlation.designator,
        `Exact schematic topology correlation ${component.uniqueId}.designator`,
      );
      assertCanonicalUniqueStrings(
        correlation.pinNumbers,
        `Exact schematic topology correlation ${component.uniqueId}.pinNumbers`,
      );
      if (
        correlation.designator !== component.designator ||
        JSON.stringify(correlation.pinNumbers) !== JSON.stringify(compiledPinNumbers)
      ) {
        throw new Error('Exact schematic topology compiled and public component state disagree.');
      }
      connectivityIds.push(component.uniqueId);
      correlatedPrimitiveIds.push(correlation.primitiveId);
    }
    if (new Set(connectivityIds).size !== connectivityIds.length) {
      throw new Error('Exact schematic topology compiled connectivity has duplicate unique IDs.');
    }
    const correlatedIds = [...payload.componentCorrelation.uniqueIds].toSorted();
    const compiledPinCount = payload.compiledConnectivity.reduce(
      (total, component) => total + (component.pins?.length ?? 0),
      0,
    );
    if (
      payload.componentCorrelation.componentCount !== connectivityIds.length ||
      payload.componentCorrelation.pinCount !== compiledPinCount ||
      payload.componentCorrelation.primitiveIds.length !== connectivityIds.length ||
      JSON.stringify(Object.keys(payload.componentCorrelation.byUniqueId).toSorted()) !==
        JSON.stringify([...connectivityIds].toSorted()) ||
      JSON.stringify(correlatedIds) !== JSON.stringify([...connectivityIds].toSorted()) ||
      JSON.stringify([...correlatedPrimitiveIds].toSorted()) !==
        JSON.stringify(payload.componentCorrelation.primitiveIds)
    ) {
      throw new Error('Exact schematic topology component correlation is inconsistent.');
    }
  } else if (request.kind === 'pcb-inventory') {
    const limitations = payload.limitations;
    if (
      !payload.families ||
      typeof payload.families !== 'object' ||
      Array.isArray(payload.families) ||
      payload.units?.coordinatesAndLengths !== 'mil' ||
      payload.units?.angles !== 'degree' ||
      !isUnknownRecord(limitations) ||
      typeof limitations['directPads'] !== 'string' ||
      typeof limitations['componentPadCorrelation'] !== 'string' ||
      typeof limitations['pouredCorrelation'] !== 'string' ||
      typeof limitations['regionRuleTypes'] !== 'string' ||
      typeof limitations['fillModes'] !== 'string' ||
      typeof limitations['arcPrecision'] !== 'string' ||
      typeof limitations['viaPrecision'] !== 'string' ||
      payload.componentPadCorrelation?.status !== 'exact-subset' ||
      !Array.isArray(payload.componentPadCorrelation?.primitiveIds) ||
      !payload.componentPadCorrelation?.byPrimitiveId ||
      typeof payload.componentPadCorrelation.byPrimitiveId !== 'object' ||
      Array.isArray(payload.componentPadCorrelation.byPrimitiveId) ||
      !payload.componentPadCorrelation?.byComponentPrimitiveId ||
      typeof payload.componentPadCorrelation.byComponentPrimitiveId !== 'object' ||
      Array.isArray(payload.componentPadCorrelation.byComponentPrimitiveId) ||
      payload.pouredCorrelation?.status !== 'derived-subset' ||
      !Array.isArray(payload.pouredCorrelation?.pourPrimitiveIds) ||
      !payload.pouredCorrelation?.byPourPrimitiveId ||
      typeof payload.pouredCorrelation.byPourPrimitiveId !== 'object' ||
      Array.isArray(payload.pouredCorrelation.byPourPrimitiveId)
    ) {
      throw new Error('Exact PCB inventory omitted primitive families.');
    }
    const families = payload.families;
    if (
      JSON.stringify(Object.keys(families).toSorted()) !==
      JSON.stringify(PCB_INVENTORY_FAMILY_NAMES)
    ) {
      throw new Error('Exact PCB inventory primitive-family set is incomplete.');
    }
    const monitoredFamilies = new Set<PcbInventoryFamilyName>(PCB_MONITORED_FAMILY_NAMES);
    const validatedFamilies = new Map<PcbInventoryFamilyName, ValidatedFamily>();
    const allFamilyPrimitiveIds: string[] = [];
    for (const name of PCB_INVENTORY_FAMILY_NAMES) {
      const family = families[name];
      assertExactRecordKeys(
        family,
        monitoredFamilies.has(name)
          ? ['status', 'count', 'primitiveIds', 'byPrimitiveId']
          : ['status', 'count', 'primitiveIds'],
        `Exact PCB inventory family ${name}`,
      );
      assertCanonicalUniqueStrings(
        family.primitiveIds,
        `Exact PCB inventory family ${name} primitive IDs`,
      );
      const familyPrimitiveIds = family.primitiveIds;
      if (
        family.status !== 'adapter-enumerated' ||
        typeof family.count !== 'number' ||
        family.count !== familyPrimitiveIds.length ||
        !Number.isSafeInteger(family.count) ||
        family.count < 0
      ) {
        throw new Error(`Exact PCB inventory family ${name} is internally inconsistent.`);
      }
      allFamilyPrimitiveIds.push(...familyPrimitiveIds);
      const familyIndex: unknown = family.byPrimitiveId;
      let validatedFamilyIndex: Record<string, ValidationRecord> | undefined;
      if (familyIndex !== undefined) {
        if (
          !isUnknownRecord(familyIndex) ||
          JSON.stringify(Object.keys(familyIndex).toSorted(compareStrings)) !==
            JSON.stringify(familyPrimitiveIds)
        ) {
          throw new Error(`Exact PCB inventory family ${name} has an inconsistent state index.`);
        }
        const indexEntries: Array<[string, ValidationRecord]> = [];
        for (const id of familyPrimitiveIds) {
          const state = familyIndex[id];
          if (!isUnknownRecord(state) || state['primitiveId'] !== id) {
            throw new Error(`Exact PCB inventory family ${name} mismatched state for ${id}.`);
          }
          indexEntries.push([id, state]);
        }
        validatedFamilyIndex = Object.fromEntries(indexEntries);
      }
      if (monitoredFamilies.has(name) && familyIndex === undefined) {
        throw new Error(`Exact PCB inventory family ${name} has an inconsistent state index.`);
      }
      validatedFamilies.set(name, {
        count: family.count,
        primitiveIds: familyPrimitiveIds,
        ...(validatedFamilyIndex === undefined ? {} : { byPrimitiveId: validatedFamilyIndex }),
      });
    }
    if (
      new Set(allFamilyPrimitiveIds).size !== allFamilyPrimitiveIds.length ||
      typeof payload.enumeratedPrimitiveCount !== 'number' ||
      !Number.isSafeInteger(payload.enumeratedPrimitiveCount) ||
      payload.enumeratedPrimitiveCount !== allFamilyPrimitiveIds.length
    ) {
      throw new Error('Exact PCB inventory family primitive identities overlap or have the wrong total.');
    }

    const getFamily = (name: PcbInventoryFamilyName): ValidatedFamily => {
      const family = validatedFamilies.get(name);
      if (!family) throw new Error(`Exact PCB inventory family ${name} is unavailable.`);
      return family;
    };
    const getMonitoredFamily = (name: PcbMonitoredFamilyName): ValidatedMonitoredFamily => {
      const family = getFamily(name);
      if (!family.byPrimitiveId) {
        throw new Error(`Exact PCB inventory family ${name} has an inconsistent state index.`);
      }
      return { ...family, byPrimitiveId: family.byPrimitiveId };
    };

    const primitiveSchemas: Record<PcbMonitoredFamilyName, readonly string[]> = {
      pads: [
        'primitiveId',
        'primitiveType',
        'layer',
        'padNumber',
        'x',
        'y',
        'rotation',
        'pad',
        'specialPad',
        'net',
        'hole',
        'holeOffsetX',
        'holeOffsetY',
        'holeRotation',
        'metallization',
        'padType',
        'solderMaskAndPasteMaskExpansion',
        'heatWelding',
        'primitiveLock',
        'source',
      ],
      vias: [
        'primitiveId',
        'primitiveType',
        'net',
        'x',
        'y',
        'holeDiameter',
        'diameter',
        'viaType',
        'designRuleBlindViaName',
        'solderMaskExpansion',
        'primitiveLock',
      ],
      lines: [
        'primitiveId',
        'primitiveType',
        'net',
        'layer',
        'startX',
        'startY',
        'endX',
        'endY',
        'lineWidth',
        'primitiveLock',
      ],
      arcs: [
        'primitiveId',
        'primitiveType',
        'net',
        'layer',
        'startX',
        'startY',
        'endX',
        'endY',
        'lineWidth',
        'primitiveLock',
        'arcAngle',
        'interactiveMode',
      ],
      polylines: [
        'primitiveId',
        'primitiveType',
        'net',
        'layer',
        'polygon',
        'lineWidth',
        'primitiveLock',
      ],
      regions: [
        'primitiveId',
        'primitiveType',
        'layer',
        'complexPolygon',
        'regionName',
        'lineWidth',
        'primitiveLock',
      ],
      pours: [
        'primitiveId',
        'primitiveType',
        'net',
        'layer',
        'complexPolygon',
        'pourFillMethod',
        'preserveSilos',
        'pourName',
        'pourPriority',
        'lineWidth',
        'primitiveLock',
      ],
      fills: [
        'primitiveId',
        'primitiveType',
        'net',
        'layer',
        'complexPolygon',
        'lineWidth',
        'primitiveLock',
      ],
    };
    const validatePrimitiveRecord = (
      name: PcbMonitoredFamilyName,
      row: ValidationRecord | undefined,
      id: string,
    ): void => {
      const label = `Exact PCB inventory ${name} ${id}`;
      if (!isUnknownRecord(row)) throw new Error(`${label} must be an object.`);
      const keys = [...primitiveSchemas[name]];
      const hasParent = Object.hasOwn(row, 'parentComponentPrimitiveId');
      const hasCorrelationSource = Object.hasOwn(row, 'componentCorrelationSource');
      if (name === 'pads' && hasParent && hasCorrelationSource) {
        keys.push('parentComponentPrimitiveId', 'componentCorrelationSource');
      } else if (name === 'pads' && hasParent !== hasCorrelationSource) {
        throw new Error(`${label} has a partial component correlation.`);
      }
      assertExactRecordKeys(row, keys, label);
      assertNonemptyString(row.primitiveId, `${label}.primitiveId`);
      assertNonemptyString(row.primitiveType, `${label}.primitiveType`);
      if (['pads', 'lines', 'arcs', 'polylines', 'pours', 'fills'].includes(name)) {
        assertNullableString(row.net, `${label}.net`);
      }
      if (name === 'pads') {
        assertFiniteFields(
          row,
          ['layer', 'x', 'y', 'rotation', 'holeOffsetX', 'holeOffsetY', 'holeRotation'],
          label,
        );
        if (typeof row.padNumber !== 'string' || !Number.isInteger(row.padType)) {
          throw new TypeError(`${label} has a malformed pad number or type.`);
        }
        if (
          typeof row.metallization !== 'boolean' ||
          typeof row.primitiveLock !== 'boolean' ||
          row.source !== 'pcb_PrimitivePad-direct-state'
        ) {
          throw new Error(`${label} has malformed pad flags or provenance.`);
        }
        assertPadShape(row.pad, `${label}.pad`);
        assertSpecialPadShape(row.specialPad, `${label}.specialPad`);
        assertPadHole(row.hole, `${label}.hole`);
        assertMaskExpansion(
          row.solderMaskAndPasteMaskExpansion,
          `${label}.solderMaskAndPasteMaskExpansion`,
        );
        assertHeatWelding(row.heatWelding, `${label}.heatWelding`);
      } else if (name === 'vias') {
        assertNullableString(row.net, `${label}.net`);
        assertNullableString(row.designRuleBlindViaName, `${label}.designRuleBlindViaName`);
        assertFiniteFields(row, ['x', 'y', 'holeDiameter', 'diameter'], label);
        if (!Number.isInteger(row.viaType) || typeof row.primitiveLock !== 'boolean') {
          throw new TypeError(`${label} has malformed via type or lock state.`);
        }
        assertMaskExpansion(row.solderMaskExpansion, `${label}.solderMaskExpansion`);
      } else if (name === 'lines' || name === 'arcs') {
        assertFiniteFields(
          row,
          [
            'layer',
            'startX',
            'startY',
            'endX',
            'endY',
            'lineWidth',
            ...(name === 'arcs' ? ['arcAngle'] : []),
          ],
          label,
        );
        if (
          typeof row.primitiveLock !== 'boolean' ||
          (name === 'arcs' && !Number.isInteger(row.interactiveMode))
        ) {
          throw new Error(`${label} has malformed line/arc state.`);
        }
      } else if (name === 'polylines') {
        assertFiniteFields(row, ['layer', 'lineWidth'], label);
        assertJsonContainer(row.polygon, `${label}.polygon`);
        if (typeof row.primitiveLock !== 'boolean') throw new Error(`${label} has malformed lock state.`);
      } else if (name === 'regions') {
        assertFiniteFields(row, ['layer', 'lineWidth'], label);
        assertJsonContainer(row.complexPolygon, `${label}.complexPolygon`);
        assertNullableString(row.regionName, `${label}.regionName`);
        if (typeof row.primitiveLock !== 'boolean') throw new Error(`${label} has malformed lock state.`);
      } else if (name === 'pours') {
        assertFiniteFields(row, ['layer', 'pourPriority', 'lineWidth'], label);
        assertJsonContainer(row.complexPolygon, `${label}.complexPolygon`);
        assertNullableString(row.pourName, `${label}.pourName`);
        if (typeof row.preserveSilos !== 'boolean' || typeof row.primitiveLock !== 'boolean') {
          throw new TypeError(`${label} has malformed pour flags.`);
        }
      } else if (name === 'fills') {
        assertFiniteFields(row, ['layer', 'lineWidth'], label);
        assertJsonContainer(row.complexPolygon, `${label}.complexPolygon`);
        if (typeof row.primitiveLock !== 'boolean') throw new Error(`${label} has malformed lock state.`);
      }
    };
    for (const name of PCB_MONITORED_FAMILY_NAMES) {
      const family = getMonitoredFamily(name);
      for (const id of family.primitiveIds) {
        validatePrimitiveRecord(name, family.byPrimitiveId[id], id);
      }
    }

    const componentsFamily = getFamily('components');
    const padsFamily = getMonitoredFamily('pads');
    const poursFamily = getMonitoredFamily('pours');
    const regionsFamily = getMonitoredFamily('regions');
    const fillsFamily = getMonitoredFamily('fills');
    const componentPadCorrelation = payload.componentPadCorrelation;
    const pouredCorrelation = payload.pouredCorrelation;

    if (
      typeof payload.physicalPadCount !== 'number' ||
      !Number.isSafeInteger(payload.physicalPadCount) ||
      typeof payload.standalonePadCount !== 'number' ||
      !Number.isSafeInteger(payload.standalonePadCount) ||
      payload.physicalPadCount !== padsFamily.count ||
      payload.standalonePadCount < 0
    ) {
      throw new Error('Exact PCB inventory physical pad count is inconsistent.');
    }
    assertExactRecordKeys(
      componentPadCorrelation,
      [
        'status',
        'count',
        'primitiveIds',
        'byPrimitiveId',
        'byComponentPrimitiveId',
      ],
      'Exact PCB inventory component-pad correlation',
    );
    assertCanonicalUniqueStrings(
      componentPadCorrelation.primitiveIds,
      'Exact PCB inventory component-pad primitive IDs',
    );
    const componentPadByPrimitiveId = componentPadCorrelation.byPrimitiveId;
    const padIdsByComponentPrimitiveId = componentPadCorrelation.byComponentPrimitiveId;
    if (!componentPadByPrimitiveId || !padIdsByComponentPrimitiveId) {
      throw new Error('Exact PCB inventory component-pad correlation is inconsistent.');
    }
    const correlatedPadIds = [...componentPadCorrelation.primitiveIds].toSorted();
    const componentIds = componentsFamily.primitiveIds;
    if (
      typeof componentPadCorrelation.count !== 'number' ||
      componentPadCorrelation.count !== correlatedPadIds.length ||
      !Number.isSafeInteger(componentPadCorrelation.count) ||
      new Set(correlatedPadIds).size !== correlatedPadIds.length ||
      payload.standalonePadCount !== padsFamily.count - correlatedPadIds.length ||
      correlatedPadIds.some((id) => !padsFamily.byPrimitiveId[id]) ||
      JSON.stringify(Object.keys(componentPadByPrimitiveId).toSorted()) !==
        JSON.stringify(correlatedPadIds) ||
      JSON.stringify(Object.keys(padIdsByComponentPrimitiveId).toSorted()) !==
        JSON.stringify(componentIds)
    ) {
      throw new Error('Exact PCB inventory component-pad correlation is inconsistent.');
    }
    const mappedPadIds = [];
    for (const componentId of componentIds) {
      const ids = padIdsByComponentPrimitiveId[componentId];
      assertCanonicalUniqueStrings(
        ids,
        `Exact PCB inventory component ${componentId} correlated pad IDs`,
      );
      mappedPadIds.push(...ids);
    }
    if (
      new Set(mappedPadIds).size !== mappedPadIds.length ||
      JSON.stringify([...mappedPadIds].toSorted()) !== JSON.stringify(correlatedPadIds)
    ) {
      throw new Error('Exact PCB inventory component-to-pad index is inconsistent.');
    }
    for (const id of correlatedPadIds) {
      const correlation = componentPadByPrimitiveId[id];
      const directPad = padsFamily.byPrimitiveId[id];
      assertExactRecordKeys(
        correlation,
        ['primitiveId', 'parentComponentPrimitiveId', 'padNumber', 'net', 'source'],
        `Exact PCB inventory pad correlation ${id}`,
      );
      if (
        correlation.primitiveId !== id ||
        typeof correlation.parentComponentPrimitiveId !== 'string' ||
        !componentIds.includes(correlation.parentComponentPrimitiveId) ||
        typeof correlation.padNumber !== 'string' ||
        correlation.source !== 'component-getState_Pads'
      ) {
        throw new Error('Exact PCB inventory correlated pad has malformed identity or provenance.');
      }
      assertNullableString(correlation.net, `Exact PCB inventory pad correlation ${id}.net`);
      if (!directPad) {
        throw new Error('Exact PCB inventory correlated pad disagrees with direct pad state.');
      }
      const ownedPadIds = padIdsByComponentPrimitiveId[correlation.parentComponentPrimitiveId];
      if (
        directPad.parentComponentPrimitiveId !== correlation.parentComponentPrimitiveId ||
        directPad.componentCorrelationSource !== correlation.source ||
        directPad.padNumber !== correlation.padNumber ||
        directPad.net !== correlation.net ||
        ownedPadIds === undefined ||
        !ownedPadIds.includes(id)
      ) {
        throw new Error('Exact PCB inventory correlated pad disagrees with direct pad state.');
      }
    }
    for (const id of padsFamily.primitiveIds) {
      const directPad = padsFamily.byPrimitiveId[id];
      const isCorrelated = componentPadByPrimitiveId[id] !== undefined;
      if (
        !directPad ||
        isCorrelated !== Object.hasOwn(directPad, 'parentComponentPrimitiveId') ||
        isCorrelated !== Object.hasOwn(directPad, 'componentCorrelationSource')
      ) {
        throw new Error('Exact PCB inventory direct pad has unexpected component ownership state.');
      }
    }
    assertExactRecordKeys(
      pouredCorrelation,
      ['status', 'count', 'pourPrimitiveIds', 'byPourPrimitiveId'],
      'Exact PCB inventory poured-state correlation',
    );
    assertCanonicalUniqueStrings(
      pouredCorrelation.pourPrimitiveIds,
      'Exact PCB inventory poured parent IDs',
    );
    const pouredByPrimitiveId = pouredCorrelation.byPourPrimitiveId;
    if (!pouredByPrimitiveId) {
      throw new Error('Exact PCB inventory poured-state correlation is inconsistent.');
    }
    const pouredParentIds = [...pouredCorrelation.pourPrimitiveIds].toSorted();
    if (
      typeof pouredCorrelation.count !== 'number' ||
      pouredCorrelation.count !== pouredParentIds.length ||
      new Set(pouredParentIds).size !== pouredParentIds.length ||
      JSON.stringify(Object.keys(pouredByPrimitiveId).toSorted()) !==
        JSON.stringify(pouredParentIds) ||
      pouredParentIds.some((id) => !poursFamily.byPrimitiveId[id])
    ) {
      throw new Error('Exact PCB inventory poured-state correlation is inconsistent.');
    }
    const pouredFillIds = [];
    for (const id of pouredParentIds) {
      const row = pouredByPrimitiveId[id];
      assertExactRecordKeys(
        row,
        ['primitiveId', 'primitiveType', 'pourPrimitiveId', 'pourFills'],
        `Exact PCB inventory poured state ${id}`,
      );
      if (row.primitiveId !== id || row.pourPrimitiveId !== id || !Array.isArray(row.pourFills)) {
        throw new Error('Exact PCB inventory poured-state record is malformed.');
      }
      assertNonemptyString(row.primitiveType, `Exact PCB inventory poured state ${id}.primitiveType`);
      const rowFillIds = [];
      for (const [index, fill] of row.pourFills.entries()) {
        const fillLabel = `Exact PCB inventory poured state ${id} fill[${index}]`;
        assertExactRecordKeys(fill, ['id', 'path', 'lineWidth', 'fill'], fillLabel);
        assertNonemptyString(fill.id, `${fillLabel}.id`);
        assertJsonContainer(fill.path, `${fillLabel}.path`);
        assertFiniteFields(fill, ['lineWidth'], fillLabel);
        if (typeof fill.fill !== 'boolean') throw new Error(`${fillLabel}.fill must be boolean.`);
        rowFillIds.push(fill.id);
      }
      if (
        new Set(rowFillIds).size !== rowFillIds.length ||
        JSON.stringify(rowFillIds) !== JSON.stringify([...rowFillIds].toSorted())
      ) {
        throw new Error('Exact PCB inventory poured fill-piece order or identity is inconsistent.');
      }
      pouredFillIds.push(...rowFillIds);
    }
    if (
      pouredFillIds.some((id) => typeof id !== 'string' || id.length === 0) ||
      new Set(pouredFillIds).size !== pouredFillIds.length ||
      !Number.isSafeInteger(payload.pouredFillPieceCount) ||
      payload.pouredFillPieceCount !== pouredFillIds.length
    ) {
      throw new Error('Exact PCB inventory poured fill-piece identities are inconsistent.');
    }
    for (const row of Object.values(regionsFamily.byPrimitiveId)) {
      if (Object.hasOwn(row, 'ruleType')) {
        throw new Error('Exact PCB inventory exposed incomplete region rule-type state.');
      }
    }
    for (const row of Object.values(fillsFamily.byPrimitiveId)) {
      if (Object.hasOwn(row, 'fillMode')) {
        throw new Error('Exact PCB inventory exposed adapter-hardcoded fill-mode state.');
      }
    }
  } else if (request.kind === 'pcb-rules') {
    const rules = payload.rules;
    const nets = payload.nets;
    if (
      !rules ||
      typeof rules.configurationName !== 'string' ||
      !Array.isArray(rules.netRules) ||
      !Array.isArray(rules.regionRules) ||
      !Array.isArray(rules.netClasses) ||
      !Array.isArray(rules.equalLengthGroups) ||
      !Array.isArray(rules.padPairGroups) ||
      !Array.isArray(rules.differentialPairs) ||
      !rules.configuration ||
      typeof rules.configuration !== 'object' ||
      Array.isArray(rules.configuration) ||
      typeof rules.configuration.name !== 'string' ||
      rules.configuration.name !== rules.configurationName ||
      rules.configuration.config === undefined ||
      rules.configuration.config === null ||
      typeof rules.configuration.config !== 'object' ||
      Array.isArray(rules.configuration.config) ||
      Object.keys(rules.configuration.config).length === 0 ||
      !rules.netByNetRules ||
      typeof rules.netByNetRules !== 'object' ||
      Array.isArray(rules.netByNetRules) ||
      !Array.isArray(nets) ||
      new Set(nets).size !== nets.length
    ) {
      throw new Error('Exact PCB rules reader omitted rules or nets.');
    }
    assertExactRecordKeys(
      rules.configuration,
      ['name', 'config'],
      'Exact PCB rules configuration',
    );
    assertCanonicalUniqueStrings(nets, 'Exact PCB rule net names');
    const netSet = new Set(nets);
    const ruleLeafNets: string[] = [];
    const visitRuleRow = (row: unknown, label: string): void => {
      if (!isUnknownRecord(row)) {
        throw new Error(`${label} must be an object.`);
      }
      if (row['type'] === 'net') {
        assertNonemptyString(row['name'], `${label}.name`);
        if (!netSet.has(row['name'])) throw new Error(`${label} references an unknown net.`);
        ruleLeafNets.push(row['name']);
      }
      if (Object.hasOwn(row, 'sub')) {
        if (!Array.isArray(row['sub'])) throw new Error(`${label}.sub must be an array.`);
        for (const [index, child] of row['sub'].entries()) {
          visitRuleRow(child, `${label}.sub[${index}]`);
        }
      }
    };
    for (const [index, row] of rules.netRules.entries()) {
      visitRuleRow(row, `Exact PCB net rule[${index}]`);
    }
    if (
      new Set(ruleLeafNets).size !== ruleLeafNets.length ||
      JSON.stringify([...ruleLeafNets].toSorted()) !== JSON.stringify(nets)
    ) {
      throw new Error('Exact PCB rule leaves do not cover every live net exactly once.');
    }
    for (const [key, rows] of Object.entries(rules.netByNetRules)) {
      if (!Array.isArray(rows)) {
        throw new TypeError(`Exact PCB net-to-net rule ${key} must be an array.`);
      }
    }
    assertUniqueNames(rules.netClasses, 'net class');
    assertUniqueNames(rules.differentialPairs, 'differential pair');
    assertUniqueNames(rules.equalLengthGroups, 'equal-length group');
    assertUniqueNames(rules.padPairGroups, 'pad-pair group');
    const groupedRuleRows: ReadonlyArray<readonly [string, ValidationRecord[]]> = [
      ['net class', rules.netClasses],
      ['equal-length group', rules.equalLengthGroups],
    ];
    for (const [label, rows] of groupedRuleRows) {
      for (const row of rows) {
        if (
          !Array.isArray(row.nets) ||
          new Set(row.nets).size !== row.nets.length ||
          row.nets.some((net) => typeof net !== 'string' || !netSet.has(net))
        ) {
          throw new Error(`Exact PCB rules reader returned a malformed ${label}.`);
        }
      }
    }
    for (const pair of rules.differentialPairs) {
      if (
        typeof pair.positiveNet !== 'string' ||
        typeof pair.negativeNet !== 'string' ||
        pair.positiveNet === pair.negativeNet ||
        !netSet.has(pair.positiveNet) ||
        !netSet.has(pair.negativeNet)
      ) {
        throw new Error('Exact PCB rules reader returned a malformed differential pair.');
      }
    }
    for (const group of rules.padPairGroups) {
      if (!Array.isArray(group.padPairs) || !Array.isArray(group.minimumWireLengths)) {
        throw new TypeError('Exact PCB rules reader returned a malformed pad-pair group.');
      }
      const pairKeys = group.padPairs.map((pair) => JSON.stringify(pair));
      const lengthKeys = group.minimumWireLengths.map((row) => JSON.stringify(row?.padPair));
      if (
        group.padPairs.some(
          (pair) =>
            !Array.isArray(pair) ||
            pair.length !== 2 ||
            pair.some((pad) => typeof pad !== 'string' || pad.length === 0),
        ) ||
        group.minimumWireLengths.some(
          (row) => typeof row?.minWireLength !== 'number' || !Number.isFinite(row.minWireLength),
        ) ||
        new Set(pairKeys).size !== pairKeys.length ||
        JSON.stringify(pairKeys) !== JSON.stringify(lengthKeys)
      ) {
        throw new Error('Exact PCB rules reader returned inconsistent pad-pair lengths.');
      }
    }
  }
  return payload;
}

export function exactTargetAssertionPointer(primitiveId: string): string {
  const escaped = primitiveId.replaceAll('~', '~0').replaceAll('/', '~1');
  return `/byPrimitiveId/${escaped}/primitiveId`;
}

export function buildExactReadCode(request: unknown): string {
  const parsed = exactReadRequestSchema.parse(request);
  const serialized = JSON.stringify(parsed);
  return `
return await (async () => {
  const REQUEST = ${serialized};
  const requiredApi = (lower, _upper, methods) => {
    const value = eda[lower];
    if (!value || typeof value !== "object") throw new Error(lower + " API is unavailable");
    for (const method of methods) {
      if (typeof value[method] !== "function") throw new Error(lower + "." + method + " is unavailable");
    }
    return value;
  };
  const requiredArray = (value, label) => {
    if (!Array.isArray(value)) throw new Error(label + " did not return an array");
    return value;
  };
  const requiredObject = (value, label) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(label + " did not return an object");
    }
    return value;
  };
  const finite = (value, label) => {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(label + " is not finite");
    return value;
  };
  const integer = (value, label) => {
    const result = finite(value, label);
    if (!Number.isInteger(result)) throw new Error(label + " is not an integer enum");
    return result;
  };
  const requiredString = (value, label, allowEmpty = true) => {
    if (typeof value !== "string" || (!allowEmpty && value.length === 0)) {
      throw new Error(label + " is not a valid string");
    }
    return value;
  };
  const nonemptyString = (value, label) => requiredString(value, label, false);
  const requiredBoolean = (value, label) => {
    if (typeof value !== "boolean") throw new Error(label + " is not boolean");
    return value;
  };
  const state = async (value, method, required = true) => {
    const fn = value?.[method];
    if (typeof fn !== "function") {
      if (required) throw new Error(method + " is unavailable on a returned primitive");
      return null;
    }
    const result = await fn.call(value);
    if (result === undefined) {
      if (required) throw new Error(method + " returned undefined");
      return null;
    }
    return result;
  };
  const plain = (value, label, depth = 0, seen = new WeakSet()) => {
    if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
      if (typeof value === "number" && !Number.isFinite(value)) throw new Error(label + " contains a non-finite number");
      return value;
    }
    if (value === undefined) return null;
    if (typeof value !== "object") throw new Error(label + " contains a non-JSON value");
    if (depth > 14) throw new Error(label + " exceeds the exact-reader depth limit");
    if (seen.has(value)) throw new Error(label + " contains a cycle");
    seen.add(value);
    if (Array.isArray(value)) {
      if (value.length > 20000) throw new Error(label + " exceeds the exact-reader array limit");
      const result = value.map((item, index) => plain(item, label + "[" + index + "]", depth + 1, seen));
      seen.delete(value);
      return result;
    }
    const keys = Object.keys(value).sort();
    if (keys.length > 20000) throw new Error(label + " exceeds the exact-reader object limit");
    const result = {};
    for (const key of keys) {
      if (typeof value[key] === "function" || value[key] === undefined) continue;
      result[key] = plain(value[key], label + "." + key, depth + 1, seen);
    }
    seen.delete(value);
    return result;
  };
  const polygonSource = (value, label) => {
    if (!value || typeof value.getSource !== "function") {
      throw new Error(label + " is not an EasyEDA polygon object");
    }
    return plain(value.getSource(), label + " source");
  };
  const nullableString = (value, label) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") throw new Error(label + " is not a string or null");
    return value;
  };
  const association = (value, label, kind = "library") => {
    if (value === null || value === undefined) return null;
    const row = requiredObject(value, label);
    const allowed = kind === "cbb-symbol"
      ? ["libraryUuid", "cbbUuid", "uuid", "name"]
      : ["libraryUuid", "uuid", "name"];
    const identityKeys = kind === "cbb-symbol" ? ["cbbUuid", "uuid"] : ["uuid"];
    const result = {};
    for (const key of Object.keys(row)) {
      if (!allowed.includes(key)) throw new Error(label + " contains an unexpected field " + key);
      const fieldValue = row[key];
      if (fieldValue === undefined || fieldValue === null || fieldValue === "") continue;
      result[key] = nonemptyString(fieldValue, label + "." + key);
    }
    if (Object.keys(result).length === 0) {
      return null;
    }
    if (!identityKeys.some((key) => Object.prototype.hasOwnProperty.call(result, key))) {
      throw new Error(label + " exposes nonidentity association fields without an observable UUID");
    }
    return result;
  };
  const bbox = async (api, primitiveId, label) => {
    const value = await api.getPrimitivesBBox([primitiveId]);
    requiredObject(value, label + " bounds");
    return {
      minX: finite(value.minX, label + " bounds.minX"),
      minY: finite(value.minY, label + " bounds.minY"),
      maxX: finite(value.maxX, label + " bounds.maxX"),
      maxY: finite(value.maxY, label + " bounds.maxY"),
    };
  };
  const uniqueStrings = (values, label) => {
    const result = requiredArray(values, label).map((value) => {
      if (typeof value !== "string" || value.length === 0) throw new Error(label + " contains an invalid ID");
      return value;
    });
    if (new Set(result).size !== result.length) throw new Error(label + " contains duplicate IDs");
    return result.sort();
  };
  const selectComponents = async (api) => {
    const all = requiredArray(await api.getAll(), "component getAll");
    const indexed = [];
    for (const component of all) {
      const primitiveId = nonemptyString(
        await state(component, "getState_PrimitiveId"),
        "component primitive ID",
      );
      const designatorValue = await state(component, "getState_Designator", false);
      const designator = nullableString(designatorValue, "component designator");
      indexed.push({ component, primitiveId, designator });
    }
    if (new Set(indexed.map((item) => item.primitiveId)).size !== indexed.length) {
      throw new Error("component getAll returned duplicate primitive IDs");
    }
    const declaredIds = uniqueStrings(await api.getAllPrimitiveId(), "component getAllPrimitiveId");
    const objectIds = uniqueStrings(indexed.map((item) => item.primitiveId), "component getAll IDs");
    if (JSON.stringify(declaredIds) !== JSON.stringify(objectIds)) {
      throw new Error("component ID and object enumerations disagree");
    }
    let selected;
    if (REQUEST.selector.all === true) selected = indexed;
    else if (REQUEST.selector.primitiveIds) {
      const wanted = new Set(REQUEST.selector.primitiveIds);
      selected = indexed.filter((item) => wanted.has(item.primitiveId));
      if (selected.length !== wanted.size) throw new Error("one or more requested component primitive IDs were not found");
    } else {
      selected = [];
      for (const wanted of REQUEST.selector.designators) {
        const matches = indexed.filter((item) => item.designator === wanted);
        if (matches.length !== 1) throw new Error("designator " + wanted + " did not match exactly one component");
        selected.push(matches[0]);
      }
    }
    return selected.sort((left, right) => left.primitiveId.localeCompare(right.primitiveId));
  };

  if (REQUEST.kind === "schematic-components") {
    const componentApi = requiredApi("sch_PrimitiveComponent", "SCH_PrimitiveComponent", ["getAll", "getAllPrimitiveId", "getAllPinsByPrimitiveId"]);
    const primitiveApi = REQUEST.includeBounds
      ? requiredApi("sch_Primitive", "SCH_Primitive", ["getPrimitivesBBox"])
      : null;
    const selected = await selectComponents(componentApi);
    const byPrimitiveId = {};
    for (const item of selected) {
      const component = item.component;
      const primitiveId = item.primitiveId;
      const record = {
        primitiveId,
        primitiveType: nonemptyString(
          await state(component, "getState_PrimitiveType"),
          "schematic component primitive type",
        ),
        componentType: nonemptyString(
          await state(component, "getState_ComponentType"),
          "schematic component type",
        ),
        component: association(await state(component, "getState_Component", false), "schematic component association"),
        cbb: association(await state(component, "getState_Cbb", false), "schematic CBB association", "cbb"),
        cbbSymbol: association(await state(component, "getState_CbbSymbol", false), "schematic CBB symbol association", "cbb-symbol"),
        symbol: association(await state(component, "getState_Symbol", false), "schematic symbol association"),
        footprint: association(await state(component, "getState_Footprint", false), "schematic footprint association"),
        x: finite(await state(component, "getState_X"), "schematic component x"),
        y: finite(await state(component, "getState_Y"), "schematic component y"),
        rotation: finite(await state(component, "getState_Rotation"), "schematic component rotation"),
        mirror: requiredBoolean(
          await state(component, "getState_Mirror"),
          "schematic component mirror",
        ),
        subPartName: plain(await state(component, "getState_SubPartName", false), "schematic sub-part"),
        addIntoBom: plain(await state(component, "getState_AddIntoBom", false), "schematic BOM state"),
        addIntoPcb: plain(await state(component, "getState_AddIntoPcb", false), "schematic PCB state"),
        net: plain(await state(component, "getState_Net", false), "schematic component net"),
        designator: item.designator,
        name: plain(await state(component, "getState_Name", false), "schematic component name"),
        uniqueId: plain(await state(component, "getState_UniqueId", false), "schematic unique ID"),
        manufacturer: plain(await state(component, "getState_Manufacturer", false), "schematic manufacturer"),
        manufacturerId: plain(await state(component, "getState_ManufacturerId", false), "schematic manufacturer ID"),
        supplier: plain(await state(component, "getState_Supplier", false), "schematic supplier"),
        supplierId: plain(await state(component, "getState_SupplierId", false), "schematic supplier ID"),
        otherProperty: plain(await state(component, "getState_OtherProperty", false), "schematic other properties"),
      };
      if (REQUEST.includeBounds) record.bounds = await bbox(primitiveApi, primitiveId, "schematic component " + primitiveId);
      if (REQUEST.includePins) {
        const pins = requiredArray(await componentApi.getAllPinsByPrimitiveId(primitiveId), "schematic component pins");
        record.pins = [];
        for (const pin of pins) {
          record.pins.push({
            primitiveId: nonemptyString(
              await state(pin, "getState_PrimitiveId"),
              "schematic pin primitive ID",
            ),
            pinNumber: nonemptyString(
              await state(pin, "getState_PinNumber"),
              "schematic pin number",
            ),
            pinName: requiredString(await state(pin, "getState_PinName"), "schematic pin name"),
            x: finite(await state(pin, "getState_X"), "schematic pin x"),
            y: finite(await state(pin, "getState_Y"), "schematic pin y"),
            rotation: finite(await state(pin, "getState_Rotation"), "schematic pin rotation"),
            pinLength: finite(await state(pin, "getState_PinLength"), "schematic pin length"),
            pinColor: plain(await state(pin, "getState_PinColor"), "schematic pin color"),
            pinShape: requiredString(
              await state(pin, "getState_PinShape"),
              "schematic pin shape",
            ),
            pinType: requiredString(
              await state(pin, "getState_pinType"),
              "schematic pin type",
            ),
            noConnected: requiredBoolean(
              await state(pin, "getState_NoConnected"),
              "schematic pin no-connect state",
            ),
          });
        }
        record.pins.sort((left, right) => left.primitiveId.localeCompare(right.primitiveId));
        if (new Set(record.pins.map((pin) => pin.primitiveId)).size !== record.pins.length) {
          throw new Error("schematic component pins contain duplicate primitive IDs");
        }
      }
      byPrimitiveId[primitiveId] = record;
    }
    return {
      ok: true,
      kind: REQUEST.kind,
      documentType: 1,
      detail: { pins: REQUEST.includePins, bounds: REQUEST.includeBounds },
      units: { coordinates: "0.01inch", bounds: "0.01inch" },
      limitations: {
        componentPinOtherProperty:
          "Omitted: the pinned Component3 pin mapper does not populate the optional otherProperty constructor field.",
        componentOtherPropertyFiltering:
          "Adapter-filtered public state: the pinned Component3 mapper removes 3D Model, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId keys before exposing component otherProperty.",
        cbbLibraryOwnership:
          "Unavailable: the pinned Component3 CBB mapper exposes CBB and symbol UUIDs but sets both libraryUuid fields to undefined.",
      },
      primitiveIds: Object.keys(byPrimitiveId).sort(),
      byPrimitiveId,
    };
  }

  if (REQUEST.kind === "schematic-topology") {
    const netlistApi = requiredApi("sch_Netlist", "SCH_Netlist", ["getNetlist"]);
    const componentApi = requiredApi("sch_PrimitiveComponent", "SCH_PrimitiveComponent", ["getAll", "getAllPrimitiveId", "getAllPinsByPrimitiveId"]);
    // The pinned public adapters for sch_Net.getAllNets/getAllNetsName are
    // unconditional [] stubs, while sch_PrimitiveWire enumeration converts
    // RPC failures to []. Neither can establish complete topology. Use the
    // compiled JLCEDA netlist and make the missing wire-geometry authority
    // explicit instead of reporting a stable false-empty inventory.
    const componentObjects = requiredArray(
      await componentApi.getAll("part", true),
      "all-page schematic part components",
    );
    const declaredPrimitiveIds = uniqueStrings(
      await componentApi.getAllPrimitiveId("part", true),
      "all-page schematic part component IDs",
    );
    const componentIdentities = [];
    for (const component of componentObjects) {
      const primitiveId = nonemptyString(
        await state(component, "getState_PrimitiveId"),
        "all-page schematic component primitive ID",
      );
      const uniqueIdValue = await state(component, "getState_UniqueId", false);
      if (typeof uniqueIdValue !== "string" || uniqueIdValue.length === 0) {
        throw new Error("all-page schematic part component " + primitiveId + " has no unique ID");
      }
      const designatorValue = await state(component, "getState_Designator", false);
      const publicPins = requiredArray(
        await componentApi.getAllPinsByPrimitiveId(primitiveId),
        "all-page schematic part component pins",
      );
      const pinNumbers = uniqueStrings(
        await Promise.all(publicPins.map((pin) => state(pin, "getState_PinNumber"))),
        "all-page schematic part component pin numbers",
      );
      componentIdentities.push({
        primitiveId,
        uniqueId: uniqueIdValue,
        designator: nullableString(
          designatorValue,
          "all-page schematic component designator",
        ),
        pinNumbers,
      });
    }
    componentIdentities.sort((left, right) => left.primitiveId.localeCompare(right.primitiveId));
    const objectPrimitiveIds = uniqueStrings(
      componentIdentities.map((item) => item.primitiveId),
      "all-page schematic part object IDs",
    );
    if (JSON.stringify(declaredPrimitiveIds) !== JSON.stringify(objectPrimitiveIds)) {
      throw new Error("all-page schematic part ID and object enumerations disagree");
    }
    if (new Set(componentIdentities.map((item) => item.uniqueId)).size !== componentIdentities.length) {
      throw new Error("all-page schematic part components contain duplicate unique IDs");
    }

    const netlist = await netlistApi.getNetlist("JLCEDA");
    if (typeof netlist !== "string") {
      throw new Error("schematic netlist is unavailable");
    }
    const splitJsonDocuments = (source) => {
      try {
        const parsed = JSON.parse(source);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {}
      const documents = [];
      let start = -1;
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        if (inString) {
          if (escaped) escaped = false;
          else if (character.charCodeAt(0) === 92) escaped = true;
          else if (character === '"') inString = false;
          continue;
        }
        if (character === '"') inString = true;
        else if (character === "{" || character === "[") {
          if (depth === 0) start = index;
          depth += 1;
        } else if (character === "}" || character === "]") {
          depth -= 1;
          if (depth < 0) throw new Error("schematic netlist JSON sequence is malformed");
          if (depth === 0 && start >= 0) {
            const parsed = JSON.parse(source.slice(start, index + 1));
            documents.push(...(Array.isArray(parsed) ? parsed : [parsed]));
            start = -1;
          }
        }
      }
      if (depth !== 0 || inString || start !== -1 || documents.length === 0) {
        throw new Error("schematic netlist JSON sequence could not be parsed");
      }
      return documents;
    };
    const compiledConnectivity = [];
    for (const [documentIndex, rawDocument] of splitJsonDocuments(netlist).entries()) {
      const document = requiredObject(rawDocument, "schematic netlist document[" + documentIndex + "]");
      const components = document.components === undefined
        ? document
        : requiredObject(document.components, "schematic netlist document components");
      for (const fallbackUniqueId of Object.keys(components).sort()) {
        const item = requiredObject(components[fallbackUniqueId], "schematic netlist component");
        const props = requiredObject(item.props, "schematic netlist component props");
        const uniqueId = nonemptyString(
          props["Unique ID"] ?? props.UniqueId ?? fallbackUniqueId,
          "schematic netlist component unique ID",
        );
        const designatorValue = props.Designator ?? props.designator;
        const designator = designatorValue === undefined || designatorValue === null
          ? null
          : requiredString(designatorValue, "schematic netlist component designator");
        const pinInfoMap = item.pinInfoMap === undefined
          ? {}
          : requiredObject(item.pinInfoMap, "schematic netlist component pin map");
        const pins = [];
        for (const fallbackNumber of Object.keys(pinInfoMap).sort()) {
          const info = requiredObject(pinInfoMap[fallbackNumber], "schematic netlist pin");
          const pinNumber = nonemptyString(
            info.number ?? fallbackNumber,
            "schematic netlist pin number",
          );
          pins.push({
            pinNumber,
            net: nullableString(info.net, "schematic netlist pin net"),
          });
        }
        pins.sort((left, right) => left.pinNumber.localeCompare(right.pinNumber));
        if (new Set(pins.map((pin) => pin.pinNumber)).size !== pins.length) {
          throw new Error("schematic netlist component contains duplicate pin numbers");
        }
        compiledConnectivity.push({ uniqueId, designator, pins });
      }
    }
    compiledConnectivity.sort((left, right) =>
      left.uniqueId.localeCompare(right.uniqueId) ||
        (left.designator ?? "").localeCompare(right.designator ?? ""),
    );
    if (new Set(compiledConnectivity.map((item) => item.uniqueId)).size !== compiledConnectivity.length) {
      throw new Error("schematic netlist contains duplicate component unique IDs");
    }
    const identityByUniqueId = new Map(componentIdentities.map((item) => [item.uniqueId, item]));
    if (compiledConnectivity.length !== componentIdentities.length) {
      throw new Error("compiled schematic netlist count does not match all-page part components");
    }
    for (const compiled of compiledConnectivity) {
      const identity = identityByUniqueId.get(compiled.uniqueId);
      const compiledPinNumbers = compiled.pins.map((pin) => pin.pinNumber).sort();
      if (
        !identity ||
        identity.designator !== compiled.designator ||
        JSON.stringify(identity.pinNumbers) !== JSON.stringify(compiledPinNumbers)
      ) {
        throw new Error("compiled schematic netlist identity does not match all-page part components");
      }
    }
    const correlationByUniqueId = {};
    for (const identity of componentIdentities) {
      correlationByUniqueId[identity.uniqueId] = {
        primitiveId: identity.primitiveId,
        designator: identity.designator,
        pinNumbers: identity.pinNumbers,
      };
    }
    return {
      ok: true,
      kind: REQUEST.kind,
      documentType: 1,
      authority: {
        connectivity: "sch_Netlist.getNetlist(JLCEDA)",
        wireGeometry: "unavailable",
      },
      componentCorrelation: {
        status: "exact-match",
        source: "sch_PrimitiveComponent.getAll(part,true)",
        componentCount: componentIdentities.length,
        pinCount: componentIdentities.reduce((total, item) => total + item.pinNumbers.length, 0),
        primitiveIds: componentIdentities.map((item) => item.primitiveId),
        uniqueIds: componentIdentities.map((item) => item.uniqueId).sort(),
        byUniqueId: correlationByUniqueId,
      },
      limitations: [
        "The pinned sch_Net net-tree/name adapters are hard stubs and are not read.",
        "The pinned sch_PrimitiveWire enumerators swallow RPC failures, so wire geometry is not claimed complete.",
      ],
      compiledConnectivity,
    };
  }

  if (REQUEST.kind === "pcb-components") {
    const componentApi = requiredApi("pcb_PrimitiveComponent", "PCB_PrimitiveComponent", ["getAll", "getAllPrimitiveId", "getAllPinsByPrimitiveId"]);
    const primitiveApi = REQUEST.includeBounds
      ? requiredApi("pcb_Primitive", "PCB_Primitive", ["getPrimitivesBBox"])
      : null;
    const selected = await selectComponents(componentApi);
    const byPrimitiveId = {};
    for (const item of selected) {
      const component = item.component;
      const primitiveId = item.primitiveId;
      const record = {
        primitiveId,
        primitiveType: nonemptyString(
          await state(component, "getState_PrimitiveType"),
          "PCB component primitive type",
        ),
        component: association(await state(component, "getState_Component", false), "PCB component association"),
        footprint: association(await state(component, "getState_Footprint", false), "PCB footprint association"),
        model3D: association(await state(component, "getState_Model3D", false), "PCB model association"),
        layer: finite(await state(component, "getState_Layer"), "PCB component layer"),
        x: finite(await state(component, "getState_X"), "PCB component x"),
        y: finite(await state(component, "getState_Y"), "PCB component y"),
        rotation: finite(await state(component, "getState_Rotation"), "PCB component rotation"),
        primitiveLock: requiredBoolean(
          await state(component, "getState_PrimitiveLock"),
          "PCB component lock state",
        ),
        addIntoBom: requiredBoolean(
          await state(component, "getState_AddIntoBom"),
          "PCB component BOM state",
        ),
        designator: item.designator,
        name: plain(await state(component, "getState_Name", false), "PCB component name"),
        uniqueId: plain(await state(component, "getState_UniqueId", false), "PCB unique ID"),
        manufacturer: plain(await state(component, "getState_Manufacturer", false), "PCB manufacturer"),
        manufacturerId: plain(await state(component, "getState_ManufacturerId", false), "PCB manufacturer ID"),
        supplier: plain(await state(component, "getState_Supplier", false), "PCB supplier"),
        supplierId: plain(await state(component, "getState_SupplierId", false), "PCB supplier ID"),
        otherProperty: plain(await state(component, "getState_OtherProperty", false), "PCB other properties"),
      };
      if (REQUEST.includeBounds) record.bounds = await bbox(primitiveApi, primitiveId, "PCB component " + primitiveId);
      if (REQUEST.includePins) {
        const rawPadSummary = await state(component, "getState_Pads", false);
        const padSummary = rawPadSummary === null
          ? []
          : requiredArray(plain(rawPadSummary, "PCB pad summary"), "PCB pad summary");
        const pins = requiredArray(await componentApi.getAllPinsByPrimitiveId(primitiveId), "PCB component pads");
        record.pads = [];
        for (const wrapper of pins) {
          const padId = nonemptyString(
            await state(wrapper, "getState_PrimitiveId"),
            "PCB component-pad wrapper ID",
          );
          const pad = wrapper;
          const directPadId = nonemptyString(
            await state(pad, "getState_PrimitiveId"),
            "PCB direct pad ID",
          );
          if (directPadId !== padId) throw new Error("PCB component pad identity mismatch for " + padId);
          const primitiveType = nonemptyString(
            await state(pad, "getState_PrimitiveType"),
            "PCB direct pad primitive type",
          );
          if (primitiveType !== "ComponentPad") throw new Error("PCB component pad type mismatch for " + padId);
          const parentComponentPrimitiveId = nonemptyString(
            await state(wrapper, "getState_ParentComponentPrimitiveId"),
            "PCB component-pad parent ID",
          );
          if (parentComponentPrimitiveId !== primitiveId) {
            throw new Error("PCB component pad parent mismatch for " + padId);
          }
          const padRecord = {
            primitiveId: padId,
            primitiveType,
            parentComponentPrimitiveId,
            layer: finite(await state(pad, "getState_Layer"), "PCB component-pad layer"),
            padNumber: requiredString(
              await state(pad, "getState_PadNumber"),
              "PCB component-pad number",
            ),
            x: finite(await state(pad, "getState_X"), "PCB pad x"),
            y: finite(await state(pad, "getState_Y"), "PCB pad y"),
            rotation: finite(await state(pad, "getState_Rotation"), "PCB pad rotation"),
            net: nullableString(await state(pad, "getState_Net", false), "PCB component-pad net"),
            source: "component-pin-wrapper-transformed-placement-only",
          };
          record.pads.push(padRecord);
        }
        record.pads.sort((left, right) => left.primitiveId.localeCompare(right.primitiveId));
        if (new Set(record.pads.map((pad) => pad.primitiveId)).size !== record.pads.length) {
          throw new Error("PCB component pads contain duplicate primitive IDs");
        }
        const summaryIds = uniqueStrings(
          padSummary.map((pad) => pad?.primitiveId),
          "PCB component pad summary IDs",
        );
        const directIds = record.pads.map((pad) => pad.primitiveId).sort();
        if (JSON.stringify(summaryIds) !== JSON.stringify(directIds)) {
          throw new Error("PCB component pad summary and direct pad enumeration disagree");
        }
      }
      byPrimitiveId[primitiveId] = record;
    }
    return {
      ok: true,
      kind: REQUEST.kind,
      documentType: 3,
      detail: { pins: REQUEST.includePins, bounds: REQUEST.includeBounds },
      units: { coordinates: "mil", bounds: "mil", transformedPadCoordinates: "mil" },
      limitations: {
        componentPadWrapper:
          "Placed component-pad centers, identity, layer, number, and net only; pad/hole geometry is intentionally omitted because this pinned wrapper has a known 0.1 drill-scale defect.",
      },
      primitiveIds: Object.keys(byPrimitiveId).sort(),
      byPrimitiveId,
    };
  }

  if (REQUEST.kind === "pcb-inventory") {
    const definitions = [
      ["components", "pcb_PrimitiveComponent", "PCB_PrimitiveComponent"],
      ["pads", "pcb_PrimitivePad", "PCB_PrimitivePad"],
      ["vias", "pcb_PrimitiveVia", "PCB_PrimitiveVia"],
      ["lines", "pcb_PrimitiveLine", "PCB_PrimitiveLine"],
      ["arcs", "pcb_PrimitiveArc", "PCB_PrimitiveArc"],
      ["strings", "pcb_PrimitiveString", "PCB_PrimitiveString"],
      ["attributes", "pcb_PrimitiveAttribute", "PCB_PrimitiveAttribute"],
      ["polylines", "pcb_PrimitivePolyline", "PCB_PrimitivePolyline"],
      ["regions", "pcb_PrimitiveRegion", "PCB_PrimitiveRegion"],
      ["pours", "pcb_PrimitivePour", "PCB_PrimitivePour"],
      ["fills", "pcb_PrimitiveFill", "PCB_PrimitiveFill"],
      ["dimensions", "pcb_PrimitiveDimension", "PCB_PrimitiveDimension"],
      ["images", "pcb_PrimitiveImage", "PCB_PrimitiveImage"],
      ["objects", "pcb_PrimitiveObject", "PCB_PrimitiveObject"],
    ];
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
    const monitoredRecord = async (name, primitive, primitiveId) => {
      const base = {
        primitiveId,
        primitiveType: nonemptyString(
          await state(primitive, "getState_PrimitiveType"),
          name + " primitive type",
        ),
      };
      if (name === "pads") {
        return {
          ...base,
          layer: finite(await state(primitive, "getState_Layer"), "pad layer"),
          padNumber: requiredString(await state(primitive, "getState_PadNumber"), "pad number"),
          x: finite(await state(primitive, "getState_X"), "pad x"),
          y: finite(await state(primitive, "getState_Y"), "pad y"),
          rotation: finite(await state(primitive, "getState_Rotation"), "pad rotation"),
          pad: plain(await state(primitive, "getState_Pad", false), "pad shape"),
          specialPad: plain(await state(primitive, "getState_SpecialPad", false), "special pad"),
          net: nullableString(await state(primitive, "getState_Net", false), "pad net"),
          hole: plain(await state(primitive, "getState_Hole"), "pad hole"),
          holeOffsetX: finite(await state(primitive, "getState_HoleOffsetX"), "pad hole offset X"),
          holeOffsetY: finite(await state(primitive, "getState_HoleOffsetY"), "pad hole offset Y"),
          holeRotation: finite(await state(primitive, "getState_HoleRotation"), "pad hole rotation"),
          metallization: requiredBoolean(
            await state(primitive, "getState_Metallization"),
            "pad metallization",
          ),
          padType: integer(await state(primitive, "getState_PadType"), "pad type"),
          solderMaskAndPasteMaskExpansion: plain(await state(primitive, "getState_SolderMaskAndPasteMaskExpansion"), "pad mask expansion"),
          heatWelding: plain(await state(primitive, "getState_HeatWelding"), "pad heat welding"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "pad lock state",
          ),
          source: "pcb_PrimitivePad-direct-state",
        };
      }
      if (name === "vias") {
        return {
          ...base,
          net: nullableString(await state(primitive, "getState_Net", false), "via net"),
          x: finite(await state(primitive, "getState_X"), "via x"),
          y: finite(await state(primitive, "getState_Y"), "via y"),
          holeDiameter: finite(await state(primitive, "getState_HoleDiameter"), "via hole diameter"),
          diameter: finite(await state(primitive, "getState_Diameter"), "via diameter"),
          viaType: integer(await state(primitive, "getState_ViaType"), "via type"),
          designRuleBlindViaName: nullableString(await state(primitive, "getState_DesignRuleBlindViaName"), "blind-via rule name"),
          solderMaskExpansion: plain(await state(primitive, "getState_SolderMaskExpansion"), "via solder-mask expansion"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "via lock state",
          ),
        };
      }
      if (name === "lines" || name === "arcs") {
        const record = {
          ...base,
          net: nullableString(await state(primitive, "getState_Net", false), name + " net"),
          layer: finite(await state(primitive, "getState_Layer"), name + " layer"),
          startX: finite(await state(primitive, "getState_StartX"), name + " start X"),
          startY: finite(await state(primitive, "getState_StartY"), name + " start Y"),
          endX: finite(await state(primitive, "getState_EndX"), name + " end X"),
          endY: finite(await state(primitive, "getState_EndY"), name + " end Y"),
          lineWidth: finite(await state(primitive, "getState_LineWidth"), name + " line width"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            name + " lock state",
          ),
        };
        if (name === "arcs") {
          record.arcAngle = finite(await state(primitive, "getState_ArcAngle"), "arc angle");
          record.interactiveMode = integer(
            await state(primitive, "getState_InteractiveMode"),
            "arc interactive mode",
          );
        }
        return record;
      }
      if (name === "polylines") {
        return {
          ...base,
          net: nullableString(await state(primitive, "getState_Net", false), "polyline net"),
          layer: finite(await state(primitive, "getState_Layer"), "polyline layer"),
          polygon: polygonSource(await state(primitive, "getState_Polygon"), "polyline polygon"),
          lineWidth: finite(await state(primitive, "getState_LineWidth"), "polyline line width"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "polyline lock state",
          ),
        };
      }
      if (name === "regions") {
        return {
          ...base,
          layer: finite(await state(primitive, "getState_Layer"), "region layer"),
          complexPolygon: polygonSource(await state(primitive, "getState_ComplexPolygon"), "region polygon"),
          regionName: nullableString(await state(primitive, "getState_RegionName", false), "region name"),
          lineWidth: finite(await state(primitive, "getState_LineWidth"), "region line width"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "region lock state",
          ),
        };
      }
      if (name === "pours") {
        return {
          ...base,
          net: nullableString(await state(primitive, "getState_Net", false), "pour net"),
          layer: finite(await state(primitive, "getState_Layer"), "pour layer"),
          complexPolygon: polygonSource(await state(primitive, "getState_ComplexPolygon"), "pour polygon"),
          pourFillMethod: plain(await state(primitive, "getState_PourFillMethod"), "pour fill method"),
          preserveSilos: requiredBoolean(
            await state(primitive, "getState_PreserveSilos"),
            "pour preserve-silos state",
          ),
          pourName: nullableString(await state(primitive, "getState_PourName", false), "pour name"),
          pourPriority: finite(await state(primitive, "getState_PourPriority"), "pour priority"),
          lineWidth: finite(await state(primitive, "getState_LineWidth"), "pour line width"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "pour lock state",
          ),
        };
      }
      if (name === "poured") {
        const rawFills = requiredArray(await state(primitive, "getState_PourFills"), "poured fill regions");
        const pourFills = rawFills.map((fill, index) => {
          const row = requiredObject(fill, "poured fill region[" + index + "]");
          if (typeof row.id !== "string" || row.id.length === 0) {
            throw new Error("poured fill region has no ID");
          }
          return {
            id: row.id,
            path: polygonSource(row.path, "poured fill region path"),
            lineWidth: finite(row.lineWidth, "poured fill region line width"),
            fill: requiredBoolean(row.fill, "poured fill region fill state"),
          };
        });
        pourFills.sort((left, right) => left.id.localeCompare(right.id));
        return {
          ...base,
          pourPrimitiveId: nonemptyString(
            await state(primitive, "getState_PourPrimitiveId"),
            "poured parent pour ID",
          ),
          pourFills,
        };
      }
      if (name === "fills") {
        return {
          ...base,
          net: nullableString(await state(primitive, "getState_Net", false), "fill net"),
          layer: finite(await state(primitive, "getState_Layer"), "fill layer"),
          complexPolygon: polygonSource(await state(primitive, "getState_ComplexPolygon"), "fill polygon"),
          lineWidth: finite(await state(primitive, "getState_LineWidth"), "fill line width"),
          primitiveLock: requiredBoolean(
            await state(primitive, "getState_PrimitiveLock"),
            "fill lock state",
          ),
        };
      }
      throw new Error("no monitored-state serializer for PCB family " + name);
    };
    const families = {};
    const objectsByFamily = {};
    for (const [name, lower, upper] of definitions) {
      const api = requiredApi(lower, upper, ["getAllPrimitiveId", "getAll"]);
      const declaredIds = uniqueStrings(await api.getAllPrimitiveId(), lower + ".getAllPrimitiveId");
      const objects = requiredArray(await api.getAll(), lower + ".getAll");
      const objectIds = [];
      const byPrimitiveId = {};
      for (const object of objects) {
        const primitiveId = nonemptyString(
          await state(object, "getState_PrimitiveId"),
          lower + " primitive ID",
        );
        objectIds.push(primitiveId);
        if (monitoredFamilies.has(name)) {
          if (byPrimitiveId[primitiveId]) throw new Error(lower + " getAll returned duplicate primitive IDs");
          byPrimitiveId[primitiveId] = await monitoredRecord(name, object, primitiveId);
        }
      }
      const serializedIds = uniqueStrings(objectIds, lower + ".getAll primitive IDs");
      if (JSON.stringify(declaredIds) !== JSON.stringify(serializedIds)) {
        throw new Error(lower + " ID and object enumerations disagree");
      }
      objectsByFamily[name] = objects;
      families[name] = {
        status: "adapter-enumerated",
        count: declaredIds.length,
        primitiveIds: declaredIds,
        ...(monitoredFamilies.has(name) ? { byPrimitiveId } : {}),
      };
    }
    const pouredApi = requiredApi("pcb_PrimitivePoured", "PCB_PrimitivePoured", ["getAllPrimitiveId", "getAll"]);
    const declaredPouredParentIds = uniqueStrings(
      await pouredApi.getAllPrimitiveId(),
      "pcb_PrimitivePoured.getAllPrimitiveId",
    );
    const pouredObjects = requiredArray(await pouredApi.getAll(), "pcb_PrimitivePoured.getAll");
    const pouredObjectParentIds = [];
    const pouredByPourPrimitiveId = {};
    const pouredFillPieceIds = [];
    for (const object of pouredObjects) {
      const primitiveId = nonemptyString(
        await state(object, "getState_PrimitiveId"),
        "pcb_PrimitivePoured parent pour ID",
      );
      if (pouredByPourPrimitiveId[primitiveId]) {
        throw new Error("pcb_PrimitivePoured returned duplicate parent pour IDs");
      }
      const record = await monitoredRecord("poured", object, primitiveId);
      if (record.pourPrimitiveId !== primitiveId) {
        throw new Error("poured state primitive ID does not equal its parent pour ID");
      }
      if (!families.pours.byPrimitiveId[primitiveId]) {
        throw new Error("poured state references a parent absent from pcb_PrimitivePour");
      }
      pouredObjectParentIds.push(primitiveId);
      pouredFillPieceIds.push(...record.pourFills.map((fill) => fill.id));
      pouredByPourPrimitiveId[primitiveId] = record;
    }
    const exactPouredParentIds = uniqueStrings(
      pouredObjectParentIds,
      "pcb_PrimitivePoured.getAll parent pour IDs",
    );
    if (JSON.stringify(declaredPouredParentIds) !== JSON.stringify(exactPouredParentIds)) {
      throw new Error("pcb_PrimitivePoured ID and object enumerations disagree");
    }
    uniqueStrings(pouredFillPieceIds, "poured fill-piece IDs");
    const pouredCorrelation = {
      status: "derived-subset",
      count: exactPouredParentIds.length,
      pourPrimitiveIds: exactPouredParentIds,
      byPourPrimitiveId: pouredByPourPrimitiveId,
    };

    const apiPrimitiveIds = [];
    for (const family of Object.values(families)) apiPrimitiveIds.push(...family.primitiveIds);
    const apiPrimitiveIdSet = new Set(apiPrimitiveIds);
    if (apiPrimitiveIdSet.size !== apiPrimitiveIds.length) {
      throw new Error("PCB public primitive families contain overlapping IDs");
    }
    const componentPadIds = [];
    const componentPadsByPrimitiveId = {};
    const componentPadIdsByComponentPrimitiveId = {};
    for (const component of objectsByFamily.components) {
      const componentId = nonemptyString(
        await state(component, "getState_PrimitiveId"),
        "PCB component correlation primitive ID",
      );
      if (componentPadIdsByComponentPrimitiveId[componentId]) {
        throw new Error("PCB component pad correlation contains a duplicate component ID");
      }
      componentPadIdsByComponentPrimitiveId[componentId] = [];
      const rawPads = await state(component, "getState_Pads", false);
      const pads = rawPads === null
        ? []
        : requiredArray(rawPads, "PCB component pad summary");
      for (const pad of pads) {
        const padId = nonemptyString(
          pad?.primitiveId,
          "PCB component pad summary primitive ID",
        );
        if (
          !padId ||
          typeof pad?.padNumber !== "string" ||
          !["string", "undefined"].includes(typeof pad?.net)
        ) {
          throw new Error("PCB component pad summary contains an invalid row");
        }
        if (componentPadsByPrimitiveId[padId]) {
          throw new Error("PCB component pad summary contains duplicate primitive IDs");
        }
        const directPad = families.pads.byPrimitiveId[padId];
        if (!directPad) {
          throw new Error("PCB component pad summary references a pad absent from pcb_PrimitivePad");
        }
        const nullableNet = pad.net ?? null;
        if (directPad.padNumber !== pad.padNumber || directPad.net !== nullableNet) {
          throw new Error("PCB component pad summary disagrees with direct pad identity or net");
        }
        componentPadIds.push(padId);
        componentPadIdsByComponentPrimitiveId[componentId].push(padId);
        componentPadsByPrimitiveId[padId] = {
          primitiveId: padId,
          parentComponentPrimitiveId: componentId,
          padNumber: pad.padNumber,
          net: nullableNet,
          source: "component-getState_Pads",
        };
        directPad.parentComponentPrimitiveId = componentId;
        directPad.componentCorrelationSource = "component-getState_Pads";
      }
      componentPadIdsByComponentPrimitiveId[componentId].sort();
    }
    const exactComponentPadIds = uniqueStrings(componentPadIds, "PCB component pad IDs");
    const componentPadCorrelation = {
      status: "exact-subset",
      count: exactComponentPadIds.length,
      primitiveIds: exactComponentPadIds,
      byPrimitiveId: componentPadsByPrimitiveId,
      byComponentPrimitiveId: componentPadIdsByComponentPrimitiveId,
    };
    return {
      ok: true,
      kind: REQUEST.kind,
      documentType: 3,
      families,
      componentPadCorrelation,
      pouredCorrelation,
      physicalPadCount: families.pads.count,
      standalonePadCount: families.pads.count - componentPadCorrelation.count,
      pouredFillPieceCount: pouredFillPieceIds.length,
      enumeratedPrimitiveCount: apiPrimitiveIds.length,
      units: {
        coordinatesAndLengths: "mil",
        angles: "degree",
        layers: "numeric EPCB_LayerId",
      },
      limitations: {
        directPads:
          "pcb_PrimitivePad enumerates both component-owned and standalone pads; its direct state is the sole physical pad and hole record.",
        componentPadCorrelation:
          "Component getState_Pads contributes parent identity, pad number, and nullable net as an exact subset correlation; the pinned mapper emits undefined for a legitimate zero-pad component, which is normalized to an empty per-component list, and it is never counted as a second physical pad family.",
        pouredCorrelation:
          "pcb_PrimitivePoured groups derived fill state by its parent pour ID; parent IDs are correlated to pours and child getState_PourFills IDs identify fill pieces, with no second primitive count.",
        regionRuleTypes:
          "Omitted: the pinned PCB region adapter drops raw no-via rule state instead of mapping it to EPCB_PrimitiveRegionRuleType.NO_VIAS.",
        fillModes:
          "Omitted: the pinned PCB fill adapter hardcodes fillMode=0 rather than reading persisted state.",
        arcPrecision:
          "Adapter-normalized public state: arc start/end coordinates and arcAngle are rounded to one decimal adapter unit, so sub-step persisted drift is not observable here.",
        viaPrecision:
          "Adapter-normalized public state: raw via radii are rounded to one decimal before exposed diameter conversion, so this is not raw persisted precision.",
        unmonitoredFamilies:
          "Components, strings, attributes, dimensions, images, and objects are identity-counted here; component state is read separately and the remaining visual families are not geometry-serialized.",
      },
    };
  }

  if (REQUEST.kind === "pcb-rules") {
    const drc = requiredApi("pcb_Drc", "PCB_Drc", [
      "getCurrentRuleConfigurationName",
      "getCurrentRuleConfiguration",
      "getNetRules",
      "getNetByNetRules",
      "getRegionRules",
      "getAllNetClasses",
      "getAllDifferentialPairs",
      "getAllEqualLengthNetGroups",
      "getAllPadPairGroups",
      "getPadPairGroupMinWireLength",
    ]);
    const netApi = requiredApi("pcb_Net", "PCB_Net", ["getAllNetsName"]);
    const configurationName = await drc.getCurrentRuleConfigurationName();
    if (typeof configurationName !== "string" || configurationName.length === 0) {
      throw new Error("current PCB rule configuration name is unavailable");
    }
    const rawConfiguration = requiredObject(
      await drc.getCurrentRuleConfiguration(),
      "current PCB rule configuration",
    );
    if (
      !Object.prototype.hasOwnProperty.call(rawConfiguration, "name") ||
      typeof rawConfiguration.name !== "string" ||
      rawConfiguration.name.length === 0 ||
      rawConfiguration.name !== configurationName
    ) {
      throw new Error("current PCB rule configuration getters disagree on the configuration name");
    }
    if (!Object.prototype.hasOwnProperty.call(rawConfiguration, "config")) {
      throw new Error("current PCB rule configuration omitted its config object");
    }
    const configuration = {
      name: rawConfiguration.name,
      config: plain(
        requiredObject(rawConfiguration.config, "current PCB rule configuration config"),
        "current PCB rule configuration config",
      ),
    };
    if (Object.keys(configuration.config).length === 0) {
      throw new Error("current PCB rule configuration config is empty");
    }
    const nets = uniqueStrings(await netApi.getAllNetsName(), "PCB net names");
    const netSet = new Set(nets);
    const named = (value, label) => {
      if (typeof value !== "string" || value.length === 0) throw new Error(label + " has no name");
      return value;
    };
    const color = (value, label) => {
      if (value === null) return null;
      const row = requiredObject(value, label + " color");
      return {
        r: finite(row.r, label + " color.r"),
        g: finite(row.g, label + " color.g"),
        b: finite(row.b, label + " color.b"),
        alpha: finite(row.alpha, label + " color.alpha"),
      };
    };
    const memberNets = (value, label) => {
      const members = uniqueStrings(value, label + " nets");
      for (const net of members) {
        if (!netSet.has(net)) throw new Error(label + " references unknown net " + net);
      }
      return members;
    };
    const normalizeBroadRows = (value, label) =>
      requiredArray(value, label).map((row, index) =>
        plain(requiredObject(row, label + "[" + index + "]"), label + "[" + index + "]"),
      );

    const netRules = normalizeBroadRows(await drc.getNetRules(), "PCB net rules");
    const ruleLeafNets = [];
    const visitRuleRow = (row, label) => {
      if (row.type === "net") {
        const net = named(row.name, label + " net leaf");
        if (!netSet.has(net)) throw new Error(label + " references unknown net " + net);
        ruleLeafNets.push(net);
      }
      if (row.sub !== undefined) {
        for (const [index, child] of requiredArray(row.sub, label + " sub-rules").entries()) {
          visitRuleRow(requiredObject(child, label + " sub-rule[" + index + "]"), label + " sub-rule");
        }
      }
    };
    for (const [index, row] of netRules.entries()) visitRuleRow(row, "PCB net rule[" + index + "]");
    if (new Set(ruleLeafNets).size !== ruleLeafNets.length) {
      throw new Error("PCB net rules contain duplicate net leaves");
    }
    if (JSON.stringify([...ruleLeafNets].sort()) !== JSON.stringify(nets)) {
      throw new Error("PCB net rule leaves do not cover every live net exactly once");
    }

    const rawNetByNetRules = requiredObject(await drc.getNetByNetRules(), "PCB net-to-net rules");
    const netByNetRules = {};
    for (const key of Object.keys(rawNetByNetRules).sort()) {
      netByNetRules[key] = normalizeBroadRows(rawNetByNetRules[key], "PCB net-to-net rule " + key);
    }
    const regionRules = normalizeBroadRows(await drc.getRegionRules(), "PCB region rules");

    const rawNetClasses = requiredArray(await drc.getAllNetClasses(), "PCB net classes");
    const netClasses = rawNetClasses.map((rawClass, index) => {
      const row = requiredObject(rawClass, "PCB net class[" + index + "]");
      const name = named(row.name, "PCB net class");
      return { name, nets: memberNets(row.nets, "PCB net class " + name), color: color(row.color, "PCB net class " + name) };
    });
    netClasses.sort((left, right) => left.name.localeCompare(right.name));
    if (new Set(netClasses.map((row) => row.name)).size !== netClasses.length) {
      throw new Error("PCB net classes contain duplicate names");
    }

    const rawDifferentialPairs = requiredArray(await drc.getAllDifferentialPairs(), "PCB differential pairs");
    const differentialPairs = rawDifferentialPairs.map((rawPair, index) => {
      const row = requiredObject(rawPair, "PCB differential pair[" + index + "]");
      const name = named(row.name, "PCB differential pair");
      const positiveNet = named(row.positiveNet, "PCB differential pair " + name + " positive net");
      const negativeNet = named(row.negativeNet, "PCB differential pair " + name + " negative net");
      if (!netSet.has(positiveNet) || !netSet.has(negativeNet) || positiveNet === negativeNet) {
        throw new Error("PCB differential pair " + name + " has invalid member nets");
      }
      return { name, positiveNet, negativeNet };
    });
    differentialPairs.sort((left, right) => left.name.localeCompare(right.name));
    if (new Set(differentialPairs.map((row) => row.name)).size !== differentialPairs.length) {
      throw new Error("PCB differential pairs contain duplicate names");
    }

    const rawEqualLengthGroups = requiredArray(await drc.getAllEqualLengthNetGroups(), "PCB equal-length groups");
    const equalLengthGroups = rawEqualLengthGroups.map((rawGroup, index) => {
      const row = requiredObject(rawGroup, "PCB equal-length group[" + index + "]");
      const name = named(row.name, "PCB equal-length group");
      return { name, nets: memberNets(row.nets, "PCB equal-length group " + name), color: color(row.color, "PCB equal-length group " + name) };
    });
    equalLengthGroups.sort((left, right) => left.name.localeCompare(right.name));
    if (new Set(equalLengthGroups.map((row) => row.name)).size !== equalLengthGroups.length) {
      throw new Error("PCB equal-length groups contain duplicate names");
    }
    const rawPadPairGroups = requiredArray(await drc.getAllPadPairGroups(), "PCB pad-pair groups");
    const padPairGroups = [];
    for (const rawGroup of rawPadPairGroups) {
      const group = requiredObject(rawGroup, "PCB pad-pair group");
      if (typeof group.name !== "string" || group.name.length === 0) {
        throw new Error("PCB pad-pair group has no name");
      }
      const padPairs = requiredArray(group.padPairs, "PCB pad-pair group pairs").map((pair) => {
        if (
          !Array.isArray(pair) ||
          pair.length !== 2 ||
          pair.some((pad) => typeof pad !== "string" || pad.length === 0)
        ) {
          throw new Error("PCB pad-pair group contains an invalid pair");
        }
        return [pair[0], pair[1]];
      });
      padPairs.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
      const rawLengths = requiredArray(
        await drc.getPadPairGroupMinWireLength(group.name),
        "PCB pad-pair minimum wire lengths",
      );
      const minimumWireLengths = rawLengths.map((rawLength) => {
        const length = requiredObject(rawLength, "PCB pad-pair minimum wire length");
        if (
          !Array.isArray(length.padPair) ||
          length.padPair.length !== 2 ||
          length.padPair.some((pad) => typeof pad !== "string" || pad.length === 0)
        ) {
          throw new Error("PCB pad-pair minimum wire length contains an invalid pair");
        }
        return {
          padPair: [length.padPair[0], length.padPair[1]],
          minWireLength: finite(length.minWireLength, "PCB pad-pair minimum wire length"),
        };
      });
      minimumWireLengths.sort((left, right) =>
        JSON.stringify(left.padPair).localeCompare(JSON.stringify(right.padPair)),
      );
      const pairKeys = padPairs.map((pair) => JSON.stringify(pair));
      const lengthKeys = minimumWireLengths.map((row) => JSON.stringify(row.padPair));
      if (
        new Set(pairKeys).size !== pairKeys.length ||
        new Set(lengthKeys).size !== lengthKeys.length ||
        JSON.stringify(pairKeys) !== JSON.stringify(lengthKeys)
      ) {
        throw new Error("PCB pad-pair group pairs and minimum-length rows disagree");
      }
      padPairGroups.push({ name: group.name, padPairs, minimumWireLengths });
    }
    padPairGroups.sort((left, right) => left.name.localeCompare(right.name));
    if (new Set(padPairGroups.map((group) => group.name)).size !== padPairGroups.length) {
      throw new Error("PCB pad-pair groups contain duplicate names");
    }
    return {
      ok: true,
      kind: REQUEST.kind,
      documentType: 3,
      nets,
      rules: {
        configurationName,
        configuration,
        netRules: plain(netRules, "PCB net rules"),
        netByNetRules: plain(netByNetRules, "PCB net-to-net rules"),
        regionRules: plain(regionRules, "PCB region rules"),
        netClasses,
        differentialPairs,
        equalLengthGroups,
        padPairGroups,
      },
      units: { padPairMinimumWireLength: "mil" },
      limitations: {
        configurationFallback:
          "The pinned public API may return EasyEDA's global JLCPCB default when the project has no saved default; this value is an invariant observation, not proof that the named configuration is persisted in the project.",
      },
    };
  }

  throw new Error("unsupported exact-reader request");
})();`;
}
