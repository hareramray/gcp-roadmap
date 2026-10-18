# Hybrid, multicloud, fleets, and Google Distributed Cloud

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcome and prerequisites

Choose an appropriate hybrid operating model and distinguish container fleet management from VMware hosting and distributed infrastructure. This design lab uses Cloud Shell Bash and the shared `PROJECT_ID`, `REGION`, and `ZONE`; no cluster, circuit, private cloud, or hardware is purchased. A live fleet inspection requires a configured fleet host project, the GKE Hub API, and fleet-viewer permissions. VMware Engine and Google Distributed Cloud deployments have separate entitlement, capacity, hardware, networking, and contractual prerequisites.

## Choose the reason for multiple environments

Hybrid connects on-premises and cloud systems. Multicloud uses more than one provider. Drivers include data locality, latency, existing investment, regulatory requirements, and acquisition integration. Each extra environment adds identity, connectivity, patching, monitoring, backup, and support coordination. Portability of a container image does not guarantee portability of data services, identities, load balancers, storage, or operational procedures.

A fleet groups Kubernetes clusters for supported management features. GKE Enterprise capabilities can help govern configuration, policy, service connectivity, and operations across eligible environments; feature support differs by cluster type and edition. Registering a cluster is not equivalent to making its control plane Google-managed. Attached third-party clusters support a subset of features. [GKE deployment options](https://docs.cloud.google.com/kubernetes-engine/enterprise/docs/deployment-options), [Fleet creation](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/creating-fleets).

Google Distributed Cloud has distinct connected, air-gapped, and software-only offerings. Connected deployments use supported dedicated hardware on premises with Google Cloud management integration. Software-only deployments run on supported customer infrastructure, such as VMware or bare metal. Air-gapped environments have a different operational and service boundary; do not assume Google Cloud API parity or always-on connectivity. [Connected Distributed Cloud](https://docs.cloud.google.com/distributed-cloud/connected/latest/docs/overview), [Software-only VMware overview](https://docs.cloud.google.com/kubernetes-engine/distributed-cloud/vmware/docs/overview).

VMware Engine hosts a VMware environment on dedicated Google Cloud infrastructure. It can preserve existing VMware tools and application patterns, while the customer still owns workload-level responsibilities. VMware Engine is not the same as running GKE clusters on an on-premises vSphere installation. Node availability, minimum configurations, licensing, topology, and recovery design need current validation. [VMware Engine overview](https://docs.cloud.google.com/vmware-engine/docs/overview).

## Lab: select a platform for three workloads

1. Write a local requirements file:

   ```bash
   cat > hybrid-requirements.csv <<'EOF'
   workload,latency_need,offline_need,existing_platform
   store-checkout,local-low,24-hours,kubernetes
   finance-erp,regional,none,vmware
   public-api,global,none,containers
   EOF
   column -s, -t hybrid-requirements.csv
   ```

2. For store checkout, evaluate local processing with queued synchronization. Define what “24 hours offline” means for inventory consistency, authentication, key expiry, images, telemetry buffering, and updates. An application cannot remain autonomous if every transaction requires a remote cloud database.

3. For finance ERP, compare VMware Engine with direct VM migration and application modernization. Score compatibility, migration time, licensing, operational skills, recovery, total cost, and long-term exit options. Retaining familiar operations can be valuable, but it is not automatically the least expensive choice.

4. For the public API, evaluate managed cloud hosting first and add cross-environment deployment only for a concrete requirement. Identify the stateful dependency that could limit failover even when frontend containers run in two clouds.

5. Draw network and identity boundaries: nonoverlapping CIDRs, DNS forwarding, hybrid routing, firewall policy, certificate trust, identity federation, and egress. Define the effect of an Interconnect or VPN failure and how routing failover will be tested. A tunnel being up does not prove application reachability.

6. If an existing lab fleet is supplied, inspect memberships:

   ```bash
   gcloud container fleet memberships list --project="$PROJECT_ID"
   ```

   Record cluster platform and feature eligibility. Do not register or unregister a production cluster for the exercise.

7. Build an operations matrix assigning upgrades, node failures, control-plane management, backups, policy rollout, security patches, and incidents across Google, your platform team, the application team, and other vendors. Include a disconnected-site update and certificate renewal process.

## Verification, cleanup, costs, and exercises

Acceptance requires a platform decision per workload, a failure-mode table, and an explicit responsibility matrix. Common mistakes include assuming fleet membership provides universal feature parity, using overlapping networks, ignoring cloud egress, and designing active-active writes without conflict handling.

Remove the synthetic requirements file when finished. Real private clouds, dedicated connectivity, hardware, licensing, telemetry, and redundant capacity can be substantial ongoing commitments. Extend the design to a second provider and identify the five largest provider-specific dependencies. Propose a test for each dependency before claiming the application is portable.

