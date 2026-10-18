# Kubernetes fundamentals: desired state and application objects

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Prerequisites and mental model

Use a disposable Kubernetes cluster from the next GKE tutorial, or an existing authorized local learning cluster. Commands run in Cloud Shell Bash. Verify `kubectl config current-context` before every exercise: a namespace does not protect you from selecting the wrong cluster. Allow one hour. GKE compute and storage charges continue while a cluster exists, even when you are studying YAML.

The API server accepts desired state. Controllers compare it with observed state and reconcile differences. The scheduler chooses nodes for pending Pods; node agents start containers. A Pod is the smallest scheduled application unit and can contain cooperating containers sharing network and volumes. A Deployment manages ReplicaSets, which maintain replicated Pods. Deleting a managed Pod usually causes replacement; deleting its Deployment removes that desired state.

A Service selects Pods by labels and gives them a stable discovery endpoint. It does not contain the application. A ConfigMap supplies ordinary configuration; a Secret stores sensitive values but base64 encoding is not encryption. Namespace isolation, RBAC, encryption, and secret-access policy still matter. A persistent volume claim requests storage independently of a Pod's ephemeral filesystem. [Kubernetes concepts](https://kubernetes.io/docs/concepts/)

## Hands-on: deploy, discover, and reconcile

Use the public sample image for the first exercise so you do not need registry credentials. Production images should use reviewed digests from your controlled repository.

```bash
kubectl config current-context
kubectl create namespace k8s-lab
cat > web.yaml <<'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-settings
  namespace: k8s-lab
data:
  LEARNING_STAGE: foundations
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: k8s-lab
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: us-docker.pkg.dev/cloudrun/container/hello
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: web-settings
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /
            port: 8080
          initialDelaySeconds: 3
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: k8s-lab
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
EOF
kubectl apply -f web.yaml
kubectl rollout status deployment/web -n k8s-lab --timeout=300s
kubectl get pods,services,endpointslices -n k8s-lab
kubectl port-forward -n k8s-lab service/web 8080:80
```

Run `curl http://localhost:8080/` in a second Cloud Shell terminal. Expect the sample page, two ready Pods, and an EndpointSlice listing their addresses. Port-forwarding is a debugging tunnel tied to your client, not production ingress. Stop it with Ctrl+C.

Delete one Pod and watch the Deployment restore its replica count:

```bash
POD="$(kubectl get pods -n k8s-lab -l app=web -o jsonpath='{.items[0].metadata.name}')"
kubectl delete pod "$POD" -n k8s-lab
kubectl get pods -n k8s-lab --watch
```

Observe the new name and readiness transition, then stop the watch. A Pod identity is disposable; client code should use Service discovery, not memorize Pod IPs. In-cluster DNS resolves `web.k8s-lab.svc.cluster.local` to the Service. [Services](https://kubernetes.io/docs/concepts/services-networking/service/)

## Scheduling and configuration

Requests guide scheduling and some autoscaling calculations; limits constrain resource consumption. A CPU limit can throttle processing, while exceeding a memory limit can terminate a container. `Pending` can mean insufficient allocatable resources, unsuitable affinity, taints without tolerations, or unbound storage. Tolerations permit placement on tainted nodes; they do not force placement. Use node affinity and topology spread constraints when placement or failure-domain distribution matters.

Edit the ConfigMap and observe that environment variables in existing processes do not automatically change. Restart the Deployment to create Pods with the new environment. Mounted ConfigMap updates have different semantics and still require application reload behavior. Practice a dummy Secret with a clearly fake password, then inspect who can read Secrets in the namespace. Never print real secrets in a tutorial log or commit them to Git.

Use Jobs for finite tasks, CronJobs for scheduled Jobs, DaemonSets for node-level agents, and StatefulSets when stable identities and storage relationships are required. A StatefulSet does not implement database replication or backups; the application and storage design must do that work.

## Verification, troubleshooting, and cleanup

Work down the chain: Deployment status → Pod events → container logs → Service selector → EndpointSlice → network policy. `ImagePullBackOff` points to image names, access, or network reachability. `CrashLoopBackOff` means repeated process failure; inspect `kubectl logs --previous`. A ready Pod missing from endpoints commonly has a label mismatch.

```bash
kubectl describe deployment web -n k8s-lab
kubectl get events -n k8s-lab --sort-by=.metadata.creationTimestamp
kubectl logs -n k8s-lab deployment/web --all-containers=true
kubectl delete namespace k8s-lab
```

Deleting this namespace removes its objects but does not delete your cluster. Persistent volumes and cloud load balancers have their own lifecycle rules; inspect them when using other manifests. Exercise: deliberately break the Service selector, diagnose the symptom, then restore it. Explain why increasing replicas cannot repair a wrong selector.

## Official references

- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

