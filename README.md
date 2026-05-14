# SaaS Admin Boilerplate

## Descripción

Base admin para productos SaaS construida con Angular, PrimeNG y Tailwind CSS para utilidades de layout.

## Características

- Angular 20 con componentes standalone.
- Estado local y compartido con `signal()` y `computed()` cuando no haga falta un stream RxJS.
- PrimeNG como sistema UI principal y **Tailwind CSS** únicamente como utilidades de layout/espaciado (preflight desactivado para coexistir con estilos de Prime).
- Layout privado con sidebar, navbar, bottom navigation mobile y paneles de settings.
- Interceptores HTTP funcionales para auth, loader, retry y response time.
- Formularios reactivos para auth y flujos administrativos.
- Guards funcionales para auth, permisos, owner y sesión.

## Requisitos Previos

Asegúrate de tener las siguientes herramientas instaladas en tu entorno de desarrollo antes de clonar el proyecto:

- [Node.js](https://nodejs.org/) 20.19+ o 22.12+
- [Bun](https://bun.sh/) 1.1+
- [Angular CLI](https://angular.dev/cli) 20.x
- [Git](https://git-scm.com/)

## Instalación

```bash
bun install
bun run start
```

La app queda disponible en `http://localhost:4200`.

## Configuración y entornos (API URL, captcha, etc.)

En el navegador **no hay variables de entorno secretas**: todo lo que incluyas en el front puede verse en el código publicado. Aquí solo deben ir datos **públicos** (URL de la API, site key del captcha). Secretos van en el **backend**.

Este proyecto **no** lee un archivo `.env` para el bundle. Usa tres mecanismos combinados:

### 1. Archivos TypeScript (`src/environments/`)

| Archivo | Cuándo se usa |
|---------|----------------|
| `environment.development.ts` | Al hacer `bun run start` / `ng serve`: Angular sustituye `environment.ts` por este (ver `angular.json` → `fileReplacements`). |
| `environment.ts` | Al hacer `bun run build` / `ng build` **sin** `--configuration development`: es el build por defecto (**production**). Ahí van los valores “de producción” por defecto. |

Edita `apiUrl` y `captcha_key` en el archivo que corresponda antes de compilar si no vas a usar el JSON de runtime.

### 2. JSON en runtime (sin recompilar)

Tras el build, puedes colocar o montar **`assets/runtime-environment.json`** junto al resto de estáticos (por ejemplo volumen en Docker/Dokploy o sustitución en Nginx).

- Si el archivo **no existe**, falla el fetch o está vacío `{}`, se mantienen los valores ya compilados en `environment.ts`.
- Si incluye claves, **sobrescriben** solo lo que indiques, por ejemplo:

```json
{
  "apiUrl": "https://api.tu-dominio.com",
  "captcha_key": "tu_site_key_publica"
}
```

En el repo hay una referencia en `src/assets/runtime-environment.sample.json`; el archivo que lee la app en despliegue es **`assets/runtime-environment.json`** (relativo a la URL de la app). La lógica está en `src/environments/load-runtime-environment.ts` y se ejecuta al arrancar la app (`APP_INITIALIZER` en `app.config.ts`).

### 3. Resumen rápido

- **Solo en tu PC**: `environment.development.ts` (con `ng serve`).
- **Build listo para un servidor concreto**: ajusta `environment.ts` y compila, **o** deja valores por defecto y define todo en `runtime-environment.json` en el servidor.
- **Nunca**: API keys secretas, tokens privados o contraseñas en estos archivos.

## Estructura base

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   ├── resolvers/
│   └── services/
├── pages/
│   ├── private/
│   └── public/
└── shared/
    ├── components/
    ├── interfaces/
    ├── modules/
    ├── pipes/
    ├── services/
    ├── utils/
    └── validators/
```

## Reglas de desarrollo

- Componentes nuevos: standalone, `ChangeDetectionStrategy.OnPush`, `inject()` para dependencias.
- Estado de componente o servicio: signals por defecto. RxJS se reserva para HTTP, websockets y streams reales.
- Formularios: Reactive Forms.
- UI: importar `PrimengModule` compartido cuando un componente necesite varios módulos de PrimeNG; utilidades de layout con **Tailwind** (`tailwind.config.js`, preflight desactivado).
- Interfaces: no declararlas dentro de componentes; ubicarlas en `core/models` o `shared/interfaces`.
- Flujos destructivos: confirmar con modal y cerrar con toast.
- Mobile: validar sidebar, navbar, navegación inferior y diálogos.

## Actualización de versión

Para cambios mayores de Angular, usar el update guide oficial y avanzar de una major a la siguiente:

```bash
bunx ng update @angular/cli@^20 @angular/core@^20
```

Luego correr:

```bash
bun run build
bun run lint
```
