#!/bin/bash

# Start backend
echo "Starting backend on port 5000..."
cd "$(dirname "$0")/server"
npm start &
BACKEND_PID=$!

# Wait for backend to startup
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
cd "$(dirname "$0")/client"
npm start &
FRONTEND_PID=$!

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

echo ""
echo "============================================"
echo "📦 Weekly Orders App"
echo "============================================"
echo "✅ Backend:  http://localhost:5000"
echo "✅ Frontend: http://localhost:3000"
echo "============================================"
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both to end
wait
