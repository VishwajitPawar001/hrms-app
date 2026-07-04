# Human Resource Management System (HRMS)

A premium, role-based corporate tracking and resource platform built for managing staff details, shift sessions, leave scheduling, and payroll structures. The application enforces role-based separation of privileges, allowing Employees to manage their shifts, apply for time-off, and view payslips, while empowering HR Administrators to manage all organizational profiles, coordinate leaves, and configure salary settings.

---

## 🚀 Key Features

*   **⚡ Automated Employee ID Generation:** Generates unique corporate identifiers in the format `OI` + User Initials + Joining Year + Sequential Serial Number (e.g. `OISD20260001`) automatically upon signup.
*   **👥 Searchable Employee Directory:** A card layout directory letting HR admins search and filter employees dynamically. Each card contains a real-time status indicator:
    *   🟢 **Green dot:** Currently checked-in and active on shift.
    *   ✈️ **Airplane emoji:** On approved, scheduled leave today.
    *   🟡 **Yellow dot:** Offline / absent.
*   **👁️ HR Review Mode Switcher:** Enables HR Administrators to select any employee card in the directory to inspect their profile metrics, leave application queue, shift punch logs, and compensation structures in a read-only context.
*   **📊 Reactive Payroll Engine:** Automatically distributes base wages into compliant components (50% Basic, 50% HRA, 8.33% Performance Bonus, 8.333% LTA, Fixed Allowance, PF deductions, and flat PT). Includes an interactive slider interface for HR to adjust base wages with real-time component scaling.
*   **📅 Time-Off Management:** Support for applying leaves (Casual, Sick, Maternity, Paternity, Unpaid) with date range pickers, synchronized with immediate status updates in employee histories.
*   **⏱️ Shift Logs:** Punch-in and punch-out mechanics validating that only one active shift session runs per employee per day.

---

## ⚙️ System Architecture

The project is structured as a decoupled monorepo:

```
hrms-app/
├── hrms-server/                 # Express backend written in TypeScript
│   ├── config/                  # Database connectivity configuration
│   ├── middlewares/             # JWT auth validation gates
│   ├── models/                  # Mongoose models (User, Attendance, Leave, Payroll)
│   ├── routes/                  # Controller routers (auth, attendance, leave, profile, payroll)
│   ├── index.ts                 # Server entrypoint
│   └── tsconfig.json            # Backend TypeScript configurations
│
└── hrms-client/                 # Vite + React + TailwindCSS frontend
    ├── src/
    │   ├── api/                 # Axios networking instance with interceptors
    │   ├── components/          # Tabbed components (Dashboard, Profile, Directory, Payroll)
    │   ├── App.tsx              # Main UI routing controller
    │   └── main.tsx             # Frontend entrypoint
    └── tsconfig.json            # Frontend TypeScript configurations
```

---

## 🛠️ Quick Start

### 1. Installation
Install project dependencies in both the client and server directories:

```bash
# Install server modules
cd hrms-server
npm install

# Install client modules
cd ../hrms-client
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `hrms-server` directory:
```env
JWT_SECRET=super_secret_key_here
PORT=5000
LOCAL_MONGO_URI=mongodb://localhost:27017/odoo_hrms
```

### 3. Execution
Start the server and client development hosts:

```bash
# Start backend (from hrms-server directory)
npm run dev

# Start frontend (from hrms-client directory)
npm run dev
```
The server will bind to `http://localhost:5000` and the client will serve on `http://localhost:5173`.

### 4. Compilation Verification
Verify TypeScript type safety and compile targets before pushing:

```bash
# Verify backend compilation
cd hrms-server
npx tsc --noEmit

# Verify frontend compilation
cd ../hrms-client
npx tsc --noEmit
```
Both commands should compile cleanly with zero errors or warnings.
