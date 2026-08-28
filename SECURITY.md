# Security policy

## Reporting

Please report a vulnerability through [GitHub private vulnerability reporting](https://github.com/jan-guenter/easyeda-pro-agent-plugin/security/advisories/new). Do not include a real EasyEDA project, credential, operation journal, or proprietary design in a public issue.

## Safety-sensitive findings

Treat these as security or data-integrity issues:

- a path that bypasses runtime, context, capability, or compatibility gates;
- a write that is not journaled before dispatch;
- any live bridge call allowed while an orphan-risk or unreadable journal exists;
- a timeout/disconnect that can be retried without a one-use restart boundary;
- evidence that accepts malformed, coerced, partial, contradictory, replaced, or changing files;
- a mutation that can save without exact live, collateral, reopened, and durable-database proof;
- unrestricted bridge execution becoming reachable;
- secrets or user design data entering logs, artifacts, tests, or the repository.

The production component writer is disabled. Do not validate it on a real project.
