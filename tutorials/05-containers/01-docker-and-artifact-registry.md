# Docker, OCI images, and Artifact Registry

[Curriculum home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## The objects you are actually deploying

An image is a layered filesystem plus execution metadata. A container is a running instance of that image with process, filesystem, and resource isolation. The Open Container Initiative (OCI) defines interoperable image and runtime formats. A registry stores manifests and blobs; a repository organizes them. A tag is a human-friendly reference that can move, while a digest identifies immutable content. Record the digest tested in staging and deploy that same digest to production.

You will build a small Python HTTP image, run it locally in Cloud Shell, push it to Artifact Registry, and inspect its digest. Use Cloud Shell Bash even if your laptop uses Windows. Docker is available in Cloud Shell. The local build consumes session resources; registry storage and remote builds can incur charges. Allow 45 minutes. Complete the shared project setup first.

Do not confuse Artifact Registry with historical Container Registry instructions. Use the explicit `LOCATION-docker.pkg.dev/PROJECT/REPOSITORY/IMAGE` form for new repositories. Repository location affects latency, data transfer, and residency. Standard repositories hold your artifacts; remote repositories cache upstream packages; virtual repositories provide a single access point over configured upstream repositories. Choose IAM and upstream policy deliberately. [Artifact Registry overview](https://docs.cloud.google.com/artifact-registry/docs/overview)

## Build a minimal, inspectable image

```bash
mkdir -p "$HOME/gcp-roadmap-labs/container"
cd "$HOME/gcp-roadmap-labs/container"
cat > app.py <<'EOF'
import http.server
import os
import socketserver

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"roadmap-container-ok\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

with socketserver.ThreadingTCPServer(("0.0.0.0", int(os.getenv("PORT", "8080"))), Handler) as server:
    server.serve_forever()
EOF
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY --chown=10001:10001 app.py /app/app.py
USER 10001:10001
ENV PORT=8080
EXPOSE 8080
CMD ["python", "app.py"]
EOF
cat > .dockerignore <<'EOF'
.git
.venv
*.log
*.pem
*.key
.env
EOF
docker build -t roadmap-web:lab-v1 .
docker run --detach --rm --name roadmap-web-lab \
  --publish 127.0.0.1:8080:8080 --memory=256m --cpus=1 roadmap-web:lab-v1
curl --retry 5 --retry-connrefused --retry-delay 1 http://localhost:8080/
docker inspect roadmap-web-lab --format='{{.Config.User}}'
docker logs roadmap-web-lab
docker stop roadmap-web-lab
```

Expect the response `roadmap-container-ok` and user `10001:10001`. Binding the host port to loopback keeps the local example from listening on every host interface. `EXPOSE` documents the port; it does not publish it. The JSON form of `CMD` avoids an unnecessary shell wrapper and improves signal propagation. The Python standard-library server is a learning fixture, not a production web-server recommendation.

The floating Python tag is convenient for learning. Production builds should pin a reviewed digest and use an automated dependency-update workflow. Otherwise the same Dockerfile can produce a different image next month. A pinned base still requires deliberate security updates.

## Push and verify by digest

```bash
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create roadmap-containers \
  --repository-format=docker --location="$REGION" \
  --description='Disposable roadmap container lab'
gcloud auth configure-docker "${REGION}-docker.pkg.dev"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/roadmap-containers/roadmap-web"
docker tag roadmap-web:lab-v1 "$IMAGE:lab-v1"
docker push "$IMAGE:lab-v1"
gcloud artifacts docker images list "$IMAGE" --include-tags
gcloud artifacts docker images describe "$IMAGE:lab-v1" \
  --format='value(image_summary.digest)'
```

The push output and registry description should identify the same manifest digest. Set `DIGEST` to that observed value and try `docker pull "$IMAGE@$DIGEST"`. A repository writer can push; consumers generally need only Artifact Registry Reader. The Docker credential helper uses your current identity rather than placing a downloaded service-account key in the build context. CI should use short-lived credentials. [Push and pull instructions](https://docs.cloud.google.com/artifact-registry/docs/docker/pushing-and-pulling)

## Build quality and registry policy

Order layers to preserve useful caching: copy dependency manifests, install dependencies, then copy frequently changing source. Use multi-stage builds to separate compilers from runtime content. Never pass secrets through Dockerfile `ARG` or `ENV` and assume a later deletion removes them; image layers and build metadata can retain information. Use supported build-secret mechanisms and inspect the final filesystem.

Set a cleanup policy first in dry-run mode, review which versions it selects, and only then enable deletion. Preserve currently deployed digests and rollback candidates. Immutable tags can prevent accidental retagging, but they do not replace digest-based deployment or backups. Vulnerability findings require triage by exploitability and runtime exposure; a successful push says nothing about safety.

## Troubleshooting and cleanup

An unauthorized push commonly means the credential helper lacks this region's hostname or the active identity lacks repository permissions. `exec format error` suggests an architecture mismatch. A container that starts but cannot be reached may bind only to its internal loopback address. Check logs before changing firewall rules.

```bash
gcloud artifacts repositories delete roadmap-containers --location="$REGION"
docker image rm "$IMAGE:lab-v1" roadmap-web:lab-v1
```

Delete the repository only after downstream tutorials no longer need it. Local image deletion does not remove remote storage, and removing a tag does not necessarily remove the underlying image. Exercise: build a second release, compare digests, then explain how you can prove a production deployment uses the image that passed testing.

## Official references

- [Docker build practices](https://docs.docker.com/build/building/best-practices/)
- [OCI image specification](https://github.com/opencontainers/image-spec)
- [Artifact Registry cleanup policies](https://docs.cloud.google.com/artifact-registry/docs/repositories/cleanup-policy)

