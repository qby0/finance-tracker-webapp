#!/bin/bash

# Script to start both Node.js and Python services

echo "Starting Finance Tracker Services..."

# Start Python service in background
echo "Starting Python service on port 5001..."
cd "$(dirname "$0")"
python3 python_service.py &
PYTHON_PID=$!

# Wait a moment for Python service to start
sleep 2

# Start Node.js server
echo "Starting Node.js server on port 5000..."
node server.js &
NODE_PID=$!

echo "Services started!"
echo "Python service PID: $PYTHON_PID"
echo "Node.js server PID: $NODE_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $PYTHON_PID $NODE_PID; exit" INT TERM
wait

