// Private proposal. No managed or native process-launch API is called here.
using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

public sealed class EasyedaClockSample {
  public string schema = "easyeda-pro-control.windows-clock-sample.v1";
  public string utcBeforeTicks, utcAfterTicks, qpcBefore, qpcAfter, qpcFrequency;
  public bool highResolution = true;
  public int localOffsetMinutes;
  public string zoneRulesSha256;
}
public sealed class EasyedaClockObservation {
  public bool tzAbsent;
  public string reason;
  public EasyedaClockSample sample;
  [DllImport("kernel32.dll", EntryPoint="GetEnvironmentVariableW", CharSet=CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
  static extern uint GetEnvironmentVariable(string name, IntPtr buffer, uint size);
  [DllImport("kernel32.dll", EntryPoint="SetLastError", ExactSpelling=true)]
  static extern void ResetLastError(uint code);

  public static EasyedaClockObservation Read() {
    EasyedaClockObservation result = new EasyedaClockObservation();
    try {
      // Query presence only. Empty, present and ambiguous/error cases do not
      // prove absence. Never retrieve a value or mutate the process environment.
      ResetLastError(0);
      uint length = GetEnvironmentVariable("TZ", IntPtr.Zero, 0);
      int error = Marshal.GetLastWin32Error();
      if (length != 0 || error != 203) {
        result.reason = length != 0 || error == 0 ? "tz-present" : "tz-query";
        return result;
      }
      result.tzAbsent = true;
      if (!Stopwatch.IsHighResolution || Stopwatch.Frequency <= 0) {
        result.reason = "clock-sample"; return result;
      }
      long qpcBefore = Stopwatch.GetTimestamp();
      DateTime utcBefore = DateTime.UtcNow;
      TimeZoneInfo.ClearCachedData();
      TimeZoneInfo zone = TimeZoneInfo.Local;
      TimeSpan offset = zone.GetUtcOffset(utcBefore);
      string rules = zone.ToSerializedString();
      if (rules.Length > 65536 || offset.Ticks % TimeSpan.TicksPerMinute != 0 ||
          offset.TotalMinutes < -840 || offset.TotalMinutes > 840) {
        result.reason = "timezone"; return result;
      }
      string rulesHash;
      using (SHA256 hash = SHA256.Create()) {
        rulesHash = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(rules))).Replace("-", "").ToLowerInvariant();
      }
      DateTime utcAfter = DateTime.UtcNow;
      long qpcAfter = Stopwatch.GetTimestamp();
      if (qpcBefore < 0 || qpcAfter < qpcBefore || utcAfter < utcBefore ||
          qpcAfter - qpcBefore > Stopwatch.Frequency ||
          utcAfter.Ticks - utcBefore.Ticks > TimeSpan.TicksPerSecond) {
        result.reason = "clock-sample"; return result;
      }
      EasyedaClockSample value = new EasyedaClockSample();
      value.utcBeforeTicks = utcBefore.Ticks.ToString(CultureInfo.InvariantCulture);
      value.utcAfterTicks = utcAfter.Ticks.ToString(CultureInfo.InvariantCulture);
      value.qpcBefore = qpcBefore.ToString(CultureInfo.InvariantCulture);
      value.qpcAfter = qpcAfter.ToString(CultureInfo.InvariantCulture);
      value.qpcFrequency = Stopwatch.Frequency.ToString(CultureInfo.InvariantCulture);
      value.localOffsetMinutes = checked((int)offset.TotalMinutes);
      value.zoneRulesSha256 = rulesHash;
      result.sample = value;
      return result;
    } catch {
      // Exception strings can reveal system details. Preserve only a fixed
      // unavailable category; a clock failure must not mask a legacy result.
      result.reason = "clock-sample";
      return result;
    }
  }
}
