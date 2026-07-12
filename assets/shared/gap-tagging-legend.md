# Gap Tagging Legend
#
# All generated documents must use these inline tags to flag unresolved items.
# Never silently omit a gap - always tag it so reviewers can find and resolve it.

## Tags

| Tag | Meaning | When to use |
|---|---|---|
| `🔶 Assumption` | A decision made without confirmed data or stakeholder sign-off | When the author assumed something that could turn out to be wrong |
| `🔵 Open Question` | An unresolved question that must be answered before the document is approved | When information is genuinely unknown or requires stakeholder input |

## Usage Examples

```markdown
The system will support up to 10,000 concurrent users. 🔶 Assumption - load test not yet conducted.

What is the SLA for third-party payment gateway response time? 🔵 Open Question - awaiting vendor contract.
```

## Resolution Process

1. Reviewers address all tagged items during the review cycle.
2. Replace each tag with the confirmed value or decision.
3. Move the document to `Approved` status only when zero tags remain.
4. If a question cannot be resolved, escalate to the project stakeholder before approval.
