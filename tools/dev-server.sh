#!/usr/bin/env bash
# Restart the Vite dev server in the background (pid in /tmp/vite.pid, log in /tmp/vite.log).
cd "$(dirname "$0")/.."
if [ -f /tmp/vite.pid ]; then kill "$(cat /tmp/vite.pid)" 2>/dev/null; sleep 0.5; fi
nohup node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 > /tmp/vite.log 2>&1 &
echo $! > /tmp/vite.pid
