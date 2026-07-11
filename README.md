# MaintainIQ — Frontend

**MaintainIQ** is a QR-based asset maintenance platform. Physical assets carry QR
codes; scanning a code opens a safe public asset page where anyone can report an
issue with AI-assisted triage, while staff manage assignment, maintenance, and a
permanent asset history from an internal dashboard.

This repository is the **frontend**: a React single-page app that talks to the
[MaintainIQ backend API](../maintainiq-backend).

---

## Tech stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Framework     | React 19                                     |
| Build tool    | Vite 8                                        |
| UI kit        | MUI (Material UI) 9 + `@mui/x-data-grid`     |
| Routing       | React Router 7                               |
| HTTP client   | Axios (JWT bearer via interceptor)           |
| Auth state    | React Context (`AuthContext`) + localStorage |
| Notifications | Snackbar (`NotifyContext`)                   |

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- The **MaintainIQ backend** running and reachable (default `http://localhost:8080`)

### 2. Install

```bash
git clone <repo-url>
cd maintainiq-frontend
npm install
```

### 3. Configure environment

Create a `.env` file (copy `.env.example`):

```bash
cp .env.example .env
```

| Variable       | Description                       | Default                     |
| -------------- | --------------------------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the backend REST API  | `http://localhost:8080/api` |

> When deployed, set `VITE_API_URL` to the **deployed backend** URL, e.g.
> `https://your-api.onrender.com/api`. Vite env vars are read at **build time**,
> so rebuild after changing it.

### 4. Run

```bash
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run lint       # eslint
```

---

## Demo credentials

Log in at `/login` with a seeded account (see the backend's seed step):

| Role       | Email                       | Password    |
| ---------- | --------------------------- | ----------- |
| Admin      | `admin@maintainiq.com`      | `Admin@123` |
| Technician | `tech@maintainiq.com`       | `Tech@123`  |
| Supervisor | `supervisor@maintainiq.com` | `Super@123` |

> These must exist in the backend database (run the backend seed script). They
> are for demo/testing only.

---

## Routes

### Public (no login)

| Path           | Screen            | Purpose                                                  |
| -------------- | ----------------- | -------------------------------------------------------- |
| `/login`       | Login             | Sign in                                                  |
| `/register`    | Register          | Create an account                                        |
| `/asset/:slug` | Public Asset Page | Opened by scanning a QR — safe asset info + Report Issue |

### Protected (require a token)

| Path          | Screen        | Purpose                                     |
| ------------- | ------------- | ------------------------------------------- |
| `/dashboard`  | Dashboard     | Summary cards + recent activity             |
| `/assets`     | Asset List    | Search / filter assets                      |
| `/assets/new` | Create Asset  | Register a new asset (admin)                |
| `/assets/:id` | Asset Details | Asset info, QR + printable label, history   |
| `/issues`     | Issue List    | Search / filter issues                      |
| `/issues/:id` | Issue Details | Workflow, assignment, maintenance, evidence |

`/` redirects to `/dashboard`; unknown paths show a Not Found page.

---

## Key features

- **QR public flow** — scanning an asset QR opens `/asset/:slug`, which exposes
  only safe info and a **Report an Issue** action.
- **AI Issue Triage** — the report dialog sends the complaint to the backend
  (Gemini) and returns a suggested title, category, priority, possible causes,
  and initial checks that the reporter can review and edit before submitting.
- **Evidence upload** — reporters and technicians can attach photos/videos
  (stored in Cloudinary via the backend) on issues and maintenance records.
- **Maintenance workflow** — controlled status transitions, assignment, and
  maintenance records (notes, parts, cost, time, evidence).
- **Asset history** — a permanent, append-only activity timeline per asset.
- **Role-aware UI** — admin and technician actions differ; the backend also
  enforces authorization.

---

## Project structure

```
src/
├── api/            # Axios client + per-resource API modules
├── components/     # Reusable UI (Sidebar, Topbar, cards, dialogs, uploaders…)
├── context/        # AuthContext, NotifyContext
├── pages/          # Route screens (Dashboard, AssetList, IssueDetails, …)
├── theme/          # MUI theme
├── utils/          # formatting, storage, constants helpers
├── App.jsx         # Routes
└── main.jsx        # App bootstrap
```

---

## Notes

- Auth token is stored in `localStorage` and attached to every request by an
  Axios interceptor. A `401` response clears the session and redirects to
  `/login`.
- The app expects the backend response envelope `{ success, data }` — see the
  [backend README](../maintainiq-backend/README.md) for the API contract.
