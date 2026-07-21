# Checklist de cierre funcional

## Código

- [ ] No existen imports de `mockData` o `proyectosMock`.
- [ ] `pnpm lint` termina sin errores.
- [ ] `pnpm build` termina sin errores.
- [ ] `python manage.py check` termina sin errores.
- [ ] Todas las migraciones aparecen aplicadas.
- [ ] Los repositorios tienen `working tree clean`.

## Funciones

- [ ] Login y refresh.
- [ ] Clientes.
- [ ] Cotizaciones y conceptos.
- [ ] Proyectos.
- [ ] Evidencias.
- [ ] Cobranza.
- [ ] Contabilidad.
- [ ] Dashboard.
- [ ] Papeleras.
- [ ] Roles.

## Archivos

- [ ] `.env` no está versionado.
- [ ] `.env.example` sí está versionado.
- [ ] `node_modules`, `dist`, `venv`, logs y cachés no están versionados.
- [ ] La migración de Evidencias está en Git.
- [ ] Los archivos de ejemplo no contienen claves reales.

## Documentación

- [ ] README del frontend actualizado.
- [ ] README del backend actualizado.
- [ ] Instalación local documentada.
- [ ] Matriz de roles documentada.
- [ ] Prueba integral documentada.

## Pendiente para otra etapa

- [ ] Despliegue del backend.
- [ ] Despliegue del frontend.
- [ ] Base de datos de producción.
- [ ] Almacenamiento persistente de archivos.
- [ ] HTTPS, dominio y configuración de seguridad.
- [ ] Respaldos y monitoreo.
