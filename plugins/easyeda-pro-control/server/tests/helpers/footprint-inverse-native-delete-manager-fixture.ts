/** Original source/Inspector continuation with explicit inert constructor and
 * collateral comparisons. No fixture object creates a Core/native origin. */
import {FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_INSPECTOR as BASE} from "./footprint-inverse-native-get-task-manager-fixture.ts";

let source=BASE.replaceAll("NativeGetTask","NativeDeleteExecution").replaceAll("native-get-task","native-delete-execution");
source=source.replace("collectCurrentFootprintInverseNativeDeleteExecutionSender:prepare","collectCurrentFootprintInverseNativeDeleteSender:prepare");
const marker="  caller=new Caller({receipt,prepared:sender,";
if(source.split(marker).length!==2){throw new Error("INERT_NATIVE_DELETE_MANAGER_CALLER");}
source=source.replace(marker,`  helper={scriptId:null};const collateralRaw=await s.post('Runtime.callFunctionOn',{objectId:receipt,functionDeclaration:'function(){return[[null,()=>true],[null,()=>0]]}',returnByValue:false});if(collateralRaw.exceptionDetails)throw Error(JSON.stringify(collateralRaw));const collateralProps=await s.post('Runtime.getProperties',{objectId:collateralRaw.result.objectId,ownProperties:true}),collateralRefs=collateralProps.result.filter(x=>x.name!=='length').map(x=>x.value.objectId);helper=null;const collateral={tabProof:collateralRefs[0],storageProof:collateralRefs[1]};
  caller=new Caller({receipt,prepared:sender,collateral,`);
source=source.replace("managerOriginal.getDataBodyAuthorized","managerOriginal.deleteDataBodyAuthorized");
export const FOOTPRINT_INVERSE_NATIVE_DELETE_MANAGER_INSPECTOR=source;
