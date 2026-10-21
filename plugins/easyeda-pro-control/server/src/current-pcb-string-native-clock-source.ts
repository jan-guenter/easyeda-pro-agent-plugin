/** Reviewed clock collector for inclusion in the diagnostic helper's existing
 * Add-Type block. It contains no process lookup, launch, close or authority
 * issuance. The owner MUST bracket its own retained Job/root checks with Read.
 * Keep this fragment byte-identical in the helper and verify parity in tests. */
export const CURRENT_PCB_STRING_NATIVE_CLOCK_CSHARP = String.raw`
public sealed class EasyedaStringClockSample {
  public string schema = "easyeda-pro-control.windows-clock-sample.v1";
  public string utcBeforeTicks, utcAfterTicks, qpcBefore, qpcAfter, qpcFrequency;
  public bool highResolution = true;
  public int localOffsetMinutes;
  public string zoneRulesSha256;
}
public sealed class EasyedaStringClockObservation {
  public bool tzAbsent;
  public string reason;
  public EasyedaStringClockSample sample;
  [System.Runtime.InteropServices.DllImport("kernel32.dll", EntryPoint="GetEnvironmentVariableW", CharSet=System.Runtime.InteropServices.CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
  static extern uint GetEnvironmentVariable(string name, System.IntPtr buffer, uint size);
  [System.Runtime.InteropServices.DllImport("kernel32.dll", EntryPoint="SetLastError", ExactSpelling=true)]
  static extern void ResetLastError(uint code);
  public static EasyedaStringClockObservation Read() {
    EasyedaStringClockObservation result = new EasyedaStringClockObservation();
    try {
      ResetLastError(0);
      uint length = GetEnvironmentVariable("TZ", System.IntPtr.Zero, 0);
      int error = System.Runtime.InteropServices.Marshal.GetLastWin32Error();
      if (length != 0 || error != 203) {
        result.reason = length != 0 || error == 0 ? "tz-present" : "tz-query";
        return result;
      }
      result.tzAbsent = true;
      if (!System.Diagnostics.Stopwatch.IsHighResolution || System.Diagnostics.Stopwatch.Frequency <= 0) {
        result.reason = "clock-sample"; return result;
      }
      long qpcBefore = System.Diagnostics.Stopwatch.GetTimestamp();
      System.DateTime utcBefore = System.DateTime.UtcNow;
      System.TimeZoneInfo.ClearCachedData();
      System.TimeZoneInfo zone = System.TimeZoneInfo.Local;
      System.TimeSpan offset = zone.GetUtcOffset(utcBefore);
      string rules = zone.ToSerializedString();
      if (rules.Length > 65536 || offset.Ticks % System.TimeSpan.TicksPerMinute != 0 ||
          offset.TotalMinutes < -840 || offset.TotalMinutes > 840) {
        result.reason = "timezone"; return result;
      }
      string rulesHash;
      using (System.Security.Cryptography.SHA256 hash = System.Security.Cryptography.SHA256.Create()) {
        rulesHash = System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(rules))).Replace("-", "").ToLowerInvariant();
      }
      System.DateTime utcAfter = System.DateTime.UtcNow;
      long qpcAfter = System.Diagnostics.Stopwatch.GetTimestamp();
      if (qpcBefore < 0 || qpcAfter < qpcBefore || utcAfter < utcBefore ||
          qpcAfter - qpcBefore > System.Diagnostics.Stopwatch.Frequency ||
          utcAfter.Ticks - utcBefore.Ticks > System.TimeSpan.TicksPerSecond) {
        result.reason = "clock-sample"; return result;
      }
      EasyedaStringClockSample value = new EasyedaStringClockSample();
      value.utcBeforeTicks = utcBefore.Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.utcAfterTicks = utcAfter.Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcBefore = qpcBefore.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcAfter = qpcAfter.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcFrequency = System.Diagnostics.Stopwatch.Frequency.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.localOffsetMinutes = checked((int)offset.TotalMinutes);
      value.zoneRulesSha256 = rulesHash;
      result.sample = value;
      return result;
    } catch {
      result.reason = "clock-sample"; return result;
    }
  }
}
`;
