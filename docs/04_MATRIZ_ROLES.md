# Matriz de roles

| Acción | Dueño | Administrador | Ayudante |
|---|:---:|:---:|:---:|
| Consultar Dashboard | Sí | Sí | Sí |
| Consultar clientes | Sí | Sí | Sí |
| Crear o editar clientes | Sí | Sí | No |
| Consultar cotizaciones | Sí | Sí | Sí |
| Crear o editar cotizaciones | Sí | Sí | No |
| Consultar proyectos | Sí | Sí | Sí |
| Crear o editar proyectos | Sí | Sí | No |
| Consultar evidencias | Sí | Sí | Sí |
| Subir o modificar evidencias | Sí | Sí | No |
| Consultar cobranza | Sí | Sí | Sí |
| Registrar o editar pagos | Sí | Sí | No |
| Consultar contabilidad | Sí | Sí | Sí |
| Registrar o editar gastos | Sí | Sí | No |
| Eliminar o restaurar | Sí | Sí | No |
| Administrar categorías | Sí | Sí | No |

## Criterio

El frontend adapta la interfaz, pero el backend debe rechazar cualquier operación no autorizada aunque se intente fuera de la interfaz.
