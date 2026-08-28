/* SPDX-License-Identifier: MIT */
OUTPUT_FORMAT("elf64-x86-64")
OUTPUT_ARCH(i386:x86-64)
ENTRY(_start)

PHDRS
{
  image PT_LOAD FILEHDR PHDRS FLAGS(5); /* Read + execute, never writable. */
  stack PT_GNU_STACK FLAGS(6);          /* Read + write, never executable. */
}

SECTIONS
{
  . = 0x400000 + SIZEOF_HEADERS;
  .text : { *(.text) } :image
  .rodata : { *(.rodata) } :image

  /DISCARD/ :
  {
    *(.data)
    *(.bss)
    *(.comment)
    *(.eh_frame*)
    *(.note*)
  }
}
