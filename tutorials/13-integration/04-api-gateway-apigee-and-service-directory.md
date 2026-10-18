# API Gateway, Apigee, contracts, and service discovery

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and prerequisites

Design an API contract, select an API-management approach, and distinguish gateway authentication from backend authorization. Complete HTTP, IAM, Cloud Run, and basic YAML. The core lab is local contract authoring with console inspection. API gateways, Apigee environments, networking, and target services can incur charges, and Apigee setup may require an enterprise agreement or substantial permissions.

## Select based on the product you need

API Gateway provides a managed front door for supported API configurations and backends. Apigee addresses a broader API-management lifecycle including proxy policies, API products, developer onboarding, analytics, and other edition-dependent capabilities. Cloud Endpoints remains relevant for supported existing deployments and its proxy-based model; compare current requirements and support before adopting it. A load balancer provides traffic distribution and serving features, but is not automatically a complete developer API program.

An API contract describes paths, operations, request/response schemas, authentication, and errors. OpenAPI has versions with differing syntax, and products support specific subsets. This tutorial's small example uses OpenAPI 2.0 form for compatibility with the linked Gateway workflow; inspect current supported features before extending it.

Separate **client authentication**, **client authorization**, and **gateway-to-backend authentication**. A verified JWT proves claims from an issuer; the application must still decide whether that subject may access a particular order. An API key alone is not a complete user authorization system. If the backend remains publicly invokable, clients may bypass gateway controls unless ingress and IAM are deliberately restricted.

Service Directory provides a registry for supported service discovery use cases. Knowing an endpoint's address does not prove it is healthy or that the caller is authorized. Registry metadata, DNS integration, network paths, and service identity must be managed together.

## Lab: write a small contract and threat model

Create `orders-api.yaml` locally:

```yaml
swagger: '2.0'
info:
  title: Study Orders API
  version: '1.0.0'
schemes:
  - https
produces:
  - application/json
paths:
  /orders/{orderId}:
    get:
      operationId: getOrder
      parameters:
        - name: orderId
          in: path
          required: true
          type: string
      responses:
        '200':
          description: Order visible to the authenticated caller
        '401':
          description: Missing or invalid authentication
        '403':
          description: Caller cannot access this order
        '404':
          description: Order unavailable
```

This is a **contract sketch, not a deployable authenticated Gateway configuration**. It deliberately omits backend routing extensions, host, security definitions, and security requirements until you choose a real identity provider and test backend.

1. Add schema details on paper: order identifier format, monetary units, error body, pagination if listing, and compatibility guarantees.
2. Choose a supported JWT issuer/audience model. Document how signing keys are discovered and rotated. Add the product-specific supported security definition using the current authentication guide.
3. Add the supported backend routing configuration for your authenticated test service, and identify the gateway runtime service account. Give it only the required backend invocation permission.
4. Write a negative test matrix: missing token, wrong audience, expired token, user A asking for user B's order, invalid order ID, and direct backend access.
5. Compare an API Gateway deployment with an Apigee proxy/API product design. Explain which requirements justify the additional operational and commercial complexity.
6. Design a version migration: add backward-compatible fields, publish deprecation policy, measure old-client usage, and provide rollback. Do not change a field's meaning while keeping the same contract version.

## Verification and troubleshooting

For a deployed extension, verify the gateway hostname, client identity validation, backend identity, per-object authorization, and logs with a correlation ID. A valid token with a 403 might mean backend invoker permissions or application authorization; identify which layer generated it. Route mismatches often concern path translation or backend URL configuration. Inspect the exact request received by a test backend without logging secrets.

## Cleanup and practice

Keep the contract and test matrix as portfolio artifacts. If you deployed, remove the gateway, unused configs/API resources, test proxy/environment resources where owned, target services, and temporary identities in documented order. Confirm recurring Apigee/environment or network charges are accounted for. Completion evidence includes a contract, trust-boundary diagram, product-selection decision, and successful positive and negative tests or their explicit design-only expected outcomes.

## References

- [API Gateway documentation](https://docs.cloud.google.com/api-gateway/docs)
- [Gateway OpenAPI configuration](https://docs.cloud.google.com/api-gateway/docs/openapi-overview)
- [Gateway authentication](https://docs.cloud.google.com/api-gateway/docs/authentication-method)
- [Apigee overview](https://docs.cloud.google.com/apigee/docs/api-platform/get-started/what-apigee)
- [Cloud Endpoints](https://docs.cloud.google.com/endpoints/docs)
- [Service Directory](https://docs.cloud.google.com/service-directory/docs/overview)
