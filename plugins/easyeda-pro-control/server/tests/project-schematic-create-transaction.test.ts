// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { prepareProjectSchematicCreate } from "../src/project-schematic-create.ts";
import { SCHEMATIC_CREATE_CONTEXT as CONTEXT, SCHEMATIC_CREATE_ID as CREATED, SCHEMATIC_CREATE_OPERATION as OPERATION, schematicCreateHistory as history } from "./project-schematic-create-fixture.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

registerStructureTransactionTests({ operation: OPERATION, context: CONTEXT, preparationPhase: "schematic-create-prepared",
  prepare: () => ({ schematicCreatePlan: prepareProjectSchematicCreate(OPERATION, history(), CONTEXT) }), targetId: CREATED, created: true });
