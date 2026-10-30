/** Fixed C#5 members inserted inside the original retained diagnostic owner.
 * WM_PRINT is not a browser canvas exporter. One owned DIB/DC stays retained
 * after every possible paint until the original root and complete Job exit. */
export const CURRENT_WINDOW_CAPTURE_NATIVE_MEMBERS = String.raw`
  const int WindowCaptureMaximumDimension=4096,WindowCaptureMaximumPixels=4194304,WindowCaptureMaximumPngBytes=262144;
  [StructLayout(LayoutKind.Sequential)] struct WcRect { public int left,top,right,bottom; }
  [StructLayout(LayoutKind.Sequential)] struct WcBitmapInfo {
    public uint size;public int width,height;public ushort planes,bits;public uint compression,imageBytes;
    public int xResolution,yResolution;public uint colors,important,color;
  }
  [DllImport("user32.dll",SetLastError=true,EntryPoint="SendMessageTimeoutW")] static extern IntPtr WcSendMessageTimeout(IntPtr hwnd,uint message,IntPtr wparam,IntPtr lparam,uint flags,uint milliseconds,out UIntPtr result);
  [DllImport("user32.dll",EntryPoint="GetWindowRect",ExactSpelling=true,SetLastError=true)] static extern bool WcGetWindowRect(IntPtr hwnd,out WcRect bounds);
  [DllImport("user32.dll")] static extern bool EnumChildWindows(IntPtr hwnd,WindowCallback callback,IntPtr argument);
  [DllImport("user32.dll",EntryPoint="GetWindowThreadProcessId",ExactSpelling=true,SetLastError=true)] static extern uint WcChildProcess(IntPtr hwnd,out uint pid);
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr OpenProcess(uint access,bool inherit,uint pid);
  [DllImport("gdi32.dll")] static extern IntPtr CreateCompatibleDC(IntPtr source);
  [DllImport("gdi32.dll")] static extern IntPtr CreateDIBSection(IntPtr dc,ref WcBitmapInfo info,uint usage,out IntPtr bits,IntPtr section,uint offset);
  [DllImport("gdi32.dll")] static extern IntPtr SelectObject(IntPtr dc,IntPtr selected);
  [DllImport("gdi32.dll")] static extern bool DeleteObject(IntPtr value);
  [DllImport("gdi32.dll")] static extern bool DeleteDC(IntPtr dc);
  sealed class WindowCaptureSurface {
    public IntPtr dc,bitmap,bits;IntPtr previous;
    public void Allocate(int width,int height) {
      WcDimensions(width,height);if(dc!=IntPtr.Zero||bitmap!=IntPtr.Zero)throw Error("window-capture-allocation-once");
      dc=CreateCompatibleDC(IntPtr.Zero);if(dc==IntPtr.Zero)throw Error("window-capture-dc");
      WcBitmapInfo info=new WcBitmapInfo();info.size=40;info.width=width;info.height=-height;info.planes=1;info.bits=32;info.imageBytes=checked((uint)(width*height*4));
      bitmap=CreateDIBSection(dc,ref info,0,out bits,IntPtr.Zero,0);
      if(bitmap==IntPtr.Zero||bits==IntPtr.Zero)throw Error("window-capture-dib");
      previous=SelectObject(dc,bitmap);if(previous==IntPtr.Zero||previous==new IntPtr(-1))throw Error("window-capture-select");
      byte[] zeros=new byte[checked(width*4)];for(int row=0;row<height;row++)Marshal.Copy(zeros,0,IntPtr.Add(bits,checked(row*zeros.Length)),zeros.Length);
    }
    public bool Release() {
      // The previous stock bitmap is borrowed and is never deleted.
      if(dc!=IntPtr.Zero&&previous!=IntPtr.Zero&&previous!=new IntPtr(-1))SelectObject(dc,previous);
      if(dc!=IntPtr.Zero&&DeleteDC(dc)){dc=IntPtr.Zero;previous=IntPtr.Zero;}
      if(bitmap!=IntPtr.Zero&&DeleteObject(bitmap)){bitmap=IntPtr.Zero;bits=IntPtr.Zero;}
      return dc==IntPtr.Zero&&bitmap==IntPtr.Zero;
    }
  }
  string windowFaultStage="request";WcRect windowFaultBounds;bool windowFaultBoundsObserved;object windowFaultChildren;
  void WcFaultStart(string stage){ResetWindowDiscovery();windowFaultStage=stage;windowFaultBoundsObserved=false;windowFaultChildren=null;}
  public string WindowFaultStage {get{return windowFaultStage;}}
  public object WindowFaultBounds {get{return windowFaultBoundsObserved?(object)new Dictionary<string,object>{{"left",windowFaultBounds.left},{"top",windowFaultBounds.top},{"right",windowFaultBounds.right},{"bottom",windowFaultBounds.bottom}}:null;}}
  public object WindowFaultChildren {get{return windowFaultChildren;}}
  WindowCaptureSurface windowCaptureSurface;
  sealed class WcProcessLease {public IntPtr handle;public long created;public bool qualified;}
  readonly Dictionary<uint,WcProcessLease> windowChildProcesses=new Dictionary<uint,WcProcessLease>();bool windowChildrenSealed;int windowChildHandles;
  [DllImport("user32.dll")] static extern bool IsZoomed(IntPtr hwnd);
  [DllImport("user32.dll",SetLastError=true)] static extern bool SetWindowPos(IntPtr hwnd,IntPtr after,int x,int y,int width,int height,uint flags);
  [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr hwnd,int command);
  bool windowRestoreAttempted,windowRestoreSubmitted,windowRestoreStateObserved;string windowRestoreHwnd;
  bool windowResizeAttempted,windowResizeSubmitted,windowResizeGeometryObserved;
  string windowResizeHwnd;WcRect windowResizeBefore;
  int windowCaptureReadinessQueries;
  bool windowCaptureAttempted,windowCapturePaintDispatched,windowCapturePrintAcknowledged;
  public bool WindowCaptureAttempted { get { return windowCaptureAttempted; } }
  public bool WindowCaptureResourcesRetained { get { return windowCaptureSurface!=null||windowChildHandles!=0; } }
  public bool WindowCapturePaintDispatched { get { return windowCapturePaintDispatched; } }
  public bool WindowCapturePrintAcknowledged { get { return windowCapturePrintAcknowledged; } }
  static void WcDimensions(int width,int height) {
    if(width<1||height<1||width>WindowCaptureMaximumDimension||height>WindowCaptureMaximumDimension||
       (long)width*height>WindowCaptureMaximumPixels)throw Error("window-capture-dimensions");
  }
  WcRect WcReadBounds(IntPtr hwnd) {
    WcRect value;if(!WcGetWindowRect(hwnd,out value)||value.left<-1000000||value.left>1000000||value.top<-1000000||value.top>1000000||
       value.right<-1000000||value.right>1000000||value.bottom<-1000000||value.bottom>1000000)throw Error("window-capture-rectangle");
    windowFaultBounds=value;windowFaultBoundsObserved=true;return value;
  }
  WcRect WcBounds(IntPtr hwnd) {
    WcRect value=WcReadBounds(hwnd);
    long width=(long)value.right-value.left,height=(long)value.bottom-value.top;
    if(width<320||height<200||width>WindowCaptureMaximumDimension||height>WindowCaptureMaximumDimension)throw Error("window-capture-rectangle");
    WcDimensions((int)width,(int)height);return value;
  }
  static bool WcSame(WcRect a,WcRect b){return a.left==b.left&&a.top==b.top&&a.right==b.right&&a.bottom==b.bottom;}
  string WcProcess(uint pid,out long created,out object nativeError) {
    created=rootCreated;nativeError=null;IntPtr process=root;WcProcessLease lease=null;
    if(pid!=rootPid){
      if(windowChildProcesses.TryGetValue(pid,out lease)){if(!lease.qualified)return "process-identity";}
      else {
        if(windowChildrenSealed||windowChildProcesses.Count>=256)return "process-identity";
        // Retain the slot before OpenProcess and all fallible qualification. No
        // failed/recycled PID is reopened. Query+wait only, never inheritable.
        lease=new WcProcessLease();windowChildProcesses.Add(pid,lease);lease.handle=OpenProcess(0x00101000,false,pid);
        if(lease.handle==IntPtr.Zero){nativeError=unchecked((uint)Marshal.GetLastWin32Error());return "process-open-failed";}
        windowChildHandles++;
      }
      process=lease.handle;created=lease.created;
    }
    long expected=created,exited,kernel,user;bool contained;
    if(process==IntPtr.Zero||job==IntPtr.Zero||rootCreated<=0)return "process-identity";
    if(WaitForSingleObject(process,0)!=258)return "process-not-live";
    if(GetProcessId(process)!=pid)return "process-identity";
    if(!GetProcessTimes(process,out created,out exited,out kernel,out user)){nativeError=unchecked((uint)Marshal.GetLastWin32Error());return "process-query-failed";}
    if(created<rootCreated||created<=0||expected!=0&&created!=expected)return "process-identity";
    if(!IsProcessInJob(process,job,out contained)){nativeError=unchecked((uint)Marshal.GetLastWin32Error());return "process-job-query-failed";}
    if(!contained)return "process-outside-job";
    try{installation.AssertCreatedImage(process);}catch(InvalidOperationException){return "process-image";}
    if(WaitForSingleObject(process,0)!=258||GetProcessId(process)!=pid)return "process-not-live";
    if(lease!=null){lease.created=created;lease.qualified=true;}return null;
  }
  string WcChildren(IntPtr hwnd) {
    List<string> children=new List<string>();string refusal=null;int visited=0,visible=0;object nativeError=null;windowFaultChildren=null;
    // Same pinned application image, retained process generation and original
    // Job are all required. These HWND samples do not pin window lifetimes.
    EnumChildWindows(hwnd,(child,unused)=>{if(++visited>256){refusal="descendant-limit";return false;}if(!IsWindowVisible(child))return true;visible++;uint pid;
      uint thread=WcChildProcess(child,out pid);if(thread==0){uint error=unchecked((uint)Marshal.GetLastWin32Error());nativeError=error;refusal=error==1400?"window-disappeared":"pid-query-failed";return false;}
      long created;refusal=WcProcess(pid,out created,out nativeError);if(refusal!=null)return false;
      uint again;uint current=WcChildProcess(child,out again);if(current==0){uint error=unchecked((uint)Marshal.GetLastWin32Error());nativeError=error;refusal=error==1400?"window-disappeared":"pid-query-failed";return false;}
      if(current!=thread||again!=pid||!IsWindowVisible(child)||GetAncestor(child,2)!=hwnd){refusal="window-linkage-changed";return false;}
      children.Add(string.Format(CultureInfo.InvariantCulture,"{0}:{1}:{2}:{3}",child.ToInt64(),pid,thread,created));return true;},IntPtr.Zero);
    if(refusal!=null){windowFaultChildren=new Dictionary<string,object>{{"reason",refusal},{"visited",visited},{"visible",visible},{"nativeError",nativeError}};throw Error("window-capture-child-ownership");}windowChildrenSealed=true;return string.Join(",",children.ToArray());
  }
  static void WcWriteUInt(byte[] target,int offset,uint value){target[offset]=(byte)(value>>24);target[offset+1]=(byte)(value>>16);target[offset+2]=(byte)(value>>8);target[offset+3]=(byte)value;}
  static uint WcCrc(byte[] type,byte[] body) {
    uint value=0xffffffffu;foreach(byte[] part in new byte[][]{type,body})foreach(byte atom in part){value^=atom;for(int bit=0;bit<8;bit++)value=(value>>1)^((value&1u)==0?0u:0xedb88320u);}return value^0xffffffffu;
  }
  static void WcChunk(Stream output,string name,byte[] body) {
    byte[] header=new byte[4],type=Encoding.ASCII.GetBytes(name);WcWriteUInt(header,0,(uint)body.Length);output.Write(header,0,4);output.Write(type,0,4);output.Write(body,0,body.Length);
    WcWriteUInt(header,0,WcCrc(type,body));output.Write(header,0,4);
  }
  static byte[] WcPng(IntPtr bits,int width,int height,out bool allZero) {
    WcDimensions(width,height);if(bits==IntPtr.Zero)throw Error("window-capture-pixel-pointer");
    // Fixed non-expandable storage reserves the complete PNG maximum before
    // compression. No growing bitmap-sized managed image or MemoryStream.
    byte[] compressed=new byte[WindowCaptureMaximumPngBytes-63],nativeRow=new byte[checked(width*4)],rgb=new byte[checked(width*3+1)];
    uint adlerA=1,adlerB=0;allZero=true;int length;
    using(MemoryStream target=new MemoryStream(compressed,0,compressed.Length,true,true)) {
      target.SetLength(0);
      using(System.IO.Compression.DeflateStream encoder=new System.IO.Compression.DeflateStream(target,System.IO.Compression.CompressionLevel.Optimal,true)) {
        for(int row=0;row<height;row++) {
          Marshal.Copy(IntPtr.Add(bits,checked(row*nativeRow.Length)),nativeRow,0,nativeRow.Length);rgb[0]=0;
          for(int column=0;column<width;column++){int input=column*4,output=column*3+1;rgb[output]=nativeRow[input+2];rgb[output+1]=nativeRow[input+1];rgb[output+2]=nativeRow[input];
            if(rgb[output]!=0||rgb[output+1]!=0||rgb[output+2]!=0)allZero=false;}
          foreach(byte atom in rgb){adlerA=(adlerA+atom)%65521;adlerB=(adlerB+adlerA)%65521;}encoder.Write(rgb,0,rgb.Length);
        }
      }
      length=checked((int)target.Length);
    }
    byte[] zlib=new byte[checked(length+6)];zlib[0]=0x78;zlib[1]=0x9c;Buffer.BlockCopy(compressed,0,zlib,2,length);WcWriteUInt(zlib,zlib.Length-4,(adlerB<<16)|adlerA);
    byte[] png=new byte[checked(57+zlib.Length)],ihdr=new byte[13];WcWriteUInt(ihdr,0,(uint)width);WcWriteUInt(ihdr,4,(uint)height);ihdr[8]=8;ihdr[9]=2;
    using(MemoryStream output=new MemoryStream(png,0,png.Length,true,true)) {
      output.SetLength(0);byte[] signature=new byte[]{137,80,78,71,13,10,26,10};output.Write(signature,0,8);
      WcChunk(output,"IHDR",ihdr);WcChunk(output,"IDAT",zlib);WcChunk(output,"IEND",new byte[0]);
      if(output.Position!=png.Length||png.Length>WindowCaptureMaximumPngBytes)throw Error("window-capture-png-bound");
    }
    return png;
  }
  bool WcRestoreMatches(string hwnd) {return windowRestoreSubmitted&&hwnd==windowRestoreHwnd&&!IsZoomed(new IntPtr(long.Parse(hwnd,CultureInfo.InvariantCulture)));}
  public Dictionary<string,object> RestoreWindowForCapture() {
    WcFaultStart("request");
    if(!visual209||!layers209||workerStartup||stringPrecreate)throw Error("window-restore-purpose");
    if(windowRestoreAttempted||windowResizeAttempted||windowCaptureAttempted||windowCaptureReadinessQueries>6)throw Error("window-restore-consumed");
    windowRestoreAttempted=true;windowRestoreStateObserved=false;windowFaultStage="owner";AssertLive();windowFaultStage="identity";string hwnd=Window();
    if(hwnd==null)throw Error("window-restore-window");IntPtr handle=new IntPtr(long.Parse(hwnd,CultureInfo.InvariantCulture));
    windowFaultStage="bounds";WcRect before=WcReadBounds(handle);if(!IsZoomed(handle))throw Error("window-restore-not-maximized");
    windowFaultStage="before-restore";AssertLive();if(Window()!=hwnd||!WcSame(before,WcReadBounds(handle))||!IsZoomed(handle))throw Error("window-restore-window-changed");
    windowRestoreHwnd=hwnd;windowFaultStage="restore-submission";
    if(!ShowWindowAsync(handle,4))throw Error("window-restore-submission-failed");windowRestoreSubmitted=true;
    windowFaultStage="after-restore";AssertLive();if(Window()!=hwnd)throw Error("window-restore-window-changed");
    return new Dictionary<string,object>{{"schema","easyeda-pro-control.original-window-restore.v1"},{"hwnd",hwnd},
      {"previousBounds",new Dictionary<string,object>{{"left",before.left},{"top",before.top},{"right",before.right},{"bottom",before.bottom}}},
      {"previousMaximized",true},{"showCommand",4},{"requestSubmitted",true},{"activationRequested",false},{"positionMayChange",true},
      {"zOrderPreservationVerified",false},{"geometryVerified",false},{"renderCompletionVerified",false}};
  }
  bool WcResizeMatches(string hwnd,WcRect value) {
    return windowResizeSubmitted&&hwnd==windowResizeHwnd&&!IsZoomed(new IntPtr(long.Parse(hwnd,CultureInfo.InvariantCulture)))&&
      value.left==windowResizeBefore.left&&value.top==windowResizeBefore.top&&(long)value.right-value.left==1920&&(long)value.bottom-value.top==1080;
  }
  public Dictionary<string,object> ResizeWindowForCapture() {
    WcFaultStart("request");
    if(!visual209||!layers209||workerStartup||stringPrecreate)throw Error("window-resize-purpose");
    if(windowRestoreAttempted&&!windowRestoreStateObserved)throw Error("window-restore-readiness-required");
    if(windowResizeAttempted||windowCaptureAttempted||windowCaptureReadinessQueries>=8)throw Error("window-resize-consumed");
    windowResizeAttempted=true;windowResizeGeometryObserved=false;windowFaultStage="owner";AssertLive();windowFaultStage="identity";string hwnd=Window();
    if(hwnd==null)throw Error("window-resize-window");IntPtr handle=new IntPtr(long.Parse(hwnd,CultureInfo.InvariantCulture));
    windowFaultStage="bounds";WcRect before=WcReadBounds(handle);if(windowRestoreAttempted&&!WcRestoreMatches(hwnd))throw Error("window-restore-state-changed");if(IsZoomed(handle))throw Error("window-resize-maximized-unsupported");
    windowFaultStage="before-resize";AssertLive();if(Window()!=hwnd||!WcSame(before,WcReadBounds(handle)))throw Error("window-resize-window-changed");
    windowResizeHwnd=hwnd;windowResizeBefore=before;
    // Fixed asynchronous no-move/no-activate/no-Z-order request, never restore.
    windowFaultStage="resize-submission";if(!SetWindowPos(handle,IntPtr.Zero,0,0,1920,1080,0x4216))throw Error("window-resize-submission-failed");
    windowResizeSubmitted=true;windowFaultStage="after-resize";AssertLive();if(Window()!=hwnd)throw Error("window-resize-window-changed");
    return new Dictionary<string,object>{{"schema","easyeda-pro-control.original-window-resize.v1"},{"hwnd",hwnd},
      {"previousBounds",new Dictionary<string,object>{{"left",before.left},{"top",before.top},{"right",before.right},{"bottom",before.bottom}}},
      {"requestedWidth",1920},{"requestedHeight",1080},{"requestSubmitted",true},{"noMoveRequested",true},{"noActivateRequested",true},
      {"zOrderPreservationRequested",true},{"geometryVerified",false},{"renderCompletionVerified",false}};
  }
  public Dictionary<string,object> WindowCaptureReadiness() {
    WcFaultStart("request");
    if(!visual209||!layers209||workerStartup||stringPrecreate)throw Error("window-readiness-purpose");
    if(windowCaptureReadinessQueries>=8)throw Error("window-readiness-consumed");windowCaptureReadinessQueries++;windowFaultStage="owner";AssertLive();windowFaultStage="identity";
    string hwnd=Window();object bounds=null,maximized=null;windowResizeGeometryObserved=false;windowRestoreStateObserved=false;
    if(hwnd!=null){IntPtr handle=new IntPtr(long.Parse(hwnd,CultureInfo.InvariantCulture));windowFaultStage="bounds";WcRect value=WcReadBounds(handle);AssertLive();
      if(Window()!=hwnd||!WcSame(value,WcReadBounds(handle)))throw Error("window-readiness-changed");
      windowFaultStage="readiness";maximized=IsZoomed(handle);windowRestoreStateObserved=WcRestoreMatches(hwnd);windowResizeGeometryObserved=WcResizeMatches(hwnd,value);
      bounds=new Dictionary<string,object>{{"left",value.left},{"top",value.top},{"right",value.right},{"bottom",value.bottom}};
    }else{AssertLive();if(Window()!=null)throw Error("window-readiness-changed");}
    return new Dictionary<string,object>{{"hwnd",hwnd},{"bounds",bounds},{"queriesUsed",windowCaptureReadinessQueries},{"captureAttempted",windowCaptureAttempted},
      {"paintDispatched",windowCapturePaintDispatched},{"nativeResourcesRetained",WindowCaptureResourcesRetained},{"maximized",maximized},
      {"restoreAttempted",windowRestoreAttempted},{"restoreRequestSubmitted",windowRestoreSubmitted},{"restoreStateObserved",windowRestoreStateObserved},
      {"resizeAttempted",windowResizeAttempted},{"resizeRequestSubmitted",windowResizeSubmitted},{"resizeGeometryObserved",windowResizeGeometryObserved}};
  }
  public Dictionary<string,object> CaptureWindow(string hwnd) {
    WcFaultStart("request");
    if(!visual209||!layers209||workerStartup||stringPrecreate)throw Error("window-capture-purpose");
    if(windowRestoreAttempted&&!windowRestoreStateObserved)throw Error("window-restore-readiness-required");
    if(windowResizeAttempted&&!windowResizeGeometryObserved)throw Error("window-resize-readiness-required");
    if(windowCaptureAttempted)throw Error("window-capture-consumed");windowCaptureAttempted=true;windowFaultStage="owner";AssertLive();windowFaultStage="identity";
    long number;if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number)||number<=0||Window()!=hwnd)throw Error("window-capture-window");
    IntPtr handle=new IntPtr(number);windowFaultStage="bounds";WcRect bounds=WcBounds(handle);if(windowRestoreAttempted&&!WcRestoreMatches(hwnd))throw Error("window-restore-state-changed");if(windowResizeAttempted&&!WcResizeMatches(hwnd,bounds))throw Error("window-resize-geometry-changed");windowFaultStage="children";string children=WcChildren(handle);
    int width=checked(bounds.right-bounds.left),height=checked(bounds.bottom-bounds.top);
    windowCaptureSurface=new WindowCaptureSurface();
    try {
      windowFaultStage="allocation";windowCaptureSurface.Allocate(width,height);windowFaultStage="before-paint";AssertLive();
      if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
      UIntPtr result;windowFaultStage="paint";windowCapturePaintDispatched=true;
      // Fixed WM_PRINT, visible/nonclient/client/children only. It never reads
      // a desktop DC, requests owned popup windows, or invokes caller code.
      if(WcSendMessageTimeout(handle,0x0317,windowCaptureSurface.dc,new IntPtr(0x17),0x23,1000,out result)==IntPtr.Zero)throw Error("window-capture-paint-unsettled");
      windowCapturePrintAcknowledged=true;windowFaultStage="after-paint";AssertLive();
      if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
      windowFaultStage="encoding";bool allZero;byte[] png=WcPng(windowCaptureSurface.bits,width,height,out allZero);string sha;
      using(SHA256 hash=SHA256.Create())sha=BitConverter.ToString(hash.ComputeHash(png)).Replace("-","").ToLowerInvariant();
      windowFaultStage="after-encoding";AssertLive();if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
      return new Dictionary<string,object>{{"schema","easyeda-pro-control.original-window-png.v1"},{"hwnd",hwnd},{"width",width},{"height",height},
        {"bounds",new Dictionary<string,object>{{"left",bounds.left},{"top",bounds.top},{"right",bounds.right},{"bottom",bounds.bottom}}},
        {"pngBase64",Convert.ToBase64String(png)},{"pngBytes",png.Length},{"pngSha256",sha},{"allRgbZero",allZero},{"method","wm-print-to-owned-dib"},
        {"printMessageAcknowledged",true},{"nativeResourcesRetained",true},{"renderCompletionVerified",false}};
    } finally {
      // GdiFlush covers only the calling thread. Even a successful WM_PRINT
      // reply cannot retire the target thread's possible deferred GDI batches.
      if(!windowCapturePaintDispatched&&windowCaptureSurface!=null&&windowCaptureSurface.Release())windowCaptureSurface=null;
    }
  }
  public void ReleaseWindowCaptureAfterTermination() {
    if(!WindowCaptureResourcesRetained)return;WcFaultStart("cleanup");
    if(!Terminated())throw Error("window-capture-release-before-exit");
    if(windowCaptureSurface!=null){if(!windowCaptureSurface.Release())throw Error("window-capture-gdi-release");windowCaptureSurface=null;}
    foreach(WcProcessLease lease in windowChildProcesses.Values)if(lease.handle!=IntPtr.Zero){if(!CloseHandle(lease.handle))throw Error("window-capture-child-release");lease.handle=IntPtr.Zero;windowChildHandles--;}
    windowChildProcesses.Clear();
  }
  public static void VerifyWindowCaptureSmoke() {
    // Resolve the renamed import on Windows without observing or controlling a window.
    if(Environment.OSVersion.Platform==PlatformID.Win32NT){WcRect invalid;if(WcGetWindowRect(IntPtr.Zero,out invalid))throw Error("window-capture-invalid-handle-smoke");}
    EasyedaDiagnosticOwner oldRestore=new EasyedaDiagnosticOwner();bool restoreRefused=false;
    try{oldRestore.RestoreWindowForCapture();}catch(InvalidOperationException){restoreRefused=true;}
    if(!restoreRefused||oldRestore.windowRestoreAttempted)throw Error("window-restore-purpose-smoke");
    EasyedaDiagnosticOwner spentRestore=CreateVisual209();spentRestore.windowRestoreAttempted=true;restoreRefused=false;
    try{spentRestore.RestoreWindowForCapture();}catch(InvalidOperationException){restoreRefused=true;}
    if(!restoreRefused||spentRestore.windowRestoreSubmitted)throw Error("window-restore-consumed-smoke");
    EasyedaDiagnosticOwner oldResize=new EasyedaDiagnosticOwner();bool resizeRefused=false;
    try{oldResize.ResizeWindowForCapture();}catch(InvalidOperationException){resizeRefused=true;}
    if(!resizeRefused||oldResize.windowResizeAttempted)throw Error("window-resize-purpose-smoke");
    EasyedaDiagnosticOwner spentResize=CreateVisual209();spentResize.windowResizeAttempted=true;resizeRefused=false;
    try{spentResize.ResizeWindowForCapture();}catch(InvalidOperationException){resizeRefused=true;}
    if(!resizeRefused||spentResize.windowResizeSubmitted)throw Error("window-resize-consumed-smoke");
    EasyedaDiagnosticOwner legacy=new EasyedaDiagnosticOwner();bool readinessRefused=false;
    try{legacy.WindowCaptureReadiness();}catch(InvalidOperationException){readinessRefused=true;}
    if(!readinessRefused||legacy.windowCaptureReadinessQueries!=0||legacy.windowCaptureAttempted||legacy.windowCaptureSurface!=null)throw Error("window-readiness-purpose-smoke");
    EasyedaDiagnosticOwner limited=CreateVisual209();limited.windowCaptureReadinessQueries=8;readinessRefused=false;
    try{limited.WindowCaptureReadiness();}catch(InvalidOperationException){readinessRefused=true;}
    if(!readinessRefused||limited.windowCaptureAttempted||limited.windowCaptureSurface!=null)throw Error("window-readiness-bound-smoke");

    bool refused=false;try{WcDimensions(4097,1);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("window-capture-smoke-bound");
    refused=false;try{WcDimensions(4096,4096);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("window-capture-smoke-pixels");
    IntPtr pixels=Marshal.AllocHGlobal(16);
    try {byte[] values=new byte[]{0,0,255,0,0,255,0,0,255,0,0,0,0,0,0,0};Marshal.Copy(values,0,pixels,values.Length);bool zero;
      byte[] png=WcPng(pixels,2,2,out zero);if(zero||png.Length<63||png.Length>WindowCaptureMaximumPngBytes||png[0]!=137||png[25]!=2)throw Error("window-capture-smoke-png");
    } finally {Marshal.FreeHGlobal(pixels);}
  }
`;
