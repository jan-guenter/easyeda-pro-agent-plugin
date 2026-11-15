# Temporary artifact cleanup and source continuation

The user requested cleanup of task-generated temporary files and explicitly
excluded WSL disk changes. The user removed the earlier Windows EasyEDA
validation temporary roots and reported freeing about 30 GB. A subsequent
scoped inventory found no remaining EasyEDA-prefixed entries in that temporary
folder. No unrelated files or managed plugin caches were removed.

The current workflow removed its incomplete, never-attached 54,538,534,912-byte
copy, 172,856,356 bytes of duplicate public source/tool archives, and 19,510,374
bytes of closed public runtime copies. Two closed extraction/failed-clone
folders totaling 219,918,505 bytes went to the Windows Recycle Bin. The current
public checkout, small exact interrupted fixture, hashes, failure records and
original process-closure receipts remain available. Raw receipts stay private.

The incomplete copy was not a verified backup: an unexpected WSL restart
changed the source during copying. Its own original copy worker was cancelled
with its retained process handle and observed exit before that output was
removed. No original WSL image was moved, deleted, manually mounted or repaired.
Ordinary project-file access subsequently worked through the existing setup.

A single read-only full Git object check passed without errors. The integrated
source was clean, and the unfinished Wire source and native drain work were
read back before development resumed. These observations establish source
continuation, not live design or saved-result validation.

The repository rules now make cleanup part of each workflow's responsibility.
Large retained artifacts need a reason; source, unique evidence and unfinished
owners must be preserved. This is an operating rule, not a claim that a generic
host-temp purge or disk-management tool has been added.
