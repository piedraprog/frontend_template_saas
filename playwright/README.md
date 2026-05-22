# Playwright E2E

Esta suite prueba el frontend real contra tu backend local ya levantado.

## Scripts

- `bun run e2e`
- `bun run e2e:headed`
- `bun run e2e:ui`
- `bun run e2e:stripe`

## Variables opcionales

- `E2E_BASE_URL` default: `http://localhost:4200`
- `E2E_API_URL` default: `http://127.0.0.1:3000`

## Flujos cubiertos

- registro de empresa nueva
- login y redirección automática al onboarding
- activación de plan gratis
- activación de trial
- checkout Stripe desde onboarding
- upgrade Stripe desde `Facturación`

## Antes de correr

1. Levanta frontend y backend en local.
2. Asegúrate de que Stripe test esté configurado y que el plan pago tenga `price_id`.
3. Si quieres persistencia completa por webhook, corre Stripe CLI.

## Ejecutar

```bash
bun run e2e
```
