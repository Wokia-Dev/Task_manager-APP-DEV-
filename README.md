# TaskFlow - Project Setup & Execution Guide

Welcome to **TaskFlow**, a comprehensive team task management ecosystem. This guide provides step-by-step instructions to set up and run the entire application—including the Flask Backend, React Native (Expo) Frontend, and MySQL Database—on your local machine.

---

## 1. Prerequisites

Ensure you have the following tools installed:

- **Node.js**: v18.x or higher (LTS recommended)
- **Python**: 3.9 - 3.12
- **MySQL Server**: 8.0 or higher
- **Git**: Latest version
- **Expo CLI**: Installed via `npx expo` (standard with Expo 55)
- **Mobile Emulator/Physical Device**:
    - **Android**: Android Studio & Emulator (or physical device with Expo Go)
    - **iOS**: macOS with Xcode & Simulator (or physical device with Expo Go)

---

## 2. Database Setup (MySQL)

TaskFlow uses MySQL to store user data, teams, and tasks.

### Step 1: Create the Database
Open your MySQL terminal or a GUI like MySQL Workbench and run:
```sql
CREATE DATABASE taskflow_db;
```

### Step 2: Initialize Schema
Navigate to the backend database directory and run the initialization script:
```bash
cd TaskManagerBE/database
mysql -u your_username -p taskflow_db < init_db.sql
```
*(Replace `your_username` with your MySQL username, e.g., `root`)*

---

## 3. Backend Setup (Flask API)

The backend is built with Flask and handles authentication (JWT), team management, and task operations.

### Step 1: Navigate and Environment Setup
```bash
cd TaskManagerBE
# Create virtual environment
python -m venv .venv
# Activate virtual environment (Windows)
.\.venv\Scripts\activate
# Activate virtual environment (macOS/Linux)
source .venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `TaskManagerBE` directory:
```env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taskflow_db
```

### Step 4: Start the Server
```bash
python run.py
```
The API will be available at `http://localhost:5000/api`.

### Step 5: Seed Demo Data (Optional)
To populate the database with realistic sample users, teams, and tasks:
```bash
python seed.py
```
**Demo Credentials:**
- **Email:** `demo@taskflow.com`
- **Password:** `password123`

---

## 4. Frontend Setup (React Native Expo)

The frontend is a cross-platform mobile app built with Expo 55 and TypeScript.

### Step 1: Navigate and Install
```bash
cd TaskManagerFE/TaskManager
npm install
```

### Step 2: Configure API Base URL
For mobile devices to connect to your local backend, you **must** use your computer's Local IP address instead of `localhost`.

1. Find your IP address:
    - **Windows**: `ipconfig` (Look for IPv4 Address)
    - **macOS/Linux**: `ifconfig` or `ip addr`
2. Open `src/services/api.ts` and update the `getBaseUrl` function:
```typescript
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return 'http://YOUR_LOCAL_IP:5000/api'; // Example: 192.168.1.50
};
```

### Step 3: Run the Application
```bash
npx expo start
```
- **Web**: Press `w` in the terminal.
- **Android**: Press `a` (requires emulator or device connected via USB).
- **iOS**: Press `i` (requires macOS).
- **Physical Device**: Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).

---

## 5. Application Workflow

Once the app is running, follow these steps to explore TaskFlow:

1.  **Login/Register**: Use the demo credentials (`demo@taskflow.com` / `password123`) or create a new account.
2.  **Create/Join a Team**:
    -   Navigate to the **Teams** tab.
    -   **Create**: Start a new team and get an invite code.
    -   **Join**: Use an existing invite code to join a colleague's team.
3.  **Manage Tasks**:
    -   Create tasks within your team.
    -   Assign tasks to members.
    -   Update status (Todo → In Progress → Completed).

---

## 6. Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **CORS Errors** | Ensure `Flask-CORS` is installed and initialized in `app/__init__.py`. Check that your frontend origin is allowed. |
| **MySQL Connection Refused** | Verify MySQL service is running and credentials in `.env` match your local setup. |
| **Network Request Failed (Mobile)** | Ensure your phone and PC are on the same Wi-Fi. Double-check the IP address in `api.ts`. Disable Firewall temporarily if needed. |
| **Expo Tunnel Issues** | If using `expo start --tunnel`, ensure you have `@expo/ngrok` installed globally or locally. |
| **Module Not Found** | Run `npm install` (frontend) or `pip install -r requirements.txt` (backend) again to ensure all packages are present. |

---

Developed with ❤️ by the TaskFlow Team.