import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-success-register',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './success-register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessRegisterComponent implements AfterViewInit {
  private router = inject(Router);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 10_000);
  }
}
