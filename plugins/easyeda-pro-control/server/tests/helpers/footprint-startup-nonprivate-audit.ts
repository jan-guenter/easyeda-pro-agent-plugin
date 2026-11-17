/** Independent syntax census on actual installed source; no execution. */
import {parse} from "acorn";

type ObjectNode=Record<string,unknown>;
function object(input:unknown):input is ObjectNode{return input!==null&&typeof input==="object"&&!Array.isArray(input);}
function row(input:unknown):ObjectNode|undefined{return object(input)?input:undefined;}
function list(input:unknown):readonly unknown[]{return Array.isArray(input)?input:[];}
function name(input:unknown):unknown{return row(input)?.["name"];}
function targets(input:unknown):boolean{
 const node=row(input);if(node===undefined){return false;}
 switch(node["type"]){
 case "Identifier": {return node["name"]==="jr";
 }
 case "Property": {return targets(node["value"]);
 }
 case "RestElement": {return targets(node["argument"]);
 }
 case "AssignmentPattern": {return targets(node["left"]);
 }
 case "VariableDeclarator": {return targets(node["id"]);
 }
 case "ObjectPattern": {return list(node["properties"]).some(value=>targets(value));
 }
 case "ArrayPattern": {return list(node["elements"]).some(value=>targets(value));
 }
 case "VariableDeclaration": {return list(node["declarations"]).some(value=>targets(value));
 }
 default: {return false;
 }
 }
}
interface Initializer{readonly start:unknown;readonly end:unknown;readonly kind:unknown;readonly initializer:unknown}
interface PostCall{readonly start:unknown;readonly end:unknown;readonly method:unknown;readonly keys:readonly unknown[];readonly type:unknown;readonly topicParameter:unknown}
interface Callback{readonly start:unknown;readonly end:unknown;readonly arity:number;readonly async:unknown;readonly registration:unknown}
export interface NonprivateAudit{readonly identifiers:readonly number[];readonly initializers:readonly Initializer[];readonly shadowBindings:number;readonly writes:number;readonly directEval:number;readonly withStatements:number;readonly postCalls:readonly PostCall[];readonly callbacks:readonly Callback[]}
export function auditStartupNonprivateSource(source:string):NonprivateAudit{
 const identifiers=new Set<number>();const initializers:Initializer[]=[];const postCalls:PostCall[]=[];const callbacks:Callback[]=[];
 let shadowBindings=0;let writes=0;let directEval=0;let withStatements=0;
 const visit=(input:unknown,parent?:ObjectNode,key?:string,className?:string,method?:ObjectNode):void=>{
  const node=row(input);if(node===undefined){return;}
  const type=node["type"];
  if(type==="Identifier"&&node["name"]==="jr"&&typeof node["start"]==="number"&&!(parent?.["type"]==="Property"&&key==="key"&&parent["computed"]===false)&&!(parent?.["type"]==="MemberExpression"&&key==="property"&&parent["computed"]===false)){identifiers.add(node["start"]);}
  if(type==="VariableDeclarator"&&targets(node["id"])){initializers.push({start:node["start"],end:node["end"],kind:parent?.["kind"],initializer:name(node["init"])});}
  if((type==="FunctionDeclaration"||type==="FunctionExpression"||type==="ArrowFunctionExpression")&&list(node["params"]).some(value=>targets(value))){shadowBindings+=1;}
  if((type==="FunctionDeclaration"||type==="FunctionExpression"||type==="ClassDeclaration"||type==="ClassExpression")&&name(node["id"])==="jr"){shadowBindings+=1;}
  if(type==="CatchClause"&&targets(node["param"])){shadowBindings+=1;}
  if(type==="AssignmentExpression"&&targets(node["left"])||type==="UpdateExpression"&&targets(node["argument"])||(type==="ForInStatement"||type==="ForOfStatement")&&targets(node["left"])){writes+=1;}
  const callee=row(node["callee"]);
  if(type==="CallExpression"&&callee?.["type"]==="Identifier"&&callee["name"]==="eval"){directEval+=1;}
  if(type==="WithStatement"){withStatements+=1;}
  if(type==="CallExpression"&&callee?.["type"]==="MemberExpression"&&callee["computed"]===false){
   const receiver=row(callee["object"]);const called=name(callee["property"]);const args=list(node["arguments"]);
   if(className==="JP"&&receiver?.["type"]==="ThisExpression"&&called==="post"){
    const argument=row(args[0]);const properties=list(argument?.["properties"]).map(value=>row(value));
    if(args.length!==1||argument?.["type"]!=="ObjectExpression"||properties.some(property=>property===undefined||property["type"]!=="Property"||property["computed"]!==false||property["method"]!==false||property["kind"]!=="init"||property["shorthand"]!==false)){throw new Error("POST_FRESH_LITERAL_REQUIRED");}
    const keys=properties.map(property=>name(property?.["key"]));const typeProperty=properties.find(property=>name(property?.["key"])==="type");const topic=properties.find(property=>name(property?.["key"])==="topic");const value=row(typeProperty?.["value"]);const topicValue=row(topic?.["value"]);
    const parameter=name(list(row(method?.["value"])?.["params"])[0]);
    if(new Set(keys).size!==keys.length||value?.["type"]!=="Literal"||typeof value["value"]!=="string"||topicValue?.["type"]!=="Identifier"||topicValue["name"]!==parameter){throw new Error("POST_LITERAL_HEADER_REQUIRED");}
    postCalls.push({start:node["start"],end:node["end"],method:name(method?.["key"]),keys,type:value["value"],topicParameter:topicValue["name"]});
   }
   if(className==="Lg"&&name(method?.["key"])==="constructor"&&receiver?.["type"]==="MemberExpression"&&receiver["computed"]===false&&row(receiver["object"])?.["type"]==="ThisExpression"&&name(receiver["property"])==="consistencyManager"&&(called==="onHeadChange"||called==="onChange")){
    const fn=row(args[0]);if(args.length!==1||fn?.["type"]!=="ArrowFunctionExpression"){throw new Error("REGISTERED_ARROW_REQUIRED");}callbacks.push({start:fn["start"],end:fn["end"],arity:list(fn["params"]).length,async:fn["async"],registration:called});
   }
  }
  const declared=type==="VariableDeclarator"?name(node["id"]):undefined;
  const childClass=(declared==="JP"||declared==="Lg")&&row(node["init"])?.["type"]==="ClassExpression"?declared:className;
  const childMethod=type==="MethodDefinition"?node:method;
  for(const[field,value]of Object.entries(node)){
   if(field!=="start"&&field!=="end"&&field!=="loc"){
    if(Array.isArray(value)){const children:readonly unknown[]=value;for(const child of children){visit(child,node,field,childClass,childMethod);}}
    else if(object(value)){visit(value,node,field,childClass,childMethod);}
   }
  }
 };
 visit(parse(source,{ecmaVersion:"latest",sourceType:"script"}));
 return{identifiers:[...identifiers],initializers,shadowBindings,writes,directEval,withStatements,postCalls,callbacks};
}
