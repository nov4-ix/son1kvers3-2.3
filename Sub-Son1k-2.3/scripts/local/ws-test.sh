*** Begin Patch *** Add File: Sub-Son1k-2.3/scripts/local/ws-test.sh +#!/usr/bin/env bash +set -euo pipefail +HOST=
1
:
−
l
o
c
a
l
h
o
s
t
+
P
O
R
T
=
1:−localhost+PORT={2:-3001} +WS_URL="ws://
H
O
S
T
:
HOST:PORT/ws/generation" +if ! command -v wscat >/dev/null; then

echo "Installing wscat globally..."
npm install -g wscat +fi +echo "Connecting to WebSocket: WS_URL&quot; +printf '{&quot;type&quot;:&quot;subscribe&quot;,&quot;generationId&quot;:&quot;test-123&quot;}\n' | wscat -c &quot;WS_URL" ***