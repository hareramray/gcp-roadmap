# Linux, Bash, processes, files, and troubleshooting

[Home](../../README.md) · [Lab setup](../../LAB-SETUP.md)

## Outcomes and environment

Learn to navigate Linux, inspect a process, read logs, handle files, and write predictable shell commands. Use Google Cloud Shell or a disposable Linux environment. This is a local exercise; no VM or other billable deployment is necessary. On Windows, these are Bash commands, not PowerShell commands.

## Core concepts

A filesystem organizes directories and files. Absolute paths start at `/`; relative paths start at your current directory. `pwd` shows that directory. File ownership and mode bits govern read, write, and execute access for the owner, group, and others. Executing a directory means traversing it. Avoid `chmod 777` as a troubleshooting shortcut: investigate the correct owner and required permission.

Each process has an ID, environment, current directory, open files, and exit status. A shell starts child processes. `SIGTERM` requests orderly termination; `SIGKILL` prevents application cleanup and should be a last resort. Standard input, output, and error are separate streams. Pipes connect a producer's output to a consumer's input. In scripts, inspect exit codes and errors, not just whether some output appeared.

Environment variables are strings inherited by child processes. `export` makes a shell variable available to those children. Quote expansions such as `"$PROJECT_ID"` to prevent unintended splitting. Single quotes preserve literal text; double quotes allow variable and command expansion. Never paste secrets into commands that will be stored in history.

For scripts, `set -euo pipefail` can expose some errors but is not a substitute for explicit control flow: `-e` has context-dependent exceptions, `-u` rejects unset variables, and `pipefail` reports failed pipeline stages. This course usually shows short interactive blocks so you can inspect each result.

## Lab: inspect a tiny local service

1. Create a dedicated temporary directory and one file:

```bash
export SHELL_LAB="$(mktemp -d)"
cd "$SHELL_LAB"
printf 'Hello from the GCP learning lab\n' > index.html
pwd
ls -la
stat index.html
```

2. Start a server bound only to your local loopback interface. The captured PID identifies this lab process.

```bash
python3 -m http.server 8088 --bind 127.0.0.1 > server.log 2>&1 &
export SERVER_PID=$!
ps -p "$SERVER_PID" -o pid,ppid,stat,args
curl --fail --retry 3 --retry-connrefused --retry-delay 1 http://127.0.0.1:8088/
tail -n 5 server.log
```

3. Inspect system conditions. Some minimal environments may lack an optional utility; use the available equivalent.

```bash
df -h .
du -sh "$SHELL_LAB"
free -h
ss -lnt
```

`df` measures filesystem usage; `du` measures directory contents. A process can keep a deleted file open, which is one reason their apparent totals may differ. `ss` shows listening sockets; a socket existing does not prove the application returns correct responses.

4. Request a missing path and observe the response and log entry:

```bash
curl -i http://127.0.0.1:8088/missing
tail -n 5 server.log
```

The expected HTTP status is 404, while the server itself stays running. The distinction between application errors and process failure will matter for container probes and SRE alerts.

## Verification and troubleshooting

You should see the greeting, a listener on port 8088, and HTTP request lines in the log. If the port is occupied, choose another unused local port and update both server and client. If you see permission denied, inspect path ownership before elevating privileges. If `curl` fails immediately after start, inspect the server log and confirm the process survived startup. If a process is healthy but requests time out remotely, investigate its bind address and network path.

## Cleanup and exercises

```bash
kill "$SERVER_PID"
wait "$SERVER_PID" 2>/dev/null || true
cd
```

Inspect the saved directory with `printf '%s\n' "$SHELL_LAB"`, then remove its known files and empty directory when finished. Do not recursively delete a variable you have not checked. This exercise does not require deleting other files or terminating unrelated processes.

Practice writing a script that accepts a port as an argument, rejects invalid input, starts the server, and uses `trap` to stop it on exit. Explain why log redirection order matters and why `killall python3` would be inappropriate on a shared machine. Completion evidence is a sanitized command transcript and a brief diagnosis of the intentional 404.

## References

- [GNU Bash manual](https://www.gnu.org/software/bash/manual/)
- [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/)
- [Python HTTP server](https://docs.python.org/3/library/http.server.html)
- [Cloud Shell usage](https://docs.cloud.google.com/shell/docs/using-cloud-shell)
