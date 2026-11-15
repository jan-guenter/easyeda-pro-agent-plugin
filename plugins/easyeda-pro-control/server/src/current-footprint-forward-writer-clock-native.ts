/** Full-purpose logical clock unit over its original physical renderer cursor.
 * The old 78-command phase ledger and fixed native codecs stay unchanged. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_NATIVE = `public sealed class EasyedaForwardWriterAllocatedClockLedger:IEasyedaFootprintCopyCreateClockLedger {
readonly EasyedaFootprintCopyAllocatedCreateClockLedger unit=new EasyedaFootprintCopyAllocatedCreateClockLedger(1);
public int Next{get;private set;}public int CreateId{get;private set;}public bool Failed{get{return unit.Failed;}}
public EasyedaForwardWriterAllocatedClockLedger(int first){if(first<1||(long)first+EasyedaFootprintCopyAllocatedCreateClockLedger.Requests-1>EasyedaFootprintForwardExecutionLimits.Requests)throw new InvalidOperationException("forward-writer-clock-headroom");Next=first;}
void Physical(int id){if(unit.Failed||unit.Retired||id!=Next||id>EasyedaFootprintForwardExecutionLimits.Requests){unit.Fail();throw new InvalidOperationException("forward-writer-clock-original-physical-id");}}
public void Clock(int id,bool cleanup){Physical(id);unit.Clock(unit.Next,cleanup);Next++;}
public void Allocation(int id,string phase,bool cleanup){Physical(id);unit.Allocation(unit.Next,phase,cleanup);Next++;}
public void Create(int id){Physical(id);unit.Create(unit.Next);CreateId=id;Next++;}
public void OriginalProducer(int id){Physical(id);Next++;}
public void Fail(){unit.Fail();}public void Retire(bool ended){unit.Retire(ended);}
public static void VerifySmoke(){var v=new EasyedaForwardWriterAllocatedClockLedger(9000);v.Allocation(v.Next,"allocation-arm",false);
for(int i=0;i<13;i++){v.OriginalProducer(v.Next);v.Clock(v.Next,false);}v.Create(v.Next);int originalCreate=v.CreateId;
string[] phases={"allocation-frame-build","allocation-frame-create","allocation-frame-wrapper","allocation-source","allocation-join","allocation-properties","allocation-remove","allocation-resume"};
for(int i=0;i<phases.Length;i++){v.OriginalProducer(v.Next);v.Allocation(v.Next,phases[i],i>=6);}
for(int i=13;i<49;i++){v.OriginalProducer(v.Next);v.Clock(v.Next,false);}for(int i=0;i<10;i++)v.Clock(v.Next,true);v.Allocation(v.Next,"allocation-release",true);for(int i=10;i<18;i++)v.Clock(v.Next,true);
if(originalCreate!=9027||v.Next!=9135||!v.unit.Complete)throw new InvalidOperationException("forward-writer-clock-logical-physical-smoke");v.Retire(false);
bool refused=false;try{v.OriginalProducer(v.Next);}catch(InvalidOperationException){refused=true;}if(!refused)throw new InvalidOperationException("forward-writer-clock-retired-smoke");
v=new EasyedaForwardWriterAllocatedClockLedger(2);refused=false;try{v.Allocation(3,"allocation-arm",false);}catch(InvalidOperationException){refused=true;}if(!refused||!v.Failed)throw new InvalidOperationException("forward-writer-clock-unobserved-gap-smoke");
}
}
public sealed partial class EasyedaDiagnosticOwner {
public void BeginForwardWriterAllocatedClock(int first){
if(!forwardWriterBirth||!forwardExecution||!forwardWriterProducerEnrolled||!forwardWriterCacheCompleted||!forwardWriterInitialSyncComplete||!forwardWriterFrontierComplete||!registrationV2Bindings||registrationV2Released||!forwardHeadCompleted||originalMain==null||!originalMain.ForwardExecutionProfile||footprintCreateClockBegun||footprintClockRpcBegun||mainCompletionBegun)throw Error("forward-writer-clock-original-workflow");
footprintCreateClockBegun=true;footprintCreateClockActive=true;try{AssertLive();if(protocolFailed||footprintCombinedAbortAttempted||!startupOpeningConsumed||startupActorContext==null||footprintCopyWorkerSession==null||startupActorContext.Split('\\n')[0]==footprintCopyWorkerSession||first!=nextRequest)throw Error("forward-writer-clock-original-owner");
if(forwardNormalRequests+EasyedaFootprintCopyAllocatedCreateClockLedger.ClockNormal+8>EasyedaFootprintForwardExecutionLimits.NormalClass||forwardCleanupRequests+EasyedaFootprintCopyAllocatedCreateClockLedger.ClockCleanup+3>EasyedaFootprintForwardExecutionLimits.CleanupClass)throw Error("forward-writer-clock-class-headroom");
footprintCreateClockLedger=new EasyedaForwardWriterAllocatedClockLedger(first);
}catch{if(footprintCreateClockLedger!=null)footprintCreateClockLedger.Fail();throw;}}
public string RetireForwardWriterAllocatedClock(){if(!forwardWriterBirth)throw Error("forward-writer-clock-retire-purpose");if(!footprintCreateClockBegun){if(!Terminated())throw Error("forward-writer-clock-original-exit-required");return "ended-before-begin";}RetireFootprintCopyCreateClock();return "retired";}
public static void VerifyForwardWriterClockSmoke(){EasyedaForwardWriterAllocatedClockLedger.VerifySmoke();var o=CreateFootprintForwardWriter209();try{bool refused=false;try{o.BeginForwardWriterAllocatedClock(1);}catch(InvalidOperationException){refused=true;}if(!refused||o.footprintCreateClockBegun||o.footprintCreateClockLedger!=null)throw Error("forward-writer-clock-unissued-smoke");}finally{o.originalMain.Release();}}
}
`;
