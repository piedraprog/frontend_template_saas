import { expect, test } from '@playwright/test';
import {
  activatePlanFromOnboarding,
  expectCurrentPlan,
  expectDashboard,
  expectOnboarding,
  openMembership,
  startUpgradeFromMembership,
} from '../helpers/flows';
import { createAuthenticatedPage } from '../helpers/session';
import { completeStripeCheckout } from '../helpers/stripe';
import { buildRegistrationData } from '../helpers/test-data';

test.describe('Subscription flows', () => {
  test('activates the free onboarding plan', async ({ browser, request }, testInfo) => {
    const account = buildRegistrationData('free');
    const { context, page } = await createAuthenticatedPage(browser, request, testInfo, account);

    try {
      await page.goto('/onboarding');
      await expectOnboarding(page);

      await activatePlanFromOnboarding(page, 'Sandbox Free', /Activar gratis/i);
      await expectDashboard(page);

      await openMembership(page);
      await expectCurrentPlan(page, 'Sandbox Free');
    } finally {
      await context.close();
    }
  });

  test('activates the trial onboarding plan', async ({ browser, request }, testInfo) => {
    const account = buildRegistrationData('trial');
    const { context, page } = await createAuthenticatedPage(browser, request, testInfo, account);

    try {
      await page.goto('/onboarding');
      await expectOnboarding(page);

      await activatePlanFromOnboarding(page, 'Sandbox Trial', /Iniciar trial/i);
      await expectDashboard(page);

      await openMembership(page);
      await expectCurrentPlan(page, 'Sandbox Trial');
    } finally {
      await context.close();
    }
  });

  test('completes the Stripe onboarding checkout', async ({ browser, request }, testInfo) => {
    test.slow();
    const account = buildRegistrationData('stripe-onboarding');
    const { context, page } = await createAuthenticatedPage(browser, request, testInfo, account);

    try {
      await page.goto('/onboarding');
      await expectOnboarding(page);

      await activatePlanFromOnboarding(page, 'Sandbox Pro', /Continuar con Stripe/i);
      await completeStripeCheckout(page, account.email);
      await expectDashboard(page);

      await openMembership(page);
      await expectCurrentPlan(page, 'Sandbox Pro');
      await expect(page.getByRole('button', { name: 'Gestionar Facturación' })).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('upgrades a free company to the paid Stripe plan from membership settings', async ({
    browser,
    request,
  }, testInfo) => {
    test.slow();
    const account = buildRegistrationData('stripe-upgrade');
    const { context, page } = await createAuthenticatedPage(browser, request, testInfo, account);

    try {
      await page.goto('/onboarding');
      await expectOnboarding(page);

      await activatePlanFromOnboarding(page, 'Sandbox Free', /Activar gratis/i);
      await expectDashboard(page);
      await openMembership(page);
      await expectCurrentPlan(page, 'Sandbox Free');

      await startUpgradeFromMembership(page, 'Sandbox Pro');
      await completeStripeCheckout(page, account.email);
      await expectDashboard(page);

      await openMembership(page);
      await expectCurrentPlan(page, 'Sandbox Pro');
      await expect(page.getByRole('button', { name: 'Gestionar Facturación' })).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
