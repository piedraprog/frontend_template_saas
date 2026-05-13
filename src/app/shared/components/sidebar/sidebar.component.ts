import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MenuItem, PrimeIcons } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  host: { class: 'admin-sidebar-host shrink-0' },
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    DividerModule,
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    ConfirmDialogModule,
    RouterModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  profileData = computed(() => this.userService.userData());
  isFullDisplay = true;
  items: MenuItem[] | undefined;
  endItems: MenuItem[] | undefined;

  private tenantIdFromUrl(): string | undefined {
    const path = this.router.url.split('?')[0] ?? '';
    const first = path.replace(/^\//, '').split('/').filter(Boolean)[0];
    return first || undefined;
  }

  ngOnInit() {
    const tid = this.tenantIdFromUrl();
    const dash = tid ? ['/', tid, 'dashboard'] : ['/dashboard'];
    const settingsHome = tid ? ['/', tid, 'settings'] : ['/settings'];
    const userAdmin = tid ? ['/', tid, 'settings', 'user-admin'] : ['/settings', 'user-admin'];

    this.items = [
      {
        separator: true,
      },
      {
        items: [
          {
            label: 'Dashboard',
            icon: PrimeIcons.CHART_BAR,
            visible: true,
            routerLink: dash,
          },
          {
            label: 'Usuarios',
            icon: PrimeIcons.USER,
            routerLink: userAdmin,
          },
        ],
      },
      {
        label: 'bottom',
        separator: true,
        items: [
          {
            label: 'Configuración',
            icon: PrimeIcons.COG,
            routerLink: settingsHome,
          },
          {
            label: 'Colapsar menú',
            icon: 'pi pi-angle-double-left',
            secondIcon: 'pi pi-angle-double-right',
            command: () => this.toggleSidebar(),
            tooltip: 'Colapsar menú',
          },
          {
            label: 'Cerrar sesión',
            icon: 'pi pi-sign-out',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            command: ($event: any) => this.logout($event),
          },
        ],
      },
    ];
  }

  toggleSidebar() {
    this.isFullDisplay = !this.isFullDisplay;
  }

  onMenuLeafAction(item: MenuItem, event: MouseEvent): void {
    item.command?.({ originalEvent: event, item });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout(event: any): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Deseas cerrar sesión en esta cuenta?',
      header: 'Confirmar cierre de sesión',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.authService.logOut().subscribe({
          next: () => {
            this.authService.removeTokens();
            this.router.navigate(['/login']);
          },
          error: () => {
            this.authService.removeTokens();
            this.router.navigate(['/login']);
          },
        });
      },
      reject: () => {
        const t = this.tenantIdFromUrl();
        void this.router.navigate(t ? ['/', t, 'dashboard'] : ['/dashboard']);
      },
    });
  }
}
