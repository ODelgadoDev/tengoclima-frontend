# Prueba integral del sistema

Esta prueba valida el proceso principal de TENGOCLIMA de principio a fin.

## Preparación

- Backend encendido.
- Frontend encendido.
- Usuario Administrador o Dueño.
- Base de datos de prueba.
- Una imagen JPG o PNG.
- Opcional: comprobante PDF o imagen.

## Flujo

### 1. Cliente

1. Crear un cliente temporal.
2. Buscarlo.
3. Editar un campo.
4. Confirmar que aparece en el listado.

Resultado esperado: creación `201` y edición `200`.

### 2. Cotización

1. Crear una cotización para el cliente.
2. Agregar al menos dos conceptos.
3. Confirmar subtotal, IVA y total.
4. Cambiar el estado a `AUTORIZADA`.

Resultado esperado: los totales oficiales coinciden con Django.

### 3. Proyecto

1. Convertir la cotización autorizada.
2. Seleccionar responsable.
3. Capturar fechas y notas.
4. Confirmar que la cotización pasa a `CONVERTIDA`.

### 4. Evidencia

1. Abrir el detalle del proyecto.
2. Subir una imagen.
3. Ampliarla.
4. Editar su descripción.

### 5. Cobranza

1. Registrar un abono menor al saldo.
2. Confirmar estado `PARCIAL`.
3. Registrar el monto restante.
4. Confirmar estado `PAGADO`.
5. Verificar que la cotización salga de X Cobrar y aparezca en Pagados.

### 6. Contabilidad

1. Crear una categoría de prueba.
2. Registrar un gasto.
3. Adjuntar un comprobante.
4. Confirmar el nuevo total de gastos.

### 7. Dashboard

Verificar:

- Monto cobrado.
- Saldo por cobrar.
- Gastos.
- Utilidad.
- Conteos.
- Registros recientes.

### 8. Papelera

Probar eliminación y restauración de:

- Cliente temporal.
- Cotización temporal.
- Proyecto temporal.
- Pago temporal.
- Gasto temporal.
- Evidencia temporal.

### 9. Ayudante

1. Iniciar sesión como Ayudante.
2. Consultar todos los módulos.
3. Confirmar que no aparecen acciones administrativas.
4. Abrir manualmente `/cotizaciones/nueva`.

Resultado esperado: acceso de solo consulta.

## Criterio de aprobación

La prueba queda aprobada cuando:

- No hay errores en consola.
- No hay respuestas 500.
- Los cálculos coinciden.
- Las relaciones se conservan.
- Los permisos funcionan.
- `pnpm lint`, `pnpm build` y `python manage.py check` terminan correctamente.
