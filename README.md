# Frontend TENGOCLIMA

Aplicación web administrativa construida con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js instalado.
- pnpm instalado.
- Backend TENGOCLIMA ejecutándose.
- Archivo `.env` configurado.

## Configuración

Copia el ejemplo de variables:

```powershell
Copy-Item .env.example .env
```

Contenido esperado:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Comandos

```powershell
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm preview
```

## Rutas principales

```text
/                       Inicio de sesión
/dashboard              Resumen administrativo
/clientes                Clientes potenciales
/pendientes              Cotizaciones pendientes
/cotizaciones            Cotizaciones
/cotizaciones/nueva      Nueva cotización
/cotizaciones/:id        Detalle de cotización
/cotizaciones/:id/editar Edición de cotización
/proyectos                Proyectos
/proyectos/:id            Detalle y evidencias
/cobros                   Cuentas por cobrar
/pagados                  Cotizaciones liquidadas
/libro                    Gastos y utilidad
```

## Autenticación

El cliente Axios:

- Adjunta `Authorization: Bearer`.
- Renueva el access token con el refresh token.
- Cierra la sesión cuando ya no puede renovarse.
- Permite `FormData` para evidencias y comprobantes.

## Roles

- `DUENO`: administración completa.
- `ADMINISTRADOR`: administración completa.
- `AYUDANTE`: solo consulta.

El backend conserva la autoridad final sobre los permisos. El frontend oculta acciones no permitidas y protege las rutas administrativas.

## Validación previa a commit

```powershell
pnpm lint
pnpm build
git status
```
