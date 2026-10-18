# GKE operations, traffic, fleets, and service mesh

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Operate an application, not just a cluster

This tutorial extends the `web` Deployment from Kubernetes fundamentals. Recreate that lab if you already removed its namespace. Use Cloud Shell Bash and confirm the current context. The cluster remains billable; this exercise does not create a public load balancer or a second cluster. Multicluster and mesh work below is a gated architecture exercise, with explicit decisions to make before paying for additional infrastructure.

Operations begins with a service objective: for example, a defined success rate and latency target over a stated measurement window. Cluster health alone cannot establish user experience. Monitor request rate, errors, duration, saturation, restarts, pending Pods, and dependency behavior. Connect alerts to a runbook with diagnosis and mitigation steps rather than paging for every CPU spike.

## Hands-on: probes and disruption budget

A readiness probe controls whether a Pod should receive traffic. A liveness probe restarts a container believed to be stuck. A startup probe allows slow initialization before other probes apply. A liveness endpoint that fails whenever a database is briefly unavailable can restart every application replica simultaneously and worsen the outage. Keep liveness focused on recoverable process health and readiness focused on serving capability. [Probe semantics](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

```bash
kubectl get deployment web -n k8s-lab
kubectl patch deployment web -n k8s-lab --type=strategic -p '
{"spec":{"template":{"spec":{"containers":[{"name":"web",
"startupProbe":{"httpGet":{"path":"/","port":8080},"failureThreshold":30,"periodSeconds":2},
"livenessProbe":{"httpGet":{"path":"/","port":8080},"periodSeconds":10,"failureThreshold":3}}]}}}}'
cat > availability.yaml <<'EOF'
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-budget
  namespace: k8s-lab
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: web
EOF
kubectl apply -f availability.yaml
kubectl rollout status deployment/web -n k8s-lab --timeout=300s
kubectl get pdb -n k8s-lab
```

With two healthy replicas, expect one allowed voluntary disruption. A PDB constrains supported eviction operations; it does not stop a hardware failure, direct Pod deletion, or every controller action. Deployment rolling-update availability is also controlled by Deployment strategy settings. Add topology spread or anti-affinity when replicas must occupy different nodes or zones, and verify sufficient capacity exists for those constraints.

## Scaling and diagnosis

```bash
kubectl autoscale deployment web -n k8s-lab \
  --cpu-percent=60 --min=2 --max=4
kubectl get hpa -n k8s-lab
kubectl top pods -n k8s-lab
kubectl describe hpa web -n k8s-lab
```

CPU-based HPA requires metrics and CPU requests. The utilization percentage is measured against requests, so an unrealistically tiny request can trigger scaling too early. HPA adds Pods; cluster autoscaling or Autopilot provisioning adds node capacity for unschedulable workloads. Vertical Pod Autoscaler recommends or changes resource requests; its interaction with HPA must be designed deliberately. Scaling replicas does not fix a shared database bottleneck.

For a safe load experiment, issue bounded traffic from an approved test client and record baseline, peak, and recovery metrics. Stop after a short fixed duration. Do not run an unbounded load generator against shared infrastructure. Expect delays between demand, metrics collection, replica decisions, and node availability.

## Ingress and Gateway

A `LoadBalancer` Service can provision a cloud load balancer and incur ongoing charges. Ingress expresses HTTP routing through a controller; Gateway API separates infrastructure ownership from application routes and supports richer attachment policies. GKE Gateway has supported GatewayClasses and feature constraints. Before applying a public route, define TLS, DNS, certificate ownership, health checks, backend timeouts, Cloud Armor policy where appropriate, and whether traffic should be internal or external. [GKE Gateway](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/gateway-api)

Design a Gateway and HTTPRoute on paper for `/api` and `/static`. Identify who owns the Gateway, who may attach routes, and how cross-namespace references are authorized. A YAML object accepted by the API is not proof of a functioning endpoint: inspect controller conditions, backend health, and actual TLS requests.

## Fleet and multicluster design lab

Fleets group clusters for supported centralized management features. Registration is not a replication mechanism. Multicluster Services export and import service discovery across eligible member clusters; multicluster Gateway capabilities can route traffic across clusters. Cloud Service Mesh adds supported service-to-service traffic, security, and telemetry controls. It introduces its own control-plane, data-plane, upgrade, and troubleshooting responsibilities. [Fleet overview](https://docs.cloud.google.com/kubernetes-engine/fleet-management/docs/fleet-concepts)

Write a two-region design containing independent clusters, shared or isolated identity boundaries, global entry routing, and an explicit data-replication strategy. State what happens if one region loses connectivity but still accepts writes. Resolve data consistency and split-brain behavior before declaring the system highly available. Mesh mutual TLS protects transport identity; it does not automatically authorize business operations or encrypt database storage.

## Cleanup and mastery checks

```bash
kubectl delete hpa web -n k8s-lab
kubectl delete pdb web-budget -n k8s-lab
kubectl delete namespace k8s-lab
```

Delete the cluster using the creation tutorial once all GKE labs are finished. Inspect cloud load balancers, persistent disks, addresses, and logs if you added optional resources. For failures, distinguish `Pending` capacity/placement issues, probe failures, OOM kills, and upstream errors; each requires a different response.

Exercise: produce a runbook for “healthy Pods, elevated user errors.” Include DNS, TLS, Gateway status, Service endpoints, policy, application logs, and dependency checks. Explain how to roll back an application while preserving enough capacity for ongoing traffic.

## Official references

- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [PodDisruptionBudgets](https://kubernetes.io/docs/tasks/run-application/configure-pdb/)
- [Cloud Service Mesh](https://docs.cloud.google.com/service-mesh/docs/overview)
- [Multicluster Services](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/multi-cluster-services)
