/** The distinct forward clones own one bounded original synchronous pipe write.
 * Cancellation is a request; only the original thread's observed exit releases custody. */
export function currentFootprintForwardWriterPipeNativeSource(): string {
  return String.raw`// BEGIN FORWARD WRITER BOUNDED PIPE
internal sealed class EasyedaForwardWriterPipeWrite {
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool WriteFile(System.IntPtr pipe,byte[] data,uint count,out uint written,System.IntPtr overlapped);
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool ReadFile(System.IntPtr pipe,byte[] data,uint count,out uint read,System.IntPtr overlapped);
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool PeekNamedPipe(System.IntPtr pipe,System.IntPtr buffer,uint size,System.IntPtr read,out uint available,System.IntPtr remaining);
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool CancelSynchronousIo(System.IntPtr thread);
[System.Runtime.InteropServices.DllImport("kernel32.dll")] static extern System.IntPtr GetCurrentThread();
[System.Runtime.InteropServices.DllImport("kernel32.dll")] static extern System.IntPtr GetCurrentProcess();
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool DuplicateHandle(System.IntPtr sourceProcess,System.IntPtr source,System.IntPtr targetProcess,out System.IntPtr target,uint access,bool inherit,uint options);
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern uint WaitForSingleObject(System.IntPtr handle,uint milliseconds);
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool CloseHandle(System.IntPtr handle);
readonly System.IntPtr pipe;readonly byte[] bytes;readonly System.Threading.Thread writer;
readonly System.Threading.ManualResetEvent smokeAtWrite,smokeContinueWrite;
readonly object gate=new object();readonly System.Threading.ManualResetEvent completed=new System.Threading.ManualResetEvent(false);
System.IntPtr originalThread;bool startEntered,startFailed,cancelled,disposed,writeEntered;int nativeError,cancelError,cancellationAttempts;uint written;bool writeSucceeded,cancelAttempted,cancelSucceeded,anyCancellationSucceeded;System.Exception failure;
static void Need(bool value,string stage){if(!value)throw new System.InvalidOperationException("forward-writer-pipe-"+stage);}
internal EasyedaForwardWriterPipeWrite(System.IntPtr originalPipe,byte[] originalBytes):this(originalPipe,originalBytes,null,null){}
// Only the fixed no-app component smoke can create this private barrier.
EasyedaForwardWriterPipeWrite(System.IntPtr originalPipe,byte[] originalBytes,System.Threading.ManualResetEvent atWrite,System.Threading.ManualResetEvent continueWrite){smokeAtWrite=atWrite;smokeContinueWrite=continueWrite;Need(originalPipe!=System.IntPtr.Zero&&originalBytes!=null&&originalBytes.Length>0,"input");pipe=originalPipe;bytes=originalBytes;writer=new System.Threading.Thread(Run);writer.IsBackground=false;}
internal void Start(){Need(!startEntered&&!disposed,"start-once");startEntered=true;try{writer.Start();}catch{startFailed=true;throw;}}
void Run(){try{
System.IntPtr retained;Need(DuplicateHandle(GetCurrentProcess(),GetCurrentThread(),GetCurrentProcess(),out retained,0,false,2),"retain-original-thread");
lock(gate){originalThread=retained;if(cancelled)return;writeEntered=true;}
// A deadline can race this P/Invoke. An ERROR_NOT_FOUND cancellation never
// frees the thread or pipes: the original foreground writer remains retained.
if(smokeAtWrite!=null){smokeAtWrite.Set();smokeContinueWrite.WaitOne();}
writeSucceeded=WriteFile(pipe,bytes,(uint)bytes.Length,out written,System.IntPtr.Zero);nativeError=System.Runtime.InteropServices.Marshal.GetLastWin32Error();
}catch(System.Exception error){failure=error;}finally{completed.Set();}}
internal void CancelAtDeadline(){lock(gate){if(disposed)return;cancelled=true;}RequestOriginalCancellation();}
// At most one non-waiting cancellation request per cleanup poll. This single-use
// thread can issue only its original WriteFile, so a late retry cannot cancel
// another operation or transfer custody. ERROR_NOT_FOUND is never exit proof.
void RequestOriginalCancellation(){System.IntPtr retained;lock(gate){if(!cancelled||disposed)return;retained=originalThread;}if(retained!=System.IntPtr.Zero){cancelAttempted=true;if(cancellationAttempts<int.MaxValue)cancellationAttempts++;cancelSucceeded=CancelSynchronousIo(retained);if(cancelSucceeded)anyCancellationSucceeded=true;cancelError=System.Runtime.InteropServices.Marshal.GetLastWin32Error();}}
internal void Complete(int milliseconds){Need(startEntered&&!disposed&&milliseconds>=0,"wait-state");var clock=System.Diagnostics.Stopwatch.StartNew();
if(!completed.WaitOne(milliseconds)||!writer.Join((int)System.Math.Max(0,milliseconds-clock.ElapsedMilliseconds))){CancelAtDeadline();throw new System.InvalidOperationException("forward-writer-pipe-deadline");}
lock(gate){Need(!cancelled,"deadline");}Need(originalThread!=System.IntPtr.Zero,"original-thread-handle");uint exit=WaitForSingleObject(originalThread,(uint)System.Math.Max(0,milliseconds-clock.ElapsedMilliseconds));if(exit==258){CancelAtDeadline();throw new System.InvalidOperationException("forward-writer-pipe-deadline");}Need(exit==0,"original-thread-exit");if(failure!=null)throw new System.InvalidOperationException("forward-writer-pipe-worker",failure);Need(writeSucceeded&&written==bytes.Length,"write-"+nativeError.ToString(System.Globalization.CultureInfo.InvariantCulture));}
internal bool TryDisposeExited(){if(disposed)return true;if(!startEntered)return false;
if(startFailed&&(writer.ThreadState&System.Threading.ThreadState.Unstarted)!=0){completed.Dispose();disposed=true;return true;}
if(!writer.Join(0)){RequestOriginalCancellation();return false;}lock(gate){if(originalThread!=System.IntPtr.Zero){uint state=WaitForSingleObject(originalThread,0);Need(state==0||state==258,"thread-wait");if(state!=0){RequestOriginalCancellation();return false;}Need(CloseHandle(originalThread),"thread-close");originalThread=System.IntPtr.Zero;}}completed.Dispose();disposed=true;return true;}
// Fixed component smoke uses an anonymous pipe only, with no application/owner.
[System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool CreatePipe(out System.IntPtr read,out System.IntPtr write,System.IntPtr attributes,uint size);
internal static void VerifySmoke(){System.IntPtr read,write;Need(CreatePipe(out read,out write,System.IntPtr.Zero,4096),"smoke-create");EasyedaForwardWriterPipeWrite pending=null;bool settled=false;System.Threading.ManualResetEvent raceAtWrite=null,raceContinue=null;
try{pending=new EasyedaForwardWriterPipeWrite(write,new byte[]{90});pending.Start();pending.Complete(1000);settled=pending.TryDisposeExited();Need(settled&&pending.writeSucceeded&&pending.written==1,"smoke-normal-original-exit");var actual=new byte[1];uint count;Need(ReadFile(read,actual,1,out count,System.IntPtr.Zero)&&count==1&&actual[0]==90,"smoke-normal-readback");
pending=new EasyedaForwardWriterPipeWrite(write,new byte[131072]);settled=false;pending.Start();var readyClock=System.Diagnostics.Stopwatch.StartNew();uint available=0;while(readyClock.ElapsedMilliseconds<5000){Need(PeekNamedPipe(read,System.IntPtr.Zero,0,System.IntPtr.Zero,out available,System.IntPtr.Zero),"smoke-blocked-peek");if(available>0)break;Need(!pending.completed.WaitOne(0),"smoke-blocked-early-exit");System.Threading.Thread.Sleep(1);}Need(available>0&&!pending.completed.WaitOne(0),"smoke-blocked-original-call-ready");bool timedOut=false;try{pending.Complete(100);}catch(System.InvalidOperationException error){if(error.Message!="forward-writer-pipe-deadline")throw;timedOut=true;}Need(timedOut,"smoke-blocked-deadline");
var clock=System.Diagnostics.Stopwatch.StartNew();while(!(settled=pending.TryDisposeExited())&&clock.ElapsedMilliseconds<5000)System.Threading.Thread.Sleep(1);Need(settled&&pending.writeEntered&&pending.cancelAttempted&&(pending.cancelSucceeded||pending.cancelError!=0),"smoke-original-exit");
// Cancel before any P/Invoke: no pending native call is inferred, and the
// unstarted writer must remain in custody until its actual thread exits.
pending=new EasyedaForwardWriterPipeWrite(write,new byte[1]);settled=false;pending.CancelAtDeadline();Need(!pending.TryDisposeExited(),"smoke-unstarted-retained");pending.Start();bool refused=false;try{pending.Complete(1000);}catch(System.InvalidOperationException error){if(error.Message!="forward-writer-pipe-deadline")throw;refused=true;}Need(refused&&!pending.writeEntered&&!pending.cancelAttempted,"smoke-before-dispatch");clock.Restart();while(!(settled=pending.TryDisposeExited())&&clock.ElapsedMilliseconds<5000)System.Threading.Thread.Sleep(1);Need(settled,"smoke-precancelled-exit");
// Force the exact checked-before-P/Invoke race. The first cancellation has
// no pending call; cleanup must cancel the later original blocked WriteFile.
raceAtWrite=new System.Threading.ManualResetEvent(false);raceContinue=new System.Threading.ManualResetEvent(false);pending=new EasyedaForwardWriterPipeWrite(write,new byte[131072],raceAtWrite,raceContinue);settled=false;pending.Start();Need(raceAtWrite.WaitOne(1000),"smoke-late-enter-barrier");pending.CancelAtDeadline();Need(pending.cancelAttempted&&!pending.cancelSucceeded&&pending.cancelError==1168,"smoke-first-cancel-not-found");raceContinue.Set();clock.Restart();while(!(settled=pending.TryDisposeExited())&&clock.ElapsedMilliseconds<5000)System.Threading.Thread.Sleep(1);Need(settled&&pending.cancellationAttempts>1&&pending.anyCancellationSucceeded,"smoke-late-original-cancel-and-exit");
}finally{if(pending!=null)pending.CancelAtDeadline();if(raceContinue!=null)raceContinue.Set();while(pending!=null&&!pending.TryDisposeExited())System.Threading.Thread.Sleep(1);if(raceAtWrite!=null)raceAtWrite.Dispose();if(raceContinue!=null)raceContinue.Dispose();bool writeClosed=CloseHandle(write),readClosed=CloseHandle(read);Need(writeClosed&&readClosed,"smoke-pipe-close");}
}
// Failed cancellation keeps the original foreground writer and pipe custody;
// even component-smoke cleanup waits for actual exit instead of closing a live pipe.
}
public sealed partial class EasyedaDiagnosticOwner {
EasyedaForwardWriterPipeWrite forwardWriterPipeWrite;
void RequireForwardWriterPipeExited(){if(forwardWriterPipeWrite==null)return;if(!forwardWriterPipeWrite.TryDisposeExited())throw Error("forward-writer-original-pipe-writer-pending");forwardWriterPipeWrite=null;}
void WriteForwardWriterPipe(byte[] bytes){RequireForwardWriterPipeExited();var original=new EasyedaForwardWriterPipeWrite(parentWrite,bytes);forwardWriterPipeWrite=original;try{original.Start();original.Complete(5000);RequireForwardWriterPipeExited();}catch{protocolFailed=true;throw;}}
// Fixed default-owner integration smoke: no factory selector, application or
// caller-supplied owner state. The immutable baseline constructor is shared by
// every separately generated clone that can reuse this transport fragment.
static void VerifyForwardWriterPipeOwnerObservationSmoke(){var owner=new EasyedaDiagnosticOwner();EasyedaForwardWriterPipeWrite original=null;bool startEntered=false;
try{owner.Initialize();original=new EasyedaForwardWriterPipeWrite(owner.parentWrite,new byte[1]);owner.forwardWriterPipeWrite=original;original.CancelAtDeadline();
var pending=owner.TerminationObservation();if(pending.Count!=3||pending["originalRootExited"]!=null||pending["originalJobEmpty"]!=null||!(pending["terminated"] is bool)||(bool)pending["terminated"]||!Object.ReferenceEquals(owner.forwardWriterPipeWrite,original)||owner.released)throw Error("forward-writer-observation-pending-smoke");
startEntered=true;original.Start();bool cancelled=false;try{original.Complete(1000);}catch(InvalidOperationException error){if(error.Message!="forward-writer-pipe-deadline")throw;cancelled=true;}if(!cancelled)throw Error("forward-writer-observation-original-cancel-smoke");
var clock=Stopwatch.StartNew();while(owner.forwardWriterPipeWrite!=null&&clock.ElapsedMilliseconds<5000){var observation=owner.TerminationObservation();if(observation.Count!=3||observation["originalRootExited"]!=null||observation["originalJobEmpty"]!=null||!(observation["terminated"] is bool)||(bool)observation["terminated"])throw Error("forward-writer-observation-empty-smoke");if(owner.forwardWriterPipeWrite!=null)Thread.Sleep(1);}if(owner.forwardWriterPipeWrite!=null||owner.released)throw Error("forward-writer-observation-original-retained-smoke");
}finally{if(original!=null){original.CancelAtDeadline();if(!startEntered){startEntered=true;try{original.Start();}catch{}}while(!original.TryDisposeExited())Thread.Sleep(1);}owner.RetainUntilClosed();}
}
public static void VerifyForwardWriterPipeSmoke(){EasyedaForwardWriterPipeWrite.VerifySmoke();VerifyForwardWriterPipeOwnerObservationSmoke();}
}
// END FORWARD WRITER BOUNDED PIPE
`;
}

