/** Fixed Linux durable evidence backend for the v2 Windows metadata driver.
 * Its private pipe accepts only bounded bytes for preallocated journal names. */
import { createHash } from "node:crypto";
import { lstat, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { OwnedProofProcess, PROOF_JOURNALS, boundedProofWait, proofNeed, proofRecord } from "./fresh-cli-metadata-proof-resources.ts";
import type { ProofEvidence, ProofFacadeClosure, ProofJournal, ProofJournalName, ProofRecord } from "./fresh-cli-metadata-proof-resources.ts";

const PROFILE = "easyeda-pro-control.fresh-cli-linux-evidence-broker.v1";
const CHUNK = 64 * 1024;
const MAXIMUM_PENDING = 112 * 1024 * 1024;
interface BrokerOptions { readonly distribution: string; readonly linuxEvidenceDirectory: string; readonly workspace: string; readonly nonce: string }
interface JournalState { readonly name: ProofJournalName; readonly limit: number; readonly hash: ReturnType<typeof createHash>; readonly retained: { readonly end: number; readonly bytes: Buffer }[]; received: number; durable: number; overflow: number }
function memoryJournal(limit: number): ProofJournal {
  let bytes = 0; const retained: Buffer[] = []; const hash = createHash("sha256");
  return { append(value): boolean { bytes += value.length; hash.update(value); if (bytes <= limit) { retained.push(Buffer.from(value)); } return bytes <= limit; }, put(value): boolean { bytes += Buffer.byteLength(JSON.stringify(value)); return bytes <= limit; },
    flush(): boolean { return true; }, snapshot(): ProofRecord { return { receivedBytes: bytes, retainedBytes: retained.reduce((total, item) => total + item.length, 0), receivedSha256: hash.copy().digest("hex") }; } };
}

/** Python is fixed source from this reviewed module, never a caller program. */
export function linuxEvidenceBrokerProgram(): string {
  return String.raw`import os,sys,json,base64,stat,re
NAMES=${JSON.stringify(PROOF_JOURNALS)}
PROFILE='${PROFILE}';fds=[];dirs=[];states={};expected_seq=1;control=None;control_at=0;ev=None;protocol=None;protocol_state=None;closing=False;current_seq=1

def require(value):
 if not value:raise ValueError('FIXED_BROKER_REFUSAL')
def object_pairs(pairs):
 out={}
 for k,v in pairs:require(k not in out);out[k]=v
 return out
def read_packet():
 line=sys.stdin.buffer.readline(131073)
 if not line:return None
 require(len(line)<=131072 and line.endswith(b'\n'))
 return json.loads(line.decode('utf-8','strict'),object_pairs_hook=object_pairs)
def write_all(fd,data):
 at=0
 while at<len(data):
  count=os.write(fd,data[at:]);require(count>0);at+=count

def directory(path,private=False):
 require(type(path) is str and path.startswith('/') and len(path)<=4096 and os.path.realpath(path)==path)
 before=os.stat(path,follow_symlinks=False);fd=os.open(path,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW|os.O_CLOEXEC);fds.append(fd);now=os.fstat(fd)
 require(stat.S_ISDIR(before.st_mode) and (before.st_dev,before.st_ino)==(now.st_dev,now.st_ino))
 if private:require(stat.S_IMODE(now.st_mode)==0o700 and now.st_uid==os.getuid())
 dirs.append((fd,path,now.st_dev,now.st_ino));return fd

def local_filesystem(fd):
 before=os.fstat(fd)
 def mount_id():
  with open('/proc/self/fdinfo/'+str(fd),'rb') as stream:data=stream.read(8193)
  require(len(data)<=8192);found=[line.split(b':',1)[1].strip() for line in data.splitlines() if line.startswith(b'mnt_id:')];require(len(found)==1 and found[0].isdigit());return found[0]
 original_mount=mount_id()
 with open('/proc/self/mountinfo','rb') as stream:data=stream.read(1048577)
 require(len(data)<=1048576);matches=[]
 for line in data.splitlines():
  parts=line.split(b' - ');require(len(parts)==2);left=parts[0].split();right=parts[1].split();require(len(left)>=6 and len(right)>=3)
  if left[0]==original_mount:matches.append(right[0].decode('ascii','strict'))
 after=os.fstat(fd);require(len(matches)==1 and matches[0] in ('ext4','xfs','btrfs') and mount_id()==original_mount and (before.st_dev,before.st_ino,before.st_mode)==(after.st_dev,after.st_ino,after.st_mode));return matches[0]

def sync_dirs():
 for fd,path,dev,ino in reversed(dirs):
  now=os.stat(path,follow_symlinks=False);held=os.fstat(fd);require(stat.S_ISDIR(now.st_mode) and (now.st_dev,now.st_ino)==(dev,ino) and (held.st_dev,held.st_ino)==(dev,ino) and os.path.realpath(path)==path);os.fsync(fd)

def flush_state(s):
 try:
  while s['pending']:
   b=s['pending'][0];count=os.write(s['fd'],b);require(count>0);s['written']+=count;s['dirty']=True
   if count==len(b):s['pending'].pop(0)
   else:s['pending'][0]=b[count:]
  if s['dirty']:os.fsync(s['fd']);s['dirty']=False
  s['durable']=s['written'];return True
 except OSError:return False

def metrics(s):return {'name':s['name'],'receivedBytes':s['received'],'durableBytes':s['durable'],'syncPending':s['dirty'] or bool(s['pending'])}
def flush_all():
 ok=True
 for s in states.values():
  if not flush_state(s):ok=False
 if protocol_state is not None and not flush_state(protocol_state):ok=False
 try:os.fsync(control);sync_dirs()
 except OSError:ok=False
 return ok

def emit(seq,kind,ok,**more):
 result={'schema':PROFILE,'seq':seq,'kind':kind,'ok':ok,**more};raw=(json.dumps(result,separators=(',',':'),ensure_ascii=True)+'\n').encode('ascii')
 if protocol_state is not None:
  require(protocol_state['received']+len(raw)<=8388608);protocol_state['received']+=len(raw);protocol_state['pending'].append(raw);durable=flush_state(protocol_state)
  try:sync_dirs()
  except OSError:durable=False
  if not durable:
   result['ok']=False;result['protocolSyncPending']=True;raw=(json.dumps(result,separators=(',',':'),ensure_ascii=True)+'\n').encode('ascii');require(protocol_state['received']+len(raw)<=8388608);protocol_state['received']+=len(raw);protocol_state['pending'].append(raw);flush_state(protocol_state)
 sys.stdout.buffer.write(raw);sys.stdout.buffer.flush()
try:
 p=read_packet();require(type(p) is dict and set(p)=={'schema','seq','op','directory','nonce'} and p['schema']==PROFILE and type(p['seq']) is int and p['seq']==1 and p['op']=='initialize' and type(p['nonce']) is str and re.fullmatch('[a-f0-9-]{36}',p['nonce']))
 path=p['directory'];require(type(path) is str and len(path)<=4096 and path.startswith('/') and '\x00' not in path and all(x not in ('','.', '..') for x in path[1:].split('/')))
 parent=directory(os.path.dirname(path));filesystem=local_filesystem(parent);os.mkdir(os.path.basename(path),0o700,dir_fd=parent);ev=directory(path,True);require(local_filesystem(ev)==filesystem)
 control=os.open('control.jsonl',os.O_RDWR|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW|os.O_CLOEXEC,0o600,dir_fd=ev);fds.append(control);os.fsync(control)
 for name in NAMES:
  fd=os.open(name,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW|os.O_CLOEXEC,0o600,dir_fd=ev);fds.append(fd);os.fsync(fd)
  states[name]={'name':name,'fd':fd,'received':0,'written':0,'durable':0,'pending':[],'dirty':False,'limit':67108864 if name=='app-server.stdout.jsonl' else (4194304 if name.endswith('stderr.log') else 2097152)}
 protocol=os.open('broker-protocol.jsonl',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW|os.O_CLOEXEC,0o600,dir_fd=ev);fds.append(protocol);os.fsync(protocol);protocol_state={'name':'broker-protocol.jsonl','fd':protocol,'received':0,'written':0,'durable':0,'pending':[],'dirty':False};sync_dirs()
 emit(1,'ready',True,linuxPid=os.getpid(),filesPreallocated=len(states)+2,directoryDescriptorsHeld=len(dirs),fileAndDirectorySync=True,filesystemProfile='local-persistent-linux.v1',filesystemType=filesystem);expected_seq=2
 while True:
  p=read_packet()
  if p is None:require(closing);break
  current_seq=expected_seq;require(type(p) is dict and type(p.get('seq')) is int and p['seq']==expected_seq and expected_seq<=2147483647 and not closing);seq=expected_seq;expected_seq+=1;op=p.get('op')
  if op=='append':
   require(set(p)=={'seq','op','journal','offset','bytes'} and p['journal'] in states and type(p['offset']) is int and type(p['bytes']) is str and len(p['bytes'])<=87384)
   s=states[p['journal']];require(p['offset']==s['received']);data=base64.b64decode(p['bytes'],validate=True);require(0<len(data)<=65536 and base64.b64encode(data).decode('ascii')==p['bytes'] and s['received']+len(data)<=s['limit']);s['received']+=len(data);s['pending'].append(data);ok=flush_state(s)
   try:sync_dirs()
   except OSError:ok=False
   emit(seq,'append',ok,journal=metrics(s))
  elif op=='flush':
   require(set(p)=={'seq','op'});ok=flush_all();emit(seq,'flush',ok,journals=[metrics(s) for s in states.values()],fileAndDirectorySync=ok)
  elif op=='read-control':
   require(set(p)=={'seq','op'} and control_at<=65536);data=os.pread(control,8192,control_at);control_at+=len(data);require(control_at<=65536);os.fsync(control);emit(seq,'control',True,bytes=base64.b64encode(data).decode('ascii'))
  elif op=='close':
   require(set(p)=={'seq','op'});ok=flush_all();emit(seq,'close-ready',ok,journals=[metrics(s) for s in states.values()],fileAndDirectorySync=ok);closing=ok
  else:raise ValueError('FIXED_BROKER_OPERATION_REFUSED')
 require(flush_all())
except BaseException:
 try:emit(current_seq,'refused',False,code='FIXED_EVIDENCE_BROKER_REFUSED')
 except BaseException:pass
 sys.exit(1)
finally:
 for fd in reversed(fds):
  try:os.close(fd)
  except OSError:pass
`;
}

/** The local-Linux branch exists for inert protocol fixtures. V2 admission still
 * selects this backend only for a verified Windows host plan. */
export async function createLinuxBrokerProofEvidence(options: BrokerOptions): Promise<ProofEvidence> {
  proofNeed(/^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(options.distribution) && options.linuxEvidenceDirectory.startsWith("/") && options.linuxEvidenceDirectory.length <= 4096, "BROKER_TRUSTED_LOCAL_PLAN_REQUIRED");
  await mkdir(options.workspace, { recursive: false, mode: 0o700 }); const workspace = await lstat(options.workspace, { bigint: true });
  proofNeed(workspace.isDirectory() && !workspace.isSymbolicLink(), "EXCLUSIVE_HOST_WORKSPACE_REQUIRED");
  const args = ["-I", "-S", "-c", linuxEvidenceBrokerProgram()]; let executable = "/usr/bin/python3";
  if (process.platform === "win32") { const root = process.env["SystemRoot"]; proofNeed(root !== undefined, "WINDOWS_SYSTEM_ROOT_REQUIRED"); executable = join(root, "System32", "wsl.exe"); args.unshift("--distribution", options.distribution, "--exec", "/usr/bin/python3"); }
  else { proofNeed(process.platform === "linux", "BROKER_HOST_UNSUPPORTED"); }
  const stderr = memoryJournal(2 * 1024 * 1024), stdout = memoryJournal(8 * 1024 * 1024);
  const peer = new OwnedProofProcess(executable, args, options.workspace, stdout, stderr);
  const failure = Promise.withResolvers<null>(); let failed = false; let closed = false; let closing = false; let sequence = 0; let pendingBytes = 0;
  const states = new Map<ProofJournalName, JournalState>(); const journals = new Map<ProofJournalName, ProofJournal>(); let tail: Promise<unknown> = Promise.resolve(null); let filesystemType: string | undefined; let closeAck: Promise<ProofRecord> | undefined; let flushAck: Promise<ProofRecord> | undefined;
  const markFailure = (): void => { failed = true; failure.resolve(null); };
  const receive = async (packet: ProofRecord, kind: string): Promise<ProofRecord> => {
    sequence += 1; const seq = sequence; proofNeed(seq <= 2_147_483_647, "BROKER_SEQUENCE_BOUND");
    await peer.sendWatcherPacket({ ...packet, seq }); const response = proofRecord(await peer.next(), "BROKER_RESPONSE");
    proofNeed(response["schema"] === PROFILE && response["seq"] === seq && response["kind"] === kind && typeof response["ok"] === "boolean", "ORIGINAL_BROKER_ACK_DIFFERS"); return response;
  };
  const observeFailure = async (original: Promise<unknown>): Promise<void> => { try { await original; } catch { markFailure(); } };
  const enqueue = (packet: ProofRecord, kind: string): Promise<ProofRecord> => {
    const previous = tail; const original = (async (): Promise<ProofRecord> => { await previous; return receive(packet, kind); })(); tail = original;
    void observeFailure(original); return original;
  };
  const bounded = async <Value>(original: Promise<Value>): Promise<Value> => {
    try { return await boundedProofWait(original, 30_000, "ORIGINAL_BROKER_ACK_PENDING_NO_REPLAY"); } catch (error) { markFailure(); throw error; }
  };
  const update = (value: unknown): void => {
    const metric = proofRecord(value, "BROKER_METRIC"); const name = metric["name"];
    proofNeed(typeof name === "string", "BROKER_JOURNAL_NAME"); const state = [...states.values()].find(item => item.name === name); proofNeed(state !== undefined, "BROKER_JOURNAL_WHITELIST");
    const durable = metric["durableBytes"], received = metric["receivedBytes"];
    proofNeed(typeof received === "number" && Number.isSafeInteger(received) && received <= state.received && typeof durable === "number" && Number.isSafeInteger(durable) && durable >= state.durable && durable <= received && typeof metric["syncPending"] === "boolean", "BROKER_METRIC_BOUND");
    state.durable = durable;
    while (state.retained[0] !== undefined && state.retained[0].end <= durable) { const first = state.retained.shift(); if (first !== undefined) { pendingBytes -= first.bytes.length; } }
  };
  const flush = async (): Promise<boolean> => {
    if (closed) { return pendingBytes === 0; }
    if (closing) { return await closeEvidence() && pendingBytes === 0; }
    try { flushAck ??= enqueue({ op: "flush" }, "flush"); const response = await bounded(flushAck); flushAck = undefined; proofNeed(Array.isArray(response["journals"]) && response["journals"].length === PROOF_JOURNALS.length, "BROKER_FLUSH_ROSTER");
      for (const metric of response["journals"]) { update(metric); } if (response["ok"] !== true || response["fileAndDirectorySync"] !== true) { markFailure(); return false; }
      return pendingBytes === 0;
    } catch { markFailure(); return false; }
  };
  let preownerBuffer = "";
  const preownerStatus = (): void => { try { process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.fresh-cli-broker-setup.v1", nonce: options.nonce, originalBrokerTransportPid: peer.child.pid ?? null, cliOwnerAllocated: false, linuxEvidenceDirectory: options.linuxEvidenceDirectory, controls: ["status", "close-cli-stdin"] })}\n`); } catch { peer.closeInput(); } };
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  const preownerControl = (bytes: Buffer): void => {
    try { preownerBuffer += decoder.decode(bytes, { stream: true }); proofNeed(Buffer.byteLength(preownerBuffer) <= 8192, "PREOWNER_CONTROL_BOUND"); let at = preownerBuffer.indexOf("\n");
      while (at >= 0) { const line = preownerBuffer.slice(0, at); preownerBuffer = preownerBuffer.slice(at + 1); const request = proofRecord(JSON.parse(line), "PREOWNER_CONTROL");
        proofNeed(Object.keys(request).length === 2 && request["nonce"] === options.nonce && (request["action"] === "status" || request["action"] === "close-cli-stdin"), "PREOWNER_FIXED_CONTROL_ONLY");
        if (request["action"] === "status") { preownerStatus(); } else { peer.closeInput(); } at = preownerBuffer.indexOf("\n"); }
    } catch { preownerBuffer = ""; }
  };
  const preownerEnd = (): void => { peer.closeInput(); };
  process.stdin.on("data", preownerControl); process.stdin.once("end", preownerEnd); preownerStatus();
  try {
    const ready = await bounded(enqueue({ schema: PROFILE, op: "initialize", directory: options.linuxEvidenceDirectory, nonce: options.nonce }, "ready"));
    proofNeed(typeof ready["filesystemType"] === "string" && ["ext4", "xfs", "btrfs"].includes(ready["filesystemType"]) && ready["filesystemProfile"] === "local-persistent-linux.v1", "ORIGINAL_LINUX_FILESYSTEM_REQUIRED"); filesystemType = ready["filesystemType"];
    proofNeed(ready["ok"] === true && ready["fileAndDirectorySync"] === true && ready["filesPreallocated"] === PROOF_JOURNALS.length + 2, "LINUX_BROKER_PREALLOCATION_ACK_REQUIRED");
  } catch (error) { peer.closeInput(); await peer.closed.promise; throw new Error("ORIGINAL_LINUX_EVIDENCE_BROKER_SETUP_FAILED", { cause: error }); }
  finally { process.stdin.off("data", preownerControl); process.stdin.off("end", preownerEnd); process.stdin.pause(); }
  const observeClose = async (): Promise<void> => { await peer.closed.promise; if (!closing) { markFailure(); } };
  const observeProtocol = async (): Promise<void> => { try { await peer.fault.promise; } catch { if (!closing) { markFailure(); peer.closeInput(); } } };
  void observeClose(); void observeProtocol();
  const observeAppend = async (original: Promise<ProofRecord>, expectedReceived: number): Promise<void> => { try { const response = await original; const metric = proofRecord(response["journal"], "BROKER_APPEND_METRIC"); proofNeed(metric["receivedBytes"] === expectedReceived, "BROKER_APPEND_OFFSET_DIFFERS"); update(metric); if (response["ok"] !== true) { markFailure(); } } catch { markFailure(); } };
  const createJournal = (name: ProofJournalName): ProofJournal => {
    let limit = 2 * 1024 * 1024; if (name === "app-server.stdout.jsonl") { limit = 64 * 1024 * 1024; } else if (name.endsWith("stderr.log")) { limit = 4 * 1024 * 1024; }
    const state: JournalState = { name, limit, hash: createHash("sha256"), retained: [], received: 0, durable: 0, overflow: 0 }; states.set(name, state);
    const journal: ProofJournal = {
      append(bytes): boolean {
        state.hash.update(bytes); if (closed || closing || bytes.length > state.limit - state.received || bytes.length > MAXIMUM_PENDING - pendingBytes) { state.overflow += bytes.length; markFailure(); return false; }
        for (let at = 0; at < bytes.length; at += CHUNK) { const copy = Buffer.from(bytes.subarray(at, at + CHUNK)); const offset = state.received; state.received += copy.length; pendingBytes += copy.length; state.retained.push({ end: state.received, bytes: copy });
          const original = enqueue({ op: "append", journal: name, offset, bytes: copy.toString("base64") }, "append");
          void observeAppend(original, offset + copy.length);
        } return true;
      },
      put(value): boolean { try { return journal.append(Buffer.from(`${JSON.stringify(value)}\n`)); } catch { markFailure(); return false; } },
      flush(): boolean { return state.durable === state.received; },
      snapshot(): ProofRecord { return { name, receivedBytes: state.received + state.overflow, durableBytes: state.durable, retainedBytes: state.retained.reduce((total, item) => total + item.bytes.length, 0), overflowBytes: state.overflow, receivedSha256: state.hash.copy().digest("hex") }; },
    }; return journal;
  };
  for (const name of PROOF_JOURNALS) { journals.set(name, createJournal(name)); }
  const journal = (name: ProofJournalName): ProofJournal => { const item = journals.get(name); proofNeed(item !== undefined, "BROKER_FIXED_JOURNAL_REQUIRED"); return item; };
  async function closeEvidence(): Promise<boolean> {
      if (closed) { return true; }
      if (closeAck === undefined) { if (!await flush()) { return false; } closing = true; closeAck = enqueue({ op: "close" }, "close-ready"); }
      try { const response = await bounded(closeAck); if (response["ok"] !== true || response["fileAndDirectorySync"] !== true) { markFailure(); closeAck = undefined; closing = false; return false; }
        peer.closeInput(); const result = await peer.closed.promise; closed = true; if (result.code !== 0 || result.signal !== null || !peer.protocolHealthy()) { markFailure(); } return true;
      } catch { markFailure(); if (peer.closeResult !== undefined && pendingBytes === 0) { closed = true; return true; } return false; }
  }
  return { controlFile: `${options.linuxEvidenceDirectory}/control.jsonl`, failure: failure.promise, state: journal("state.jsonl"), cleanup: journal("cleanup-manifest.json"), journal, flush,
    hasPending(): boolean { return pendingBytes > 0; }, failed(): boolean { return failed; }, snapshots(): readonly ProofRecord[] { return [...[...journals.values()].map(item => item.snapshot()), { schema: PROFILE, originalBrokerTransportPid: peer.child.pid ?? null, originalClose: peer.closeResult ?? null, sequence, pendingRawBytes: pendingBytes, stdout: stdout.snapshot(), stderr: stderr.snapshot(), filesystemType }]; },
    async readControl(): Promise<Buffer> { if (closed || closing) { return Buffer.alloc(0); } try { const response = await bounded(enqueue({ op: "read-control" }, "control")); proofNeed(response["ok"] === true && typeof response["bytes"] === "string" && response["bytes"].length <= 10_924, "BROKER_CONTROL_BOUND"); const bytes = Buffer.from(response["bytes"], "base64"); proofNeed(bytes.length <= 8192 && bytes.toString("base64") === response["bytes"], "BROKER_CONTROL_ENCODING"); return bytes; } catch { markFailure(); return Buffer.alloc(0); } },
    async terminalWorkspaceManifest(originalTransportsClosed: boolean, supplied?: ProofFacadeClosure): Promise<ProofRecord> {
      const facade = supplied ?? { mayExist: false, pid: null, originalPidfdHeld: false, originalExitObserved: false }; const unknown = facade.mayExist && !facade.originalExitObserved;
      try { const current = await lstat(options.workspace, { bigint: true }), entries = await readdir(options.workspace); const same = current.isDirectory() && !current.isSymbolicLink() && current.dev === workspace.dev && current.ino === workspace.ino && current.birthtimeNs === workspace.birthtimeNs;
        return { schema: "easyeda-pro-control.fresh-cli-closed-workspace.v2", workspace: options.workspace, hostWorkspaceDirectoryDurabilityProved: false, linuxEvidenceDirectory: options.linuxEvidenceDirectory, createdByThisAttempt: true, originalTransportsClosed, originalsClosed: originalTransportsClosed && !unknown, loadedFacade: facade, loadedFacadeExitUnknown: unknown, sameDirectoryIdentity: same, entries: entries.length, eligibleForEmptyDirectoryRemovalAfterDriverExit: originalTransportsClosed && !unknown && same && entries.length === 0, createdRuntimeCopies: [], createdClones: [], recursiveDeletionPerformed: false, evidencePreserved: true };
      } catch { return { schema: "easyeda-pro-control.fresh-cli-closed-workspace.v2", workspace: options.workspace, inspectionFailed: true, loadedFacadeExitUnknown: unknown, eligibleForEmptyDirectoryRemovalAfterDriverExit: false, evidencePreserved: true }; }
    },
    close: closeEvidence,
  };
}
