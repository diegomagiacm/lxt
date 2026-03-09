# Locos x La tecnología - iPhone Store

E-commerce premium para la venta de iPhones con integración en tiempo real con Supabase, cálculo de cuotas dinámico y panel administrativo de edición masiva.

## Características

- 📱 **Catálogo Dinámico**: Listado de productos desde Supabase con soporte para `image_url` y fallback automático.
- 💰 **Motor de Pagos Multi-moneda**:
  - Precios en USD.
  - Conversión a ARS automática (Dólar Blue venta + 10).
  - Recargos configurables para transferencias (5%).
  - Sistema de cuotas con tarjeta (hasta 12 cuotas con recargos escalonados).
- 🛒 **Carrito de Compras**: Persistente en `localStorage`.
- 🔐 **Autenticación**:
  - Login de clientes vía Google (OAuth).
  - Acceso administrativo protegido.
- 🛠️ **Panel Administrativo (Backend)**:
  - **Bulk Edit**: Grilla tipo Excel para editar precios y stock de múltiples depósitos simultáneamente.
  - **Gestión de Usuarios**: Creación de nuevos usuarios administrativos/clientes desde el panel.
- 💬 **Integración WhatsApp**: Generación automática de mensajes de reserva con el detalle del pedido.

## Configuración del Entorno

1. Copia el archivo `.env.example` a `.env`.
2. Completa las variables:
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Anon Key de Supabase.
   - `VITE_ADMIN_USER`: Usuario para el panel backend.
   - `VITE_ADMIN_PASS`: Contraseña para el panel backend.

## Configuración de la Base de Datos

Para que la aplicación funcione correctamente, debes ejecutar el contenido del archivo `database.sql` en el SQL Editor de tu proyecto de Supabase. Esto creará las tablas:
- `products`
- `warehouses`
- `stock`

## Desarrollo

```bash
npm install
npm run dev
```

## Construcción

```bash
npm run build
```
