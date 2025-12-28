# Koola Backend

Backend API for Koola fullstack test

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## Seed Database

Create sample data:

```bash
npm run seed
```

This will create 3 users:
- admin / admin123 (lv3)
- user_lv2 / user123 (lv2)
- user_lv1 / user123 (lv1)

## Run

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Default port: `5001` (see `.env`).

## API Endpoints

### Sessions
- POST /api/sessions

### Users
- GET /api/users
- GET /api/users/:id (lv2, lv3)
- POST /api/users
- PATCH /api/users/:id
- DELETE /api/users/:id
- PATCH /api/users/me/password (lv3)

### Settings
- GET /api/settings
- PATCH /api/settings/:key

### System & Logs
- GET /api/system
- GET /api/logs

## Utilities

Normalize existing usernames to the new format:
```bash
npm run normalize-usernames
```
