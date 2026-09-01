# Backend — AMYTRONICS

API REST en Node.js + TypeScript + Express, con PostgreSQL vía Prisma.

## Stack

- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- Autenticación con JWT (bcrypt para contraseñas)
- Subida de archivos con Multer (fotos de producto y comprobantes de pago
  Yape/Plin), guardados en `uploads/` y servidos como estáticos

## 1. Requisitos previos

- Node.js 18+
- Una base de datos PostgreSQL. Opciones rápidas y gratuitas para
  arrancar sin instalar nada localmente:
  - [Neon](https://neon.tech) (recomendado, tiene capa gratuita generosa)
  - [Supabase](https://supabase.com)
  - o Postgres local si ya lo tienes instalado

## 2. Instalación

```bash
cd backend
npm install
```

## 3. Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

- `DATABASE_URL`: la cadena de conexión de tu base de datos Postgres (Neon
  o Supabase te la dan lista para copiar en su panel).
- `JWT_SECRET`: cualquier cadena larga y aleatoria. Puedes generar una con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `CORS_ORIGIN`: la URL de tu frontend (`http://localhost:3000` en
  desarrollo; agrega también tu dominio de Vercel en producción, separado
  por coma).

## 4. Generar el cliente de Prisma y crear las tablas

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Esto crea todas las tablas (`categories`, `subcategories`, `products`,
`product_images`, `users`, `orders`, `order_items`) en tu base de datos.

## 5. Cargar datos iniciales (seed)

```bash
npx prisma db seed
# si eso falla con un error de "rootDir", usa:
npm run seed
```

Esto crea:
- Las categorías y subcategorías (Sensores, Actuadores, Controladores,
  con sus mismas subcategorías del frontend).
- Un usuario admin de prueba: **admin@electrostock.pe / admin1234**
  (cámbialo apenas puedas — ver sección de seguridad más abajo).
- **14 productos de ejemplo** (los mismos del frontend). Si la carpeta
  `frontend/` está al lado, el seed copia sus fotos de demo a
  `uploads/products/`; si no, usa un placeholder.

## 6. Correr en desarrollo

```bash
npm run dev
```

La API queda en `http://localhost:4000`. Pruebas rápidas:
```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/categories
curl http://localhost:4000/api/products

# login (devuelve un token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@electrostock.pe","password":"admin1234"}'
```

## 7. Verificar que TypeScript compila

Antes de desplegar (y después de cualquier cambio):
```bash
npm run build
```
Debe terminar sin errores y crear la carpeta `dist/`.

## Endpoints principales

### Públicos (sin login)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categories` | Lista categorías con sus subcategorías |
| GET | `/api/products` | Lista productos (filtros: `?category=`, `?subcategory=`, `?search=`, `?page=`, `?pageSize=`) |
| GET | `/api/products/:slug` | Detalle de un producto |
| POST | `/api/orders` | Crear un pedido (multipart/form-data, con `receipt` = imagen del comprobante e `items` = JSON string) |
| POST | `/api/auth/login` | Login (`{ email, password }`) → devuelve `{ token, user }` |

### Admin (requieren header `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/categories` | Crear categoría |
| PATCH | `/api/categories/:id` | Renombrar categoría (el slug nunca cambia) |
| DELETE | `/api/categories/:id` | Eliminar (bloqueado si tiene productos) |
| PATCH | `/api/categories/:id/move` | Reordenar (`{ direction: "up" \| "down" }`) |
| POST | `/api/categories/:id/subcategories` | Crear subcategoría |
| PATCH/DELETE | `/api/categories/:id/subcategories/:subId` | Editar/eliminar subcategoría |
| PATCH | `/api/categories/:id/subcategories/:subId/move` | Reordenar subcategoría |
| POST | `/api/products` | Crear producto (multipart/form-data, campo `images` con hasta 8 fotos) |
| PATCH | `/api/products/:id` | Editar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| DELETE | `/api/products/images/:imageId` | Quitar una foto puntual |
| GET | `/api/orders` | Listar pedidos (filtro `?status=`) |
| PATCH | `/api/orders/:id/status` | Cambiar estado del pedido |

## Seguridad — antes de mostrárselo al cliente

1. **Cambia la contraseña del admin de seed.** Genera un hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "TU-NUEVA-CLAVE"
   ```
   Luego pégalo en el campo `passwordHash` del usuario en Prisma Studio
   (`npx prisma studio`).
2. Nunca subas tu archivo `.env` real a GitHub (ya está en `.gitignore`).
3. En producción, `CORS_ORIGIN` debe apuntar solo a tu dominio real, no
   quedar abierto a cualquier origen. Y `NODE_ENV=production`.
4. El login ya tiene rate-limit (10 intentos por IP cada 15 min).

## Notas importantes para conectar el frontend

El frontend hoy usa `localStorage` para productos, categorías y carrito
(`frontend/lib/admin-store.ts`, `frontend/lib/cart-context.tsx`,
`frontend/lib/data.ts`). El siguiente paso — con su propio prompt para
Claude Code — es reemplazar esas fuentes por llamadas `fetch` a esta API,
con `NEXT_PUBLIC_API_URL` apuntando a `http://localhost:4000` en dev y a la
URL real del backend en producción.

Al hacer esa conexión, tener en cuenta:

1. **Las URLs de imágenes se guardan RELATIVAS** (`/uploads/products/x.jpg`).
   El frontend debe anteponer `NEXT_PUBLIC_API_URL` al mostrarlas
   (`${apiUrl}${img.url}`). Así, si el backend cambia de dominio, las
   imágenes viejas no se rompen.
2. **Enum de stock:** la API devuelve `EN_STOCK` / `AGOTADO` / `BAJO_PEDIDO`;
   el frontend muestra `"En stock"` / `"Agotado"` / `"Bajo pedido"`. Hay que
   mapear en un adaptador.
3. **Pedidos:** `POST /api/orders` es `multipart/form-data` — `receipt` es el
   archivo del comprobante e `items` va como **string JSON**
   (`JSON.stringify([{ productId, qty }])`). El total NO se envía: lo calcula
   el servidor con los precios reales de la BD.
4. **El panel `/admin/categorias` y `/admin/productos`** ya tienen la misma
   lógica de negocio que la API (bloqueo de borrado, reordenar, slug fijo al
   renombrar), así que la migración es sobre todo cambiar de dónde salen los
   datos, no reescribir la lógica.

## Cambios aplicados en la revisión (Claude Code, 2026-08-31)

- **URLs de subida relativas** (`uploadUrl` en `middleware/upload.ts`) en vez
  de absolutas con host — evita romper imágenes al cambiar de dominio.
- **Limpieza de archivos huérfanos:** al borrar un producto o una foto,
  también se borra el `.jpg` del disco (`removeUpload`).
- **`DELETE /api/products/:id`** ahora responde 409 con mensaje claro si el
  producto está en algún pedido (antes daba 500).
- **`PATCH /api/products/:id`** valida que la subcategoría pertenezca a la
  categoría (igual que el `create`).
- **Errores de Multer** (archivo muy pesado / no es imagen) → 400 con
  mensaje entendible, no 500.
- **Rate-limit** en `/api/auth/login`: 10 intentos por IP cada 15 min
  (`middleware/rate-limit.ts`, sin dependencias nuevas).
- **`app.set("trust proxy", 1)`** para leer bien la IP y el protocolo
  detrás del proxy de Railway/Render.
- **`GET /api/orders?status=`** valida el estado (antes `?status=basura`
  → 500).
- **Seed** ampliado a 14 productos (los del frontend), copia sus fotos de
  demo, y `prisma db seed` usa `--transpile-only` para no fallar por
  `rootDir`.
- `listProducts` tipa el `where` como `Prisma.ProductWhereInput`.

> Estos cambios se hicieron sin poder compilar aquí (falta `npm install` +
> `prisma generate`). Corre `npm run build` después del setup y avísame si
> algo no compila.

## Despliegue

Esta API es un servidor persistente (usa Express escuchando en un puerto),
así que **no se despliega como funciones serverless de Vercel** igual que
el frontend. Opciones recomendadas: [Railway](https://railway.app),
[Render](https://render.com), o una base de datos Neon/Supabase + el
backend en Railway/Render. En cualquiera de estas, configura las mismas
variables de entorno de `.env.example` en su panel, y corre
`npx prisma migrate deploy` (no `migrate dev`) antes del primer arranque
en producción.
