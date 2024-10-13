import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="flex w-full h-screen justify-content-center align-items-center bg-gray-200">
      <p-card
        [header]="title"
        [subheader]="subheader"
        styleClass="w-20rem h-auto pb-2 md:w-30rem border-2"
        class="cartoon"
      >
        <ng-content></ng-content>
      </p-card>
    </div>
  `,
})
export class AuthCardComponent {
  @Input() title: string = '';
  @Input() subheader: string = '';
}
