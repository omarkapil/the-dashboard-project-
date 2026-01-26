#!/bin/sh

# Start Nginx in background if it exists
if command -v nginx >/dev/null; then
    echo "Starting Nginx..."
    nginx
fi

# Simulate Windows RDP (3389)
if [ "$SIMULATE_OS" = "windows" ]; then
    echo "Simulating Windows RDP..."
    # Keep port 3389 open with a dummy listener
    while true; do nc -l -p 3389 -e echo "Microsoft RDP"; sleep 1; done &
fi

# Simulate Linux SSH (22)
if [ "$SIMULATE_OS" = "linux" ]; then
    echo "Simulating SSH..."
    # Keep port 22 open
    while true; do nc -l -p 22 -e echo "SSH-2.0-OpenSSH_8.2p1"; sleep 1; done &
fi

# Keep container alive
tail -f /dev/null
