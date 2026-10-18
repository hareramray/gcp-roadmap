# GKE security, RBAC, and Workload Identity Federation

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Separate the security boundaries

Use your disposable cluster and Cloud Shell Bash. Allow one hour. This lab creates one empty Cloud Storage bucket and a Kubernetes identity; normal cluster and storage costs apply. Confirm the current context and project before making IAM changes.

Google Cloud IAM controls access to cloud resources. Kubernetes RBAC controls requests to the Kubernetes API. NetworkPolicy controls supported Pod traffic paths. Pod security controls constrain process privileges. These mechanisms complement one another; no single “secure cluster” setting replaces them. A namespace organizes resources and supports scoped policy, but it is not by itself a strong hostile-tenant isolation boundary.

Workload Identity Federation for GKE maps Kubernetes identities to Google Cloud authorization without distributing private service-account keys. Autopilot enables it automatically. Standard requires the workload pool on the cluster and compatible metadata-server configuration on the node pool. Enabling federation does not grant an application any API permissions. [Federation concepts](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity)

## Hands-on: direct access for one Kubernetes account

```bash
kubectl config current-context
kubectl create namespace identity-lab
kubectl create serviceaccount reader -n identity-lab
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export IDENTITY_BUCKET="${PROJECT_ID}-identity-lab"
gcloud storage buckets create "gs://$IDENTITY_BUCKET" \
  --location="$REGION" --uniform-bucket-level-access
export KSA_PRINCIPAL="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${PROJECT_ID}.svc.id.goog/subject/ns/identity-lab/sa/reader"
gcloud storage buckets add-iam-policy-binding "gs://$IDENTITY_BUCKET" \
  --member="$KSA_PRINCIPAL" --role=roles/storage.objectViewer
cat > identity-pod.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: identity-check
  namespace: identity-lab
spec:
  serviceAccountName: reader
  restartPolicy: Never
  containers:
  - name: client
    image: google/cloud-sdk:slim
    command: ["sleep", "3600"]
    resources:
      requests:
        cpu: 250m
        memory: 512Mi
      limits:
        cpu: 500m
        memory: 512Mi
EOF
kubectl apply -f identity-pod.yaml
kubectl wait -n identity-lab --for=condition=Ready pod/identity-check --timeout=300s
kubectl exec -n identity-lab identity-check -- \
  gcloud storage ls "gs://$IDENTITY_BUCKET"
```

An empty listing with successful exit status is expected because the bucket is empty. No downloaded JSON key is needed. Uploading should fail because Object Viewer does not permit creation. Test a denied operation with harmless synthetic content if you want proof of least privilege. For production, pin and scan the client image rather than using a floating tutorial tag.

On a Standard cluster with mixed metadata-server settings, explicitly schedule the test on a node pool configured for Workload Identity Federation. Autopilot rejects unnecessary node selectors for this purpose. Some APIs require the documented IAM-service-account impersonation approach instead of direct federated access; evaluate API limitations before choosing the binding. [Configure workload access](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)

## RBAC exercise

Create a Role allowing only Pod inspection and bind it to the Kubernetes service account:

```bash
kubectl create role pod-reader -n identity-lab \
  --verb=get,list,watch --resource=pods
kubectl create rolebinding reader-pods -n identity-lab \
  --role=pod-reader --serviceaccount=identity-lab:reader
kubectl auth can-i list pods -n identity-lab \
  --as=system:serviceaccount:identity-lab:reader
kubectl auth can-i delete pods -n identity-lab \
  --as=system:serviceaccount:identity-lab:reader
```

Expect `yes` then `no`. These impersonation checks require your administrator identity to have impersonation permission; a denial to impersonate is not proof that the target account lacks Pod permissions. Avoid using cluster-admin as a routine application role. Disable automatic Kubernetes API token mounting for workloads that do not need that API, after testing the selected identity integration.

## Network and secret controls

Start a network-policy exercise in a separate namespace so you do not accidentally block the identity test. Apply default-deny ingress and egress, then add explicit application, DNS, and metadata-server access according to your GKE dataplane. GKE metadata-server destinations differ by networking mode; use the current official guidance instead of copying an arbitrary IP exception. NetworkPolicy is enforced only by a compatible configured dataplane. It does not regulate every possible host-network or control-plane path.

Secret Manager's GKE add-on uses a CSI volume integration and workload identity to mount authorized secret material. Review supported cluster versions, regions, rotation behavior, and whether your application rereads changed files. A SecretProviderClass describes which secrets to mount; IAM still determines whether the Pod can read them. Avoid mirroring secrets into Kubernetes Secret objects unless the integration and your threat model require it. [Secret Manager add-on](https://docs.cloud.google.com/secret-manager/docs/secret-manager-managed-csi-component)

Require non-root execution where compatible, drop unnecessary Linux capabilities, avoid privileged containers and host mounts, use read-only filesystems when possible, and set resource requests and limits. Scan images and enforce trusted deployment policy. Restrict control-plane access independently from application ingress.

## Diagnose and clean up

A 403 can indicate a wrong namespace/account in the principal, missing IAM binding, unsupported direct federation, or policy restrictions. Timeouts usually point toward DNS, metadata-server reachability, or egress controls. Do not “fix” either by attaching Editor to the node account.

```bash
kubectl delete namespace identity-lab
gcloud storage buckets remove-iam-policy-binding "gs://$IDENTITY_BUCKET" \
  --member="$KSA_PRINCIPAL" --role=roles/storage.objectViewer
gcloud storage buckets delete "gs://$IDENTITY_BUCKET"
```

Exercise: explain the identity-sameness risk when two clusters in one project create the same namespace and service-account names. Design separate trust domains for teams that should not impersonate one another.

## Official references

- [Kubernetes RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [GKE network policy](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/network-policy)
- [Autopilot security](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-security)

