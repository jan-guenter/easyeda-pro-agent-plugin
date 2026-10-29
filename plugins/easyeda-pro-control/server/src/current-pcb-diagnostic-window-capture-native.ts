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
  [DllImport("user32.dll")] static extern bool WcGetWindowRect(IntPtr hwnd,out WcRect bounds);
  [DllImport("user32.dll")] static extern bool EnumChildWindows(IntPtr hwnd,WindowCallback callback,IntPtr argument);
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
  WindowCaptureSurface windowCaptureSurface;
  bool windowCaptureAttempted,windowCapturePaintDispatched,windowCapturePrintAcknowledged;
  public bool WindowCaptureAttempted { get { return windowCaptureAttempted; } }
  public bool WindowCaptureResourcesRetained { get { return windowCaptureSurface!=null; } }
  public bool WindowCapturePaintDispatched { get { return windowCapturePaintDispatched; } }
  public bool WindowCapturePrintAcknowledged { get { return windowCapturePrintAcknowledged; } }
  static void WcDimensions(int width,int height) {
    if(width<1||height<1||width>WindowCaptureMaximumDimension||height>WindowCaptureMaximumDimension||
       (long)width*height>WindowCaptureMaximumPixels)throw Error("window-capture-dimensions");
  }
  WcRect WcBounds(IntPtr hwnd) {
    WcRect value;if(!WcGetWindowRect(hwnd,out value)||value.left<-1000000||value.left>1000000||value.top<-1000000||value.top>1000000||
       value.right<-1000000||value.right>1000000||value.bottom<-1000000||value.bottom>1000000)throw Error("window-capture-rectangle");
    long width=(long)value.right-value.left,height=(long)value.bottom-value.top;
    if(width<320||height<200||width>WindowCaptureMaximumDimension||height>WindowCaptureMaximumDimension)throw Error("window-capture-rectangle");
    WcDimensions((int)width,(int)height);return value;
  }
  static bool WcSame(WcRect a,WcRect b){return a.left==b.left&&a.top==b.top&&a.right==b.right&&a.bottom==b.bottom;}
  string WcChildren(IntPtr hwnd) {
    List<string> children=new List<string>();bool bad=false;int visited=0;
    // WM_PRINT never receives PRF_OWNED. Visible descendants must belong to the
    // original root process, not an embedded foreign application.
    EnumChildWindows(hwnd,(child,unused)=>{if(++visited>256){bad=true;return false;}if(!IsWindowVisible(child))return true;uint pid;
      GetWindowThreadProcessId(child,out pid);if(pid!=rootPid||children.Count>=256){bad=true;return false;}
      children.Add(child.ToInt64().ToString(CultureInfo.InvariantCulture));return true;},IntPtr.Zero);
    if(bad)throw Error("window-capture-child-ownership");return string.Join(",",children.ToArray());
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
  public Dictionary<string,object> CaptureWindow(string hwnd) {
    if(!visual209||!layers209||workerStartup||stringPrecreate)throw Error("window-capture-purpose");
    if(windowCaptureAttempted)throw Error("window-capture-consumed");windowCaptureAttempted=true;AssertLive();
    long number;if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number)||number<=0||Window()!=hwnd)throw Error("window-capture-window");
    IntPtr handle=new IntPtr(number);WcRect bounds=WcBounds(handle);string children=WcChildren(handle);
    int width=checked(bounds.right-bounds.left),height=checked(bounds.bottom-bounds.top);
    windowCaptureSurface=new WindowCaptureSurface();
    try {
      windowCaptureSurface.Allocate(width,height);AssertLive();
      if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
      UIntPtr result;windowCapturePaintDispatched=true;
      // Fixed WM_PRINT, visible/nonclient/client/children only. It never reads
      // a desktop DC, requests owned popup windows, or invokes caller code.
      if(WcSendMessageTimeout(handle,0x0317,windowCaptureSurface.dc,new IntPtr(0x17),0x23,1000,out result)==IntPtr.Zero)throw Error("window-capture-paint-unsettled");
      windowCapturePrintAcknowledged=true;AssertLive();
      if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
      bool allZero;byte[] png=WcPng(windowCaptureSurface.bits,width,height,out allZero);string sha;
      using(SHA256 hash=SHA256.Create())sha=BitConverter.ToString(hash.ComputeHash(png)).Replace("-","").ToLowerInvariant();
      AssertLive();if(Window()!=hwnd||!WcSame(bounds,WcBounds(handle))||children!=WcChildren(handle))throw Error("window-capture-window-changed");
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
    if(windowCaptureSurface==null)return;
    if(!Terminated())throw Error("window-capture-release-before-exit");
    if(!windowCaptureSurface.Release())throw Error("window-capture-gdi-release");windowCaptureSurface=null;
  }
  public static void VerifyWindowCaptureSmoke() {
    bool refused=false;try{WcDimensions(4097,1);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("window-capture-smoke-bound");
    refused=false;try{WcDimensions(4096,4096);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("window-capture-smoke-pixels");
    IntPtr pixels=Marshal.AllocHGlobal(16);
    try {byte[] values=new byte[]{0,0,255,0,0,255,0,0,255,0,0,0,0,0,0,0};Marshal.Copy(values,0,pixels,values.Length);bool zero;
      byte[] png=WcPng(pixels,2,2,out zero);if(zero||png.Length<63||png.Length>WindowCaptureMaximumPngBytes||png[0]!=137||png[25]!=2)throw Error("window-capture-smoke-png");
    } finally {Marshal.FreeHGlobal(pixels);}
  }
`;
