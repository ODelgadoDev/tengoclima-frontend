# Arquitectura general

## Visión

TENGOCLIMA utiliza una arquitectura cliente-servidor:

```text
Navegador
   │
   ▼
React + TypeScript
   │ HTTP / JSON / multipart
   ▼
Django REST Framework
   │
   ▼
Base de datos y almacenamiento de archivos
```

## Frontend

Responsabilidades:

- Presentación y navegación.
- Formularios y validaciones inmediatas.
- Autenticación y almacenamiento de tokens.
- Consumo de API.
- Estados de carga y error.
- Restricción visual según rol.
- Envío de imágenes y comprobantes mediante `FormData`.

## Backend

Responsabilidades:

- Reglas de negocio.
- Autenticación JWT.
- Autorización y roles.
- Persistencia.
- Auditoría.
- Cálculos financieros.
- Eliminación lógica y restauración.
- Validación de archivos.
- OpenAPI, Swagger y ReDoc.

## Flujo empresarial

```text
Cliente
  ↓
Cotización + conceptos
  ↓
Autorización
  ↓
Proyecto
  ↓
Evidencias
  ↓
Abonos / liquidación
  ↓
Gastos
  ↓
Dashboard financiero
```

## Principios aplicados

- El backend es la fuente de verdad.
- Los totales financieros se calculan en Django.
- Las cotizaciones solo se convierten cuando están autorizadas.
- Un proyecto conserva una relación única con su cotización.
- Las operaciones administrativas requieren Dueño o Administrador.
- Los registros importantes utilizan soft delete.
