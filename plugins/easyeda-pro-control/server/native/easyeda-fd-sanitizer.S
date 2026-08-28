/*
 * SPDX-License-Identifier: MIT
 *
 * Linux x86_64 descriptor-sanitizing launcher.
 *
 * The facade deliberately maps Bubblewrap's complete authority set to file
 * descriptors 0 through 9 and passes reviewed Bubblewrap itself as descriptor
 * 10. This launcher verifies all eleven descriptors, rejects file-capability
 * Bubblewrap images, marks descriptor 10 close-on-exec, atomically closes the
 * rest of the descriptor table, and enters Bubblewrap by descriptor. It has no
 * interpreter, libc, writable image segment, or configuration parser.
 */

.section .rodata
missing_argument_message:
  .ascii "EasyEDA descriptor sanitizer: missing executable.\n"
.set missing_argument_message_length, . - missing_argument_message

missing_descriptor_message:
  .ascii "EasyEDA descriptor sanitizer: required descriptor missing.\n"
.set missing_descriptor_message_length, . - missing_descriptor_message

close_range_message:
  .ascii "EasyEDA descriptor sanitizer: close_range failed.\n"
.set close_range_message_length, . - close_range_message

parent_identity_message:
  .ascii "EasyEDA descriptor sanitizer: parent identity changed.\n"
.set parent_identity_message_length, . - parent_identity_message

capability_message:
  .ascii "EasyEDA descriptor sanitizer: executable capability admission failed.\n"
.set capability_message_length, . - capability_message

descriptor_isolation_message:
  .ascii "EasyEDA descriptor sanitizer: descriptor isolation failed.\n"
.set descriptor_isolation_message_length, . - descriptor_isolation_message

execve_message:
  .ascii "EasyEDA descriptor sanitizer: execveat failed.\n"
.set execve_message_length, . - execve_message

capability_name:
  .asciz "security.capability"

empty_path:
  .asciz ""

.section .text
.global _start
.type _start, @function
_start:
  movq (%rsp), %r12
  cmpq $3, %r12
  jb missing_argument

  movq 16(%rsp), %rbx           /* argv[1], expected facade PID */
  xorl %r15d, %r15d
  xorl %ecx, %ecx
parse_expected_parent:
  movzbl (%rbx,%rcx), %eax
  testb %al, %al
  je expected_parent_parsed
  cmpl $10, %ecx
  jae parent_identity_failed
  subl $48, %eax                /* ASCII '0' */
  cmpl $9, %eax
  ja parent_identity_failed
  imulq $10, %r15, %r15
  addq %rax, %r15
  cmpq $2147483647, %r15
  ja parent_identity_failed
  incl %ecx
  jmp parse_expected_parent

expected_parent_parsed:
  testl %ecx, %ecx
  jz parent_identity_failed
  testq %r15, %r15
  jz parent_identity_failed

  movl $110, %eax                /* getppid */
  syscall
  cmpq %r15, %rax
  jne parent_identity_failed

  movl $157, %eax                /* prctl */
  movl $1, %edi                  /* PR_SET_PDEATHSIG */
  movl $9, %esi                  /* SIGKILL */
  xorl %edx, %edx
  xorl %r10d, %r10d
  xorl %r8d, %r8d
  syscall
  testq %rax, %rax
  js parent_identity_failed

  movl $110, %eax                /* getppid */
  syscall
  cmpq %r15, %rax
  jne parent_identity_failed

  xorl %r13d, %r13d
verify_required_descriptors:
  cmpl $11, %r13d
  je reject_executable_capabilities
  movl $72, %eax                 /* fcntl */
  movq %r13, %rdi
  movl $1, %esi                  /* F_GETFD */
  xorl %edx, %edx
  syscall
  testq %rax, %rax
  jne missing_descriptor
  incl %r13d
  jmp verify_required_descriptors

reject_executable_capabilities:
  subq $144, %rsp                 /* Linux x86_64 struct stat */
  movl $5, %eax                   /* fstat */
  movl $10, %edi
  movq %rsp, %rsi
  syscall
  movq %rax, %r14
  movl 24(%rsp), %eax             /* st_mode */
  addq $144, %rsp
  testq %r14, %r14
  js descriptor_isolation_failed
  movl %eax, %edx
  andl $0170000, %edx             /* S_IFMT */
  cmpl $0100000, %edx             /* S_IFREG */
  jne descriptor_isolation_failed
  andl $07777, %eax
  cmpl $0755, %eax
  jne descriptor_isolation_failed

  movl $193, %eax                /* fgetxattr */
  movl $10, %edi                 /* reviewed Bubblewrap descriptor */
  leaq capability_name(%rip), %rsi
  xorl %edx, %edx                /* NULL value probes the exact size */
  xorl %r10d, %r10d
  syscall
  cmpq $-61, %rax                /* -ENODATA is the only accepted result */
  jne executable_capabilities_rejected

  movl $72, %eax                 /* fcntl */
  movl $10, %edi
  movl $2, %esi                  /* F_SETFD */
  movl $1, %edx                  /* FD_CLOEXEC */
  syscall
  testq %rax, %rax
  jne descriptor_isolation_failed

close_unexpected_descriptors:
  movl $436, %eax                /* close_range */
  movl $11, %edi
  movl $0xffffffff, %esi         /* UINT_MAX */
  xorl %edx, %edx
  syscall
  testq %rax, %rax
  js close_range_failed

  movl $10, %edi                 /* reviewed Bubblewrap descriptor */
  leaq empty_path(%rip), %rsi
  leaq 24(%rsp), %rdx            /* &argv[2] becomes the new argv */
  leaq 16(%rsp,%r12,8), %r10     /* envp follows argv[argc] == NULL */
  movl $0x1000, %r8d             /* AT_EMPTY_PATH */
  movl $322, %eax                /* execveat */
  syscall

execve_failed:
  leaq execve_message(%rip), %rsi
  movl $execve_message_length, %edx
  movl $71, %r10d
  jmp fail

missing_argument:
  leaq missing_argument_message(%rip), %rsi
  movl $missing_argument_message_length, %edx
  movl $64, %r10d
  jmp fail

missing_descriptor:
  leaq missing_descriptor_message(%rip), %rsi
  movl $missing_descriptor_message_length, %edx
  movl $65, %r10d
  jmp fail

close_range_failed:
  leaq close_range_message(%rip), %rsi
  movl $close_range_message_length, %edx
  movl $70, %r10d
  jmp fail

parent_identity_failed:
  leaq parent_identity_message(%rip), %rsi
  movl $parent_identity_message_length, %edx
  movl $72, %r10d
  jmp fail

executable_capabilities_rejected:
  leaq capability_message(%rip), %rsi
  movl $capability_message_length, %edx
  movl $73, %r10d
  jmp fail

descriptor_isolation_failed:
  leaq descriptor_isolation_message(%rip), %rsi
  movl $descriptor_isolation_message_length, %edx
  movl $74, %r10d

fail:
  movl $1, %eax                  /* write */
  movl $2, %edi                  /* STDERR_FILENO */
  syscall
  movl $60, %eax                 /* exit */
  movl %r10d, %edi
  syscall
  ud2
.size _start, . - _start

.section .note.GNU-stack,"",@progbits
