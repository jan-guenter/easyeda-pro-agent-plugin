/** Only the fixed full-writer producer/cache/sync/frontier senders enter this
 * private native bracket. Historical method-based classification stays exact. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE = `public sealed partial class EasyedaDiagnosticOwner {
int forwardWriterRendererNormalId;
bool ForwardWriterRendererCleanup(int id,bool cleanup){if(forwardWriterRendererNormalId==0)return cleanup;if(!forwardWriterBirth||id!=forwardWriterRendererNormalId)throw Error("forward-writer-renderer-original-normal-id");return false;}
void SendForwardWriterNormalMessage(int id,string message){if(!forwardWriterBirth||forwardWriterRendererNormalId!=0)throw Error("forward-writer-renderer-normal-dispatch");var clock=footprintCreateClockLedger as EasyedaForwardWriterAllocatedClockLedger;if(footprintCreateClockActive){if(clock==null)throw Error("forward-writer-renderer-clock-owner");clock.OriginalProducer(id);}forwardWriterRendererNormalId=id;try{SendMessage(id,message,false,RendererWriteRole.ForwardWriterProducer);}finally{forwardWriterRendererNormalId=0;}}
public static void VerifyForwardWriterRendererClassSmoke(){var o=CreateFootprintForwardWriter209();try{
for(int id=1;id<=EasyedaFootprintForwardExecutionLimits.NormalClass;id++){o.forwardWriterRendererNormalId=id;o.ChargeForwardRenderer(id,"{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.resume\\",\\"params\\":{}}");o.forwardWriterRendererNormalId=0;}
if(o.forwardNormalRequests!=EasyedaFootprintForwardExecutionLimits.NormalClass||o.forwardCleanupRequests!=0)throw Error("forward-writer-planned-renderer-class-smoke");
for(int n=0;n<EasyedaFootprintForwardExecutionLimits.CleanupClass;n++){int id=o.forwardNormalRequests+o.forwardCleanupRequests+1;o.ChargeForwardRenderer(id,"{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.resume\\",\\"params\\":{}}");}
if(o.forwardCleanupRequests!=EasyedaFootprintForwardExecutionLimits.CleanupClass)throw Error("forward-writer-cleanup-renderer-class-smoke");
bool refused=false;o.forwardWriterRendererNormalId=1;try{o.ChargeForwardRenderer(o.forwardNormalRequests+o.forwardCleanupRequests+1,"{\\"id\\":"+(o.forwardNormalRequests+o.forwardCleanupRequests+1).ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.resume\\",\\"params\\":{}}");}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("forward-writer-renderer-wrong-original-id-smoke");
}finally{o.forwardWriterRendererNormalId=0;o.originalMain.Release();}}
}
`;
