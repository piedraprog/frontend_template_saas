import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({ token: 'seed-token' }));
  const authService = {
    resetPassword: jasmine.createSpy('resetPassword'),
  };
  const router = {
    navigate: jasmine.createSpy('navigate').and.resolveTo(true),
    navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true),
  };
  const messageService = {
    add: jasmine.createSpy('add'),
  };

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({ token: 'seed-token' }));
    authService.resetPassword.calls.reset();
    router.navigate.calls.reset();
    router.navigateByUrl.calls.reset();
    messageService.add.calls.reset();

    TestBed.overrideComponent(ResetPasswordComponent, {
      set: {
        template: '',
        providers: [{ provide: MessageService, useValue: messageService }],
      },
    });

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();
  });

  it('marks the token as invalid when the page opens without token', () => {
    queryParamMap$.next(convertToParamMap({}));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.tokenError).toBeTrue();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'warn',
        summary: 'Enlace inválido',
      }),
    );
  });

  it('submits a valid password reset and redirects to login', fakeAsync(() => {
    authService.resetPassword.and.returnValue(
      of({ message: 'Contraseña actualizada correctamente' }),
    );
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.setValue({
      password: 'NuevaClave1!',
      confirmPassword: 'NuevaClave1!',
    });

    component.submit();
    tick();
    tick(1200);

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'seed-token',
      password: 'NuevaClave1!',
    });
    expect(component.resetCompleted).toBeTrue();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Contraseña actualizada',
      }),
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('does not call the API and explains the block when passwords do not match', () => {
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.setValue({
      password: 'NuevaClave1!',
      confirmPassword: 'OtraClave1!',
    });
    component.passwordControl?.markAsDirty();
    component.confirmPasswordControl?.markAsDirty();
    component.form.updateValueAndValidity();

    component.submit();

    expect(authService.resetPassword).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'warn',
        summary: 'Revisa el formulario',
        detail: 'Las contraseñas no coinciden.',
      }),
    );
  });

  it('shows the backend error when the reset link expired', () => {
    authService.resetPassword.and.returnValue(
      throwError(() => ({
        error: { message: 'El enlace de restablecimiento ha caducado. Solicita uno nuevo.' },
      })),
    );
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.setValue({
      password: 'NuevaClave1!',
      confirmPassword: 'NuevaClave1!',
    });

    component.submit();

    expect(component.tokenError).toBeTrue();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'No se pudo restablecer',
        detail: 'El enlace de restablecimiento ha caducado. Solicita uno nuevo.',
      }),
    );
  });
});
