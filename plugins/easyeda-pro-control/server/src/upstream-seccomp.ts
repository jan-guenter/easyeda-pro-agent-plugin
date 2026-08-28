import { endianness } from "node:os";
import process from "node:process";

interface ClassicBpfInstruction {
  readonly code: number;
  readonly falseOffset: number;
  readonly trueOffset: number;
  readonly value: number;
}

const BPF_LOAD_WORD_ABSOLUTE = 0x20;
const BPF_JUMP_EQUAL = 0x15;
const BPF_JUMP_GREATER_OR_EQUAL = 0x35;
const BPF_RETURN = 0x06;
const SECCOMP_DATA_SYSCALL_OFFSET = 0;
const SECCOMP_DATA_ARCH_OFFSET = 4;
const AUDIT_ARCH_X86_64 = 3_221_225_534;
const X32_SYSCALL_BIT = 1_073_741_824;
const SECCOMP_RETURN_KILL_PROCESS = 2_147_483_648;
const SECCOMP_RETURN_ERRNO_EPERM = 327_681;
const SECCOMP_RETURN_ALLOW = 2_147_418_112;

// X86_64 syscall numbers. The reviewed production runtime is deliberately
// Architecture-specific so an ABI change cannot silently weaken this filter.
const CONNECT_SYSCALL = 42;
const SENDTO_SYSCALL = 44;
const SENDMSG_SYSCALL = 46;
const SENDMMSG_SYSCALL = 307;
const IO_URING_SETUP_SYSCALL = 425;
const DENIED_OUTBOUND_SYSCALLS = [
  CONNECT_SYSCALL,
  SENDTO_SYSCALL,
  SENDMSG_SYSCALL,
  SENDMMSG_SYSCALL,
  IO_URING_SETUP_SYSCALL,
] as const;

function encodeInstruction(
  output: Buffer,
  index: number,
  instruction: ClassicBpfInstruction,
): void {
  const offset = index * 8;
  output.writeUInt16LE(instruction.code, offset);
  output.writeUInt8(instruction.trueOffset, offset + 2);
  output.writeUInt8(instruction.falseOffset, offset + 3);
  output.writeUInt32LE(instruction.value, offset + 4);
}

export function createReviewedUpstreamSeccompProgram(): Buffer {
  if (
    process.platform !== "linux" ||
    process.arch !== "x64" ||
    endianness() !== "LE"
  ) {
    throw new Error(
      "The reviewed upstream seccomp program requires little-endian Linux x86_64.",
    );
  }
  const instructions: ClassicBpfInstruction[] = [
    {
      code: BPF_LOAD_WORD_ABSOLUTE,
      falseOffset: 0,
      trueOffset: 0,
      value: SECCOMP_DATA_ARCH_OFFSET,
    },
    {
      code: BPF_JUMP_EQUAL,
      falseOffset: 0,
      trueOffset: 1,
      value: AUDIT_ARCH_X86_64,
    },
    {
      code: BPF_RETURN,
      falseOffset: 0,
      trueOffset: 0,
      value: SECCOMP_RETURN_KILL_PROCESS,
    },
    {
      code: BPF_LOAD_WORD_ABSOLUTE,
      falseOffset: 0,
      trueOffset: 0,
      value: SECCOMP_DATA_SYSCALL_OFFSET,
    },
    {
      code: BPF_JUMP_GREATER_OR_EQUAL,
      falseOffset: 1,
      trueOffset: 0,
      value: X32_SYSCALL_BIT,
    },
    {
      code: BPF_RETURN,
      falseOffset: 0,
      trueOffset: 0,
      value: SECCOMP_RETURN_KILL_PROCESS,
    },
  ];
  for (const syscall of DENIED_OUTBOUND_SYSCALLS) {
    instructions.push(
      {
        code: BPF_JUMP_EQUAL,
        falseOffset: 1,
        trueOffset: 0,
        value: syscall,
      },
      {
        code: BPF_RETURN,
        falseOffset: 0,
        trueOffset: 0,
        value: SECCOMP_RETURN_ERRNO_EPERM,
      },
    );
  }
  instructions.push({
    code: BPF_RETURN,
    falseOffset: 0,
    trueOffset: 0,
    value: SECCOMP_RETURN_ALLOW,
  });
  const output = Buffer.alloc(instructions.length * 8);
  for (const [index, instruction] of instructions.entries()) {
    encodeInstruction(output, index, instruction);
  }
  return output;
}
