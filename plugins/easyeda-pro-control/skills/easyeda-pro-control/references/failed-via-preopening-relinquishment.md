# Historical Via failure before opening

Use this route only when a disposable Via operation stopped at `main`, before
any project-opening intent. The complete twelve-record failure/abort/termination
prefix must match. An additional or missing record refuses. It cannot resolve
a create, Save, navigation or later verification failure.

Finish the original controller's supported cleanup first. If that is unavailable,
use only the separately authorized bounded cleanup and observe the original
processes' exits. This metadata route offers no process signal, close, release
or owner adoption. Keep the original journal and failure artifacts unchanged.

1. Select and admit a verified fresh facade with no prior application-owner
   allocation, reserved workflow or staged fixture. Do not launch EasyEDA first.
2. Query `easyeda_control_api` with
   `{request:{action:"via-preopening-relinquishment",query:{includeSchemas:true}}}`.
   Construct the inner request using `action:"relinquish-failed-via-before-opening"`,
   the original `operationId`, the exact complete canonical journal digest in
   `expectedEntireJournalSha256`, and all three required confirmations set true.
   These confirmations accept historical relinquishment, missing original Job
   and release proof, and unknown profile effects. The request accepts no PID,
   path, supplied observation, nonce or success flag.
3. Validate with
   `{request:{action:"via-preopening-relinquishment-validate",query:{request:candidateRequest}}}`.
   Send the returned request to `easyeda_control_pcb209_opening` as
   `{request:validatedRequest}`.
4. The isolated resolver checks the original complete journal and artifacts,
   all other operation/launch blockers, installation identity, two native Windows
   absence samples and two Linux facade observations. Any EasyEDA process, other
   PowerShell process or other facade refuses. The observation nonce is private
   to that original resolution attempt. Caller JSON cannot supply it.
5. A successful result writes separate immutable historical metadata and clears
   only this exact startup blocker. Original Job closure, helper release,
   termination, persistence and completion remain unproved. It grants no replay,
   inverse, native ownership, writer or Save authority. A future disposable
   workflow needs its own fresh fixture qualification and original owner.

After uncertain metadata publication, use the same coordinator and exact request.
It retains its original pending publication or returns an existing matching
receipt. Pending metadata continues to reserve the facade. Never edit the
receipt or original journal to make admission pass.
