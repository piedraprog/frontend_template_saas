/**
 * Entorno compilado en builds `production`.
 * Sobrescribe en runtime sin rebuild con `assets/runtime-environment.json`
 * (Dokploy/Compose: volumen o artifact que reemplace ese JSON).
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  captcha_key: '',
};
