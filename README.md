# TransitOps - Smart Transport Operations Platform

TransitOps is a centralized transport operations platform built using the **React, Express, Node.js, and PostgreSQL** stack. It helps manage vehicle registries, driver assignments, dispatch workflows, maintenance logs, expenses, and ROI analytics.

Scaffolded as a hackathon boilerplate, it defines all data fields, models, REST endpoints, and UI views as placeholders/stubs, enabling a 4-person team to immediately build features in parallel on the `main` branch.

---

## Project Structure

```
transitops/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── api/             # API hook callers (axios wrappers)
│   │   ├── components/      # Reusable UI (Sidebar Nav, KPI cards, modals)
│   │   ├── pages/           # Pages (Dashboard, Vehicles, Drivers, Trips, etc.)
│   │   ├── App.jsx          # Route configuration
│   │   ├── main.jsx         # App bootstrap
│   │   └── index.css        # Premium custom dark styling system
│   └── package.json
├── server/                  # Node.js + Express Backend
│   ├── controllers/         # Endpoint business logic (Stubs with TODOs)
│   ├── middleware/          # Auth and RBAC logic (Stubs with TODOs)
│   ├── models/              # PostgreSQL raw query handlers
│   ├── routes/              # Express API endpoints
│   ├── validators/          # Input schema validations (Stubs with TODOs)
│   ├── db.js                # PostgreSQL connection pool configuration
│   ├── seed.js              # Database initialization and mock data loader
│   ├── server.js            # Server entrypoint
│   └── package.json
├── database/
│   └── schema.sql           # PostgreSQL table definitions
└── README.md
```

---

## Development Setup

### Prerequisite: PostgreSQL Setup
1. Create a PostgreSQL database named `transitops`.
2. Ensure you have a user with credentials. By default, the app looks for:
   `postgresql://odoo:odoo@localhost:5432/transitops`
   *(You can customize this by creating a `.env` file in the `/server` directory and setting `DATABASE_URL`)*.

---

### Step 1: Install & Run Backend Server
In your terminal, navigate to the `/server` directory:
```bash
cd server
npm install
```

#### Initialize Tables & Seed Database:
To create the database tables and pre-populate them with the initial hackathon workflow data (such as driver `Alex` and vehicle `Van-05`), run:
```bash
node seed.js
```

#### Start Dev Server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

### Step 2: Install & Run Client Frontend
Open a new terminal window and navigate to the `/client` directory:
```bash
cd client
npm install
npm run dev
```
The client application will start on `http://localhost:5173`. Open this URL in your web browser.

---

## Parallel Work Allocation for Teammates (4-Person Team)

Since the boilerplate provides working structures, views, and routes, your team can divide the hackathon workload without touching the same files:

*   **Teammate 1 (Fleet & Maintenance Logic)**:
    *   Focus files: `server/controllers/vehicleController.js`, `server/controllers/maintenanceController.js`.
    *   Goal: Implement rules where putting a vehicle in active maintenance moves status to `In Shop`, and closing maintenance restores it to `Available`.
*   **Teammate 2 (Driver & Licensing Compliance)**:
    *   Focus files: `server/controllers/driverController.js`, `server/validators/inputValidators.js` (`validateDriver`).
    *   Goal: Implement expiration date checkers, safety score restrictions, and block suspended drivers.
*   **Teammate 3 (Trip Dispatch & State Machine)**:
    *   Focus files: `server/controllers/tripController.js`.
    *   Goal: Implement trip dispatch (checking capacity, double assignments, driver status), completion (updating odometer, creating a fuel log), and cancellation status rollbacks.
*   **Teammate 4 (Finance, Analytics & CSV Export)**:
    *   Focus files: `server/controllers/reportsController.js`, `server/controllers/dashboardController.js`, and Excel/PDF generators.
    *   Goal: Solidify fuel efficiency aggregates, operational costs (Fuel + Maintenance), and exact ROI calculation algorithms.
