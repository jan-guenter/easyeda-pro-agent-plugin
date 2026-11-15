/** Closed-graph source projection tests. They establish no native owner,
 * process, live effect or saved-content acceptance. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { projectCurrentFootprintInverseNativeOnly as project } from "../src/current-footprint-inverse-native-only-projection.ts";

const first = "public sealed partial class Owner{public int Native(){return Keep()+Codec.Encode()+ (publicBound?1:0);}}\n";
const fragment = 'public sealed partial class Owner{bool publicBound=false,unused=false;static readonly int[] Hidden=new[]{1,2};int Keep(){return Shared();}int Shared(){return 7;}int Omitted(){return Hidden[0];}public int PublicCall(){unused=true;return Omitted();}}public static class Codec{static readonly System.Collections.Generic.Dictionary<string,int> Map=new System.Collections.Generic.Dictionary<string,int>();static int Helper(){return Map.Count;}public static int Encode(){return Helper();}public static void Verify(){Encode();}}';
const source = `${first  }// BEGIN NATIVE ONLY CLOSED PUBLIC PublicOne\n${  fragment  }\n// END NATIVE ONLY CLOSED PUBLIC PublicOne\n`;
void test("native-only graph preserves reachable bodies, closes public entries and omits unused private state", () => {
  const result = project(source); assert.ok(result.source.startsWith(first)); assert.equal(result.retainedMethods, 4); assert.equal(result.omittedPrivateMethods, 1); assert.equal(result.omittedFields, 1);
  assert.deepEqual(result.closedPublicMethods, ["Owner.PublicCall", "Codec.Verify"]);
  for (const text of ["int Keep(){return Shared();}", "int Shared(){return 7;}", "static int Helper(){return Map.Count;}", "public static int Encode(){return Helper();}", "bool publicBound=false;"]) { assert.ok(result.source.includes(text), text); }
  assert.ok(result.source.includes("static readonly int[] Hidden=new[]{1,2};")); assert.equal(result.source.includes("unused"), false); assert.equal(result.source.includes("int Omitted"), false);
  assert.ok(result.source.includes('public int PublicCall(){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
  assert.ok(result.source.includes("Dictionary<string,int> Map=new System.Collections.Generic.Dictionary<string,int>();"));
});
void test("native-only projection refuses unpaired/duplicate markers and malformed generated syntax", () => {
  assert.throws(() => project(first)); assert.throws(() => project(`${source  }// END NATIVE ONLY CLOSED PUBLIC PublicOne`));
  assert.throws(() => project(source.replace("PublicOne\n", "PublicOne\n// BEGIN NATIVE ONLY CLOSED PUBLIC PublicOne\n")));
  assert.throws(() => project(source.replace("int Keep(){return Shared();}", "int Keep(){return Shared();")));
});

void test("native-only closure retains instance receiver methods and their complete transitive bodies", () => {
  const entry = "public sealed partial class Owner{public int Native(){var reader=new Reader();return reader.Read();}}\n";
  const leaf = "public sealed class Reader{int value=6;public int Read(){return Normalize(value);}int Normalize(int input){return input+1;}public int Unreachable(){return PrivateUnused();}int PrivateUnused(){return 99;}}";
  const result = project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC ReaderGraph\n${leaf}\n// END NATIVE ONLY CLOSED PUBLIC ReaderGraph\n`);
  assert.equal(result.retainedMethods,2);
  assert.ok(result.source.includes("public int Read(){return Normalize(value);}"));
  assert.ok(result.source.includes("int Normalize(int input){return input+1;}"));
  assert.ok(result.source.includes("int value=6;"));
  assert.deepEqual(result.closedPublicMethods,["Reader.Unreachable"]);
  assert.equal(result.source.includes("int PrivateUnused"),false);
  assert.ok(result.source.includes('public int Unreachable(){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
});
void test("native-only retained and closed public signatures retain defaults without opening declaration-name routes", () => {
  const entry = "public sealed partial class Owner{public int Native(){return Keep();}}\n";
  const leaf = "public sealed partial class Owner{const int RootLimit=4,DefaultLimit=RootLimit+1,ClosedLimit=RootLimit+2,BodyOnlyConstant=99;int Keep(int count=DefaultLimit){return count;}public int PublicCall(int Dangerous=ClosedLimit){return Dangerous+BodyOnly();}public int Dangerous(){return BodyOnly();}int BodyOnly(){return BodyOnlyConstant;}}";
  const result = project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC SignatureGraph\n${leaf}\n// END NATIVE ONLY CLOSED PUBLIC SignatureGraph\n`);
  assert.equal(result.retainedMethods,1);
  for(const text of["RootLimit=4","DefaultLimit=RootLimit+1","ClosedLimit=RootLimit+2","int Keep(int count=DefaultLimit){return count;}"]){assert.ok(result.source.includes(text),text);}
  assert.deepEqual(result.closedPublicMethods,["Owner.PublicCall","Owner.Dangerous"]);
  assert.ok(result.source.includes('public int PublicCall(int Dangerous=ClosedLimit){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
  assert.equal(result.source.includes("int BodyOnly("),false);assert.equal(result.source.includes("BodyOnlyConstant"),false);
});
void test("native-only closed signatures retain qualified constant chains across marked classes", () => {
  const entry = "public sealed partial class Owner{public int Native(){return Keep();}}\n";
  const leaf = "public sealed partial class Owner{int Keep(){return 1;}public int Closed(int count=Limits.DefaultLimit){return count+BodyOnly();}int BodyOnly(){return 99;}}public static class Limits{public const int RootLimit=2,DefaultLimit=RootLimit+3,Unused=99;public static int UnusedRoute(){return Unused;}}";
  const result = project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC QualifiedSignatures\n${leaf}\n// END NATIVE ONLY CLOSED PUBLIC QualifiedSignatures\n`);
  assert.equal(result.retainedMethods,1);assert.ok(result.source.includes("public const int RootLimit=2,DefaultLimit=RootLimit+3;"));
  assert.deepEqual(result.closedPublicMethods,["Owner.Closed","Limits.UnusedRoute"]);
  assert.equal(result.source.includes("int BodyOnly("),false);assert.equal(result.source.includes("Unused=99"),false);
});

void test("native-only closure refuses reflective member access introduced by a retained method",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body='public static class Owner{static int secret=17;public static int Keep(){return(int)typeof(Owner).GetField("secret",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Static).GetValue(null);}public static int Touch(){return secret;}}';
 assert.throws(()=>project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC ReflectionClosure\n${body}\n// END NATIVE ONLY CLOSED PUBLIC ReflectionClosure\n`),/INVERSE_NATIVE_ONLY_PROJECTION/u);
});
void test("native-only static constructor and its dependencies belong to a retained qualified static call",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body="public static class Owner{static int state;static Owner(){state=Initialize();}static int Initialize(){return 7;}public static int Keep(){return state;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC StaticConstructor\n${body}\n// END NATIVE ONLY CLOSED PUBLIC StaticConstructor\n`);
 for(const text of["static Owner(){state=Initialize();}","static int Initialize(){return 7;}","static int state;"]){assert.ok(result.source.includes(text),text);}
 assert.deepEqual(result.closedPublicMethods,["Owner.Closed"]);assert.equal(result.source.includes("=default("),false);
});
void test("native-only field pruning preserves omitted initializers and their textual execution order",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body="public static class Owner{static int seed=Initialize();public static int unused,value;static int Initialize(){value=7;return 5;}public static int Keep(){return seed+value;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC InitializerOrder\n${body}\n// END NATIVE ONLY CLOSED PUBLIC InitializerOrder\n`);
 assert.ok(result.source.includes("static int seed=Initialize();"));assert.ok(result.source.includes("public static int value;"));assert.equal(result.source.includes("unused"),false);assert.equal(result.source.includes("=default("),false);
 assert.ok(result.source.indexOf("seed=Initialize()")<result.source.indexOf("int value;"));
});

void test("native-only static field access retains its constructor and transitive helper without a method root",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.State;}}\n";
 const body="public static class Owner{public static int State;static Owner(){State=Initialize();}static int Initialize(){return 7;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC StaticField\n${body}\n// END NATIVE ONLY CLOSED PUBLIC StaticField\n`);
 for(const text of["static Owner(){State=Initialize();}","static int Initialize(){return 7;}","public static int State;"]){assert.ok(result.source.includes(text),text);}
 assert.deepEqual(result.closedPublicMethods,["Owner.Closed"]);assert.equal(result.retainedMethods,2);
});


void test("native-only zero-initialization diagnostics use uncalled private sinks after original writer removal",()=>{
 const entry="public sealed partial class Owner{public int Native(){return Read();}}\n";
 const body="public sealed partial class Owner{int value,unused;static int staticValue;readonly int untouched=0;const int Constant=2;int Read(){return value+staticValue+untouched+Constant-2;}public void Closed(){value=7;staticValue=9;unused=3;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC DefaultWriters\n${body}\n// END NATIVE ONLY CLOSED PUBLIC DefaultWriters\n`);
 assert.ok(result.source.includes("int value;"));assert.ok(result.source.includes("static int staticValue;"));
 assert.ok(result.source.includes("private void NativeOnlyUninitializedInstanceSink(){value=default(int);}"));
 assert.ok(result.source.includes("private static void NativeOnlyUninitializedStaticSink(){staticValue=default(int);}"));
 assert.ok(result.source.includes('public void Closed(){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
 assert.equal(result.source.includes("unused"),false);assert.ok(result.source.includes("readonly int untouched=0;"));
 assert.equal(result.source.split("NativeOnlyUninitializedInstanceSink").length,2);assert.equal(result.source.split("NativeOnlyUninitializedStaticSink").length,2);
 assert.ok(result.source.indexOf("int value;")<result.source.indexOf("static int staticValue;"));
 for(const collision of["NativeOnlyUninitializedInstanceSink","NativeOnlyUninitializedStaticSink"]){
  assert.throws(()=>project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC DefaultCollision\n${body.replace("public void Closed()",`private void ${collision}(){value=3;}public void Closed()`)}\n// END NATIVE ONLY CLOSED PUBLIC DefaultCollision\n`));
 }
});
void test("native-only diagnostic sinks resolve typed original receivers and never retain a writer route",()=>{
 const entry="public sealed partial class Owner{public int Native(){return new State().Read();}}\n";
 const body="public sealed partial class Owner{public void Closed(State state){state.Value=7;}}public sealed class State{internal int Value;public int Read(){return Value;}public int AlsoClosed(){return 4;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC TypedWriter\n${body}\n// END NATIVE ONLY CLOSED PUBLIC TypedWriter\n`);
 assert.ok(result.source.includes("private void NativeOnlyUninitializedInstanceSink(){Value=default(int);}"));
 assert.ok(result.source.includes('public void Closed(State state){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
 assert.deepEqual(result.closedPublicMethods,["Owner.Closed","State.AlsoClosed"]);
 const shadowed="public sealed partial class Owner{State state;public void Closed(){Other state=new Other();state.Value=7;}}public sealed class State{internal int Value;public int Read(){return Value;}}public sealed class Other{internal int Value=1;}";
 const refused=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC TypedShadow\n${shadowed}\n// END NATIVE ONLY CLOSED PUBLIC TypedShadow\n`);
 assert.equal(refused.source.includes("NativeOnlyUninitializedInstanceSink"),false);
});

void test("native-only diagnostic sinks omit locally shadowed writes and cells with retained writers",()=>{
 const entry="public sealed partial class Owner{public int Native(){return Read();}}\n";
 for(const writer of["public void Closed(){int value=7;System.Console.Write(value);}","public void Closed(){value=7;}"]){
  const retained=writer.includes("int value")?"int Read(){return value;}":"int Read(){value=3;return value;}";
  const body=`public sealed partial class Owner{int value;${retained}${writer}}`;
  const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC NotDefaultWriter\n${body}\n// END NATIVE ONLY CLOSED PUBLIC NotDefaultWriter\n`);
  assert.equal(result.source.includes("NativeOnlyUninitializedInstanceSink"),false);
 }
});

void test("retained constructor initializer arguments contribute method and field dependencies without declaration names",()=>{
 const entry="public static class Entry{public static int Run(){return new Owner().Keep();}}\n";
 const body="public sealed class Owner{int value;const int Offset=2;public Owner():this(Init()+Offset){}Owner(int input){value=input;}static int Init(){return Helper();}static int Helper(){return 7;}public int Keep(){return value;}public int Closed(int Dangerous=3){return Dangerous;}public int Dangerous(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC ConstructorArguments\n${body}\n// END NATIVE ONLY CLOSED PUBLIC ConstructorArguments\n`);
 for(const text of["public Owner():this(Init()+Offset){}","Owner(int input){value=input;}","static int Init(){return Helper();}","static int Helper(){return 7;}","const int Offset=2;"]){assert.ok(result.source.includes(text),text);}
 assert.deepEqual(result.closedPublicMethods,["Owner.Closed","Owner.Dangerous"]);
});
void test("unread active static and instance initializer effects join the exact original dependency closure",()=>{
 for(const instance of[false,true]){
  const entry=instance?"public static class Entry{public static int Run(){return new Owner().Keep();}}\n":"public static class Entry{public static int Run(){return Owner.Keep();}}\n";
  const body=instance?"public sealed class Owner{static int value;int seed=Init();static int Init(){value=7;return 5;}public int Keep(){return value;}public int Closed(){return 99;}}":"public static class Owner{static int seed=Init();static int value;static Owner(){}static int Init(){value=7;return 5;}public static int Keep(){return value;}public static int Closed(){return 99;}}";
  const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC UnreadInitializer\n${body}\n// END NATIVE ONLY CLOSED PUBLIC UnreadInitializer\n`);
  assert.ok(result.source.includes("seed=Init();"));assert.ok(result.source.includes("static int Init(){value=7;return 5;}"));assert.equal(result.source.includes("value=default("),false);
  assert.deepEqual(result.closedPublicMethods,["Owner.Closed"]);
 }
});
void test("inactive owner initializer methods remain closed and initializer reflection is refused after closure",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body="public static class Owner{public static int Keep(){return 1;}public static int Closed(){return 99;}}public static class Inactive{static int seed=Init();static int Init(){throw new System.Exception();}public static int Closed(){return seed;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC InactiveInitializers\n${body}\n// END NATIVE ONLY CLOSED PUBLIC InactiveInitializers\n`);
 assert.equal(result.source.includes("seed=Init()"),false);assert.equal(result.source.includes("static int Init()"),false);
 const reflective='public static class Owner{static int seed=Init();static int value;static Owner(){}static int Init(){value=(int)typeof(Owner).GetField("secret",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Static).GetValue(null);return 5;}static int secret=7;public static int Keep(){return value;}public static int Closed(){return 99;}}';
 assert.throws(()=>project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC InitializerReflection\n${reflective}\n// END NATIVE ONLY CLOSED PUBLIC InitializerReflection\n`),/INVERSE_NATIVE_ONLY_PROJECTION/u);
});

void test("closed public constructors keep executable base initializer arguments without reopening their bodies",()=>{
 const entry="public class Parent{public static int Seen;public Parent(int value){Seen=value;}}public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body="public sealed class Owner:Parent{public Owner():base(Make()){}static int Make(){return 9;}public static int Keep(){return 1;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC ClosedConstructor\n${body}\n// END NATIVE ONLY CLOSED PUBLIC ClosedConstructor\n`);
 assert.ok(result.source.includes("static int Make(){return 9;}"));assert.ok(result.source.includes('public Owner():base(Make()){throw new System.InvalidOperationException("native-only-public-route-closed");}'));
 assert.deepEqual(result.closedPublicMethods,["Owner.Owner","Owner.Closed"]);
});
void test("private field reads through an original typed receiver remain in their own owner graph",()=>{
 const entry="public static class Entry{public static int Run(){return Owner.Read(new Owner());}}\n";
 const body="public sealed class Owner{int value=7;public static int Read(Owner other){return other.value;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC TypedPrivateRead\n${body}\n// END NATIVE ONLY CLOSED PUBLIC TypedPrivateRead\n`);
 assert.ok(result.source.includes("int value=7;"));assert.ok(result.source.includes("public static int Read(Owner other){return other.value;}"));
 assert.deepEqual(result.closedPublicMethods,["Owner.Closed"]);
});

void test("implicit original construction retains instance initializer effects observed by a static reader",()=>{
 const entry="public static class Entry{public static int Run(){new Owner();return Owner.Keep();}}\n";
 const body="public sealed class Owner{static int value;int seed=Init();static int Init(){value=7;return 5;}public static int Keep(){return value;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC ImplicitConstructor\n${body}\n// END NATIVE ONLY CLOSED PUBLIC ImplicitConstructor\n`);
 assert.ok(result.source.includes("int seed=Init();"));assert.ok(result.source.includes("static int Init(){value=7;return 5;}"));
});

void test("initializer elision never treats a literal assigned through a user conversion as effect-free",()=>{
 const entry="public struct Counter{public static implicit operator Counter(int input){Owner.Set(input);return new Counter();}}public static class Entry{public static int Run(){return Owner.Keep();}}\n";
 const body="public static class Owner{static Counter seed=7;static int value;static Owner(){}public static void Set(int input){value=input;}public static int Keep(){return value;}public static int Closed(){return 99;}}";
 const result=project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC UserConversion\n${body}\n// END NATIVE ONLY CLOSED PUBLIC UserConversion\n`);
 assert.ok(result.source.includes("static Counter seed=7;"));
 const escaped=project(`${entry.replaceAll("Counter","@const")}// BEGIN NATIVE ONLY CLOSED PUBLIC EscapedType\n${body.replaceAll("Counter","@const")}\n// END NATIVE ONLY CLOSED PUBLIC EscapedType\n`);
 assert.ok(escaped.source.includes("static @const seed=7;"));
});
void test("unsupported marked base-constructor layouts refuse before any initializer is omitted",()=>{
 const entry="public static class Entry{public static int Run(){return new Owner().Keep();}}\n";
 const body="public class Parent{protected Parent(){State=7;}protected int State;public int Closed(){return 99;}}public sealed class Owner:Parent{public Owner(){}public int Keep(){return State;}public int Closed(){return 99;}}";
 assert.throws(()=>project(`${entry}// BEGIN NATIVE ONLY CLOSED PUBLIC MarkedBase\n${body}\n// END NATIVE ONLY CLOSED PUBLIC MarkedBase\n`),/INVERSE_NATIVE_ONLY_PROJECTION/u);
});
