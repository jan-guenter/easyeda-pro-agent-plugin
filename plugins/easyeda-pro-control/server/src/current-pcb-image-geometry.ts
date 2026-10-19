import { z } from "zod";

// oxlint-disable-next-line typescript/consistent-type-definitions -- Zod's mapped shape constraint requires the closed type alias, not an open interface lacking an index signature.
type ImageShape = {
  primitiveId: z.ZodType<string>; primitiveType: z.ZodLiteral<"Image">; primitiveLock: z.ZodBoolean;
  imageType: z.ZodEnum<{ Image: "Image"; Picture: "Picture" }>; layer: z.ZodType<number>;
  x: z.ZodType<number>; y: z.ZodType<number>; width: z.ZodType<number>; height: z.ZodType<number>;
  rotation: z.ZodType<number>; horizonMirror: z.ZodBoolean;
};

/** Reuse the parent observer's scalar/identity bounds without importing its
 * request module back into this family-specific projection.
 */
export function createCurrentPcbImageSchema(numberSchema: z.ZodType<number>, layerSchema: z.ZodType<number>, idSchema: z.ZodType<string>): z.ZodObject<ImageShape> {
  const dimension = numberSchema.refine((value) => value >= 0, "Negative native image dimension.");
  return z.object({ primitiveId: idSchema, primitiveType: z.literal("Image"), primitiveLock: z.boolean(),
    imageType: z.enum(["Image", "Picture"]), layer: layerSchema, x: numberSchema, y: numberSchema,
    width: dimension, height: dimension, rotation: numberSchema, horizonMirror: z.boolean() }).strict();
}

/** Fixed fragment within current-pcb-geometry-program's complete-family copy.
 * The pinned native callback scales geometry once. No SDK constructors, asset
 * getters, polygon/path decoding or source export are used by this projection.
 */
export const CURRENT_PCB_IMAGE_ROW_PROGRAM = `
  // PCB217199c8@10357328 returns vector Image then Picture DTOs, already in mil/degrees.
  // Native getByIds searches only vector images; both methods use complete getAll.
  if(family==='Image'){
   const imageType=text(own(row,'imageType'),7);if(imageType!=='Image'&&imageType!=='Picture')bad();
   const start=point(own(row,'start')),width=num(own(row,'width')),height=num(own(row,'height'));
   if(width<0||height<0)bad();
   rows.push({...identity,imageType,layer:layer(own(row,'layerId')),x:start.x,y:start.y,width,height,
    rotation:num(own(row,'rotation')),horizonMirror:bool(own(row,'mirror'))});continue;
  }
`;

export const CURRENT_PCB_IMAGE_GEOMETRY_LIMITATION = "Image observes vector Image then Picture manager order, with no parent filter and only existing stateWatcher views. Each DTO retains native imageType Image/Picture, ID, layer, lock, start x/y, width, height, degree rotation and horizonMirror. Native getAll already scales positions/dimensions to mil and rotation to degrees; no second conversion or public constructor defaults apply. Zero dimensions remain observations, not renderability or manufacturing approval. The start anchor is not a computed rotated or mirrored bounding box; horizonMirror is the native mirror flag, not effective rendered mirroring. get uses the complete combined family, unlike native getByIds which searches only vector images. Template geometry, transformed pathString, Picture hashId, source/binary assets, silkColor, partition/group, ownership and saved membership are omitted and not compared. Native vector template/path serialization precedes facade bounds and can allocate temporary geometry; the existing Picture serializer does not access its asset-backed source getter. No asset availability, image content, rendered bounds, completeness of saved source or writer baseline is established.";
