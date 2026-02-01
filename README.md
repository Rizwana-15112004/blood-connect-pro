# 🩸 BloodLife: Blood Donation Management System (Django + React)

A professional, high-performance medical platform built for managing blood donors, tracking inventory, and automating emergency blood requests.

---

## 🚀 Deployment Guide (For Clients)

This guide will help you host this application on your own account.

### 1. Account Setup (Prerequisites)
Before starting, ensure you have the following free accounts:
- **GitHub**: To store your code.
- **Render.com** (or PythonAnywhere): To host the backend and frontend.
- **Gmail Account**: To send automated blood request emails.

---

### 2. Prepare the Code
1. **Unzip** the project files on your computer.
2. **Setup Email**: Open `backend/core/settings.py` and scroll to the bottom. Update these fields with your own Gmail and **App Password**:
   ```python
   EMAIL_HOST_USER = 'your-email@gmail.com'
   EMAIL_HOST_PASSWORD = 'your-app-password'
   ```
   *Note: You must use a Google "App Password", not your regular password.*

---

### 3. Push to GitHub
1. Create a **New Repository** on your GitHub account (e.g., `blood-donation-system`).
2. Open a terminal in the project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial Release"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

### 4. Hosting on Render (Recommended)
Render is the easiest way to host this Django + React project for free.

1. **Login to [Render.com](https://render.com/)**.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Use these settings:
   - **Language**: `Python 3`
   - **Build Command**: `./backend/build.sh` (I have provided this script for you)
   - **Start Command**: `gunicorn core.wsgi:application --chdir backend`
5. **Environment Variables**: Add these in the "Env" tab on Render:
   - `PYTHON_VERSION`: `3.10.x`
   - `DEBUG`: `False` (for production)

---

### 5. Post-Deployment Setup
Once the site is live:
1. **Create Admin**: Go to your site URL + `/admin` (e.g., `yoursite.onrender.com/admin`).
2. Login with the **administrator account** you created during the initial setup or via the Django shell.
3. **Security**: Ensure your administrator has a strong, unique password.

---

## 🛠️ Local Development (For Testing)

If you want to run it on your own computer:

1. **Install Dependencies**:
   ```bash
   # Setup Backend
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install -r backend/requirements.txt
   python backend/manage.py migrate

   # Setup Frontend
   npm install
   ```

2. **Run the App**:
   ```bash
   ./run.sh
   ```
   - **Frontend**: http://localhost:8080
   - **Backend API**: http://localhost:8000

---

## 👨‍💻 Developer Support
If you need any customization or face issues during deployment, please contact the developer.

**Project Status**: Production Ready ✅
**Author**: Rizwana Nazin
