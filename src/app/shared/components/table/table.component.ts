/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ContentChild,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { StatusEnum } from '../../../core/models/enums/status.enum';
import { PrimengModule } from '../../modules/primeng.module';

export interface TableColumn {
  field: string;
  header: string;
  filterable?: boolean;
  filterType?: 'text' | 'dropdown';
  filterOptions?: { label: string; value: any }[];
  sortable?: boolean;
  style?: any;
  tag?: boolean;
  formatter?: (value: any, rowData: any) => string;
}

export interface SortEvent {
  field: string;
  order: number; // 1 para ascendente, -1 para descendente
}

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

// Interfaz para las acciones de la tabla
export interface TableAction {
  label: string;
  icon: string;
  severity: 'info' | 'success' | 'warn' | 'danger' | 'primary' | 'secondary';
  tooltip?: string | ((rowData: any) => string); // Tooltip estático o dinámico
  visible?: (rowData: any) => boolean; // Función para determinar si la acción es visible
  disabled?: (rowData: any) => boolean; // Función para determinar si la acción está deshabilitada
  onClick?: (rowData: any) => void; // Función para manejar el clic de la acción
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimengModule, DatePipe],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @Input() title: string | undefined;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions: boolean = true;
  @Input() showCreateButton: boolean = true;
  @Input() createButtonLabel: string = 'Crear Nuevo';
  @Input() showSearch: boolean = true;
  @Input() loading: boolean = false;
  @Input() tableId?: string; // Agregar esta nueva propiedad para IDs únicos

  // Propiedades para paginación
  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() showPaginator: boolean = true;
  @Input() first: number = 0;

  // Acciones personalizadas
  @Input() actions: TableAction[] = [];
  @Input() showDefaultActions: boolean = true; // Mostrar acciones predeterminadas (ver, editar, eliminar)

  // Propiedades para funcionalidad expandible
  @Input() showExpandableRows: boolean = false;
  expandedRows: any = {};

  // Event emitters
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() create = new EventEmitter<void>();
  // TODO: Agregar la funcionalidad de búsqueda
  // @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() page = new EventEmitter<PageEvent>();
  @Output() actionClick = new EventEmitter<{ action: TableAction; rowData: any }>();

  @ContentChild('statusTemplate') statusTemplate: TemplateRef<any> | undefined;

  globalFilterFields: string[] = [];

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Signal para detectar si estamos en móvil
  windowWidth = signal<number>(0);
  isMobile = signal<boolean>(false);

  // Referencia a la función para poder remover el listener
  private resizeHandler = () => this.updateWindowWidth();

  ngOnInit() {
    // Configurar los campos para filtrado global
    this.globalFilterFields = this.columns.filter((col) => col.filterable).map((col) => col.field);

    // // Asignar templates a las columnas
    // this.columns = this.columns.map((col) => {
    //   if (col.templateName === 'statusTemplate' && this.statusTemplate) {
    //     col.template = this.statusTemplate;
    //   }
    //   return col;
    // });

    // Configurar el debounce para la búsqueda
    this.searchTerms
      .pipe(
        debounceTime(300), // Esperar 300ms después de cada pulsación de tecla
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        console.log('Search term (debounced):', term);
        // this.search.emit(term);
      });

    // Detectar tamaño de pantalla para responsive
    if (isPlatformBrowser(this.platformId)) {
      this.updateWindowWidth();
      window.addEventListener('resize', this.resizeHandler);
    }

    // Debug para funcionalidad expandible (comentado en producción)
    // setTimeout(() => {
    //   this.debugExpandableRows();
    // }, 1000);
  }

  private updateWindowWidth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      this.windowWidth.set(width);
      this.isMobile.set(width < 640); // Breakpoint móvil
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  onView(rowData: any) {
    this.view.emit(rowData);
  }

  onEdit(rowData: any) {
    this.edit.emit(rowData);
  }

  onDelete(rowData: any) {
    this.delete.emit(rowData);
  }

  onCreate() {
    this.create.emit();
  }

  onSearch(searchTerm: string) {
    this.searchTerms.next(searchTerm);
  }

  onSort(event: any) {
    const sortEvent: SortEvent = {
      field: event.field,
      order: event.order,
    };
    this.sort.emit(sortEvent);
  }

  onPageChange(event: any) {
    const pageEvent: PageEvent = {
      first: event.first,
      rows: event.rows,
      page: event.page,
      pageCount: event.pageCount,
    };
    this.page.emit(pageEvent);
  }

  onActionClick(action: TableAction, rowData: any) {
    this.actionClick.emit({ action, rowData });
  }

  // Métodos para verificar visibilidad y estado de las acciones
  isActionVisible(action: TableAction, rowData: any): boolean {
    return action.visible ? action.visible(rowData) : true;
  }

  isActionDisabled(action: TableAction, rowData: any): boolean {
    return action.disabled ? action.disabled(rowData) : false;
  }

  getTooltipText(action: TableAction, rowData: any): string {
    if (typeof action.tooltip === 'function') {
      return action.tooltip(rowData);
    }
    return action.tooltip || '';
  }

  getStatusSeverity(status: string | boolean) {
    if (typeof status === 'boolean') {
      return status === false ? 'danger' : 'success';
    }
    switch (status) {
      case StatusEnum.ACTIVE:
        return 'success';
      case StatusEnum.INACTIVE:
        return 'danger';
      case StatusEnum.PENDING:
        return 'warn';
      case StatusEnum.PENDING_TO_COMPLETE:
        return 'info';
      default:
        return 'info';
    }
  }

  getStatusDisplayValue(status: string | boolean): string {
    if (typeof status === 'boolean') {
      return status === false ? 'Inactivo' : 'Activo';
    }
    switch (status) {
      case StatusEnum.ACTIVE:
        return 'Activo';
      case StatusEnum.INACTIVE:
        return 'Inactivo';
      case StatusEnum.PENDING:
        return 'Pendiente';
      case StatusEnum.PENDING_TO_COMPLETE:
        return 'Pendiente por completar';
      default:
        return status?.toString() || 'No definido';
    }
  }

  /**
   * Mapea el valor técnico del estatus de transacción a un valor amigable
   */
  getTransactionStatusDisplayValue(status: string): string {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Entregados',
      'pending_review': 'Pendientes de revisión',
      'not_delivered': 'No entregados',
      'approved': 'Aprobados',
      'paid': 'Pagado',
      'unpaid': 'No pagado',
      'pending_confirmation': 'Pendiente de confirmación',
    };

    return statusMap[status] || status || 'Sin definir';
  }

  /**
   * Obtiene los contactos relacionados que no coinciden con la búsqueda
   */
  getOtherRelatedContacts(rowData: any): any[] {
    if (!rowData.relatedContacts || rowData.relatedContacts.length === 0) {
      return [];
    }

    // Si no hay coincidencias específicas, devolver todos los relacionados
    if (
      !rowData.matchDetails?.matchingRelatedContacts ||
      rowData.matchDetails.matchingRelatedContacts.length === 0
    ) {
      return rowData.relatedContacts;
    }

    // Filtrar los que no están en matchingRelatedContacts
    const matchingIds = rowData.matchDetails.matchingRelatedContacts.map((m: any) => m.id);
    return rowData.relatedContacts.filter((contact: any) => !matchingIds.includes(contact.id));
  }

  /**
   * Convierte el código del rol a un nombre amigable para mostrar
   */
  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'DEPENDENT': 'Dependiente',
      'SPOUSE': 'Cónyuge',
      'CHILD': 'Hijo/a',
      'PARENT': 'Padre/Madre',
      'SIBLING': 'Hermano/a',
      'GRANDPARENT': 'Abuelo/a',
      'GRANDCHILD': 'Nieto/a',
      'OTHER_RELATIVE': 'Otro familiar',
      'PRIMARY_HOLDER': 'Titular principal',
      'dependent': 'Dependiente',
      'spouse': 'Cónyuge',
      'child': 'Hijo/a',
      'parent': 'Padre/Madre',
      'sibling': 'Hermano/a',
      'grandparent': 'Abuelo/a',
      'grandchild': 'Nieto/a',
      'other_relative': 'Otro familiar',
      'primary_holder': 'Titular principal',
    };

    return roleMap[role] || role || 'Dependiente';
  }

  /**
   * Obtiene la relación de la primera persona que coincidió con la búsqueda
   */
  getFirstMatchingRelationship(rowData: any): string {
    if (
      rowData.matchDetails?.matchingRelatedContacts &&
      rowData.matchDetails.matchingRelatedContacts.length > 0
    ) {
      const firstMatch = rowData.matchDetails.matchingRelatedContacts[0];
      return this.getRoleDisplayName(firstMatch.role);
    }
    return 'dependiente';
  }

  // Métodos para funcionalidad expandible
  hasRelatedContacts(rowData: any): boolean {
    return rowData.relatedContacts && rowData.relatedContacts.length > 0;
  }

  getColSpan(): number {
    let colSpan = this.columns.length;
    if (this.showActions) colSpan++;
    if (this.showExpandableRows) colSpan++;
    return colSpan;
  }

  isMatchingDependent(rowData: any, dependent: any): boolean {
    if (!rowData.matchDetails || !rowData.matchDetails.matchingRelatedContacts) {
      return false;
    }
    return rowData.matchDetails.matchingRelatedContacts.some(
      (match: any) => match.id === dependent.id || match.completeName === dependent.completeName,
    );
  }

  // Método de debugging
  debugExpandableRows(): void {
    console.log('Table component debug:', {
      showExpandableRows: this.showExpandableRows,
      dataLength: this.data.length,
      firstRowData: this.data[0],
      columnsLength: this.columns.length,
    });
  }

  // Método para obtener el valor formateado de una celda
  getFormattedCellValue(column: TableColumn, rowData: any): string {
    const rawValue = rowData[column.field];

    // Si existe un formatter personalizado, úsalo
    if (column.formatter) {
      return column.formatter(rawValue, rowData);
    }

    // Si no, devolver el valor original como string
    return rawValue?.toString() || '';
  }

  // Método para identificar campos de fecha
  isDateField(fieldName: string): boolean {
    const dateFields = ['entryDate', 'lastContact', 'createdAt', 'updatedAt', 'dueDate', 'date'];
    return dateFields.includes(fieldName);
  }
}
