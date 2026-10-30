/** Fixed Windows implementation for the original Electron-main transport.
 * The separate original diagnostic purpose wires its own kernel handles and
 * fixed command grammar. No caller supplies a URL or program. */
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE } from "./current-footprint-copy-main-transport-contract.ts";

export function currentFootprintCopyMainTransportNativeSource(): string {
  return String.raw`internal sealed class EasyedaOriginalMainTransport {
  [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)] struct SA { public int length; public System.IntPtr descriptor; [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)] public bool inherit; }
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool CreatePipe(out System.IntPtr read,out System.IntPtr write,ref SA attributes,uint size);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(System.IntPtr handle,uint mask,uint flags);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool GetHandleInformation(System.IntPtr handle,out uint flags);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool ReadFile(System.IntPtr handle,byte[] data,uint count,out uint read,System.IntPtr overlapped);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool CloseHandle(System.IntPtr handle);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern uint GetProcessId(System.IntPtr handle);
  [System.Runtime.InteropServices.DllImport("kernel32.dll")] static extern uint GetCurrentProcessId();
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool GetProcessTimes(System.IntPtr handle,out long created,out long exited,out long kernel,out long user);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool IsProcessInJob(System.IntPtr process,System.IntPtr job,out bool contains);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern uint WaitForSingleObject(System.IntPtr handle,uint milliseconds);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool QueryInformationJobObject(System.IntPtr job,int kind,System.IntPtr data,uint size,out uint returned);
  [System.Runtime.InteropServices.DllImport("kernel32.dll",SetLastError=true)] static extern bool TerminateJobObject(System.IntPtr job,uint code);
  [System.Runtime.InteropServices.DllImport("iphlpapi.dll",SetLastError=true)] static extern uint GetExtendedTcpTable(System.IntPtr table,ref uint size,[System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.Bool)] bool order,uint family,int kind,uint reserved);
  internal sealed class Endpoint { internal int port; internal string token; }
  internal sealed class TcpRow { internal uint state,localAddress,remoteAddress,pid; internal int localPort,remotePort; }
  readonly object gate=new object();
  readonly System.Diagnostics.Stopwatch elapsed;
  readonly int normalLimit,cleanupLimit;
  readonly System.Collections.Generic.List<byte> incoming=new System.Collections.Generic.List<byte>();
  readonly System.IO.MemoryStream message=new System.IO.MemoryStream();
  readonly System.Security.Cryptography.RandomNumberGenerator random=System.Security.Cryptography.RandomNumberGenerator.Create();
  readonly System.Text.UTF8Encoding utf8=new System.Text.UTF8Encoding(false,true);
  System.IntPtr stdinChild,stdinParent,stdoutChild,stdoutParent,stderrChild,stderrParent,root,job;
  System.Action assertImage;
  uint rootPid;long rootCreated,stdoutBytes,stderrBytes,totalReceived;int clientPort,requests,normalRequests,cleanupRequests,frames,polls;bool creationEntered,noRoot,drainStarted,childClosed,attachAttempted,attached,fragmented,detachAttempted,terminationAttempted,terminated,released;
  System.Threading.Thread stdoutThread,stderrThread;System.Net.Sockets.Socket socket;Endpoint endpoint;string failure;
  internal EasyedaOriginalMainTransport():this(false,null){}
  internal EasyedaOriginalMainTransport(bool combined,System.Diagnostics.Stopwatch originalElapsed):this(combined,originalElapsed,false){}
  internal EasyedaOriginalMainTransport(bool combined,System.Diagnostics.Stopwatch originalElapsed,bool forward){
    Need(combined==(originalElapsed!=null)&&(!forward||combined),"purpose-clock");elapsed=combined?originalElapsed:System.Diagnostics.Stopwatch.StartNew();
    normalLimit=forward?EasyedaFootprintForwardLimits.MainNormal:combined?EasyedaFootprintCombinedLimits.MainNormal:${String(PROFILE.normalRequests)};cleanupLimit=forward?EasyedaFootprintForwardLimits.MainCleanup:combined?EasyedaFootprintCombinedLimits.MainCleanup:${String(PROFILE.cleanupRequests)};
  }
  internal long ReceivedBytes {get{return totalReceived;}}
  internal int FrameCount {get{return frames;}}
  static System.Exception Error(string code){return new System.InvalidOperationException("pcb-diagnostic-main-"+code);}
  static void Need(bool value,string code){if(!value)throw Error(code);}
  static void Close(ref System.IntPtr handle){if(handle==System.IntPtr.Zero)return;System.IntPtr original=handle;Need(CloseHandle(original),"close-handle");handle=System.IntPtr.Zero;}
  static bool Handle(System.IntPtr handle,bool inheritable){uint flags;return handle!=System.IntPtr.Zero&&GetHandleInformation(handle,out flags)&&(flags&1)==(inheritable?1U:0U);}
  void Fail(string code){lock(gate){if(failure==null)failure=code;}}
  void CheckFailure(){lock(gate){Need(failure==null,"drain-failed");}}
  internal void PreparePipes(){
    Need(!creationEntered&&!released&&stdinChild==System.IntPtr.Zero&&stdinParent==System.IntPtr.Zero&&stdoutChild==System.IntPtr.Zero&&stdoutParent==System.IntPtr.Zero&&stderrChild==System.IntPtr.Zero&&stderrParent==System.IntPtr.Zero,"pipes-once");
    var attributes=new SA();attributes.length=System.Runtime.InteropServices.Marshal.SizeOf(typeof(SA));attributes.inherit=true;
    Need(CreatePipe(out stdinChild,out stdinParent,ref attributes,65536),"stdin-pipe");Need(SetHandleInformation(stdinParent,1,0),"stdin-parent");
    Need(CreatePipe(out stdoutParent,out stdoutChild,ref attributes,65536),"stdout-pipe");Need(SetHandleInformation(stdoutParent,1,0),"stdout-parent");
    Need(CreatePipe(out stderrParent,out stderrChild,ref attributes,65536),"stderr-pipe");Need(SetHandleInformation(stderrParent,1,0),"stderr-parent");
    Need(Handle(stdinChild,true)&&Handle(stdoutChild,true)&&Handle(stderrChild,true)&&Handle(stdinParent,false)&&Handle(stdoutParent,false)&&Handle(stderrParent,false),"pipe-inheritance");
  }
  // These are the only extra child handles placed in the ORIGINAL handle list.
  internal System.IntPtr StdinChild {get{Need(!childClosed&&Handle(stdinChild,true),"stdin-child");return stdinChild;}}
  internal System.IntPtr StdoutChild {get{Need(!childClosed&&Handle(stdoutChild,true),"stdout-child");return stdoutChild;}}
  internal System.IntPtr StderrChild {get{Need(!childClosed&&Handle(stderrChild,true),"stderr-child");return stderrChild;}}
  internal void EnterCreation(){Need(!creationEntered&&!released&&Handle(stdinChild,true)&&Handle(stdoutChild,true)&&Handle(stderrChild,true),"creation-once");creationEntered=true;}
  // Called only after CreateProcess returned false with all four outputs empty.
  internal void DefiniteNoRoot(){Need(creationEntered&&root==System.IntPtr.Zero&&!noRoot&&!attachAttempted,"no-root-state");noRoot=true;}
  internal void BindOriginalRoot(System.IntPtr originalRoot,System.IntPtr originalJob,uint originalPid,System.Action originalImageAssertion){
    Need(creationEntered&&!noRoot&&root==System.IntPtr.Zero&&originalRoot!=System.IntPtr.Zero&&originalJob!=System.IntPtr.Zero&&originalPid>0&&originalImageAssertion!=null,"root-once");
    root=originalRoot;job=originalJob;assertImage=originalImageAssertion;rootPid=originalPid;long created=0,exited,kernel,user;
    Need(rootPid!=0&&rootPid!=GetCurrentProcessId()&&GetProcessTimes(root,out created,out exited,out kernel,out user)&&created>0,"root-bind");rootCreated=created;AssertRoot(true);
  }
  void AssertRoot(bool live){
    Need(!released&&root!=System.IntPtr.Zero&&job!=System.IntPtr.Zero&&assertImage!=null&&GetProcessId(root)==rootPid,"root-handle");
    long created,exited,kernel,user;bool member;Need(GetProcessTimes(root,out created,out exited,out kernel,out user)&&created==rootCreated&&IsProcessInJob(root,job,out member)&&member,"root-identity");
    Need(WaitForSingleObject(root,0)==(live?258U:0U),"root-state");assertImage();
  }
  internal void StartDrains(){
    Need(creationEntered&&!noRoot&&!drainStarted&&!released&&Handle(stdoutParent,false)&&Handle(stderrParent,false),"drains-once");drainStarted=true;
    stdoutThread=new System.Threading.Thread(()=>Drain(stdoutParent,false));stderrThread=new System.Threading.Thread(()=>Drain(stderrParent,true));
    stdoutThread.IsBackground=true;stderrThread.IsBackground=true;stdoutThread.Start();stderrThread.Start();
  }
  internal void CloseChildHandles(){Need(!childClosed&&creationEntered,"child-close-once");childClosed=true;Close(ref stdinChild);Close(ref stdoutChild);Close(ref stderrChild);}
  void Drain(System.IntPtr handle,bool stderr){
    try{byte[] bytes=new byte[4096];var line=new System.Collections.Generic.List<byte>();
      while(true){uint read;if(!ReadFile(handle,bytes,(uint)bytes.Length,out read,System.IntPtr.Zero)){int code=System.Runtime.InteropServices.Marshal.GetLastWin32Error();if(code!=109)Fail("stdio-read");break;}if(read==0)break;
        lock(gate){if(stderr){stderrBytes+=read;if(stderrBytes>${String(PROFILE.stderrBytes)})Fail("stderr-bound");}else{stdoutBytes+=read;if(stdoutBytes>${String(PROFILE.stdoutBytes)})Fail("stdout-bound");}}
        if(!stderr)continue;
        for(int i=0;i<read;i++){byte value=bytes[i];if(value==10){if(line.Count>0&&line[line.Count-1]==13)line.RemoveAt(line.Count-1);ParseLine(line);line.Clear();}else if(line.Count<=${String(PROFILE.endpointLineBytes)})line.Add(value);else Fail("stderr-line-bound");}
      }if(stderr&&line.Count>0)ParseLine(line);
    }catch{Fail("stdio-exception");}
  }
  void ParseLine(System.Collections.Generic.List<byte> bytes){
    if(bytes.Count>${String(PROFILE.endpointLineBytes)}){Fail("stderr-line-bound");return;}string text=System.Text.Encoding.ASCII.GetString(bytes.ToArray());
    if(text.IndexOf("Debugger listening on",System.StringComparison.Ordinal)<0)return;
    try{Endpoint found=ParseEndpoint(text);lock(gate){if(endpoint!=null){Fail("endpoint-duplicate");return;}endpoint=found;}}catch{Fail("endpoint-malformed");}
  }
  internal static Endpoint ParseEndpoint(string line){
    Need(line!=null&&line.Length<=${String(PROFILE.endpointLineBytes)},"endpoint-bound");
    var match=System.Text.RegularExpressions.Regex.Match(line,@"\ADebugger listening on ws://127\.0\.0\.1:([1-9][0-9]{0,4})/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\z");
    int port;Need(match.Success&&int.TryParse(match.Groups[1].Value,System.Globalization.NumberStyles.None,System.Globalization.CultureInfo.InvariantCulture,out port),"endpoint-grammar");
    port=int.Parse(match.Groups[1].Value,System.Globalization.CultureInfo.InvariantCulture);Need(port>0&&port<=65535,"endpoint-port");return new Endpoint{port=port,token=match.Groups[2].Value};
  }
  static int Port(uint value){return (int)(((value&255)<<8)|((value>>8)&255));}
  static TcpRow[] TcpRows(){
    uint size=0;uint result=GetExtendedTcpTable(System.IntPtr.Zero,ref size,true,2,5,0);Need(result==122&&size>=4&&size<=4+${String(PROFILE.tcpRows)}U*24,"tcp-size");
    System.IntPtr memory=System.Runtime.InteropServices.Marshal.AllocHGlobal(checked((int)size));try{
      uint capacity=size;result=GetExtendedTcpTable(memory,ref size,true,2,5,0);Need(result==0&&size<=capacity&&size>=4,"tcp-read");
      uint count=unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory));Need(count<=${String(PROFILE.tcpRows)}U&&4L+count*24L<=size,"tcp-count");var rows=new TcpRow[count];
      for(int i=0;i<rows.Length;i++){int offset=4+i*24;rows[i]=new TcpRow{state=unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset)),localAddress=unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset+4)),localPort=Port(unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset+8))),remoteAddress=unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset+12)),remotePort=Port(unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset+16))),pid=unchecked((uint)System.Runtime.InteropServices.Marshal.ReadInt32(memory,offset+20))};}return rows;
    }finally{System.Runtime.InteropServices.Marshal.FreeHGlobal(memory);}
  }
  internal static void CompareRows(TcpRow[] rows,uint rootPid,uint helperPid,int serverPort,int clientPort,bool connected){
    Need(rows!=null&&rows.Length<=${String(PROFILE.tcpRows)}&&rootPid>0&&helperPid>0&&rootPid!=helperPid&&serverPort>0&&serverPort<=65535&&(!connected||clientPort>0&&clientPort<=65535&&clientPort!=serverPort),"tcp-input");
    int listeners=0,servers=0,clients=0;foreach(TcpRow row in rows){Need(row!=null&&row.state>=1&&row.state<=12&&row.localPort>=0&&row.localPort<=65535&&row.remotePort>=0&&row.remotePort<=65535,"tcp-row");
      if(row.state==2&&row.localPort==serverPort){listeners++;Need(row.pid==rootPid&&row.localAddress==0x0100007f,"tcp-listener");}
      if(connected&&row.state==5&&row.localAddress==0x0100007f&&row.localPort==serverPort){servers++;Need(row.pid==rootPid&&row.remoteAddress==0x0100007f&&row.remotePort==clientPort,"tcp-server");}
      if(connected&&row.state==5&&row.pid==helperPid&&row.localPort==clientPort){clients++;Need(row.localAddress==0x0100007f&&row.remoteAddress==0x0100007f&&row.remotePort==serverPort,"tcp-client");}}
    Need(listeners==1&&(!connected||servers==1&&clients==1),"tcp-pair");
  }
  void AssertConnection(){
    AssertRoot(true);CheckFailure();Need(attached&&socket!=null&&socket.Connected&&endpoint!=null,"connection-state");
    var local=socket.LocalEndPoint as System.Net.IPEndPoint;var remote=socket.RemoteEndPoint as System.Net.IPEndPoint;
    Need(local!=null&&remote!=null&&local.Address.Equals(System.Net.IPAddress.Loopback)&&remote.Address.Equals(System.Net.IPAddress.Loopback)&&local.Port==clientPort&&remote.Port==endpoint.port,"socket-tuple");
    CompareRows(TcpRows(),rootPid,GetCurrentProcessId(),endpoint.port,clientPort,true);AssertRoot(true);CheckFailure();
  }
  void Budget(bool cleanup){Need(elapsed.ElapsedMilliseconds<(cleanup?${String(PROFILE.totalMilliseconds)}L:${String(PROFILE.normalMilliseconds)}L),"elapsed");}
  internal void Reprove(bool cleanup){Budget(cleanup);AssertConnection();}
  internal void Attach(){
    Need(!attachAttempted&&!attached&&!released&&drainStarted&&childClosed,"attach-once");attachAttempted=true;AssertRoot(true);Budget(false);
    var deadline=System.Diagnostics.Stopwatch.StartNew();Endpoint found=null;
    while(found==null){CheckFailure();AssertRoot(true);Budget(false);lock(gate){found=endpoint;}Need(deadline.ElapsedMilliseconds<${String(PROFILE.handshakeMilliseconds)},"endpoint-deadline");if(found==null)System.Threading.Thread.Sleep(10);}
    CompareRows(TcpRows(),rootPid,GetCurrentProcessId(),found.port,0,false);AssertRoot(true);
    socket=new System.Net.Sockets.Socket(System.Net.Sockets.AddressFamily.InterNetwork,System.Net.Sockets.SocketType.Stream,System.Net.Sockets.ProtocolType.Tcp);socket.NoDelay=true;socket.ReceiveTimeout=1000;socket.SendTimeout=1000;socket.Bind(new System.Net.IPEndPoint(System.Net.IPAddress.Loopback,0));
    var pending=socket.BeginConnect(new System.Net.IPEndPoint(System.Net.IPAddress.Loopback,found.port),null,null);
    try{Need(pending.AsyncWaitHandle.WaitOne(System.Math.Max(1,${String(PROFILE.handshakeMilliseconds)}-(int)deadline.ElapsedMilliseconds)),"connect-deadline");socket.EndConnect(pending);}finally{pending.AsyncWaitHandle.Close();}
    clientPort=((System.Net.IPEndPoint)socket.LocalEndPoint).Port;CompareRows(TcpRows(),rootPid,GetCurrentProcessId(),found.port,clientPort,true);AssertRoot(true);
    byte[] nonce=new byte[16];random.GetBytes(nonce);string key=System.Convert.ToBase64String(nonce);
    string request="GET /"+found.token+" HTTP/1.1\r\nHost: 127.0.0.1:"+found.port.ToString(System.Globalization.CultureInfo.InvariantCulture)+"\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: "+key+"\r\nSec-WebSocket-Version: 13\r\n\r\n";
    WriteAll(System.Text.Encoding.ASCII.GetBytes(request));var header=new System.Collections.Generic.List<byte>();byte[] one=new byte[1];
    while(true){Budget(false);AssertRoot(true);Need(deadline.ElapsedMilliseconds<${String(PROFILE.handshakeMilliseconds)}&&header.Count<${String(PROFILE.handshakeBytes)},"handshake-bound");int read=socket.Receive(one);Need(read==1&&one[0]>=9&&one[0]<127,"handshake-read");header.Add(one[0]);int count=header.Count;if(count>=4&&header[count-4]==13&&header[count-3]==10&&header[count-2]==13&&header[count-1]==10)break;}
    ValidateHandshake(System.Text.Encoding.ASCII.GetString(header.ToArray()),key);attached=true;AssertConnection();
  }
  internal static void ValidateHandshake(string header,string key){
    Need(header!=null&&header.Length<=${String(PROFILE.handshakeBytes)}&&header.EndsWith("\r\n\r\n",System.StringComparison.Ordinal),"handshake-header");string[] lines=header.Split(new string[]{"\r\n"},System.StringSplitOptions.None);Need(lines.Length>=6&&lines[0]=="HTTP/1.1 101 Switching Protocols","handshake-status");
    var fields=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.OrdinalIgnoreCase);for(int i=1;i<lines.Length-2;i++){int colon=lines[i].IndexOf(':');Need(colon>0&&colon<lines[i].Length-1,"handshake-field");string name=lines[i].Substring(0,colon),value=lines[i].Substring(colon+1).Trim();Need(System.Text.RegularExpressions.Regex.IsMatch(name,@"\A[A-Za-z0-9-]+\z")&&!fields.ContainsKey(name),"handshake-duplicate");fields.Add(name,value);}
    string upgrade=null,connection=null,accept=null;Need(fields.TryGetValue("Upgrade",out upgrade)&&upgrade.Equals("websocket",System.StringComparison.OrdinalIgnoreCase)&&fields.TryGetValue("Connection",out connection)&&connection.Equals("Upgrade",System.StringComparison.OrdinalIgnoreCase)&&fields.TryGetValue("Sec-WebSocket-Accept",out accept),"handshake-upgrade");
    using(var sha=System.Security.Cryptography.SHA1.Create()){string expected=System.Convert.ToBase64String(sha.ComputeHash(System.Text.Encoding.ASCII.GetBytes(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11")));Need(accept==expected,"handshake-accept");}
  }
  void WriteAll(byte[] bytes){int offset=0;while(offset<bytes.Length){int written=socket.Send(bytes,offset,bytes.Length-offset,System.Net.Sockets.SocketFlags.None);Need(written>0,"socket-write");offset+=written;}}
  void WriteFrame(byte opcode,byte[] bytes){
    Need(bytes.Length<=${String(PROFILE.messageBytes)},"outgoing-bound");int header=bytes.Length<126?2:bytes.Length<=65535?4:10;byte[] frame=new byte[header+4+bytes.Length];frame[0]=(byte)(128|opcode);
    if(header==2)frame[1]=(byte)(128|bytes.Length);else if(header==4){frame[1]=254;frame[2]=(byte)(bytes.Length>>8);frame[3]=(byte)bytes.Length;}else{frame[1]=255;for(int i=0;i<8;i++)frame[2+i]=(byte)((ulong)bytes.Length>>(56-8*i));}
    byte[] mask=new byte[4];random.GetBytes(mask);System.Array.Copy(mask,0,frame,header,4);for(int i=0;i<bytes.Length;i++)frame[header+4+i]=(byte)(bytes[i]^mask[i%4]);WriteAll(frame);
  }
  // Only the separately generated fixed command encoder may call this method.
  // It is internal, has no serialized tool route and accepts no URL/session.
  internal void RequireCompletionCapacity(int consumed){
    Need(consumed>=0&&requests==consumed&&normalRequests+cleanupRequests==requests,"completion-counters");
    Need(normalRequests+EasyedaFootprintCopyMainCompletionProtocol.NormalRequests<=normalLimit &&
      cleanupRequests+EasyedaFootprintCopyMainCompletionProtocol.CleanupRequests+1<=cleanupLimit &&
      requests+EasyedaFootprintCopyMainCompletionProtocol.Requests+1<=normalLimit+cleanupLimit,"completion-capacity");
  }
  internal void SendFixed(string fixedMessage,bool cleanup){
    Budget(cleanup);AssertConnection();Need(fixedMessage!=null&&fixedMessage.Length>0&&fixedMessage.IndexOf('\0')<0&&utf8.GetByteCount(fixedMessage)<=65536,"command-bound");
    Need(requests<normalLimit+cleanupLimit&&(cleanup?cleanupRequests<cleanupLimit:normalRequests<normalLimit),"request-budget");requests++;if(cleanup)cleanupRequests++;else normalRequests++;WriteFrame(1,utf8.GetBytes(fixedMessage));AssertConnection();
  }
  internal string Poll(bool cleanup){
    Budget(cleanup);AssertConnection();Need(++polls<=(cleanup?${String(PROFILE.totalPolls)}:${String(PROFILE.normalPolls)}),"poll-budget");string ready=ReadFrame();if(ready!=null){AssertConnection();return ready;}
    if(!socket.Poll(0,System.Net.Sockets.SelectMode.SelectRead))return null;byte[] bytes=new byte[65536];int read=socket.Receive(bytes);Need(read>0,"socket-eof");totalReceived+=read;Need(totalReceived<=${String(PROFILE.totalReceivedBytes)}L&&incoming.Count+read<=${String(PROFILE.messageBytes)}+14,"received-bound");
    for(int i=0;i<read;i++)incoming.Add(bytes[i]);ready=ReadFrame();AssertConnection();return ready;
  }
  string ReadFrame(){
    while(incoming.Count>=2){byte first=incoming[0],second=incoming[1];Need((first&112)==0&&(second&128)==0,"frame-flags");bool final=(first&128)!=0;byte opcode=(byte)(first&15);ulong length=(ulong)(second&127);int header=2;
      if(length==126){if(incoming.Count<4)return null;length=(ulong)((incoming[2]<<8)|incoming[3]);Need(length>=126,"frame-short-length");header=4;}
      else if(length==127){if(incoming.Count<10)return null;length=0;for(int i=0;i<8;i++)length=(length<<8)|incoming[2+i];Need(length>65535&&length<=${String(PROFILE.messageBytes)}U,"frame-long-length");header=10;}
      Need(length<=${String(PROFILE.messageBytes)}U,"frame-bound");if((ulong)incoming.Count<(ulong)header+length)return null;Need(++frames<=${String(PROFILE.frames)},"frame-count");byte[] payload=incoming.GetRange(header,(int)length).ToArray();incoming.RemoveRange(0,header+(int)length);
      if(opcode>=8){Need(final&&length<=125&&(opcode==8||opcode==9||opcode==10),"control-frame");if(opcode==8)throw Error("websocket-close");if(opcode==9)WriteFrame(10,payload);continue;}
      Need(opcode==0||opcode==1,"text-frame");if(opcode==1){Need(!fragmented&&message.Length==0,"fragment-start");fragmented=!final;}else Need(fragmented,"fragment-continuation");
      Need(message.Length+payload.Length<=${String(PROFILE.messageBytes)},"message-bound");message.Write(payload,0,payload.Length);if(!final)continue;fragmented=false;byte[] complete=message.ToArray();message.SetLength(0);return utf8.GetString(complete);
    }return null;
  }
  // A deliberately separate diagnostic cleanup, never recovery by copied PID.
  // The original owner journals and confirms this command before calling it.
  internal void RequestOriginalJobTermination(){
    Need(!terminationAttempted&&!released&&root!=System.IntPtr.Zero&&job!=System.IntPtr.Zero,"termination-once");terminationAttempted=true;
    long created,exited,kernel,user;bool member;Need(GetProcessId(root)==rootPid&&(rootCreated==0||GetProcessTimes(root,out created,out exited,out kernel,out user)&&created==rootCreated)&&IsProcessInJob(root,job,out member)&&member,"termination-owner");Need(TerminateJobObject(job,0x4544414d),"termination-request");
  }
  internal bool ObserveTermination(){
    Need(!released&&root!=System.IntPtr.Zero&&job!=System.IntPtr.Zero,"termination-observe");if(WaitForSingleObject(root,0)!=0)return false;
    long created,exited,kernel,user;Need(GetProcessId(root)==rootPid&&(rootCreated==0||GetProcessTimes(root,out created,out exited,out kernel,out user)&&created==rootCreated),"termination-root");
    var memory=System.Runtime.InteropServices.Marshal.AllocHGlobal(48);try{uint returned;Need(QueryInformationJobObject(job,1,memory,48,out returned)&&returned==48,"job-accounting");if(System.Runtime.InteropServices.Marshal.ReadInt32(memory,40)!=0)return false;terminated=true;return true;}finally{System.Runtime.InteropServices.Marshal.FreeHGlobal(memory);}
  }
  // The original host runner proves acknowledged resume/cleanup before this
  // fixed action. Keep every process, Job and stdio handle until actual exit.
  internal bool NeverAttached {get{return !attachAttempted&&!attached&&socket==null&&!detachAttempted;}}
  void CloseInspectorSocket(){Need(detachAttempted&&attached&&socket!=null,"detach-socket");socket.Close();socket=null;attached=false;}
  internal void DetachForNormalClose(){
    Need(!detachAttempted&&attached&&!released&&!terminationAttempted&&socket!=null&&incoming.Count==0&&message.Length==0&&!fragmented,"detach-state");
    detachAttempted=true;Budget(true);AssertConnection();Need(socket.Available==0,"detach-pending-data");CloseInspectorSocket();AssertRoot(true);
  }
  internal void Release(){
    Need(!released&&(!creationEntered||noRoot||terminated),"release-state");if(creationEntered&&!noRoot)Need(ObserveTermination(),"release-reobserve");
    if(socket!=null){socket.Close();socket=null;}Close(ref stdinChild);Close(ref stdoutChild);Close(ref stderrChild);Close(ref stdinParent);
    // The original root and empty Job were observed before closing pipe readers.
    if(stdoutThread!=null&&(stdoutThread.ThreadState&System.Threading.ThreadState.Unstarted)==0)Need(stdoutThread.Join(1000),"stdout-drain-release");if(stderrThread!=null&&(stderrThread.ThreadState&System.Threading.ThreadState.Unstarted)==0)Need(stderrThread.Join(1000),"stderr-drain-release");
    Close(ref stdoutParent);Close(ref stderrParent);message.Dispose();random.Dispose();released=true;
  }
  internal static void VerifySmoke(){
    var endpoint=ParseEndpoint("Debugger listening on ws://127.0.0.1:12345/01234567-89ab-cdef-0123-456789abcdef");Need(endpoint.port==12345&&endpoint.token=="01234567-89ab-cdef-0123-456789abcdef","smoke-endpoint");
    string key="dGhlIHNhbXBsZSBub25jZQ==";ValidateHandshake("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=\r\n\r\n",key);
    var rows=new TcpRow[]{new TcpRow{state=2,localAddress=0x0100007f,localPort=12345,pid=17},new TcpRow{state=5,localAddress=0x0100007f,localPort=12345,remoteAddress=0x0100007f,remotePort=23456,pid=17},new TcpRow{state=5,localAddress=0x0100007f,localPort=23456,remoteAddress=0x0100007f,remotePort=12345,pid=18}};CompareRows(rows,17,18,12345,23456,true);
    System.Action<System.Action> refuse=action=>{bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-refusal");};
    foreach(string bad in new string[]{"ws://127.0.0.1:12345/01234567-89ab-cdef-0123-456789abcdef","Debugger listening on ws://0.0.0.0:12345/01234567-89ab-cdef-0123-456789abcdef","Debugger listening on ws://127.0.0.1:65536/01234567-89ab-cdef-0123-456789abcdef","Debugger listening on ws://127.0.0.1:0123/01234567-89ab-cdef-0123-456789abcdef"})refuse(()=>ParseEndpoint(bad));
    refuse(()=>ValidateHandshake("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: bad\r\n\r\n",key));rows[1].pid=19;refuse(()=>CompareRows(rows,17,18,12345,23456,true));
    var framed=new EasyedaOriginalMainTransport();framed.incoming.AddRange(new byte[]{129,3,97});Need(framed.ReadFrame()==null,"smoke-incomplete-frame");framed.incoming.AddRange(new byte[]{98,99});Need(framed.ReadFrame()=="abc","smoke-text-frame");
    framed.incoming.AddRange(new byte[]{1,2,97,98,128,1,99});Need(framed.ReadFrame()=="abc"&&!framed.fragmented,"smoke-fragmented-frame");
    framed.incoming.AddRange(new byte[]{129,126,0,126});for(int i=0;i<126;i++)framed.incoming.Add(97);Need(framed.ReadFrame()==new string('a',126),"smoke-medium-frame");
    framed.incoming.AddRange(new byte[]{129,127,0,0,0,0,0,1,0,0});for(int i=0;i<65536;i++)framed.incoming.Add(98);Need(framed.ReadFrame()==new string('b',65536),"smoke-long-frame");
    framed.incoming.AddRange(new byte[]{129,128});refuse(()=>framed.ReadFrame());framed.incoming.Clear();framed.Release();
    var originalElapsed=System.Diagnostics.Stopwatch.StartNew();var combined=new EasyedaOriginalMainTransport(true,originalElapsed);
    Need(System.Object.ReferenceEquals(combined.elapsed,originalElapsed)&&combined.normalLimit==EasyedaFootprintCombinedLimits.MainNormal&&combined.cleanupLimit==EasyedaFootprintCombinedLimits.MainCleanup,"smoke-combined-clock-budget");
    refuse(()=>combined.RequireCompletionCapacity(1));refuse(()=>combined.RequireCompletionCapacity(0));Need(combined.requests==0&&combined.normalRequests==0&&combined.cleanupRequests==0,"smoke-completion-capacity-nondispatch");
    refuse(()=>new EasyedaOriginalMainTransport(false,originalElapsed));refuse(()=>new EasyedaOriginalMainTransport(true,null));combined.Release();
    var transport=new EasyedaOriginalMainTransport();Need(transport.NeverAttached,"smoke-never-attached");refuse(()=>transport.Attach());Need(transport.NeverAttached,"smoke-precondition-no-attempt");transport.drainStarted=true;transport.childClosed=true;refuse(()=>transport.Attach());Need(!transport.NeverAttached,"smoke-attempt-not-absence");refuse(()=>transport.SendFixed("{}",false));refuse(()=>transport.DetachForNormalClose());refuse(()=>transport.RequestOriginalJobTermination());transport.Release();refuse(()=>transport.Release());refuse(()=>transport.DetachForNormalClose());
    var detached=new EasyedaOriginalMainTransport();var retained=new System.IntPtr(17);detached.root=detached.job=detached.stdinChild=detached.stdinParent=detached.stdoutChild=detached.stdoutParent=detached.stderrChild=detached.stderrParent=retained;
    detached.socket=new System.Net.Sockets.Socket(System.Net.Sockets.AddressFamily.InterNetwork,System.Net.Sockets.SocketType.Stream,System.Net.Sockets.ProtocolType.Tcp);detached.attached=true;detached.detachAttempted=true;detached.CloseInspectorSocket();
    Need(detached.socket==null&&!detached.attached&&!detached.NeverAttached&&detached.root==retained&&detached.job==retained&&detached.stdinChild==retained&&detached.stdinParent==retained&&detached.stdoutChild==retained&&detached.stdoutParent==retained&&detached.stderrChild==retained&&detached.stderrParent==retained&&!detached.released,"smoke-detach-retains-handles");refuse(()=>detached.CloseInspectorSocket());refuse(()=>detached.DetachForNormalClose());
    detached.root=detached.job=detached.stdinChild=detached.stdinParent=detached.stdoutChild=detached.stdoutParent=detached.stderrChild=detached.stderrParent=System.IntPtr.Zero;detached.Release();
  }
}`;
}
