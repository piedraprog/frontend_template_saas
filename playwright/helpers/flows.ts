import { expect, Locator, Page } from '@playwright/test';
import { RegistrationData } from './test-data';

export async function registerCompany(page: Page, data: RegistrationData): Promise<void> {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();

  await page.getByLabel('Empresa').fill(data.company);
  await page.getByLabel('Usuario').fill(data.username);
  await page.getByLabel('Correo electrónico').fill(data.email);
  await page.locator('#password').fill(data.password);
  await page.locator('#confirmPassword').fill(data.password);
  await page.locator('#termsCondition').check();

  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.url().includes('/auth/register') && candidate.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Crear cuenta' }).click(),
  ]);

  expect(response.ok(), `Register failed with ${response.status()}`).toBeTruthy();
  await expect(page).toHaveURL(/\/success$/);
  await expect(page.getByRole('heading', { name: 'Registro Exitoso' })).toBeVisible();
}

export async function login(page: Page, data: RegistrationData): Promise<void> {
  await page.route('https://api.ipify.org/?format=json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ip: data.clientIp }),
    });
  });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();

  await page.getByLabel('Correo electrónico').fill(data.email);
  await page.locator('#password').fill(data.password);
  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.url().includes('/auth/login') && candidate.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Iniciar sesión' }).click(),
  ]);

  expect(response.ok(), `Login failed with ${response.status()}`).toBeTruthy();
}

export async function expectOnboarding(page: Page): Promise<void> {
  await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
  await expect(
    page.getByRole('heading', { name: 'Activa tu boiler con el flujo base 0 a 1' }),
  ).toBeVisible();
}

export async function advanceToPlanSelection(page: Page): Promise<void> {
  await expectOnboarding(page);

  const continueButton = page.getByRole('button', { name: /^Continuar$/ });

  for (let index = 0; index < 3; index += 1) {
    if (
      await page
        .getByRole('heading', { name: 'Selecciona el plan con el que arrancas' })
        .isVisible()
    ) {
      return;
    }

    await expect(continueButton).toBeVisible();
    await continueButton.click();
    await page.waitForTimeout(250);
  }

  await expect(
    page.getByRole('heading', { name: 'Selecciona el plan con el que arrancas' }),
  ).toBeVisible();
}

export async function activatePlanFromOnboarding(
  page: Page,
  planName: string,
  buttonName: RegExp | string,
): Promise<void> {
  await advanceToPlanSelection(page);

  const planGrid = page.locator('.plan-grid');
  await expect(planGrid).toContainText(planName);
  await planGrid.getByRole('button', { name: buttonName }).click();
}

export async function expectDashboard(page: Page): Promise<void> {
  await page.waitForURL(/\/dashboard/, { timeout: 45_000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

export async function openMembership(page: Page): Promise<void> {
  await page.goto('/settings/membership');
  await expect(page.getByRole('heading', { name: 'Facturación' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plan actual' })).toBeVisible();
}

export async function expectCurrentPlan(page: Page, planName: string): Promise<void> {
  await expect(page.locator('.plan-name')).toContainText(planName);
  await expect(page.getByText('Activo')).toBeVisible();
}

export async function startUpgradeFromMembership(page: Page, planName: string): Promise<void> {
  await openMembership(page);
  await page.getByRole('button', { name: 'Mejorar Plan' }).click();

  const dialog = page.getByRole('dialog', { name: 'Planes y facturación' });
  await expect(dialog).toBeVisible();
  await locateMembershipPlanCard(dialog, planName)
    .getByRole('button', { name: 'Facturar con Stripe' })
    .click();
}

function locateMembershipPlanCard(scope: Page | Locator, planName: string): Locator {
  return scope.locator('.plans-list .plan-item').filter({ hasText: planName }).first();
}
