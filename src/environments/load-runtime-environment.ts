import { environment } from './environment';

/**
 * Merge opcional desde `src/assets/runtime-environment.json` ya desplegado.
 * Dokploy puede montar o sustituir ese JSON sin recompilar (misma URL pública sin tocar environments/*.ts).
 */
export async function loadRuntimeEnvironment(): Promise<void> {
  try {
    const baseHref = document.querySelector('base')?.href ?? `${globalThis.location.origin}/`;
    const url = new URL('assets/runtime-environment.json', baseHref);
    const res = await fetch(url, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return;
    }
    const patch = (await res.json()) as Record<string, unknown>;
    const apiUrl = patch['apiUrl'];
    const captcha = patch['captcha_key'];

    if (typeof apiUrl === 'string' && apiUrl.trim().length > 0) {
      environment.apiUrl = apiUrl.trim();
    }
    if (typeof captcha === 'string') {
      environment.captcha_key = captcha;
    }
  } catch {
    // Sin archivo o error de red: se mantienen los valores de compile-time (.ts)
  }
}
