import { Directive, TemplateRef, ViewContainerRef, inject, effect, input } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../models/enums/permission.enum';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  /** Un permiso o array de permisos (requiere TODOS si es array). */
  appHasPermission = input<Permission | Permission[] | undefined>(undefined);

  constructor() {
    effect(() => {
      const perms = this.appHasPermission();
      this.updateView(perms);
    });
  }

  private updateView(perms: Permission | Permission[] | undefined): void {
    if (perms === undefined) {
      this.viewContainer.clear();
      return;
    }
    const permissions = Array.isArray(perms) ? perms : [perms];
    const hasAll = permissions.every((p) => this.permissionService.has(p));
    if (hasAll) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
