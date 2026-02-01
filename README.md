## Getting Started
- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Developer
**Developed by Rapid.AI**
*Contact: rappidapp.ai@gmail.com*
*BCA Final Year Project*

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How to Run

1. **Install Dependencies** (First time only):
   ```bash
   # Setup Python Backend
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   python backend/manage.py migrate

   # Setup Frontend
   npm install
   ```

2. **Start the Application**:
   Simply run the helper script to start both Django and Vite:
   ```bash
   ./run.sh
   ```

   - Backend: http://localhost:8000
   - Frontend: http://localhost:8080

## Features
- Real Blood Donation Management
- Persistent Donor Profiles
- Admin Dashboard with Live Stats
- Email Notifications

