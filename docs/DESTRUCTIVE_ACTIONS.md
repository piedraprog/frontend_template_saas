# Acciones destructivas (admin boilerplate)

Convención mínima para C/U/D sensibles en settings.

## Soft deactivate vs hard delete

| Acción | Qué hace | Copy sugerido |
|--------|----------|---------------|
| Soft deactivate | Desactiva acceso (`active: false`); el registro permanece | “Desactivar usuario” / “El usuario dejará de poder iniciar sesión” |
| Hard delete | Elimina el recurso de forma permanente | “Eliminar” + confirmación con el nombre del recurso |

No mezclar verbos: si el endpoint es delete, el botón y el confirm deben decir **Eliminar**, no “Desactivar”.

## Confirmación

1. Usar diálogo PrimeNG (`p-dialog` o `ConfirmationService` / `p-confirmDialog`).
2. Mensaje con verbo explícito y consecuencia (quién pierde acceso / qué se borra).
3. Botón accept con severity `danger` y label del verbo (“Eliminar”, no “Sí”).
4. Tras éxito: toast con consecuencia + reconciliar lista.
5. Tras error: toast con `mapHttpErrorToUserMessage` (nunca el string crudo de Angular).

## Ejemplos canónicos en este repo

- **Eliminar usuario** — `user-admin` (`deleteUserDialog` + `AdminUserService.deleteUser`)
- **Eliminar rol custom** — `roles` (`ConfirmationService` + `RolesService.delete`)

Logout también usa confirm (cierre de sesión), pero no es hard delete de datos.
