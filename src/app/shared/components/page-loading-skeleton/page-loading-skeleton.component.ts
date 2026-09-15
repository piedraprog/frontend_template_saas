import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PrimengModule } from '../../modules/primeng.module';

export type PageLoadingSkeletonLayout = 'grid' | 'stack' | 'detail';

@Component({
  selector: 'app-page-loading-skeleton',
  standalone: true,
  imports: [PrimengModule],
  template: `
    <div
      class="admin-page-loading admin-card p-6"
      [class.admin-page-loading--stack]="layout() === 'stack'"
      [class.admin-page-loading--detail]="layout() === 'detail'"
      aria-busy="true"
      [attr.aria-label]="ariaLabel()"
    >
      @if (layout() === 'grid') {
        <div class="admin-page-loading__grid">
          @for (row of skeletonRows(); track row) {
            <p-skeleton [height]="itemHeight()" styleClass="admin-skeleton-pulse" />
          }
        </div>
      } @else if (layout() === 'detail') {
        <div class="admin-page-loading__detail">
          <p-skeleton width="40%" height="1.75rem" styleClass="admin-skeleton-pulse" />
          <p-skeleton width="100%" height="12rem" styleClass="admin-skeleton-pulse" />
          <p-skeleton width="100%" height="8rem" styleClass="admin-skeleton-pulse" />
        </div>
      } @else {
        <div class="admin-page-loading__stack">
          @for (row of skeletonRows(); track row) {
            <p-skeleton width="100%" [height]="itemHeight()" styleClass="admin-skeleton-pulse" />
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLoadingSkeletonComponent {
  readonly layout = input<PageLoadingSkeletonLayout>('grid');
  readonly rows = input(6);
  readonly itemHeight = input('6.5rem');
  readonly ariaLabel = input('Cargando contenido');

  protected skeletonRows(): number[] {
    return Array.from({ length: this.rows() }, (_, index) => index);
  }
}
