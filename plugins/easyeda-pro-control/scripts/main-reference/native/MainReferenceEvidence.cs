using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace Easyeda.PrivatePreparation
{
    // Closed producer data only. No type resolver, path conversion or callbacks.
    internal static class MainReferenceEvidence
    {
        internal const int Maximum = 65536;
        private static readonly UTF8Encoding Utf8 = new UTF8Encoding(false, true);
        private static JavaScriptSerializer Serializer()
        { return new JavaScriptSerializer { MaxJsonLength = Maximum, RecursionLimit = 24 }; }
        internal static Dictionary<string, object> Bag(params object[] pairs)
        {
            FixedFileData.Need(pairs != null && pairs.Length % 2 == 0, "session-json-pairs");
            Dictionary<string, object> result = new Dictionary<string, object>(StringComparer.Ordinal);
            for (int i = 0; i < pairs.Length; i += 2) result.Add((string)pairs[i], pairs[i + 1]);
            return result;
        }
        internal static string Json(object value)
        {
            string text = Serializer().Serialize(value);
            FixedFileData.Need(Utf8.GetByteCount(text) <= Maximum, "session-json-output-bound");
            return text;
        }
        internal static byte[] Bytes(object value)
        {
            byte[] bytes = Utf8.GetBytes(Json(value) + "\n");
            FixedFileData.Need(bytes.Length <= Maximum, "session-json-evidence-bound"); return bytes;
        }
        internal static Dictionary<string, object> Parse(byte[] bytes, int maximum, bool line)
        {
            FixedFileData.Need(bytes != null && bytes.Length > 0 && bytes.Length <= maximum &&
                maximum <= Maximum, "session-json-input-bound");
            string text = Utf8.GetString(bytes);
            if (line)
            { FixedFileData.Need(text.EndsWith("\n", StringComparison.Ordinal), "session-json-line");
              text = text.Substring(0, text.Length - 1); }
            Dictionary<string, object> result = Serializer().DeserializeObject(text) as Dictionary<string, object>;
            FixedFileData.Need(result != null, "session-json-object");
            // A closed producer spelling is required. In particular, collapsed
            // duplicate keys cannot survive this complete raw round-trip check.
            // Different escaping/number spelling refuses; no normalization fallback.
            FixedFileData.Need(Serializer().Serialize(result) == text, "session-json-canonical");
            return result;
        }
        internal static void Exact(Dictionary<string, object> value, params string[] keys)
        {
            FixedFileData.Need(value != null && value.Count == keys.Length, "session-json-keys");
            foreach (string key in keys) FixedFileData.Need(value.ContainsKey(key), "session-json-key");
        }
        internal static void Equal(Dictionary<string, object> value, string key, string expected)
        { FixedFileData.Need(value.ContainsKey(key) && value[key] is string && (string)value[key] == expected,
            "session-json-string"); }
        internal static void Flag(Dictionary<string, object> value, string key, bool expected)
        { FixedFileData.Need(value.ContainsKey(key) && value[key] is bool && (bool)value[key] == expected,
            "session-json-boolean"); }
        private static long Integer(object value, long low, long high)
        {
            FixedFileData.Need(value is int || value is long, "session-json-integer");
            long number = Convert.ToInt64(value, CultureInfo.InvariantCulture);
            FixedFileData.Need(number >= low && number <= high, "session-json-integer-bound"); return number;
        }
        internal static void Request(FixedMainReferenceInput input)
        {
            Dictionary<string, object> value = Parse(input.Copy(19), 8192, false);
            Exact(value, "profile", "nonce", "operationId", "closedPlanSha256", "baselineCopyReceiptSha256",
                "baselineLogicalSha256", "baselineClosureClockSha256", "nativePinsSha256", "historyUuid",
                "createdAtLiteral", "referenceUtcMs");
            Equal(value, "profile", "private.exact-literal-main-reference.v1"); Equal(value, "nonce", input.Nonce);
            foreach (string key in new[] { "closedPlanSha256", "baselineCopyReceiptSha256", "baselineLogicalSha256",
                "baselineClosureClockSha256", "nativePinsSha256" })
                FixedFileData.Need(value[key] is string && FixedFileData.IsHash((string)value[key]), "session-request-hash");
            FixedFileData.Need(value["operationId"] is string && Regex.IsMatch((string)value["operationId"],
                "\\Aeasyeda-[0-9]{8}t[0-9]{6}z-[a-f0-9]{8}\\z", RegexOptions.CultureInvariant), "session-request-operation");
            FixedFileData.Need(value["historyUuid"] is string && Regex.IsMatch((string)value["historyUuid"],
                "\\A[a-f0-9]{32}\\z", RegexOptions.CultureInvariant), "session-request-history");
            DateTime calendar;
            FixedFileData.Need(value["createdAtLiteral"] is string && DateTime.TryParseExact((string)value["createdAtLiteral"],
                "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out calendar) && calendar.Year >= 1970,
                "session-request-calendar");
            Integer(value["referenceUtcMs"], 0, 253402214399999L);
        }
        private static void IdentityFields(Dictionary<string, object> value, FixedLaunchRecord record, uint pid)
        {
            Equal(value, "nonce", record.Nonce);
            FixedFileData.Need(Integer(value["pid"], 1, UInt32.MaxValue) == pid, "session-child-pid");
            Equal(value, "electron", "41.2.1-jlc-sa-win-x64.2"); Equal(value, "chrome", "146.0.7680.188");
            Equal(value, "node", "24.14.1"); Equal(value, "appName", "EasyEDA Main Clock Reference");
            Equal(value, "appPath", record.LaunchDirectory(LayoutRole.App));
            Equal(value, "resourcesPath", record.LaunchDirectory(LayoutRole.Resources));
            Equal(value, "executable", record.Application); Flag(value, "rendererCreated", false);
        }
        internal static void Handshake(byte[] identityBytes, byte[] handshakeBytes, FixedLaunchRecord record, uint pid)
        {
            Dictionary<string, object> identity = Parse(identityBytes, 32768, true);
            Exact(identity, "profile", "nonce", "pid", "electron", "chrome", "node", "appName", "appPath",
                "resourcesPath", "executable", "rendererCreated");
            Equal(identity, "profile", "private.main-reference-identity.v1"); IdentityFields(identity, record, pid);
            Dictionary<string, object> handshake = Parse(handshakeBytes, 32768, true);
            Exact(handshake, "profile", "nonce", "pid", "electron", "chrome", "node", "appName", "appPath",
                "resourcesPath", "executable", "rendererCreated", "requestSha256", "userData", "sessionData",
                "logs", "crashDumps", "tzEnvironmentAbsent");
            Equal(handshake, "profile", "private.main-reference-handshake.v1"); IdentityFields(handshake, record, pid);
            Equal(handshake, "requestSha256", record.RequestHash); Flag(handshake, "tzEnvironmentAbsent", true);
            Equal(handshake, "userData", record.LaunchDirectory(LayoutRole.UserData));
            Equal(handshake, "sessionData", record.LaunchDirectory(LayoutRole.SessionData));
            Equal(handshake, "logs", record.LaunchDirectory(LayoutRole.Logs));
            Equal(handshake, "crashDumps", record.LaunchDirectory(LayoutRole.CrashDumps));
        }
        internal static Dictionary<string, object> Result(byte[] bytes, FixedMainReferenceInput input)
        {
            Dictionary<string, object> result = Parse(bytes, 32768, true);
            Exact(result, "profile", "nonce", "requestSha256", "mainReference", "mainDateIdentityRetained",
                "rendererCreated", "appClockDirectlyObserved", "executionAuthorized");
            Equal(result, "profile", "private.main-reference-result.v1"); Equal(result, "nonce", input.Nonce);
            Equal(result, "requestSha256", input.RequestHash); Flag(result, "mainDateIdentityRetained", true);
            Flag(result, "rendererCreated", false); Flag(result, "appClockDirectlyObserved", false);
            Flag(result, "executionAuthorized", false);
            Dictionary<string, object> reference = result["mainReference"] as Dictionary<string, object>;
            Exact(reference, "profile", "role", "scope", "clockBefore", "clockAfter", "epochs", "sql",
                "environmentTzAbsent", "producerBindingVerified", "appClockVerified", "executionAuthorized");
            Equal(reference, "profile", "private.clock-controls.v1"); Equal(reference, "role", "main-reference");
            Flag(reference, "environmentTzAbsent", true); Flag(reference, "producerBindingVerified", false);
            Flag(reference, "appClockVerified", false); Flag(reference, "executionAuthorized", false);
            // Calendar vectors, scope and native sample comparison remain the
            // maintained TypeScript validator's responsibility. No authority here.
            return result;
        }
    }
}
