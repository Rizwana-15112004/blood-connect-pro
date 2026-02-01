#!/usr/bin/env bash
# Exit on error
set -o errexit

# --- 1. SET UP FRONTEND ---
echo "Building Frontend..."
npm install
npm run build

# --- 2. SET UP BACKEND ---
echo "Installing Python Dependencies..."
pip install -r backend/requirements.txt
pip install gunicorn  # Ensure gunicorn is installed for production

echo "Running Migrations..."
python backend/manage.py migrate

echo "Collecting Static Files..."
python backend/manage.py collectstatic --noinput

echo "Deployment Build Completed Successfully!"
