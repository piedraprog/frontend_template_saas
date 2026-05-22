/** Path unificado para cookies legibles por JS (solo metadatos no sensibles). */
export const SESSION_COOKIE_PATH = '/';

/** Tokens JWT van en cookies HttpOnly (`boilerplate_access` / `boilerplate_refresh` en el servidor). */
export const SESSION_USER_ID = 'userId';

/** Clave sessionStorage para companyId cuando el access token no es legible (HttpOnly). */
export const SESSION_COMPANY_ID_STORAGE = 'boilerplate_company_id';