/** Mechanical clone-only replacement; the released shared bytes never change. */
export function installCurrentFootprintForwardWriterPipeNativeSource(input: string): string {
  let result = input;
  const replace = (before: string, after: string): void => {
    if (result.split(before).length !== 2) { throw new Error("FORWARD_WRITER_PIPE_NATIVE_ANCHOR"); }
    result = result.replace(before, after);
  };
  replace("try { uint written; Native(WriteFile(parentWrite,bytes,(uint)bytes.Length,out written,IntPtr.Zero)); if(written!=bytes.Length) throw Error(\"partial-write\"); AssertLive(); }", "try { WriteForwardWriterPipe(bytes); AssertLive(); }");
  replace("public bool Terminated() {", "public bool Terminated() {\n    RequireForwardWriterPipeExited();");
  replace("public void ReleaseClosed() {", "public void ReleaseClosed() {\n    RequireForwardWriterPipeExited();");
  replace("public Dictionary<string,object> TerminationObservation() {", "public Dictionary<string,object> TerminationObservation() {\n    if(forwardWriterPipeWrite!=null){if(!forwardWriterPipeWrite.TryDisposeExited())return new Dictionary<string,object>{{\"originalRootExited\",null},{\"originalJobEmpty\",null},{\"terminated\",false}};forwardWriterPipeWrite=null;}");
  return `${result}\n${currentFootprintForwardWriterPipeNativeSource()}`;
}
