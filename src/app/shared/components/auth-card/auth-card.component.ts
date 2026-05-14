import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [],
  template: `
    <div class="auth-shell min-h-screen px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center">
        <section class="auth-frame grid w-full overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
          <aside class="auth-panel hidden min-h-[560px] p-8 lg:block">
            <div class="flex h-full flex-col justify-between">
              <div>
                <div class="mb-10 flex items-center gap-3">
                  <span
                    class="auth-mark flex h-10 w-10 items-center justify-center text-sm font-black"
                  >
                    SB
                  </span>
                  <div>
                    <p class="text-sm font-extrabold text-slate-950">SaaS Boilerplate</p>
                    <p class="mt-0.5 text-xs font-medium text-slate-500">Admin console</p>
                  </div>
                </div>

                <h1 class="max-w-sm text-3xl font-extrabold leading-tight text-slate-950">
                  Base operativa para gestionar tu aplicación.
                </h1>
                <p class="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                  Acceso al panel, usuarios, roles, suscripciones y configuración de cuenta desde
                  una interfaz enfocada en trabajo diario.
                </p>
              </div>

              <div class="border-t border-slate-200 pt-5">
                <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Incluye</p>
                <div class="mt-4 grid gap-3 text-sm text-slate-700">
                  <div class="flex items-center gap-3">
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                    Roles y permisos
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                    Gestión de usuarios
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                    Configuración de planes
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main class="flex min-h-[560px] items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
            <div class="w-full max-w-[28rem]">
              <div class="mb-7">
                <div class="mb-6 flex items-center gap-3 lg:hidden">
                  <span
                    class="auth-mark flex h-10 w-10 items-center justify-center text-sm font-black"
                  >
                    SB
                  </span>
                  <div>
                    <p class="text-sm font-extrabold text-slate-950">SaaS Boilerplate</p>
                    <p class="mt-0.5 text-xs font-medium text-slate-500">Admin console</p>
                  </div>
                </div>

                <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Panel administrativo
                </p>
                <h2 class="mt-2 text-2xl font-extrabold leading-tight text-slate-950">
                  {{ title }}
                </h2>
                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ subheader }}
                </p>
              </div>

              <ng-content></ng-content>
            </div>
          </main>
        </section>
      </div>
    </div>
  `,
})
export class AuthCardComponent {
  @Input() title: string = '';
  @Input() subheader: string = '';
}
