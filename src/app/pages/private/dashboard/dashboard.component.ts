import { ChangeDetectionStrategy, Component } from '@angular/core';

interface DashTile {
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly icon: string;
  readonly trend: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
  readonly tiles: DashTile[] = [
    {
      label: 'Usuarios activos',
      value: '—',
      caption: 'Métrica de ejemplo hasta conectar el servicio de usuarios.',
      icon: 'pi pi-users',
      trend: 'Live',
    },
    {
      label: 'Sesiones',
      value: '—',
      caption: 'Ideal para graficar uso diario o semanal.',
      icon: 'pi pi-chart-line',
      trend: '+0%',
    },
    {
      label: 'Tareas pendientes',
      value: '—',
      caption: 'Sustituir por colas reales del negocio.',
      icon: 'pi pi-clock',
      trend: '0',
    },
    {
      label: 'Estado',
      value: 'OK',
      caption: 'Comprueba SLA y errores cuando tengas monitoreo.',
      icon: 'pi pi-bolt',
      trend: 'Sano',
    },
  ];
}
