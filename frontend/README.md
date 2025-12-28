# Koola Frontend

Next.js frontend for the Koola fullstack test.

## Setup

```bash
cd frontend
npm install
```

Set API base URL (optional but recommended):
```bash
export NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Run

```bash
npm run dev
```

App runs at: http://localhost:3000

## Structure

- `app/(public)`: Public routes like login and unauthorized
- `app/(dashboard)`: Authenticated dashboard routes (users, settings, system info)
- `components/layout`: Layout primitives (sidebar, dashboard shell)
- `components/ui`: Reusable UI components
- `lib`: Shared helpers (API client, validation, utilities)
- `hooks`: Shared React hooks
- `types`: Shared TypeScript types

## Notes

- The backend is expected at `http://localhost:5001` by default.
- Update `NEXT_PUBLIC_API_URL` if your backend runs on a different port.
