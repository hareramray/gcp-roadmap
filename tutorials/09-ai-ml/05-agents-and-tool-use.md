# Agents, tool calling, and controlled execution

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md) · [AI and ML roadmap](../../roadmaps/09-ai-ml.md)

## Goal and prerequisites

Implement a small trusted tool boundary, test unauthorized calls, and design a bounded agent workflow. Allow 90 minutes. Complete Gemini, IAM, and [lab setup](../../LAB-SETUP.md). The default Python exercise runs locally and invokes no model or cloud resources. A managed agent deployment requires the currently documented platform/runtime APIs, billing, a runtime identity, and narrowly scoped access to its tools and data. Do not assume an agent needs project-wide editor permissions.

Google's Agent Development Kit (ADK) supports code-based agent construction and orchestration. Current managed platform naming includes agent build/runtime capabilities; older material may refer to Vertex AI Agent Engine. Framework and runtime features change independently, so validate the supported SDK/runtime pairing and deployment requirements. [ADK documentation](https://adk.dev/) · [Platform name changes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/vertex-ai-name-changes)

## Tool calling is a proposal, not authorization

A model can emit a function name and arguments matching a declared schema. Your application decides whether to execute it. The dispatcher must check the allowlist, argument schema, caller identity, resource scope, rate limit, and action policy. A well-formed call can still be unauthorized or harmful to the business. For example, a valid `order_id` belonging to another customer must be denied.

Tool outputs become model context and can contain untrusted text. Treat retrieved documents, web pages, emails, and database notes as data, not instructions. The model must not gain privileges from a sentence inside a result. Keep the authenticated user/tenant and service credentials outside model-controlled arguments. Use least-privilege runtime identities and separate read tools from consequential write tools. [Function calling](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling)

An agent loop commonly alternates model planning, tool proposals, policy checks, execution, and response synthesis. Bound total steps, elapsed time, token usage, parallelism, tool timeouts, and retry attempts. Detect repeated identical calls and expose a useful failure state. Multi-agent delegation adds coordination and permission complexity; use it only when distinct roles or parallel tasks improve the measured outcome.

## Lab: make authorization independent of the model

```bash
mkdir -p agent-tool-lab
cat > agent-tool-lab/tools.py <<'PY'
from dataclasses import dataclass

@dataclass(frozen=True)
class Context:
    tenant_id: str
    user_id: str

ORDERS={
 'A-101':{'tenant_id':'tenant-a','status':'paid','total_minor':2500},
 'B-201':{'tenant_id':'tenant-b','status':'draft','total_minor':500}
}

def get_order(args, context):
    if set(args) != {'order_id'} or not isinstance(args['order_id'],str):
        raise ValueError('Invalid tool arguments')
    if len(args['order_id']) > 64:
        raise ValueError('Order ID too long')
    order=ORDERS.get(args['order_id'])
    if not order or order['tenant_id'] != context.tenant_id:
        raise PermissionError('Order unavailable to this caller')
    return {'order_id':args['order_id'],'status':order['status'],
            'total_minor':order['total_minor']}

ALLOWED_TOOLS={'get_order':get_order}
def dispatch(name,args,context):
    if name not in ALLOWED_TOOLS:
        raise PermissionError('Tool not allowed')
    if not isinstance(args,dict):
        raise ValueError('Arguments must be an object')
    return ALLOWED_TOOLS[name](args,context)

if __name__=='__main__':
    ctx=Context(tenant_id='tenant-a',user_id='user-1')
    assert dispatch('get_order',{'order_id':'A-101'},ctx)['status']=='paid'
    for name,args in [('get_order',{'order_id':'B-201'}),
                      ('delete_order',{'order_id':'A-101'}),
                      ('get_order',{'order_id':'A-101','tenant_id':'tenant-b'})]:
        try: dispatch(name,args,ctx)
        except (PermissionError,ValueError): pass
        else: raise AssertionError('Unsafe call accepted')
    print('Authorized read passed; cross-tenant, unknown-tool, and forged-context calls denied')
PY
python3 agent-tool-lab/tools.py
```

1. Verify the three negative tests fail closed. Notice that the response does not reveal whether another tenant's order exists; this reduces identifier enumeration.
2. Define a function schema with only `order_id`. Describe it clearly for the model, but keep all enforcement in `dispatch` and the backend.
3. Add a timeout and correlation ID around a real service client in a future extension. Log tool name, status, latency, and caller scope without unnecessarily logging order details.
4. Design a `request_refund` action separately from `get_order`. Require an authenticated ownership check, policy-calculated maximum, idempotency key, and the application's approval/confirmation workflow before irreversible execution. A model-produced “approved” string is not evidence of approval.
5. Add a malicious note in an order record telling the assistant to access another tenant. The trusted dispatcher must still deny the attempted call regardless of how the model reasons about the note.

## Optional ADK/model integration

In a dedicated local project, follow the current ADK quickstart, select a supported `MODEL_ID` and location, and register the read-only wrapper as a tool. Keep the trusted context bound by the application/session layer rather than exposed as a model-settable parameter. Run conversations requesting an owned order, another tenant's order, a nonexistent order, and an unsupported write. Inspect tool traces and final responses; the agent should accurately describe inability to access data without fabricating a successful lookup.

Before managed deployment, record the runtime service account, allowed tools, session storage, artifact storage, network paths, maximum session lifetime, and data-retention policy. Sessions and memory can contain sensitive user information; memory is not a reason to retain everything forever. Validate identity propagation across MCP or agent-to-agent integrations: connecting a protocol does not automatically delegate the user's full authorization correctly.

## Reliability, cleanup, and exercise

Common failures include repeated tool loops, schema mismatch, stale session state, misunderstood tool descriptions, unauthorized cross-resource access, and retries duplicating writes. Use explicit state machines for critical business workflows and reserve model choice for tasks where it helps. An agent's natural-language claim that it completed an action must be backed by a successful tool result or durable business record.

The local lab has no cloud cleanup. Delete `agent-tool-lab` when done. For optional managed deployments, remove runtime deployments, sessions/artifacts as appropriate, unused service accounts, and any billable model endpoints or backing stores. Verify background schedules are disabled too.

Exercise: an agent can find an invoice but should not send it to arbitrary email addresses. A worked design separates read access from distribution authority, restricts permitted recipients through application policy, and records the final authorized action. You pass when adversarial user/model arguments cannot override the same permissions enforced for ordinary application requests.
