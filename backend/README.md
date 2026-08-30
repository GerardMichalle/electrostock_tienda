# Backend

Aún no construido — es el siguiente paso después de terminar el panel `/admin`
en el frontend.

## Plan (según lo conversado)

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS o Express, según necesidad de estructura
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth) o JWT propio, con rol "admin" para el cliente
- **Almacenamiento de imágenes/video**: Cloudinary o AWS S3
- **Pagos**: método manual Yape/Plin (comprobante + verificación), con opción
  futura de Culqi/Izipay para cobro automático

## Modelo de datos (referencia — coincide con `frontend/lib/data.ts`)

- `Category` (slug, name, description) → tiene muchas `Subcategory`
- `Subcategory` (slug, name) → pertenece a una `Category`
- `Product` (slug, sku, name, price, stock, spec, description) → pertenece a
  una `Subcategory`, tiene muchas `ProductImage` y opcionalmente `ProductVideo`
- `User` (email, password hash, role: admin | staff)
- `Order` (items, total, payment method, payment status, comprobante url)
