#!/bin/bash
# Double-clickable macOS launcher for Disguise Test Pattern Generator
# Starts a local lightweight web server and opens in your default browser.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

PORT=8080
# If 8080 is taken, fall back to 8081
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    PORT=8081
fi

echo "========================================================"
echo " Starting Disguise Test Pattern Generator..."
echo " Running offline at: http://localhost:$PORT"
echo " Press Ctrl+C in this terminal window to stop."
echo "========================================================"

# Open browser after a brief delay
(sleep 1 && open "http://localhost:$PORT") &

# Start python static server
python3 -m http.server $PORT
