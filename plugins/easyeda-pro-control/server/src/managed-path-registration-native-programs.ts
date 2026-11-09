/** Both new registration variants share exact immutable source storage only.
 * Their original owners, paths, rosters, schemas and native gates stay distinct. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION } from "./managed-fixture-registration-program.ts";
import { CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION } from "./current-footprint-inverse-registration.ts";

const literal=(text:string):string=>`@"${text.replaceAll('"','""')}"`;
export function currentManagedPathRegistrationNativePrograms():string{
  const programs=Object.freeze([["generated-fixture",GENERATED_FIXTURE_REGISTRATION_FUNCTION],["footprint-inverse",CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION]] as const);
  for(const[name,program]of programs){if(name.includes("\t")||name.includes("\0")||program.includes("\t")||program.includes("\0")||Buffer.byteLength(program)>65_536){throw new Error("MANAGED_REGISTRATION_FIXED_PROGRAM_BOUND");}}
  const bytes=Buffer.from(programs.map(([name,program])=>`${name}\t${program}`).join("\0"));if(bytes.length===0||bytes.length>60_000){throw new Error("MANAGED_REGISTRATION_FIXED_TABLE_BOUND");}
  // oxlint-disable-next-line node/no-sync -- Deterministic joint storage of two fixed new programs under the unchanged existing table/program decoder bounds.
  const packed=gzipSync(bytes,{level:9});
  const hashes=programs.map(([,program])=>createHash("sha256").update(program).digest("hex"));
  return `static readonly string[][] ManagedRegistrationPrograms=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},2,2);
static string ManagedRegistrationProgramAt(int index,string role){if(index<0||index>=ManagedRegistrationPrograms.Length||ManagedRegistrationPrograms[index].Length!=2||ManagedRegistrationPrograms[index][0]!=role)throw Error("managed-registration-fixed-program-role");return ManagedRegistrationPrograms[index][1];}
static readonly string GeneratedFixtureRegistrationFunction=ManagedRegistrationProgramAt(0,"generated-fixture");
static readonly string FootprintInverseRegistrationFunction=ManagedRegistrationProgramAt(1,"footprint-inverse");
public static void VerifyManagedRegistrationProgramsSmoke(){string[] values={GeneratedFixtureRegistrationFunction,FootprintInverseRegistrationFunction},hashes={${hashes.map(value=>literal(value)).join(",")}};for(int i=0;i<values.Length;i++){using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(values[i]))).Replace("-","").ToLowerInvariant()!=hashes[i])throw Error("managed-registration-fixed-program-hash");}}
`;
}
