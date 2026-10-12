// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { prepareProjectPcbCreate } from "../src/project-pcb-create.ts";
import { PCB_CREATE_CONTEXT as CONTEXT, PCB_CREATE_ID as CREATED, PCB_CREATE_OPERATION as OPERATION, pcbCreateHistory as history } from "./project-pcb-create-fixture.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

registerStructureTransactionTests({ operation: OPERATION, context: CONTEXT, preparationPhase: "pcb-create-prepared",
  prepare: () => ({ pcbCreatePlan: prepareProjectPcbCreate(OPERATION, history(), CONTEXT) }), targetId: CREATED, created: true });
