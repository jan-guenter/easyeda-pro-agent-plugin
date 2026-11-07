/** Complete eager Ke constructor graph for the distinct inverse. These pinned
 * source/data facts issue no original scope, instance, clock or delete grant. */
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { qualifyCurrentFootprintDeleteSource } from "./current-footprint-delete-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES=freezeDeep([
  {
    "name": "Ke",
    "parent": null,
    "start": 661_982,
    "end": 662_273,
    "bytes": 291,
    "sha256": "57b9a4fafb7a173b03bc25c402368ab4583edfb2be46606cb07054d7d3162ec8",
    "constructorStart": 661_988,
    "constructorEnd": 662_272,
    "lineNumber": 56,
    "columnNumber": 1336
  },
  {
    "name": "of",
    "parent": null,
    "start": 619_698,
    "end": 620_278,
    "bytes": 580,
    "sha256": "801374a19433daf44ea622a8f9f49df7b52fe1b74d9ee814b7eab0ca48ae1177",
    "constructorStart": 619_704,
    "constructorEnd": 619_719,
    "lineNumber": 19,
    "columnNumber": 251_694
  },
  {
    "name": "th",
    "parent": "of",
    "start": 620_518,
    "end": 620_646,
    "bytes": 128,
    "sha256": "77931ee72db506d7c539af365c43b252409a81dafdadfcbf018373a4f4f5fea4",
    "constructorStart": null,
    "constructorEnd": null,
    "lineNumber": 19,
    "columnNumber": 252_497
  },
  {
    "name": "Fo",
    "parent": "th",
    "start": 648_432,
    "end": 648_554,
    "bytes": 122,
    "sha256": "8ca6b53e9747fbd3dff12518419441e13590a9cede308739c8655f0c57551b31",
    "constructorStart": null,
    "constructorEnd": null,
    "lineNumber": 45,
    "columnNumber": 20
  },
  {
    "name": "rl",
    "parent": "of",
    "start": 620_282,
    "end": 620_514,
    "bytes": 232,
    "sha256": "5b8c68d0aabe9368e1203162ac55446ce591225313e2e677e427c3c00f26bd4d",
    "constructorStart": 620_299,
    "constructorEnd": 620_353,
    "lineNumber": 19,
    "columnNumber": 252_289
  },
  {
    "name": "$p",
    "parent": "of",
    "start": 661_339,
    "end": 661_575,
    "bytes": 236,
    "sha256": "c80abd7de9189154625eb4c7816fe9b93795c17909614212d6d8c8e64e369ca2",
    "constructorStart": 661_356,
    "constructorEnd": 661_410,
    "lineNumber": 56,
    "columnNumber": 704
  },
  {
    "name": "JR",
    "parent": "th",
    "start": 620_650,
    "end": 620_773,
    "bytes": 123,
    "sha256": "271eb899aa9663fb008b343df55104d1738f066df92175554a549ef1acc494f8",
    "constructorStart": 620_667,
    "constructorEnd": 620_722,
    "lineNumber": 19,
    "columnNumber": 252_657
  },
  {
    "name": "XR",
    "parent": "th",
    "start": 620_777,
    "end": 621_027,
    "bytes": 250,
    "sha256": "44f2f9b3c0f8067d6c19c8acd01c687fa5bd605fc46347266f5b3dca32bf6d20",
    "constructorStart": 620_794,
    "constructorEnd": 620_850,
    "lineNumber": 19,
    "columnNumber": 252_784
  },
  {
    "name": "ZR",
    "parent": "th",
    "start": 621_031,
    "end": 621_207,
    "bytes": 176,
    "sha256": "bf9b5823f8811c74886a8af3c46a7afcf7ea50ab475f57a6a1bacc8fe90060ca",
    "constructorStart": 621_048,
    "constructorEnd": 621_104,
    "lineNumber": 19,
    "columnNumber": 253_038
  },
  {
    "name": "rN",
    "parent": "Fo",
    "start": 648_558,
    "end": 648_825,
    "bytes": 267,
    "sha256": "31c6cca0213b488eb39df5c9e7689fac4fea7e4efcdca46ac341a0fd2de63a67",
    "constructorStart": 648_575,
    "constructorEnd": 648_634,
    "lineNumber": 45,
    "columnNumber": 174
  },
  {
    "name": "nN",
    "parent": "Fo",
    "start": 649_025,
    "end": 649_249,
    "bytes": 224,
    "sha256": "82add1001879be261e4a8b9d0f1d4c97155492388a88be90eeed65994209d994",
    "constructorStart": 649_042,
    "constructorEnd": 649_097,
    "lineNumber": 46,
    "columnNumber": 36
  },
  {
    "name": "aN",
    "parent": "Fo",
    "start": 649_253,
    "end": 649_562,
    "bytes": 309,
    "sha256": "287fafc47d2e7bfa176a3d6663ed8c9ba5ace1aae4c62bcc9c1a3631d7c3ee70",
    "constructorStart": 649_270,
    "constructorEnd": 649_323,
    "lineNumber": 46,
    "columnNumber": 264
  },
  {
    "name": "oN",
    "parent": "th",
    "start": 649_566,
    "end": 649_849,
    "bytes": 283,
    "sha256": "74605eb1c1c3195b772a7bc7deb283e064903c28c263c31d35fdc399cebf2226",
    "constructorStart": 649_583,
    "constructorEnd": 649_636,
    "lineNumber": 46,
    "columnNumber": 577
  },
  {
    "name": "fN",
    "parent": "Fo",
    "start": 660_738,
    "end": 661_014,
    "bytes": 276,
    "sha256": "07efef80f68cd6e54b0d98c7665b13b8044ba59ca217f1b83afccd6bf3b88285",
    "constructorStart": 660_755,
    "constructorEnd": 660_813,
    "lineNumber": 56,
    "columnNumber": 103
  },
  {
    "name": "mN",
    "parent": "Fo",
    "start": 661_018,
    "end": 661_335,
    "bytes": 317,
    "sha256": "7b0e1925e8b531b570fabfb700c74bca9a39f14c0748500965025c47304bbae0",
    "constructorStart": 661_035,
    "constructorEnd": 661_091,
    "lineNumber": 56,
    "columnNumber": 383
  },
  {
    "name": "iN",
    "parent": "of",
    "start": 648_829,
    "end": 649_021,
    "bytes": 192,
    "sha256": "dc9d5e03fc863218e90ceea664841df1b5a6dc559721cc36c2d44876a1afa821",
    "constructorStart": 648_846,
    "constructorEnd": 648_904,
    "lineNumber": 45,
    "columnNumber": 445
  },
  {
    "name": "gN",
    "parent": "Fo",
    "start": 661_579,
    "end": 661_812,
    "bytes": 233,
    "sha256": "ccc8f8eee196ff4806054baafa0eb9e966a644f479626ac83173378d0049b82f",
    "constructorStart": 661_596,
    "constructorEnd": 661_655,
    "lineNumber": 56,
    "columnNumber": 944
  },
  {
    "name": "yN",
    "parent": "Fo",
    "start": 661_816,
    "end": 661_978,
    "bytes": 162,
    "sha256": "71bea746daa7cd4b79d529ab11eea819221cbaf2b3abfc3d920bcf5548ec8c9e",
    "constructorStart": 661_833,
    "constructorEnd": 661_893,
    "lineNumber": 56,
    "columnNumber": 1181
  }
] as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS=freezeDeep([
  {
    "field": "blob",
    "constructor": "rl",
    "docType": "BLOB"
  },
  {
    "field": "font",
    "constructor": "$p",
    "docType": "FONT"
  },
  {
    "field": "board",
    "constructor": "JR",
    "docType": "BOARD"
  },
  {
    "field": "config",
    "constructor": "XR",
    "docType": "CONFIG"
  },
  {
    "field": "device",
    "constructor": "ZR",
    "docType": "DEVICE"
  },
  {
    "field": "footprint",
    "constructor": "rN",
    "docType": "FOOTPRINT"
  },
  {
    "field": "panel",
    "constructor": "nN",
    "docType": "PANEL"
  },
  {
    "field": "pcb",
    "constructor": "aN",
    "docType": "PCB"
  },
  {
    "field": "schematic",
    "constructor": "oN",
    "docType": "SCH"
  },
  {
    "field": "sheet",
    "constructor": "fN",
    "docType": "SCH_PAGE"
  },
  {
    "field": "symbol",
    "constructor": "mN",
    "docType": "SYMBOL"
  },
  {
    "field": "instance",
    "constructor": "iN",
    "docType": "INSTANCE"
  },
  {
    "field": "panelLib",
    "constructor": "gN",
    "docType": "PANEL_LIB"
  },
  {
    "field": "simulation",
    "constructor": "yN",
    "docType": "SIMULATION"
  }
] as const);

