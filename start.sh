#!/bin/bash
set -e

echo "Starting Inkframe..."

# Backend
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Frontend
cd ../frontend
npm install -q
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Backend:  http://localhost:8000"
echo "✓ Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
