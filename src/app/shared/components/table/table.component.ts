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

/** Generic platform table row — consumers pass their DTO shape. */
export type TableRow = Record<string, unknown>;

export interface TableFilterOption {
  label: string;
  value: string | number | boolean | null;
}

export interface TableColumn {
  field: string;
  header: string;
  filterable?: boolean;
  filterType?: 'text' | 'dropdown';
  filterOptions?: TableFilterOption[];
  sortable?: boolean;
  style?: Record<string, string>;
  tag?: boolean;
  formatter?: (value: unknown, rowData: TableRow) => string;
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

export interface TableAction {
  label: string;
  icon: string;
  severity: 'info' | 'success' | 'warn' | 'danger' | 'primary' | 'secondary';
  tooltip?: string | ((rowData: TableRow) => string);
  visible?: (rowData: TableRow) => boolean;
  disabled?: (rowData: TableRow) => boolean;
  onClick?: (rowData: TableRow) => void;
}

interface PrimeSortEventLike {
  field?: string;
  order?: number;
}

interface PrimePageEventLike {
  first?: number;
  rows?: number;
  page?: number;
  pageCount?: number;
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
  @Input() data: TableRow[] = [];
  @Input() showActions: boolean = true;
  @Input() showCreateButton: boolean = true;
  @Input() createButtonLabel: string = 'Crear Nuevo';
  @Input() showSearch: boolean = true;
  @Input() loading: boolean = false;
  @Input() tableId?: string;

  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() showPaginator: boolean = true;
  @Input() first: number = 0;

  @Input() actions: TableAction[] = [];
  @Input() showDefaultActions: boolean = true;

  @Input() showExpandableRows: boolean = false;
  expandedRows: Record<string, boolean> = {};

  @Output() view = new EventEmitter<TableRow>();
  @Output() edit = new EventEmitter<TableRow>();
  @Output() delete = new EventEmitter<TableRow>();
  @Output() create = new EventEmitter<void>();
  // TODO: Agregar la funcionalidad de búsqueda
  // @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() page = new EventEmitter<PageEvent>();
  @Output() actionClick = new EventEmitter<{ action: TableAction; rowData: TableRow }>();

  @ContentChild('statusTemplate') statusTemplate: TemplateRef<unknown> | undefined;

  globalFilterFields: string[] = [];

  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  windowWidth = signal<number>(0);
  isMobile = signal<boolean>(false);

  private resizeHandler = () => this.updateWindowWidth();

  ngOnInit() {
    this.globalFilterFields = this.columns.filter((col) => col.filterable).map((col) => col.field);

    // // Asignar templates a las columnas
    // this.columns = this.columns.map((col) => {
    //   if (col.templateName === 'statusTemplate' && this.statusTemplate) {
    //     col.template = this.statusTemplate;
    //   }
    //   return col;
    // });

    this.searchTerms
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        console.log('Search term (debounced):', term);
        // this.search.emit(term);
      });

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
      this.isMobile.set(width < 640);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  onView(rowData: TableRow) {
    this.view.emit(rowData);
  }

  onEdit(rowData: TableRow) {
    this.edit.emit(rowData);
  }

  onDelete(rowData: TableRow) {
    this.delete.emit(rowData);
  }

  onCreate() {
    this.create.emit();
  }

  onSearch(searchTerm: string) {
    this.searchTerms.next(searchTerm);
  }

  onSort(event: PrimeSortEventLike) {
    const sortEvent: SortEvent = {
      field: event.field ?? '',
      order: event.order ?? 1,
    };
    this.sort.emit(sortEvent);
  }

  onPageChange(event: PrimePageEventLike) {
    const pageEvent: PageEvent = {
      first: event.first ?? 0,
      rows: event.rows ?? this.rows,
      page: event.page ?? 0,
      pageCount: event.pageCount ?? 0,
    };
    this.page.emit(pageEvent);
  }

  onActionClick(action: TableAction, rowData: TableRow) {
    this.actionClick.emit({ action, rowData });
  }

  isActionVisible(action: TableAction, rowData: TableRow): boolean {
    return action.visible ? action.visible(rowData) : true;
  }

  isActionDisabled(action: TableAction, rowData: TableRow): boolean {
    return action.disabled ? action.disabled(rowData) : false;
  }

  getTooltipText(action: TableAction, rowData: TableRow): string {
    if (typeof action.tooltip === 'function') {
      return action.tooltip(rowData);
    }
    return action.tooltip || '';
  }

  getStatusSeverity(status: unknown) {
    if (typeof status === 'boolean') {
      return status === false ? 'danger' : 'success';
    }
    if (typeof status !== 'string') {
      return 'info';
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

  getStatusDisplayValue(status: unknown): string {
    if (typeof status === 'boolean') {
      return status === false ? 'Inactivo' : 'Activo';
    }
    if (typeof status !== 'string') {
      return status == null ? 'No definido' : String(status);
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
        return status || 'No definido';
    }
  }

  getColSpan(): number {
    let colSpan = this.columns.length;
    if (this.showActions) colSpan++;
    if (this.showExpandableRows) colSpan++;
    return colSpan;
  }

  getFormattedCellValue(column: TableColumn, rowData: TableRow): string {
    const rawValue = rowData[column.field];

    if (column.formatter) {
      return column.formatter(rawValue, rowData);
    }

    if (rawValue == null) {
      return '';
    }

    if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      return String(rawValue);
    }

    return '';
  }

  isDateField(fieldName: string): boolean {
    const dateFields = ['entryDate', 'lastContact', 'createdAt', 'updatedAt', 'dueDate', 'date'];
    return dateFields.includes(fieldName);
  }
}
