#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if venv exists
if [ -d "backend/venv" ]; then
    source backend/venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment not found! Please create one in 'backend/venv' or 'venv'."
    exit 1
fi

echo "Starting Backend Server..."
cd backend
python3 manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend Server..."
npm run dev

# Wait for backend to finish (if frontend is stopped first)
wait $BACKEND_PID
