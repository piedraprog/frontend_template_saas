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

## URLs de API sin tocar código en cada entorno

Lee [.env.example](.env.example): explica `environment.ts` / `environment.development.ts` y el archivo opcional **`assets/runtime-environment.json`** (mismo patrón que suelen usar paneles desplegados con Nginx/Dokploy para no recompilar al pasar de local a prod).

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
