# Don Gato Reservas Frontend (Vite + React + TypeScript)

SPA liviana para reemplazar **solo la capa frontend** del sistema de reservas, manteniendo WordPress + plugin actual como backend.

## Stack
- Vite
- React 18
- TypeScript estricto
- Fetch API nativa (sin librerías pesadas)

## Endpoints consumidos (sin cambiar backend)
- `GET /config`
- `POST /public_hold`
- `GET /public_confirm`
- `GET /staff_reservations`
- `POST /staff_reservation_status`
- `GET /staff_settings`
- `POST /staff_settings`

La base se lee desde `window.DG_API_BASE` (fallback: `/wp-json/dg/v1`).

## Estructura
- `src/pages/PublicBooking.tsx`
- `src/pages/Staff.tsx`
- `src/components/*`
- `src/hooks/*`
- `src/lib/api.ts`
- `src/types/*`

## Desarrollo
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

Salida: `dist/`

## Integración en WordPress
1. Compilar (`npm run build`).
2. Copiar contenido de `dist/assets` dentro del theme activo, por ejemplo: `wp-content/themes/tu-tema/dg-spa/assets`.
3. Crear una página en WordPress usando el template PHP de ejemplo.
4. Verificar que el plugin expone los endpoints en `/wp-json/dg/v1`.

### Template PHP de ejemplo
Archivo: `wordpress-template/page-don-gato-reservas.php`

Este template:
- Renderiza `<div id="root"></div>`.
- Inyecta `window.DG_API_BASE`.
- Inyecta `window.DG_NONCE` para auth staff vía REST nonce.
- Carga CSS/JS build estático desde el theme.

## Notas de performance aplicadas
- Carga única y cacheada de `/config`.
- Debounce en búsqueda de staff.
- Filtros y orden con `useMemo`.
- Lazy loading de panel de settings staff.
- Estado local simple y explícito, sin sobreingeniería.
