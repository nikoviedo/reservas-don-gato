# Reservas Don Gato (Next.js + Prisma + PostgreSQL)

## Setup local
1. `cp .env.example .env`
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run dev`

## Docker dev
- `docker compose up --build`

## Endpoints compatibles
- `GET /api/dg/v1/config`
- `POST /api/dg/v1/public_hold`
- `GET /api/dg/v1/public_confirm?key=...`
- `GET /api/dg/v1/staff_reservations`
- `POST /api/dg/v1/staff_reservation_status`
- `GET|POST /api/dg/v1/staff_settings`
- `POST /api/dg/v1/staff_login`
- `GET /api/internal/cron?secret=...`

## Frontend
- `/reservar`
- `/staff`
- `/staff-public`

Se reutiliza frontend vanilla en `public/app.js` y `public/app.css` apuntando a `/api/dg/v1`.