function bad():never{throw new Error("FOOTPRINT_INVERSE_DELETE_ENCODER_SOURCE");}
function field(value:unknown,key:string):unknown{if(value===null||typeof value!=="object"){return bad();}const descriptor=Object.getOwnPropertyDescriptor(value,key);if(descriptor===undefined||!Object.hasOwn(descriptor,"value")){return bad();}return descriptor.value as unknown;}
function node(value:unknown,kind:string):unknown{if(field(value,"type")!==kind){return bad();}return value;}
function list(value:unknown):readonly unknown[]{if(!Array.isArray(value)){return bad();}return value;}
function identifier(value:unknown,name:string):void{node(value,"Identifier");if(field(value,"name")!==name){bad();}}
function assignment(value:unknown,name:string):unknown{node(value,"AssignmentExpression");if(field(value,"operator")!=="="){return bad();}const left=node(field(value,"left"),"MemberExpression");if(field(left,"computed")!==false){return bad();}node(field(left,"object"),"ThisExpression");identifier(field(left,"property"),name);return field(value,"right");}
function constructorShape(text:string,expected:typeof CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES[number]):void{
 const ast=parse(`const selected=${text};`,{ecmaVersion:"latest"});const body=list(field(ast,"body"));if(body.length!==1){bad();}const declaration=node(body[0],"VariableDeclaration");const declarations=list(field(declaration,"declarations"));if(declarations.length!==1){bad();}const declared=node(declarations[0],"VariableDeclarator");const value=node(field(declared,"init"),"ClassExpression");const parent=field(value,"superClass");if(expected.parent===null){if(parent!==null){bad();}}else{identifier(parent,expected.parent);}
 const classBody=node(field(value,"body"),"ClassBody");const members=list(field(classBody,"body"));for(const member of members){node(member,"MethodDefinition");if(field(member,"computed")!==false||field(member,"static")!==false){bad();}}
 const constructors=members.filter(member=>field(member,"kind")==="constructor");if(constructors.length>1||(constructors.length===0)!==(expected.constructorStart===null)){bad();}const constructor=constructors[0];if(constructor===undefined){return;}const fn=node(field(constructor,"value"),"FunctionExpression");if(field(fn,"async")!==false||field(fn,"generator")!==false||list(field(fn,"params")).length > 0){bad();}
 const fnBody=node(field(fn,"body"),"BlockStatement");const statements=list(field(fnBody,"body"));if(expected.name==="of"){if(statements.length > 0){bad();}return;}if(statements.length!==1){bad();}const statement=node(statements[0],"ExpressionStatement");const expression=node(field(statement,"expression"),"SequenceExpression");const expressions=list(field(expression,"expressions"));
 if(expected.name==="Ke"){if(expressions.length!==CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS.length){bad();}for(const[index,entry]of CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS.entries()){const call=node(assignment(expressions[index],entry.field),"NewExpression");identifier(field(call,"callee"),entry.constructor);if(list(field(call,"arguments")).length > 0){bad();}}}
 else{const target=CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS.find(entry=>entry.constructor===expected.name);if(target===undefined||expressions.length!==2){bad();}const superCall=node(expressions[0],"CallExpression");node(field(superCall,"callee"),"Super");const args=list(field(superCall,"arguments"));if(args.length!==1){bad();}const spread=node(args[0],"SpreadElement");identifier(field(spread,"argument"),"arguments");const literal=node(assignment(expressions[1],"doctype"),"Literal");if(field(literal,"value")!==target.docType){bad();}}
}
/** Full hashes qualify all original methods; this additional AST check closes
 * every eager constructor before actual native instances are created. Scope
 * reference custody remains a separate original-owner obligation. */
export function qualifyCurrentFootprintInverseDeleteEncoderSource(input:unknown):Readonly<{sourceClassCount:18;eagerInstances:14;allEagerConstructorBodiesQualified:true;originalNativeScopesVerified:false;clockInvocationAuthorized:false;deleteInvocationAuthorized:false}>{
 qualifyCurrentFootprintDeleteSource(input);if(typeof input!=="string"){return bad();}
 for(const expected of CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES){const text=input.slice(expected.start,expected.end);if(Buffer.byteLength(text)!==expected.bytes||createHash("sha256").update(text).digest("hex")!==expected.sha256){return bad();}constructorShape(text,expected);}
 return Object.freeze({sourceClassCount:18,eagerInstances:14,allEagerConstructorBodiesQualified:true,originalNativeScopesVerified:false,clockInvocationAuthorized:false,deleteInvocationAuthorized:false});
}
