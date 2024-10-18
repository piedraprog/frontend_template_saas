import { JsonPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MenuItem, PrimeIcons } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProfileResponseInterface } from '../../../core/models/interfaces/profile.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarModule,
    ButtonModule,
    NgClass,
    NgFor,
    NgIf,
    CardModule,
    DividerModule,
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    JsonPipe,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  profileInfo: ProfileResponseInterface | undefined;
  isFullDisplay = true;
  items: MenuItem[] | undefined;
  endItems: MenuItem[] | undefined;

  ngOnInit() {
    this.authService.getProfile().subscribe((profile) => (this.profileInfo = profile));

    this.items = [
      {
        separator: true,
      },
      {
        items: [
          {
            label: 'Dashboard',
            icon: PrimeIcons.CHART_BAR,
          },
          {
            label: 'Users',
            icon: PrimeIcons.USER,
          },
        ],
      },
      {
        label: 'bottom',
        separator: true,
        items: [
          {
            label: 'Settings',
            icon: PrimeIcons.COG,
          },
          {
            label: 'Toggle',
            icon: 'pi pi-angle-double-left',
            secondIcon: 'pi pi-angle-double-right',
            command: () => this.toggleSidebar(),
            tooltip: 'Toggle Sidebar',
          },
          {
            label: 'Logout',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout(event: any): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
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
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
